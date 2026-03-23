/**
 * Cache Middleware for SynKrony Functions
 *
 * Provides middleware for caching function results using Redis.
 * Supports:
 * - Response caching with TTL
 * - Cache key generation
 * - Invalidation strategies
 * - Cache warming
 */

import {HttpsFunction} from 'firebase-functions';
import * as logger from 'firebase-functions/logger';
import {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
  healthCheck,
  getStats
} from '../db/redis';

// ============================================================================
// TYPES
// ============================================================================

export interface CacheOptions {
  /**
   * Time to live in seconds
   * @default 300 (5 minutes)
   */
  ttl?: number;

  /**
   * Generate custom cache key from request
   * @default Uses pathname + query params
   */
  keyGenerator?: (req: import('express').Request) => string;

  /**
   * Skip caching for certain conditions
   */
  skipCache?: (req: import('express').Request) => boolean;

  /**
   * Cache only successful responses (2xx)
   * @default true
   */
  cacheOnlySuccessful?: boolean;

  /**
   * Include headers in cached data
   */
  includeHeaders?: boolean;

  /**
   * Cache key prefix
   * @default 'api:'
   */
  prefix?: string;
}

export interface CachedResponse {
  status: number;
  headers?: Record<string, string>;
  data: unknown;
  timestamp: string;
}

// ============================================================================
// DEFAULT KEY GENERATOR
// ============================================================================

function defaultKeyGenerator(req: import('express').Request): string {
  const {pathname, searchParams} = new URL(
    req.url,
    `${req.protocol}://${req.get('host')}`
  );

  // Include relevant headers for user-specific caching
  const uid = req.get('X-UID') || req.get('uid') || 'anonymous';
  const authHeader = req.get('Authorization');

  // Build key from pathname + query + user context
  const queryParams = searchParams.toString();
  const queryString = queryParams ? `?${queryParams}` : '';

  // If authenticated, include user ID in key
  const userPart = (uid !== 'anonymous' || authHeader) ? `:${uid}` : '';

  return `api:${pathname}${queryString}${userPart}`;
}

// ============================================================================
// CACHE MIDDLEWARE
// ============================================================================

/**
 * Express middleware for caching GET requests
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 300,
    keyGenerator = defaultKeyGenerator,
    skipCache = () => false,
    cacheOnlySuccessful = true,
    includeHeaders = false,
    prefix = 'api:'
  } = options;

  return async (
    req: import('express').Request,
    res: import('express').Response,
    next: () => void
  ) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if condition met
    if (skipCache(req)) {
      return next();
    }

    // Skip if Redis not available
    if (!(await healthCheck())) {
      logger.debug('Redis unavailable, skipping cache');
      return next();
    }

    const cacheKey = prefix + keyGenerator(req);

    try {
      // Try to get cached response
      const cached = await cacheGet<CachedResponse>(cacheKey);

      if (cached) {
        logger.debug(`Cache hit: ${cacheKey}`);

        // Set cache headers
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('Age', Math.floor((Date.now() - new Date(cached.timestamp).getTime()) / 1000).toString());

        // Restore headers if cached
        if (cached.headers) {
          Object.entries(cached.headers).forEach(([key, value]) => {
            if (!key.toLowerCase().startsWith('x-')) {
              res.setHeader(key, value);
            }
          });
        }

        return res.status(cached.status).json(cached.data);
      }

      logger.debug(`Cache miss: ${cacheKey}`);
      res.setHeader('X-Cache', 'MISS');

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache response
      res.json = function(data: unknown) {
        // Only cache successful responses if option is set
        if (!cacheOnlySuccessful || res.statusCode >= 200 && res.statusCode < 300) {
          const cachedResponse: CachedResponse = {
            status: res.statusCode,
            data,
            timestamp: new Date().toISOString()
          };

          if (includeHeaders) {
            const headers: Record<string, string> = {};
            res.getHeaderNames().forEach(name => {
              const value = res.getHeader(name);
              if (typeof value === 'string') {
                headers[name] = value;
              }
            });
            cachedResponse.headers = headers;
          }

          // Cache asynchronously (don't block response)
          cacheSet(cacheKey, cachedResponse, ttl).catch(err => {
            logger.error('Failed to cache response:', err);
          });
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
}

// ============================================================================
// INVALIDATION MIDDLEWARE
// ============================================================================

/**
 * Middleware to invalidate cache on write operations
 */
