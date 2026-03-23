/**
 * Redis Module for SynKrony Caching
 *
 * This module handles caching for frequently accessed data:
 * - Patch configurations
 * - Music theory data (scales, chords, progressions)
 * - AI agent responses
 * - Session data
 * - Hardware preset caching
 */

import Redis from 'ioredis';

// ============================================================================
// TYPES
// ============================================================================

export interface CacheConfig {
  ttl?: number;  // Time to live in seconds
  key: string;
}

export interface CachedPatch {
  patch_id: string;
  name: string;
  category: string;
  parameters: Record<string, unknown>;
  created_at: string;
}

export interface CachedTheoryData {
  type: 'scale' | 'chord' | 'progression' | 'partimento_rule';
  id: string;
  data: unknown;
}

export interface CachedAiResponse {
  agent_type: string;
  input_hash: string;
  response: unknown;
  timestamp: string;
}

// ============================================================================
// CONNECTION
// ============================================================================

let redisClient: Redis | null = null;

/**
 * Initialize Redis connection
 */
export function initRedis(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn('REDIS_URL not set, caching disabled');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableReadyCheck: true,
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });

    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    return null;
  }
}

/**
 * Get Redis client
 */
export function getRedisClient(): Redis | null {
  return redisClient || initRedis();
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// ============================================================================
// CACHE OPERATIONS
// ============================================================================

/**
 * Set a value in cache
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttl: number = 3600
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const serialized = JSON.stringify(value);
    if (ttl > 0) {
      await client.setex(key, ttl, serialized);
    } else {
      await client.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error('Failed to set cache:', error);
    return false;
  }
}

/**
 * Get a value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Failed to get cache:', error);
    return null;
  }
}

/**
 * Delete a value from cache
 */
export async function cacheDelete(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Failed to delete cache:', error);
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;

  try {
    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;
    return await client.del(...keys);
  } catch (error) {
    console.error('Failed to delete cache pattern:', error);
    return 0;
  }
}

/**
 * Check if a key exists
 */
export async function cacheExists(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    console.error('Failed to check cache existence:', error);
    return false;
  }
}

// ============================================================================
// PATCH CACHING
// ============================================================================

const PATCH_CACHE_PREFIX = 'patch:';
const PATCH_CACHE_TTL = 7200; // 2 hours

/**
 * Cache a patch
 */
export async function cachePatch(patch: CachedPatch): Promise<boolean> {
  return cacheSet(
    `${PATCH_CACHE_PREFIX}${patch.patch_id}`,
    patch,
    PATCH_CACHE_TTL
  );
}

/**
 * Get a cached patch
 */
export async function getCachedPatch(patchId: string): Promise<CachedPatch | null> {
  return cacheGet<CachedPatch>(`${PATCH_CACHE_PREFIX}${patchId}`);
}

/**
 * Invalidate patch cache
 */
export async function invalidatePatch(patchId: string): Promise<boolean> {
  return cacheDelete(`${PATCH_CACHE_PREFIX}${patchId}`);
}

/**
 * Invalidate all user patches
 */
export async function invalidateUserPatches(uid: string): Promise<number> {
  return cacheDeletePattern(`patch:user:${uid}:*`);
}

// ============================================================================
// THEORY DATA CACHING
// ============================================================================

const THEORY_CACHE_PREFIX = 'theory:';
const THEORY_CACHE_TTL = 86400; // 24 hours

/**
 * Cache theory data
 */
export async function cacheTheoryData(data: CachedTheoryData): Promise<boolean> {
  return cacheSet(
    `${THEORY_CACHE_PREFIX}${data.type}:${data.id}`,
    data.data,
    THEORY_CACHE_TTL
  );
}

/**
 * Get cached theory data
 */
export async function getCachedTheoryData(
  type: string,
  id: string
): Promise<unknown | null> {
  return cacheGet(`${THEORY_CACHE_PREFIX}${type}:${id}`);
}

/**
 * Get all scales for a key
 */
export async function getCachedScales(key: string): Promise<unknown[] | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const keys = await client.keys(`${THEORY_CACHE_PREFIX}scale:${key}*`);
    if (keys.length === 0) return null;

    const values = await client.mget(...keys);
    return values
      .filter((v): v is string => v !== null)
      .map(v => JSON.parse(v));
  } catch (error) {
    console.error('Failed to get cached scales:', error);
    return null;
  }
}

/**
 * Invalidate all theory cache
 */
export async function invalidateTheoryCache(): Promise<number> {
  return cacheDeletePattern(`${THEORY_CACHE_PREFIX}*`);
}

// ============================================================================
// AI RESPONSE CACHING
// ============================================================================

const AI_CACHE_PREFIX = 'ai:';
const AI_CACHE_TTL = 1800; // 30 minutes

/**
 * Generate cache key from input
 */
