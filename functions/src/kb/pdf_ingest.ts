import * as admin from 'firebase-admin';
import pdfParse from 'pdf-parse';

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 120;
const MAX_BATCH_WRITES = 450;

export async function ingestPdfFromStorage(uid: string, docId: string, bucket: string, path: string, fileName: string) {
  const file = admin.storage().bucket(bucket).file(path);
  const [raw] = await file.download();
  const parsed = await pdfParse(raw);
  const text = (parsed.text ?? '').replace(/\s+/g, ' ').trim();
  const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);

  const db = admin.firestore();
  const docRef = db.collection('kb_docs').doc(docId);
  await docRef.set({
    uid,
    fileName,
    storagePath: path,
    status: 'processing',
    charCount: text.length,
    chunkCount: chunks.length,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, {merge: true});

  for (let start = 0; start < chunks.length; start += MAX_BATCH_WRITES) {
    const batch = db.batch();
    const slice = chunks.slice(start, start + MAX_BATCH_WRITES);

    slice.forEach((content, offset) => {
      const i = start + offset;
      const keywords = Array.from(new Set(content.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 3))).slice(0, 25);
      const ref = db.collection('kb_chunks').doc(`${docId}_${i}`);
      batch.set(ref, {
        uid,
        docId,
        chunkIndex: i,
        content,
        keywords,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
  }

  await deleteOldChunks(uid, docId, chunks.length);

  await docRef.set({
    status: 'ready',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, {merge: true});

  return {docId, chunks: chunks.length};
}

function chunkText(text: string, size: number, overlap: number): string[] {
  if (!text) return [];
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + size, text.length);
    out.push(text.slice(i, end));
    if (end === text.length) break;
    i += size - overlap;
  }
  return out;
}


async function deleteOldChunks(uid: string, docId: string, nextChunkCount: number) {
  const db = admin.firestore();
  const staleSnap = await db.collection('kb_chunks')
    .where('uid', '==', uid)
    .where('docId', '==', docId)
    .limit(5000)
    .get();

  const staleDocs = staleSnap.docs.filter((doc: any) => Number(doc.data().chunkIndex ?? 0) >= nextChunkCount);

  for (let start = 0; start < staleDocs.length; start += MAX_BATCH_WRITES) {
    const batch = db.batch();
    const slice = staleDocs.slice(start, start + MAX_BATCH_WRITES);
    slice.forEach((doc: any) => batch.delete(doc.ref));
    await batch.commit();
  }
}