export function invalidateCacheMiddleware(
  pattern: string | ((req: import('express').Request) => string)
) {
  return async (
    req: import('express').Request,
    res: import('express').Response,
    next: () => void
  ) => {
    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override to invalidate on successful write
    res.json = function(data: unknown) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const keyPattern = typeof pattern === 'function' ? pattern(req) : pattern;

        // Invalidate asynchronously
        cacheDeletePattern(keyPattern).catch(err => {
          logger.error('Failed to invalidate cache:', err);
        });

        res.setHeader('X-Cache-Invalidated', keyPattern);
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * Invalidate specific cache key by ID
 */
export function invalidateByIdMiddleware(
  keyPrefix: string,
  idParam: string = 'id'
) {
  return invalidateCacheMiddleware((req) => {
    const id = req.params[idParam] || req.body?.id;
    return `${keyPrefix}:${id}*`;
  });
}

// ============================================================================
// SPECIALIZED MIDDLEWARE
// ============================================================================

/**
 * Cache middleware for patch endpoints
 */
export function patchCacheMiddleware() {
  return cacheMiddleware({
    ttl: 1800, // 30 minutes for patches
    prefix: 'patch:',
    skipCache: (req) => {
      // Skip cache for public patch listings to ensure freshness
      return req.path === '/api/public/patches';
    }
  });
}

/**
 * Cache middleware for theory data
 */
export function theoryCacheMiddleware() {
  return cacheMiddleware({
    ttl: 86400, // 24 hours for theory data
    prefix: 'theory:',
    keyGenerator: (req) => {
      const {type, id} = req.params;
      const {key, mode} = req.query;
      return `${type}:${id || key}:${mode || 'major'}`;
    }
  });
}

/**
 * Cache middleware for AI agent responses
 */
export function aiCacheMiddleware() {
  return cacheMiddleware({
    ttl: 3600, // 1 hour for AI responses
    prefix: 'ai:',
    keyGenerator: (req) => {
      const {agent} = req.params;
      // Hash the request body for input-based caching
      const body = JSON.stringify(req.body);
      let hash = 0;
      for (let i = 0; i < body.length; i++) {
        hash = ((hash << 5) - hash) + body.charCodeAt(i);
        hash = hash & hash;
      }
      return `${agent}:${Math.abs(hash)}`;
    },
    skipCache: (req) => {
      // Skip caching for debugging/admin requests
      return req.body?.skipCache === true || req.query?.nocache === 'true';
    }
  });
}

/**
 * Cache middleware for user-specific data
 */
export function userCacheMiddleware() {
  return cacheMiddleware({
    ttl: 600, // 10 minutes for user data
    prefix: 'user:',
    keyGenerator: (req) => {
      const uid = req.get('X-UID') || req.get('uid') || 'anonymous';
      const path = req.path.split('/').filter(Boolean).join('/');
      return `${uid}:${path}`;
    },
    skipCache: (req) => {
      // Skip cache for anonymous users
      const uid = req.get('X-UID') || req.get('uid');
      return !uid;
    }
  });
}

// ============================================================================
// CACHE WARMING
// ============================================================================

/**
 * Warm up cache with predefined data
 */
export async function warmupCache(
  entries: Array<{
    key: string;
    value: unknown;
    ttl?: number;
  }>
): Promise<{success: number; failed: number}> {
  let success = 0;
  let failed = 0;

  for (const entry of entries) {
    try {
      const result = await cacheSet(entry.key, entry.value, entry.ttl);
      if (result) {
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      logger.error(`Failed to warm up cache for key: ${entry.key}`, error);
      failed++;
    }
  }

  logger.info(`Cache warmup complete: ${success} succeeded, ${failed} failed`);
  return {success, failed};
}

/**
 * Preload theory data into cache
 */
export async function preloadTheoryData(
  theoryData: Array<{type: string; id: string; data: unknown}>
): Promise<void> {
  const entries = theoryData.map(item => ({
    key: `theory:${item.type}:${item.id}`,
    value: item.data,
    ttl: 86400 // 24 hours
  }));

  await warmupCache(entries);
}

// ============================================================================
// CACHE STATS ENDPOINT
// ============================================================================

/**
 * Endpoint handler for cache statistics
 */
export async function getCacheStatsHandler(
  req: import('express').Request,
  res: import('express').Response
) {
  const stats = await getStats();

  if (!stats) {
    return res.status(503).json({
      error: 'Cache service unavailable',
      connected: false
    });
  }

  res.json({
    cache: {
      status: 'operational',
      ...stats
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * Endpoint handler for health check
 */
export async function cacheHealthHandler(
  req: import('express').Request,
  res: import('express').Response
) {
  const isHealthy = await healthCheck();

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString()
  });
}

// ============================================================================
// CACHE CONTROL HEADERS
// ============================================================================

/**
 * Add cache control headers to response
 */
export function addCacheControlHeaders(
  maxAge: number,
  options: {
    private?: boolean;
    noCache?: boolean;
    noStore?: boolean;
    mustRevalidate?: boolean;
    staleWhileRevalidate?: number;
  } = {}
) {
  return (
    req: import('express').Request,
    res: import('express').Response,
    next: () => void
  ) => {
    const directives: string[] = [];

    if (options.noStore) {
      directives.push('no-store');
    } else if (options.noCache) {
      directives.push('no-cache');
    } else {
      directives.push(`max-age=${maxAge}`);

      if (options.private) {
        directives.push('private');
      } else {
        directives.push('public');
      }

      if (options.mustRevalidate) {
        directives.push('must-revalidate');
      }

      if (options.staleWhileRevalidate) {
        directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
      }
    }

    res.setHeader('Cache-Control', directives.join(', '));
    next();
  };
}

// ============================================================================
// DECORATOR FOR CACHING FUNCTIONS
// ============================================================================

/**
 * Decorator to cache function results
 */
export function Cached(options: {
  ttl?: number;
  keyPrefix?: string;
  keyGenerator?: (...args: unknown[]) => string;
}) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const prefix = options.keyPrefix || `function:${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      const key = options.keyGenerator
        ? options.keyGenerator(...args)
        : `${prefix}:${JSON.stringify(args)}`;

      // Try cache first
      const cached = await cacheGet(key);
      if (cached !== null) {
        return cached;
      }

      // Execute original function
      const result = await originalMethod.apply(this, args);

      // Cache result
      await cacheSet(key, result, options.ttl);

      return result;
    };

    return descriptor;
  };
}