function generateAiInputHash(agentType: string, input: unknown): string {
  const str = JSON.stringify(input);
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${agent_type}:${Math.abs(hash)}`;
}

/**
 * Cache AI response
 */
export async function cacheAiResponse(
  agentType: string,
  input: unknown,
  response: unknown
): Promise<boolean> {
  const hash = generateAiInputHash(agentType, input);
  const data: CachedAiResponse = {
    agent_type: agentType,
    input_hash: hash,
    response,
    timestamp: new Date().toISOString()
  };
  return cacheSet(`${AI_CACHE_PREFIX}${hash}`, data, AI_CACHE_TTL);
}

/**
 * Get cached AI response
 */
export async function getCachedAiResponse(
  agentType: string,
  input: unknown
): Promise<unknown | null> {
  const hash = generateAiInputHash(agentType, input);
  const data = await cacheGet<CachedAiResponse>(`${AI_CACHE_PREFIX}${hash}`);
  return data?.response || null;
}

/**
 * Invalidate AI cache for an agent
 */
export async function invalidateAiCache(agentType?: string): Promise<number> {
  if (agentType) {
    return cacheDeletePattern(`${AI_CACHE_PREFIX}${agentType}:*`);
  }
  return cacheDeletePattern(`${AI_CACHE_PREFIX}*`);
}

// ============================================================================
// SESSION CACHING
// ============================================================================

const SESSION_CACHE_PREFIX = 'session:';
const SESSION_CACHE_TTL = 3600; // 1 hour

/**
 * Cache session data
 */
export async function cacheSession(
  sessionId: string,
  data: Record<string, unknown>
): Promise<boolean> {
  return cacheSet(
    `${SESSION_CACHE_PREFIX}${sessionId}`,
    data,
    SESSION_CACHE_TTL
  );
}

/**
 * Get cached session
 */
export async function getCachedSession(
  sessionId: string
): Promise<Record<string, unknown> | null> {
  return cacheGet(`${SESSION_CACHE_PREFIX}${sessionId}`);
}

/**
 * Extend session TTL
 */
export async function extendSession(sessionId: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.expire(`${SESSION_CACHE_PREFIX}${sessionId}`, SESSION_CACHE_TTL);
    return true;
  } catch (error) {
    console.error('Failed to extend session:', error);
    return false;
  }
}

/**
 * Invalidate session
 */
export async function invalidateSession(sessionId: string): Promise<boolean> {
  return cacheDelete(`${SESSION_CACHE_PREFIX}${sessionId}`);
}

// ============================================================================
// HARDWARE PRESET CACHING
// ============================================================================

const HARDWARE_CACHE_PREFIX = 'hardware:';
const HARDWARE_CACHE_TTL = 7200; // 2 hours

/**
 * Cache hardware preset
 */
export async function cacheHardwarePreset(
  hardwareType: 'xps10' | 'mm8',
  presetId: string,
  data: unknown
): Promise<boolean> {
  return cacheSet(
    `${HARDWARE_CACHE_PREFIX}${hardwareType}:${presetId}`,
    data,
    HARDWARE_CACHE_TTL
  );
}

/**
 * Get cached hardware preset
 */
export async function getCachedHardwarePreset(
  hardwareType: 'xps10' | 'mm8',
  presetId: string
): Promise<unknown | null> {
  return cacheGet(`${HARDWARE_CACHE_PREFIX}${hardwareType}:${presetId}`);
}

/**
 * Invalidate hardware presets
 */
export async function invalidateHardwarePresets(
  hardwareType?: 'xps10' | 'mm8'
): Promise<number> {
  if (hardwareType) {
    return cacheDeletePattern(`${HARDWARE_CACHE_PREFIX}${hardwareType}:*`);
  }
  return cacheDeletePattern(`${HARDWARE_CACHE_PREFIX}*`);
}

// ============================================================================
// STATS AND METRICS
// ============================================================================

/**
 * Increment a counter
 */
export async function cacheIncrement(
  key: string,
  amount: number = 1
): Promise<number | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    return await client.incrby(key, amount);
  } catch (error) {
    console.error('Failed to increment counter:', error);
    return null;
  }
}

/**
 * Get counter value
 */
export async function cacheGetCounter(key: string): Promise<number | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    return value ? parseInt(value, 10) : null;
  } catch (error) {
    console.error('Failed to get counter:', error);
    return null;
  }
}

/**
 * Add to sorted set
 */
export async function cacheZAdd(
  key: string,
  score: number,
  member: string
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.zadd(key, score, member);
    return true;
  } catch (error) {
    console.error('Failed to add to sorted set:', error);
    return false;
  }
}

/**
 * Get top N from sorted set
 */
export async function cacheZTopN(
  key: string,
  n: number = 10
): Promise<Array<{member: string; score: number}> | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const results = await client.zrevrange(key, 0, n - 1, 'WITHSCORES');
    const output: Array<{member: string; score: number}> = [];
    for (let i = 0; i < results.length; i += 2) {
      output.push({
        member: results[i],
        score: parseFloat(results[i + 1])
      });
    }
    return output;
  } catch (error) {
    console.error('Failed to get top N:', error);
    return null;
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check Redis connection health
 */
export async function healthCheck(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    return false;
  }
}

/**
 * Get cache statistics
 */
export async function getStats(): Promise<{
  connected: boolean;
  keyCount: number;
  memoryUsage: string;
  hitRate: number;
} | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const info = await client.info('stats');
    const memoryInfo = await client.info('memory');

    const keyCountMatch = info.match(/keyspace_hits:(\d+)/);
    const hits = keyCountMatch ? parseInt(keyCountMatch[1], 10) : 0;

    const missMatch = info.match(/keyspace_misses:(\d+)/);
    const misses = missMatch ? parseInt(missMatch[1], 10) : 0;

    const memoryMatch = memoryInfo.match(/used_memory_human:([^\r\n]+)/);
    const memoryUsage = memoryMatch ? memoryMatch[1] : 'unknown';

    const keyCount = await client.dbsize();

    return {
      connected: true,
      keyCount,
      memoryUsage,
      hitRate: hits + misses > 0 ? hits / (hits + misses) : 0
    };
  } catch (error) {
    console.error('Failed to get Redis stats:', error);
    return null;
  }
}
