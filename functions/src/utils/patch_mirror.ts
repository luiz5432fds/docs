/**
 * Pure helpers to keep Firestore triggers idempotent.
 */

export type PatchLike = {
  version?: number | null;
  tags?: string[] | null;
  updatedAt?: unknown;
  [k: string]: unknown;
};

export type MirrorUpdateDecision = {
  needsUpdate: boolean;
  nextVersion: number;
  normalizedTags: string[];
  mirrorPatch: Record<string, unknown>;
};

export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const cleaned = tags
    .filter((t): t is string => typeof t === 'string')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.toLowerCase());

  const uniq = Array.from(new Set(cleaned));
  uniq.sort((a, b) => a.localeCompare(b));
  return uniq;
}

export function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function computePatchMirrorUpdate(before: PatchLike | null, after: PatchLike): MirrorUpdateDecision {
  const currentVersion = typeof before?.version === 'number' ? before.version : 0;
  const afterVersion = typeof after.version === 'number' ? after.version : 0;
  const nextVersion = Math.max(currentVersion, afterVersion);

  const currentTags = normalizeTags(before?.tags ?? []);
  const normalizedTags = normalizeTags(after.tags ?? []);

  const versionChanged = nextVersion !== currentVersion;
  const tagsChanged = !arraysEqual(currentTags, normalizedTags);
  const needsUpdate = versionChanged || tagsChanged;

  const mirrorPatch: Record<string, unknown> = {
    ...after,
    version: nextVersion,
    tags: normalizedTags,
  };

  delete mirrorPatch.updatedAt;

  return {needsUpdate, nextVersion, normalizedTags, mirrorPatch};
}
