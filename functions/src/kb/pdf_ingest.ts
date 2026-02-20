import * as admin from 'firebase-admin';
import pdfParse from 'pdf-parse';
import {chunkArray} from '../utils/batching';

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

  const indexedChunks = chunks.map((content, chunkIndex) => ({content, chunkIndex}));
  const writeSlices = chunkArray(indexedChunks, MAX_BATCH_WRITES);

  for (const slice of writeSlices) {
    const batch = db.batch();

    slice.forEach(({content, chunkIndex}) => {
      const keywords = Array.from(new Set(content.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 3))).slice(0, 25);
      const ref = db.collection('kb_chunks').doc(`${docId}_${chunkIndex}`);
      batch.set(ref, {
        uid,
        docId,
        chunkIndex,
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

  while (true) {
    const staleSnap = await db.collection('kb_chunks')
      .where('uid', '==', uid)
      .where('docId', '==', docId)
      .where('chunkIndex', '>=', nextChunkCount)
      .limit(MAX_BATCH_WRITES)
      .get();

    if (staleSnap.empty) break;

    const batch = db.batch();
    staleSnap.docs.forEach((doc: any) => batch.delete(doc.ref));
    await batch.commit();

    if (staleSnap.size < MAX_BATCH_WRITES) break;
  }
}
