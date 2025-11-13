-- Rollback initial schema migration
-- Drop in reverse order: triggers, functions, tables, extensions

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_voice_usage_stats ON analytics_events;
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON analytics_events;

-- Drop functions
DROP FUNCTION IF EXISTS update_voice_usage_stats();
DROP FUNCTION IF EXISTS update_daily_stats();

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS application_logs;
DROP TABLE IF EXISTS system_performance;
DROP TABLE IF EXISTS voice_usage_stats;
DROP TABLE IF EXISTS daily_stats;
DROP TABLE IF EXISTS voice_plays;
DROP TABLE IF EXISTS image_uploads;
DROP TABLE IF EXISTS analytics_events;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";

