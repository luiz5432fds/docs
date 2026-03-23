/**
 * PostgreSQL Module for SynKrony Analytics
 *
 * This module handles analytics data that doesn't need to be in Firestore.
 * Used for:
 * - Usage metrics and statistics
 * - Patch analytics (views, likes, forks)
 * - AI agent performance logs
 * - PNAB 2026 cultural impact metrics
 *
 * Connection pooling and query optimization included.
 */

import {Pool, PoolClient, QueryResult} from 'pg';
import {UsageMetric, PatchAnalytics, AiLog, PnabMetric} from '../types';

// ============================================================================
// CONNECTION POOL
// ============================================================================

let pool: Pool | null = null;

/**
 * Initialize PostgreSQL connection pool
 */
export function initPostgres(): Pool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL;

    if (!connectionString) {
      console.warn('POSTGRES_URL not set, PostgreSQL features disabled');
      pool = new Pool({ max: 0 });  // Empty pool
    } else {
      pool = new Pool({
        connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      pool.on('error', (err) => {
        console.error('PostgreSQL pool error:', err);
      });
    }
  }

  return pool;
}

/**
 * Get a client from the pool
 */
export async function getClient(): Promise<PoolClient | null> {
  const pool = initPostgres();

  if (pool.totalCount === 0) {
    return null;
  }

  try {
    return await pool.connect();
  } catch (error) {
    console.error('Failed to get PostgreSQL client:', error);
    return null;
  }
}

// ============================================================================
// USAGE METRICS
// ============================================================================

/**
 * Log a usage metric
 */
export async function logUsageMetric(metric: Omit<UsageMetric, 'id'>): Promise<boolean> {
  const client = await getClient();
  if (!client) return false;

  try {
    await client.query(
      `INSERT INTO usage_metrics (uid, action, resource_type, resource_id, timestamp, metadata)
       VALUES ($1, $2, $3, $4, NOW(), $5)`,
      [metric.uid, metric.action, metric.resource_type, metric.resource_id, JSON.stringify(metric.metadata || {})]
    );
    return true;
  } catch (error) {
    console.error('Failed to log usage metric:', error);
    return false;
  } finally {
    client.release();
  }
}

/**
 * Get usage metrics for a user
 */
export async function getUserUsageMetrics(
  uid: string,
  limit: number = 100
): Promise<UsageMetric[]> {
  const client = await getClient();
  if (!client) return [];

  try {
    const result: QueryResult = await client.query(
      `SELECT id, uid, action, resource_type, resource_id, timestamp, metadata
       FROM usage_metrics
       WHERE uid = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [uid, limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      uid: row.uid,
      action: row.action,
      resource_type: row.resource_type,
      resource_id: row.resource_id,
      timestamp: row.timestamp,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    }));
  } catch (error) {
    console.error('Failed to get user usage metrics:', error);
    return [];
  } finally {
    client.release();
  }
}

/**
 * Get aggregated usage statistics
 */
export async function getUsageStats(days: number = 30): Promise<{
  total_actions: number;
  unique_users: number;
  top_actions: Array<{action: string; count: number}>;
}> {
  const client = await getClient();
  if (!client) return {total_actions: 0, unique_users: 0, top_actions: []};

  try {
    const totalResult = await client.query(
      `SELECT COUNT(*) as count FROM usage_metrics
       WHERE timestamp > NOW() - INTERVAL '${days} days'`
    );

    const usersResult = await client.query(
      `SELECT COUNT(DISTINCT uid) as count FROM usage_metrics
       WHERE timestamp > NOW() - INTERVAL '${days} days'`
    );

    const actionsResult = await client.query(
      `SELECT action, COUNT(*) as count FROM usage_metrics
       WHERE timestamp > NOW() - INTERVAL '${days} days'
       GROUP BY action
       ORDER BY count DESC
       LIMIT 10`
    );

    return {
      total_actions: parseInt(totalResult.rows[0].count),
      unique_users: parseInt(usersResult.rows[0].count),
      top_actions: actionsResult.rows
    };
  } catch (error) {
    console.error('Failed to get usage stats:', error);
    return {total_actions: 0, unique_users: 0, top_actions: []};
  } finally {
    client.release();
  }
}

// ============================================================================
// PATCH ANALYTICS
// ============================================================================

/**
 * Increment patch view count
 */
export async function incrementPatchViews(patchId: string): Promise<boolean> {
  const client = await getClient();
  if (!client) return false;

  try {
    await client.query(
      `INSERT INTO patch_analytics (patch_id, views, created_at, updated_at)
       VALUES ($1, 1, NOW(), NOW())
       ON CONFLICT (patch_id) DO UPDATE
       SET views = patch_analytics.views + 1, updated_at = NOW()`,
      [patchId]
    );
    return true;
  } catch (error) {
    console.error('Failed to increment patch views:', error);
    return false;
  } finally {
    client.release();
  }
}

/**
 * Get patch analytics
 */
export async function getPatchAnalytics(patchId: string): Promise<PatchAnalytics | null> {
  const client = await getClient();
  if (!client) return null;

  try {
    const result = await client.query(
      `SELECT id, patch_id, views, likes, forks, created_at, updated_at
       FROM patch_analytics
       WHERE patch_id = $1`,
      [patchId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      patch_id: row.patch_id,
      views: row.views,
      likes: row.likes,
      forks: row.forks,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  } catch (error) {
    console.error('Failed to get patch analytics:', error);
    return null;
  } finally {
    client.release();
  }
}

// ============================================================================
// AI AGENT LOGS
// ============================================================================

/**
 * Log AI agent execution
 */
export async function logAiExecution(log: Omit<AiLog, 'id' | 'timestamp'>): Promise<boolean> {
  const client = await getClient();
  if (!client) return false;

  try {
    await client.query(
      `INSERT INTO ai_logs (uid, agent_type, input, output, latency_ms, timestamp)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [log.uid, log.agent_type, log.input, JSON.stringify(log.output), log.latency_ms]
    );
    return true;
  } catch (error) {
    console.error('Failed to log AI execution:', error);
    return false;
  } finally {
    client.release();
  }
}

