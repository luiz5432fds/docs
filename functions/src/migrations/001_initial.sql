-- SynKrony PostgreSQL Schema - Initial Migration
-- This schema supports analytics, PNAB 2026 metrics, and caching
-- for the SynKrony AI Music Production System

-- ============================================================================
-- USAGE METRICS
-- Tracks user actions for analytics and improvement
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_metrics (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_metrics_uid ON usage_metrics(uid);
CREATE INDEX idx_usage_metrics_action ON usage_metrics(action);
CREATE INDEX idx_usage_metrics_timestamp ON usage_metrics(timestamp DESC);
CREATE INDEX idx_usage_metrics_resource ON usage_metrics(resource_type, resource_id);

-- ============================================================================
-- PATCH ANALYTICS
-- Tracks views, likes, forks for patches
-- ============================================================================

CREATE TABLE IF NOT EXISTS patch_analytics (
  id SERIAL PRIMARY KEY,
  patch_id VARCHAR(255) UNIQUE NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_patch_analytics_patch_id ON patch_analytics(patch_id);
CREATE INDEX idx_patch_analytics_views ON patch_analytics(views DESC);
CREATE INDEX idx_patch_analytics_likes ON patch_analytics(likes DESC);

-- ============================================================================
-- AI AGENT LOGS
-- Tracks AI agent executions for performance monitoring
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_logs (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(255) NOT NULL,
  agent_type VARCHAR(50) NOT NULL,
  input TEXT,
  output JSONB,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_uid ON ai_logs(uid);
CREATE INDEX idx_ai_logs_agent_type ON ai_logs(agent_type);
CREATE INDEX idx_ai_logs_timestamp ON ai_logs(timestamp DESC);
CREATE INDEX idx_ai_logs_success ON ai_logs(success);

-- ============================================================================
-- PNAB 2026 CULTURAL METRICS
-- Tracks cultural impact for PNAB 2026 viability reporting
-- ============================================================================

CREATE TABLE IF NOT EXISTS pnab_metrics (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  cultural_impact DECIMAL(3,2) CHECK (cultural_impact BETWEEN 0 AND 1),
  regional_preservation DECIMAL(3,2) CHECK (regional_preservation BETWEEN 0 AND 1),
  community_beneficiaries INTEGER DEFAULT 0,
  region VARCHAR(100),
  genre_tags VARCHAR(255)[],
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pnab_metrics_project_id ON pnab_metrics(project_id);
CREATE INDEX idx_pnab_metrics_region ON pnab_metrics(region);
CREATE INDEX idx_pnab_metrics_timestamp ON pnab_metrics(timestamp DESC);
CREATE INDEX idx_pnab_metrics_impact ON pnab_metrics(cultural_impact DESC);

-- PNAB Cultural Artifacts Tracking
CREATE TABLE IF NOT EXISTS pnab_artifacts (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  artifact_type VARCHAR(50) NOT NULL, -- 'composition', 'arrangement', 'recording'
  title VARCHAR(255) NOT NULL,
  regional_style VARCHAR(100),
  traditional_elements JSONB,
  innovation_score DECIMAL(3,2),
  preservation_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pnab_artifacts_project_id ON pnab_artifacts(project_id);
CREATE INDEX idx_pnab_artifacts_type ON pnab_artifacts(artifact_type);
CREATE INDEX idx_pnab_artifacts_style ON pnab_artifacts(regional_style);

-- ============================================================================
-- SYNKRONY PROJECT ANALYTICS
-- Extended analytics for SynKrony-specific features
-- ============================================================================

CREATE TABLE IF NOT EXISTS synkrony_analytics (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) UNIQUE NOT NULL,
  creator_uid VARCHAR(255) NOT NULL,
  genre VARCHAR(50),
  subgenre VARCHAR(100),
  key_signature VARCHAR(10),
  mode VARCHAR(10),
  tempo INTEGER,
  duration_bars INTEGER,
  partimento_used BOOLEAN DEFAULT FALSE,
  counterpoint_species INTEGER,
  regional_adaptation BOOLEAN DEFAULT FALSE,
  hardware_used VARCHAR(50)[],
  daw_exported VARCHAR(50), -- 'reaper', 'musescore', 'both'
  plays_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_synkrony_analytics_project_id ON synkrony_analytics(project_id);
CREATE INDEX idx_synkrony_analytics_creator ON synkrony_analytics(creator_uid);
CREATE INDEX idx_synkrony_analytics_genre ON synkrony_analytics(genre);
CREATE INDEX idx_synkrony_analytics_plays ON synkrony_analytics(plays_count DESC);

-- ============================================================================
-- HARDWARE USAGE TRACKING
-- Tracks XPS-10 and MM8 usage patterns
-- ============================================================================

CREATE TABLE IF NOT EXISTS hardware_usage (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(255) NOT NULL,
  hardware_type VARCHAR(50) NOT NULL, -- 'xps10', 'mm8'
  preset_id VARCHAR(255),
  midi_channel INTEGER,
  parameters JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hardware_usage_uid ON hardware_usage(uid);
CREATE INDEX idx_hardware_usage_type ON hardware_usage(hardware_type);
CREATE INDEX idx_hardware_usage_timestamp ON hardware_usage(timestamp DESC);

-- ============================================================================
-- MUSIC THEORY USAGE
-- Tracks which theory elements are most used
-- ============================================================================

CREATE TABLE IF NOT EXISTS theory_usage (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(255) NOT NULL,
  element_type VARCHAR(50) NOT NULL, -- 'scale', 'chord', 'progression', 'partimento_rule'
  element_id VARCHAR(255) NOT NULL,
  element_name VARCHAR(255),
  context JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_theory_usage_uid ON theory_usage(uid);
CREATE INDEX idx_theory_usage_element_type ON theory_usage(element_type);
CREATE INDEX idx_theory_usage_element_id ON theory_usage(element_id);

-- ============================================================================
-- PERFORMANCE METRICS
-- Application performance monitoring
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_performance_metrics_endpoint ON performance_metrics(endpoint);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX idx_performance_metrics_status ON performance_metrics(status_code);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_patch_analytics_updated_at
  BEFORE UPDATE ON patch_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_synkrony_analytics_updated_at
  BEFORE UPDATE ON synkrony_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Daily active users view
CREATE OR REPLACE VIEW daily_active_users AS
SELECT
  DATE(timestamp) AS date,
  COUNT(DISTINCT uid) AS active_users
FROM usage_metrics
WHERE timestamp > NOW() - INTERVAL '90 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Top patches view
CREATE OR REPLACE VIEW top_patches AS
SELECT
  patch_id,
  views,
  likes,
  forks,
  (likes * 2 + forks * 3 + views) AS engagement_score
FROM patch_analytics
ORDER BY engagement_score DESC
LIMIT 100;

-- Genre distribution view
CREATE OR REPLACE VIEW genre_distribution AS
SELECT
  genre,
  COUNT(*) AS project_count,
  AVG(tempo) AS avg_tempo,
  AVG(duration_bars) AS avg_duration
FROM synkrony_analytics
GROUP BY genre
ORDER BY project_count DESC;

-- AI agent performance view
CREATE OR REPLACE VIEW ai_agent_performance AS
SELECT
  agent_type,
  COUNT(*) AS total_executions,
  AVG(latency_ms) AS avg_latency_ms,
  MIN(latency_ms) AS min_latency_ms,
  MAX(latency_ms) AS max_latency_ms,
  SUM(CASE WHEN success = FALSE THEN 1 ELSE 0 END) AS error_count,
  (SUM(CASE WHEN success = FALSE THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100) AS error_rate
FROM ai_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY agent_type
ORDER BY total_executions DESC;

-- PNAB summary view
CREATE OR REPLACE VIEW pnab_cultural_summary AS
SELECT
  region,
  COUNT(DISTINCT project_id) AS total_projects,
  AVG(cultural_impact) AS avg_cultural_impact,
  AVG(regional_preservation) AS avg_regional_preservation,
  SUM(community_beneficiaries) AS total_beneficiaries,
  array_agg(DISTINCT unnest(genre_tags)) AS genres_represented
FROM pnab_metrics
WHERE timestamp > NOW() - INTERVAL '90 days'
GROUP BY region
ORDER BY total_projects DESC;

-- ============================================================================
-- MATERIALIZED VIEWS FOR EXPENSIVE QUERIES
-- ============================================================================

-- Weekly usage stats (refresh daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS weekly_usage_stats AS
SELECT
  date_trunc('week', timestamp) AS week,
  COUNT(*) AS total_actions,
  COUNT(DISTINCT uid) AS unique_users,
  array_agg(DISTINCT action) AS actions_performed
FROM usage_metrics
GROUP BY date_trunc('week', timestamp)
ORDER BY week DESC;

CREATE INDEX idx_weekly_usage_stats_week ON weekly_usage_stats(week);

-- ============================================================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- ============================================================================

-- Insert sample scales if theory table exists
-- This would be populated by the seed_music_theory script

-- ============================================================================
-- GRANTS (adjust based on your setup)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO synkrony_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO synkrony_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO synkrony_app;
