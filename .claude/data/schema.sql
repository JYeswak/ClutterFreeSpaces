-- ClutterFreeSpaces Business Dashboard Schema
-- SQLite database for tracking business metrics and analytics

PRAGMA foreign_keys = ON;

-- Main metrics table for daily checkin data
CREATE TABLE IF NOT EXISTS daily_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE UNIQUE NOT NULL DEFAULT (date('now')),
    
    -- SEO Metrics from Google Search Console
    organic_clicks INTEGER,
    organic_impressions INTEGER,
    average_position REAL,
    click_through_rate REAL,
    
    -- GA4 Metrics
    website_visitors INTEGER,
    page_views INTEGER,
    conversion_rate REAL,
    bounce_rate REAL,
    avg_session_duration INTEGER, -- in seconds
    
    -- Calendly Booking Data
    total_bookings INTEGER,
    consultation_bookings INTEGER,
    new_leads INTEGER,
    booking_conversion_rate REAL,
    
    -- Airtable CRM Data
    leads_in_pipeline INTEGER,
    active_projects INTEGER,
    revenue_pipeline REAL,
    
    -- Meta fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_quality_score REAL DEFAULT 0.0 -- 0-100 based on API response completeness
);

-- Weekly aggregated metrics for trend analysis
CREATE TABLE IF NOT EXISTS weekly_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    
    -- Aggregated values
    total_organic_clicks INTEGER,
    avg_position REAL,
    total_bookings INTEGER,
    total_new_leads INTEGER,
    weekly_conversion_rate REAL,
    
    -- Week-over-week changes
    clicks_change_pct REAL,
    position_change REAL,
    bookings_change_pct REAL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(week_start, week_end)
);

-- API call log for debugging and rate limiting
CREATE TABLE IF NOT EXISTS api_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service TEXT NOT NULL, -- 'gsc', 'ga4', 'calendly', 'airtable'
    endpoint TEXT,
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    rate_limit_remaining INTEGER,
    called_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cache table for API responses to reduce calls
CREATE TABLE IF NOT EXISTS api_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT UNIQUE NOT NULL,
    service TEXT NOT NULL,
    data TEXT NOT NULL, -- JSON response
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO keyword tracking from Google Search Console
CREATE TABLE IF NOT EXISTS keyword_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    keyword TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    position REAL,
    click_through_rate REAL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(date, keyword)
);

-- Lead source attribution tracking
CREATE TABLE IF NOT EXISTS lead_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL DEFAULT (date('now')),
    source TEXT NOT NULL, -- 'organic', 'direct', 'referral', 'social', 'email'
    medium TEXT,
    campaign TEXT,
    leads_count INTEGER DEFAULT 1,
    bookings_count INTEGER DEFAULT 0,
    conversion_rate REAL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content calendar tracking
CREATE TABLE IF NOT EXISTS content_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    content_type TEXT, -- 'blog_post', 'social', 'email', 'video'
    title TEXT,
    status TEXT DEFAULT 'planned', -- 'planned', 'in_progress', 'published', 'delayed'
    platform TEXT,
    engagement_score REAL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business goals and KPI tracking
CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_type TEXT NOT NULL, -- 'monthly_bookings', 'organic_traffic', 'conversion_rate'
    target_value REAL NOT NULL,
    current_value REAL DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'achieved', 'missed', 'paused'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_api_calls_service_date ON api_calls(service, called_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_keyword_metrics_date ON keyword_metrics(date);
CREATE INDEX IF NOT EXISTS idx_lead_sources_date ON lead_sources(date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON content_calendar(date);

-- Views for common queries
CREATE VIEW IF NOT EXISTS current_week_metrics AS
SELECT 
    COUNT(*) as days_recorded,
    AVG(organic_clicks) as avg_daily_clicks,
    AVG(average_position) as avg_position,
    SUM(total_bookings) as total_bookings,
    SUM(new_leads) as total_new_leads,
    AVG(conversion_rate) as avg_conversion_rate
FROM daily_metrics 
WHERE date >= date('now', '-7 days');

CREATE VIEW IF NOT EXISTS last_30_days_trend AS
SELECT 
    date,
    organic_clicks,
    total_bookings,
    new_leads,
    LAG(organic_clicks) OVER (ORDER BY date) as prev_clicks,
    LAG(total_bookings) OVER (ORDER BY date) as prev_bookings
FROM daily_metrics 
WHERE date >= date('now', '-30 days')
ORDER BY date;

CREATE VIEW IF NOT EXISTS api_health AS
SELECT 
    service,
    COUNT(*) as total_calls,
    AVG(response_time_ms) as avg_response_time,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
    MAX(called_at) as last_call
FROM api_calls 
WHERE called_at >= datetime('now', '-24 hours')
GROUP BY service;

-- Triggers to update timestamps
CREATE TRIGGER IF NOT EXISTS update_daily_metrics_timestamp 
    AFTER UPDATE ON daily_metrics
BEGIN
    UPDATE daily_metrics SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_goals_timestamp 
    AFTER UPDATE ON goals
BEGIN
    UPDATE goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Insert initial baseline goals (can be customized)
INSERT OR IGNORE INTO goals (goal_type, target_value, period_start, period_end) VALUES
('monthly_bookings', 20, date('now', 'start of month'), date('now', 'start of month', '+1 month', '-1 day')),
('organic_clicks', 500, date('now', 'start of month'), date('now', 'start of month', '+1 month', '-1 day')),
('conversion_rate', 5.0, date('now', 'start of month'), date('now', 'start of month', '+1 month', '-1 day'));