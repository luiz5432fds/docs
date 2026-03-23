-- SynKrony PostgreSQL Schema
-- Migration 001: Initial Schema
-- For analytics, logging, and PNAB 2026 metrics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USAGE METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for common queries
    CONSTRAINT usage_metrics_uid_idx CHECK (char_length(uid) > 0)
);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_uid ON usage_metrics(uid);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_action ON usage_metrics(action);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_timestamp ON usage_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_resource ON usage_metrics(resource_type, resource_id);

-- ============================================================================
-- PATCH ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS patch_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patch_id VARCHAR(255) UNIQUE NOT NULL,
    uid VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    likes INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patch_analytics_uid ON patch_analytics(uid);
CREATE INDEX IF NOT EXISTS idx_patch_analytics_category ON patch_analytics(category);
CREATE INDEX IF NOT EXISTS idx_patch_analytics_likes ON patch_analytics(likes DESC);
CREATE INDEX IF NOT EXISTS idx_patch_analytics_tags ON patch_analytics USING GIN(tags);

-- ============================================================================
-- AI LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid VARCHAR(255) NOT NULL,
    agent VARCHAR(100) NOT NULL,
    input TEXT NOT NULL,
    output JSONB,
    latency_ms INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ai_logs_latency_check CHECK (latency_ms >= 0)
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_uid ON ai_logs(uid);
CREATE INDEX IF NOT EXISTS idx_ai_logs_agent ON ai_logs(agent);
CREATE INDEX IF NOT EXISTS idx_ai_logs_timestamp ON ai_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_latency ON ai_logs(latency_ms);

-- Agent performance summary table (updated periodically)
CREATE TABLE IF NOT EXISTS agent_performance (
    agent VARCHAR(100) PRIMARY KEY,
    total_calls INTEGER DEFAULT 0,
    avg_latency_ms NUMERIC(10, 2),
    success_rate NUMERIC(5, 4),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PNAB 2026 METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS pnab_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(255) NOT NULL,
    uid VARCHAR(255) NOT NULL,

    -- Cultural impact scores (0-100)
    cultural_impact INTEGER NOT NULL CONSTRAINT cultural_impact_check CHECK (cultural_impact BETWEEN 0 AND 100),
    regional_preservation INTEGER NOT NULL CONSTRAINT regional_preservation_check CHECK (regional_preservation BETWEEN 0 AND 100),
    community_beneficiaries INTEGER DEFAULT 0,

    -- Project details
    genre VARCHAR(100),
    region VARCHAR(100),
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Approval status
    approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,

    CONSTRAINT pnab_metrics_positive CHECK (community_beneficiaries >= 0)
);

CREATE INDEX IF NOT EXISTS idx_pnab_metrics_uid ON pnab_metrics(uid);
CREATE INDEX IF NOT EXISTS idx_pnab_metrics_genre ON pnab_metrics(genre);
CREATE INDEX IF NOT EXISTS idx_pnab_metrics_region ON pnab_metrics(region);
CREATE INDEX IF NOT EXISTS idx_pnab_metrics_approved ON pnab_metrics(approved);
CREATE INDEX IF NOT EXISTS idx_pnab_metrics_impact ON pnab_metrics(cultural_impact DESC);

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- Daily usage summary
CREATE OR REPLACE VIEW daily_usage_summary AS
SELECT
    DATE(timestamp) as date,
    action,
    resource_type,
    COUNT(*) as count,
    COUNT(DISTINCT uid) as unique_users
FROM usage_metrics
GROUP BY DATE(timestamp), action, resource_type
ORDER BY date DESC, count DESC;

-- Agent performance summary
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT
    agent,
    COUNT(*) as total_calls,
    AVG(latency_ms) as avg_latency,
    MIN(latency_ms) as min_latency,
    MAX(latency_ms) as max_latency,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency
FROM ai_logs
GROUP BY agent
ORDER BY total_calls DESC;

-- PNAB 2026 summary
CREATE OR REPLACE VIEW pnab_2026_summary AS
SELECT
    genre,
    region,
    COUNT(*) as total_projects,
    AVG(cultural_impact) as avg_cultural_impact,
    AVG(regional_preservation) as avg_regional_preservation,
    SUM(community_beneficiaries) as total_beneficiaries
FROM pnab_metrics
WHERE approved = TRUE
GROUP BY genre, region
ORDER BY total_beneficiaries DESC;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patch_analytics_updated_at
    BEFORE UPDATE ON patch_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Aggregate patch analytics daily
CREATE OR REPLACE FUNCTION aggregate_patch_analytics()
RETURNS void AS $$
BEGIN
    INSERT INTO agent_performance (agent, total_calls, avg_latency_ms, success_rate)
    SELECT
        agent,
        COUNT(*) as total_calls,
        AVG(latency_ms) as avg_latency_ms,
        CAST(COUNT(*) FILTER (WHERE latency_ms < 5000) AS NUMERIC) / COUNT(*) as success_rate
    FROM ai_logs
    WHERE timestamp >= CURRENT_DATE - INTERVAL '1 day'
    GROUP BY agent
    ON CONFLICT (agent) DO UPDATE SET
        total_calls = EXCLUDED.total_calls,
        avg_latency_ms = EXCLUDED.avg_latency_ms,
        success_rate = EXCLUDED.success_rate,
        last_updated = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE usage_metrics IS 'Tracks user actions and resource access for analytics';
COMMENT ON TABLE patch_analytics IS 'Stores analytics data for user-created patches';
COMMENT ON TABLE ai_logs IS 'Logs AI agent execution for monitoring and optimization';
COMMENT ON TABLE pnab_metrics IS 'PNAB 2026 compliance metrics for cultural projects';
COMMENT ON TABLE agent_performance IS 'Aggregated performance metrics for AI agents';

COMMENT ON VIEW daily_usage_summary IS 'Daily aggregation of usage metrics by action and resource type';
COMMENT ON VIEW agent_performance_summary IS 'Performance statistics for all AI agents';
COMMENT ON VIEW pnab_2026_summary IS 'PNAB 2026 summary statistics by genre and region';
