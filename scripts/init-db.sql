-- AltRead Analytics Database Schema
-- This script initializes the database with all necessary tables for analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analytics Events Table (raw event data)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    user_id VARCHAR(100), -- Optional user identifier
    session_id VARCHAR(100), -- Optional session identifier
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes separately
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Image Uploads Table (processed images)
CREATE TABLE IF NOT EXISTS image_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(50),
    image_hash VARCHAR(64), -- For deduplication
    alt_text TEXT,
    processing_time_ms INTEGER,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for image_uploads
CREATE INDEX IF NOT EXISTS idx_image_uploads_created_at ON image_uploads(created_at);
CREATE INDEX IF NOT EXISTS idx_image_uploads_success ON image_uploads(success);
CREATE INDEX IF NOT EXISTS idx_image_uploads_hash ON image_uploads(image_hash);

-- Voice Plays Table (TTS usage)
CREATE TABLE IF NOT EXISTS voice_plays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voice_name VARCHAR(100),
    text_length INTEGER,
    duration_ms INTEGER,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for voice_plays
CREATE INDEX IF NOT EXISTS idx_voice_plays_created_at ON voice_plays(created_at);
CREATE INDEX IF NOT EXISTS idx_voice_plays_voice_name ON voice_plays(voice_name);
CREATE INDEX IF NOT EXISTS idx_voice_plays_success ON voice_plays(success);

-- Daily Stats Table (aggregated data for performance)
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    total_images INTEGER DEFAULT 0,
    total_alt_texts INTEGER DEFAULT 0,
    total_voice_plays INTEGER DEFAULT 0,
    total_processing_time_ms BIGINT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_processing_time_ms DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for daily_stats
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- Voice Usage Stats Table (popular voices)
CREATE TABLE IF NOT EXISTS voice_usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voice_name VARCHAR(100) NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(voice_name)
);

-- Create indexes for voice_usage_stats
CREATE INDEX IF NOT EXISTS idx_voice_usage_stats_count ON voice_usage_stats(usage_count DESC);

-- System Performance Table (API metrics)
CREATE TABLE IF NOT EXISTS system_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for system_performance
CREATE INDEX IF NOT EXISTS idx_system_performance_name ON system_performance(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_performance_recorded_at ON system_performance(recorded_at);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created_at ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at_desc ON analytics_events(created_at DESC);

-- Insert initial data
INSERT INTO daily_stats (date, total_images, total_alt_texts, total_voice_plays) 
VALUES (CURRENT_DATE, 0, 0, 0) 
ON CONFLICT (date) DO NOTHING;

-- Create a function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily stats when new events are inserted
    INSERT INTO daily_stats (date, total_images, total_alt_texts, total_voice_plays)
    VALUES (CURRENT_DATE, 0, 0, 0)
    ON CONFLICT (date) DO UPDATE SET
        total_images = daily_stats.total_images + CASE WHEN NEW.event_type = 'image_uploaded' THEN 1 ELSE 0 END,
        total_alt_texts = daily_stats.total_alt_texts + CASE WHEN NEW.event_type = 'alt_text_generated' THEN 1 ELSE 0 END,
        total_voice_plays = daily_stats.total_voice_plays + CASE WHEN NEW.event_type = 'voice_play_started' THEN 1 ELSE 0 END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update daily stats
CREATE TRIGGER trigger_update_daily_stats
    AFTER INSERT ON analytics_events
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_stats();

-- Create a function to update voice usage stats
CREATE OR REPLACE FUNCTION update_voice_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update voice usage when voice plays are recorded
    IF NEW.event_type = 'voice_play_started' AND NEW.event_data->>'voice_name' IS NOT NULL THEN
        INSERT INTO voice_usage_stats (voice_name, usage_count, last_used)
        VALUES (NEW.event_data->>'voice_name', 1, NOW())
        ON CONFLICT (voice_name) DO UPDATE SET
            usage_count = voice_usage_stats.usage_count + 1,
            last_used = NOW(),
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update voice usage stats
CREATE TRIGGER trigger_update_voice_usage_stats
    AFTER INSERT ON analytics_events
    FOR EACH ROW
    EXECUTE FUNCTION update_voice_usage_stats();