/**
 * Get AI agent performance stats
 */
export async function getAiPerformanceStats(agentType: string, days: number = 7): Promise<{
  avg_latency_ms: number;
  total_executions: number;
  error_rate: number;
}> {
  const client = await getClient();
  if (!client) return {avg_latency_ms: 0, total_executions: 0, error_rate: 0};

  try {
    const result = await client.query(
      `SELECT AVG(latency_ms) as avg_latency, COUNT(*) as total
       FROM ai_logs
       WHERE agent_type = $1
       AND timestamp > NOW() - INTERVAL '${days} days'`,
      [agentType]
    );

    return {
      avg_latency_ms: Math.round(parseFloat(result.rows[0].avg_latency) || 0),
      total_executions: parseInt(result.rows[0].total),
      error_rate: 0  // Would need error tracking
    };
  } catch (error) {
    console.error('Failed to get AI performance stats:', error);
    return {avg_latency_ms: 0, total_executions: 0, error_rate: 0};
  } finally {
    client.release();
  }
}

// ============================================================================
// PNAB 2026 METRICS
// ============================================================================

/**
 * Log PNAB cultural impact metric
 */
export async function logPnabMetric(metric: Omit<PnabMetric, 'id' | 'timestamp'>): Promise<boolean> {
  const client = await getClient();
  if (!client) return false;

  try {
    await client.query(
      `INSERT INTO pnab_metrics (project_id, cultural_impact, regional_preservation, community_beneficiaries, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [metric.project_id, metric.cultural_impact, metric.regional_preservation, metric.community_beneficiaries]
    );
    return true;
  } catch (error) {
    console.error('Failed to log PNAB metric:', error);
    return false;
  } finally {
    client.release();
  }
}

/**
 * Get PNAB metrics for a project
 */
export async function getPnabMetrics(projectId: string): Promise<PnabMetric[]> {
  const client = await getClient();
  if (!client) return [];

  try {
    const result = await client.query(
      `SELECT id, project_id, cultural_impact, regional_preservation, community_beneficiaries, timestamp
       FROM pnab_metrics
       WHERE project_id = $1
       ORDER BY timestamp DESC`,
      [projectId]
    );

    return result.rows.map(row => ({
      id: row.id,
      project_id: row.project_id,
      cultural_impact: row.cultural_impact,
      regional_preservation: row.regional_preservation,
      community_beneficiaries: row.community_beneficiaries,
      timestamp: row.timestamp
    }));
  } catch (error) {
    console.error('Failed to get PNAB metrics:', error);
    return [];
  } finally {
    client.release();
  }
}

/**
 * Get PNAB summary statistics
 */
export async function getPnabSummary(): Promise<{
  total_projects: number;
  avg_cultural_impact: number;
  avg_regional_preservation: number;
  total_beneficiaries: number;
}> {
  const client = await getClient();
  if (!client) return {total_projects: 0, avg_cultural_impact: 0, avg_regional_preservation: 0, total_beneficiaries: 0};

  try {
    const result = await client.query(
      `SELECT
         COUNT(DISTINCT project_id) as total_projects,
         AVG(cultural_impact) as avg_cultural,
         AVG(regional_preservation) as avg_regional,
         SUM(community_beneficiaries) as total_beneficiaries
       FROM pnab_metrics
       WHERE timestamp > NOW() - INTERVAL '90 days'`
    );

    return {
      total_projects: parseInt(result.rows[0].total_projects),
      avg_cultural_impact: Math.round(parseFloat(result.rows[0].avg_cultural) || 0),
      avg_regional_preservation: Math.round(parseFloat(result.rows[0].avg_regional) || 0),
      total_beneficiaries: parseInt(result.rows[0].total_beneficiaries) || 0
    };
  } catch (error) {
    console.error('Failed to get PNAB summary:', error);
    return {total_projects: 0, avg_cultural_impact: 0, avg_regional_preservation: 0, total_beneficiaries: 0};
  } finally {
    client.release();
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check PostgreSQL connection health
 */
export async function healthCheck(): Promise<boolean> {
  const client = await getClient();
  if (!client) return false;

  try {
    await client.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  } finally {
    client.release();
  }
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Close all connections in the pool
 */
export async function closePostgres(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
