import * as admin from 'firebase-admin';
import pdfParse from 'pdf-parse';

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 120;

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
    status: 'ready',
    charCount: text.length,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, {merge: true});

  const batch = db.batch();
  chunks.forEach((content, i) => {
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
