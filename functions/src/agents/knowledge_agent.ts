import {searchKbChunks} from '../kb/search';

export async function knowledgeAgent(uid: string, query: string) {
  const refs = await searchKbChunks(uid, query, 3);
  return {
    knowledgeHints: refs.map((r) => `(${r.docId}#${r.chunkIndex}) ${r.snippet}`)
  };
}
