/**
 * Redis Cache Module for SynKrony
 * Handles caching of frequently accessed data
 */

import Redis from 'ioredis';

let client: Redis | null = null;

/**
 * Get Redis client
 */
export function getClient(): Redis {
  if (!client) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      console.warn('REDIS_URL not set, caching disabled');
      // Return a dummy client that does nothing
      return new Redis({
        host: 'localhost',
        port: 6379,
        lazyConnect: true,
      }) as any;
    }

    client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    client.on('connect', () => {
      console.log('Redis connected');
    });
  }

  return client;
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  musicTheory: (type: string, id: string) => `music_theory:${type}:${id}`,
  genreTemplate: (genre: string) => `genre_template:${genre}`,
  instrument: (id: string) => `instrument:${id}`,
  scale: (id: string) => `scale:${id}`,
  chord: (id: string) => `chord:${id}`,
  progression: (id: string) => `progression:${id}`,
  userProject: (uid: string, projectId: string) => `user:${uid}:project:${projectId}`,
  patchAnalytics: (patchId: string) => `patch_analytics:${patchId}`,
  agentResult: (agent: string, inputHash: string) => `agent:${agent}:${inputHash}`,
  pnabMetric: (projectId: string) => `pnab:${projectId}`,
};

// ============================================================================
// BASIC CACHE OPERATIONS
// ============================================================================

/**
 * Get value from cache
 */
export async function get<T = any>(key: string): Promise<T | null> {
  try {
    const redis = getClient();
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Set value in cache
 */
export async function set(
  key: string,
  value: any,
  ttlSeconds = 3600
): Promise<void> {
  try {
    const redis = getClient();
    const serialized = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

/**
 * Delete value from cache
 */
export async function del(key: string): Promise<void> {
  try {
    const redis = getClient();
    await redis.del(key);
  } catch (error) {
    console.error('Redis del error:', error);
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function delPattern(pattern: string): Promise<void> {
  try {
    const redis = getClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis delPattern error:', error);
  }
}

// ============================================================================
// MUSIC THEORY CACHING
// ============================================================================

/**
 * Get scale from cache
 */
export async function getScale(id: string): Promise<any | null> {
  return get(CacheKeys.scale(id));
}

/**
 * Set scale in cache
 */
export async function setScale(id: string, scale: any): Promise<void> {
  await set(CacheKeys.scale(id), scale, 86400); // 24 hours
}

/**
 * Get chord from cache
 */
export async function getChord(id: string): Promise<any | null> {
  return get(CacheKeys.chord(id));
}

/**
 * Set chord in cache
 */
export async function setChord(id: string, chord: any): Promise<void> {
  await set(CacheKeys.chord(id), chord, 86400); // 24 hours
}

/**
 * Get progression from cache
 */
export async function getProgression(id: string): Promise<any | null> {
  return get(CacheKeys.progression(id));
}

/**
 * Set progression in cache
 */
export async function setProgression(id: string, progression: any): Promise<void> {
  await set(CacheKeys.progression(id), progression, 86400); // 24 hours
}

/**
 * Get instrument from cache
 */
export async function getInstrument(id: string): Promise<any | null> {
  return get(CacheKeys.instrument(id));
}

/**
 * Set instrument in cache
 */
export async function setInstrument(id: string, instrument: any): Promise<void> {
  await set(CacheKeys.instrument(id), instrument, 86400); // 24 hours
}

/**
 * Get genre template from cache
 */
export async function getGenreTemplate(genre: string): Promise<any | null> {
  return get(CacheKeys.genreTemplate(genre));
}

/**
 * Set genre template in cache
 */
export async function setGenreTemplate(genre: string, template: any): Promise<void> {
  await set(CacheKeys.genreTemplate(genre), template, 86400); // 24 hours
}

// ============================================================================
// USER PROJECT CACHING
// ============================================================================

/**
 * Get user project from cache
 */
export async function getUserProject(
  uid: string,
  projectId: string
): Promise<any | null> {
  return get(CacheKeys.userProject(uid, projectId));
}

/**
 * Set user project in cache
 */
export async function setUserProject(
  uid: string,
  projectId: string,
  project: any
): Promise<void> {
  await set(CacheKeys.userProject(uid, projectId), project, 1800); // 30 minutes
}

/**
 * Invalidate all user projects
 */
export async function invalidateUserProjects(uid: string): Promise<void> {
  await delPattern(`user:${uid}:project:*`);
}

// ============================================================================
// AGENT RESULT CACHING
// ============================================================================

/**
 * Get cached agent result
 */
export async function getAgentResult(
  agent: string,
  input: string
): Promise<any | null> {
  const inputHash = Buffer.from(input).toString('base64').substring(0, 16);
  return get(CacheKeys.agentResult(agent, inputHash));
}

/**
 * Set agent result in cache
 */
export async function setAgentResult(
  agent: string,
  input: string,
  result: any
): Promise<void> {
  const inputHash = Buffer.from(input).toString('base64').substring(0, 16);
  await set(CacheKeys.agentResult(agent, inputHash), result, 3600); // 1 hour
}

/**
 * Invalidate all agent results
 */
export async function invalidateAgentResults(agent: string): Promise<void> {
  await delPattern(`agent:${agent}:*`);
}

// ============================================================================
// PATCH ANALYTICS CACHING
// ============================================================================

/**
 * Get patch analytics from cache
 */
export async function getPatchAnalytics(patchId: string): Promise<any | null> {
  return get(CacheKeys.patchAnalytics(patchId));
}

/**
 * Set patch analytics in cache
 */
export async function setPatchAnalytics(
  patchId: string,
  analytics: any
): Promise<void> {
  await set(CacheKeys.patchAnalytics(patchId), analytics, 600); // 10 minutes
}

/**
 * Increment patch likes in cache
 */
export async function incrementPatchLikes(patchId: string): Promise<number> {
  try {
    const redis = getClient();
    const key = `patch_likes:${patchId}`;
    const newLikes = await redis.incr(key);
    await redis.expire(key, 600); // 10 minutes
    return newLikes;
  } catch (error) {
    console.error('Redis increment error:', error);
    return 0;
  }
}

// ============================================================================
// PNAB METRICS CACHING
// ============================================================================

/**
 * Get PNAB metric from cache
 */
export async function getPNABMetric(projectId: string): Promise<any | null> {
  return get(CacheKeys.pnabMetric(projectId));
}

/**
 * Set PNAB metric in cache
 */
export async function setPNABMetric(
  projectId: string,
  metric: any
): Promise<void> {
  await set(CacheKeys.pnabMetric(projectId), metric, 3600); // 1 hour
}

/**
 * Get PNAB summary from cache
 */
export async function getPNABSummary(): Promise<any | null> {
  return get('pnab:summary');
}

/**
 * Set PNAB summary in cache
 */
export async function setPNABSummary(summary: any): Promise<void> {
  await set('pnab:summary', summary, 1800); // 30 minutes
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check Redis connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const redis = getClient();
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

/**
 * Close Redis connection
 */
export async function closeClient(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
