/**
 * Firestore batch helpers.
 */
export function chunkArray<T>(items: readonly T[], chunkSize: number): T[][] {
  if (!Number.isFinite(chunkSize) || chunkSize <= 0) throw new Error('chunkSize must be > 0');
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    out.push(items.slice(i, i + chunkSize));
  }
  return out;
}
