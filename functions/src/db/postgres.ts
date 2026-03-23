/**
 * PostgreSQL Module for SynKrony
 * Handles analytics, logging, and PNAB 2026 metrics
 */

import { Pool, PoolClient, QueryResult } from 'pg';

let pool: Pool | null = null;

/**
 * Get PostgreSQL connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL;

    if (!connectionString) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  return pool;
}

/**
 * Execute a query
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await getPool().query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const client = await getPool().connect();
  return client;
}

// ============================================================================
// USAGE METRICS
// ============================================================================

export interface UsageMetric {
  uid: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a usage metric
 */
export async function logUsage(metric: UsageMetric): Promise<void> {
  const text = `
    INSERT INTO usage_metrics (uid, action, resource_type, resource_id, metadata)
    VALUES ($1, $2, $3, $4, $5)
  `;

  await query(text, [
    metric.uid,
    metric.action,
    metric.resource_type,
    metric.resource_id || null,
    metric.metadata ? JSON.stringify(metric.metadata) : null
  ]);
}

/**
 * Get usage metrics for a user
 */
export async function getUserUsageMetrics(
  uid: string,
  limit = 100
): Promise<any[]> {
  const text = `
    SELECT * FROM usage_metrics
    WHERE uid = $1
    ORDER BY timestamp DESC
    LIMIT $2
  `;

  const result = await query(text, [uid, limit]);
  return result.rows;
}

// ============================================================================
// PATCH ANALYTICS
// ============================================================================

export interface PatchAnalytics {
  patch_id: string;
  uid: string;
  category: string;
  tags: string[];
}

/**
 * Update patch analytics
 */
export async function updatePatchAnalytics(
  analytics: PatchAnalytics
): Promise<void> {
  const text = `
    INSERT INTO patch_analytics (patch_id, uid, category, tags)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (patch_id)
    DO UPDATE SET
      updated_at = CURRENT_TIMESTAMP
  `;

  await query(text, [
    analytics.patch_id,
    analytics.uid,
    analytics.category,
    analytics.tags
  ]);
}

/**
 * Increment patch likes
 */
export async function incrementPatchLikes(patchId: string): Promise<void> {
  const text = `
    UPDATE patch_analytics
    SET likes = likes + 1
    WHERE patch_id = $1
  `;

  await query(text, [patchId]);
}

/**
 * Get popular patches
 */
export async function getPopularPatches(limit = 10): Promise<any[]> {
  const text = `
    SELECT pa.*, p.name, p.category
    FROM patch_analytics pa
    JOIN patches p ON pa.patch_id = p.id
    ORDER BY pa.likes DESC
    LIMIT $1
  `;

  const result = await query(text, [limit]);
  return result.rows;
}

// ============================================================================
// AI LOGS
// ============================================================================

export interface AILog {
  uid: string;
  agent: string;
  input: string;
  output: Record<string, unknown>;
  latency_ms: number;
}

/**
 * Log AI agent execution
 */
export async function logAI(log: AILog): Promise<void> {
  const text = `
    INSERT INTO ai_logs (uid, agent, input, output, latency_ms)
    VALUES ($1, $2, $3, $4, $5)
  `;

  await query(text, [
    log.uid,
    log.agent,
    log.input,
    JSON.stringify(log.output),
    log.latency_ms
  ]);
}

/**
 * Get AI agent statistics
 */
export async function getAgentStats(agent: string): Promise<{
  total_calls: number;
  avg_latency: number;
}> {
  const text = `
    SELECT
      COUNT(*) as total_calls,
      AVG(latency_ms) as avg_latency
    FROM ai_logs
    WHERE agent = $1
  `;

  const result = await query(text, [agent]);
  return {
    total_calls: parseInt(result.rows[0].total_calls),
    avg_latency: parseFloat(result.rows[0].avg_latency)
  };
}

// ============================================================================
// PNAB 2026 METRICS
// ============================================================================

export interface PNABMetric {
  project_id: string;
  cultural_impact: number; // 0-100
  regional_preservation: number; // 0-100
  community_beneficiaries: number;
}

/**
 * Record PNAB 2026 metric
 */
export async function recordPNABMetric(metric: PNABMetric): Promise<void> {
  const text = `
    INSERT INTO pnab_metrics (
      project_id, cultural_impact, regional_preservation, community_beneficiaries
    )
    VALUES ($1, $2, $3, $4)
  `;

  await query(text, [
    metric.project_id,
    metric.cultural_impact,
    metric.regional_preservation,
    metric.community_beneficiaries
  ]);
}

/**
 * Get PNAB 2026 summary
 */
export async function getPNABSummary(): Promise<{
  total_projects: number;
  avg_cultural_impact: number;
  avg_regional_preservation: number;
  total_beneficiaries: number;
}> {
  const text = `
    SELECT
      COUNT(*) as total_projects,
      AVG(cultural_impact) as avg_cultural_impact,
      AVG(regional_preservation) as avg_regional_preservation,
      SUM(community_beneficiaries) as total_beneficiaries
    FROM pnab_metrics
  `;

  const result = await query(text);
  return {
    total_projects: parseInt(result.rows[0].total_projects),
    avg_cultural_impact: parseFloat(result.rows[0].avg_cultural_impact || 0),
    avg_regional_preservation: parseFloat(result.rows[0].avg_regional_preservation || 0),
    total_beneficiaries: parseInt(result.rows[0].total_beneficiaries || 0)
  };
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check database connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('PostgreSQL health check failed:', error);
    return false;
  }
}

/**
 * Close all connections
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
