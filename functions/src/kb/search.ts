import * as admin from 'firebase-admin';

export type KbHit = {
  docId: string;
  chunkIndex: number;
  snippet: string;
  score: number;
};

export async function searchKbChunks(uid: string, query: string, limit = 5): Promise<KbHit[]> {
  const terms = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2);
  const snap = await admin.firestore().collection('kb_chunks').where('uid', '==', uid).limit(150).get();

  const scored = snap.docs.map((d) => {
    const data = d.data();
    const content = String(data.content ?? '').toLowerCase();
    const score = terms.reduce((acc, term) => acc + (content.includes(term) ? 1 : 0), 0);
    return {
      docId: String(data.docId ?? ''),
      chunkIndex: Number(data.chunkIndex ?? 0),
      snippet: String(data.content ?? '').slice(0, 280),
      score
    };
  });

  return scored.filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}
