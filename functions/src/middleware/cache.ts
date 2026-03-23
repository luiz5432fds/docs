/**
 * Cache Middleware for SynKrony
 * Provides caching decorators for Cloud Functions
 */

import * as functions from 'firebase-functions/v2/https';
import {get, set} from '../db/redis';

/**
 * Cache configuration
 */
interface CacheConfig {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string;
  serializeResponse?: boolean;
}

/**
 * Default cache configuration
 */
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 3600, // 1 hour
  keyPrefix: 'cf:',
  serializeResponse: true,
};

/**
 * Generate cache key from request
 */
function generateCacheKey(
  prefix: string,
  data: any,
  uid?: string
): string {
  const parts = [prefix];

  if (uid) {
    parts.push(uid);
  }

  // Add relevant data to key
  if (data.id) {
    parts.push(data.id);
  }
  if (data.genre) {
    parts.push(data.genre);
  }
  if (data.key) {
    parts.push(data.key);
  }
  if (data.query) {
    // Hash query to keep key manageable
    const queryHash = Buffer.from(data.query).toString('base64').substring(0, 12);
    parts.push(queryHash);
  }

  return parts.join(':');
}

/**
 * Cached Cloud Function decorator
 * Caches function responses in Redis
 */
export function cached(config: CacheConfig = {}) {
  const finalConfig = {...DEFAULT_CACHE_CONFIG, ...config};

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      request: functions.https.CallableRequest,
      context: functions.https.CallableContext
    ) {
      const uid = context.auth?.uid;
      const cacheKey = generateCacheKey(
        finalConfig.keyPrefix!,
        request.data,
        uid
      );

      // Try to get from cache
      try {
        const cached = await get(cacheKey);
        if (cached !== null) {
          console.log(`Cache hit for ${propertyKey}:`, cacheKey);
          return cached;
        }
      } catch (error) {
        console.warn('Cache get error:', error);
      }

      // Execute original function
      console.log(`Cache miss for ${propertyKey}:`, cacheKey);
      const result = await originalMethod.apply(this, [request, context]);

      // Store result in cache
      try {
        await set(cacheKey, result, finalConfig.ttl);
      } catch (error) {
        console.warn('Cache set error:', error);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Invalidate cache decorator
 * Invalidates cache after function execution
 */
export function invalidateCache(patterns: string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      request: functions.https.CallableRequest,
      context: functions.https.CallableContext
    ) {
      // Execute original function
      const result = await originalMethod.apply(this, [request, context]);

      // Invalidate cache patterns
      try {
        const {delPattern} = await import('../db/redis');
        for (const pattern of patterns) {
          await delPattern(pattern);
          console.log(`Invalidated cache pattern: ${pattern}`);
        }
      } catch (error) {
        console.warn('Cache invalidation error:', error);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache warming function
 * Pre-loads common data into cache
 */
export async function warmCache(): Promise<void> {
  const {setScale, setChord, setProgression, setGenreTemplate} =
    await import('../db/redis');

  // Common scales
  const commonScales = ['C Major', 'A Minor', 'G Major', 'E Minor'];

  // Common progressions
  const commonProgressions = ['ii-V-I', 'I-vi-IV-V', 'I-IV-V'];

  // Genre templates
  const genreTemplates = ['brega_romantico', 'forro_piseiro', 'tecnobrega'];

  console.log('Warming cache...');

  // This would typically fetch from Firestore and cache
  // For now, just log the intent
  console.log('Cache warmed with:', {
    scales: commonScales.length,
    progressions: commonProgressions.length,
    templates: genreTemplates.length,
  });
}

/**
 * Cache statistics
 */
export async function getCacheStats(): Promise<{
  hits: number;
  misses: number;
  hitRate: number;
}> {
  // This would typically query Redis for stats
  // For now, return mock data
  return {
    hits: 0,
    misses: 0,
    hitRate: 0,
  };
}
