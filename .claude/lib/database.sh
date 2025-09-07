#!/bin/bash
# Database management functions for ClutterFreeSpaces dashboard

DB_PATH="$PROJECT_ROOT/.claude/data/metrics.db"
SCHEMA_PATH="$PROJECT_ROOT/.claude/data/schema.sql"

# Initialize database with schema
init_database() {
    echo "Initializing database at $DB_PATH..."
    
    # Create data directory if it doesn't exist
    mkdir -p "$(dirname "$DB_PATH")"
    
    # Apply schema
    if sqlite3 "$DB_PATH" < "$SCHEMA_PATH"; then
        echo "✓ Database initialized successfully"
        return 0
    else
        echo "✗ Failed to initialize database" >&2
        return 1
    fi
}

# Check if database exists and is accessible
check_database() {
    if [[ ! -f "$DB_PATH" ]]; then
        echo "Database not found, initializing..."
        init_database
        return $?
    fi
    
    # Test database connection
    if sqlite3 "$DB_PATH" "SELECT 1;" >/dev/null 2>&1; then
        return 0
    else
        echo "Database exists but is not accessible" >&2
        return 1
    fi
}

# Insert daily metrics
insert_daily_metrics() {
    local date="$1"
    local organic_clicks="$2"
    local organic_impressions="$3"
    local avg_position="$4"
    local ctr="$5"
    local visitors="$6"
    local page_views="$7"
    local conversion_rate="$8"
    local bounce_rate="$9"
    local session_duration="${10}"
    local bookings="${11}"
    local consultation_bookings="${12}"
    local new_leads="${13}"
    local booking_conversion="${14}"
    local pipeline_leads="${15}"
    local active_projects="${16}"
    local revenue_pipeline="${17}"
    local quality_score="${18:-0.0}"
    
    sqlite3 "$DB_PATH" "
        INSERT OR REPLACE INTO daily_metrics (
            date, organic_clicks, organic_impressions, average_position, click_through_rate,
            website_visitors, page_views, conversion_rate, bounce_rate, avg_session_duration,
            total_bookings, consultation_bookings, new_leads, booking_conversion_rate,
            leads_in_pipeline, active_projects, revenue_pipeline, data_quality_score
        ) VALUES (
            '$date', $organic_clicks, $organic_impressions, $avg_position, $ctr,
            $visitors, $page_views, $conversion_rate, $bounce_rate, $session_duration,
            $bookings, $consultation_bookings, $new_leads, $booking_conversion,
            $pipeline_leads, $active_projects, $revenue_pipeline, $quality_score
        );
    "
}

# Log API call
log_api_call() {
    local service="$1"
    local endpoint="$2"
    local status_code="$3"
    local response_time="$4"
    local error_message="$5"
    local rate_limit="${6:-0}"
    
    sqlite3 "$DB_PATH" "
        INSERT INTO api_calls (service, endpoint, status_code, response_time_ms, error_message, rate_limit_remaining)
        VALUES ('$service', '$endpoint', $status_code, $response_time, '$error_message', $rate_limit);
    "
}

# Cache API response
cache_api_response() {
    local cache_key="$1"
    local service="$2"
    local data="$3"
    local ttl_minutes="${4:-60}" # Default 1 hour TTL
    
    local expires_at=$(date -d "+${ttl_minutes} minutes" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -v "+${ttl_minutes}M" '+%Y-%m-%d %H:%M:%S')
    
    sqlite3 "$DB_PATH" "
        INSERT OR REPLACE INTO api_cache (cache_key, service, data, expires_at)
        VALUES ('$cache_key', '$service', '$data', '$expires_at');
    "
}

# Get cached API response
get_cached_response() {
    local cache_key="$1"
    
    sqlite3 "$DB_PATH" "
        SELECT data FROM api_cache 
        WHERE cache_key = '$cache_key' 
        AND expires_at > datetime('now');
    " 2>/dev/null
}

# Clean expired cache entries
clean_cache() {
    sqlite3 "$DB_PATH" "
        DELETE FROM api_cache WHERE expires_at <= datetime('now');
    " >/dev/null 2>&1
}

# Get current week metrics
get_current_week_metrics() {
    sqlite3 "$DB_PATH" -header -column "
        SELECT * FROM current_week_metrics;
    "
}

# Get last 7 days of data
get_recent_metrics() {
    sqlite3 "$DB_PATH" -header -column "
        SELECT 
            date,
            organic_clicks,
            average_position,
            total_bookings,
            new_leads,
            conversion_rate
        FROM daily_metrics 
        WHERE date >= date('now', '-7 days')
        ORDER BY date DESC;
    "
}

# Get trend data (last 30 days)
get_trend_data() {
    sqlite3 "$DB_PATH" -header -column "
        SELECT 
            date,
            organic_clicks,
            total_bookings,
            new_leads,
            CASE 
                WHEN prev_clicks IS NOT NULL THEN 
                    ROUND((organic_clicks - prev_clicks) * 100.0 / prev_clicks, 1)
                ELSE 0 
            END as clicks_change_pct
        FROM last_30_days_trend
        WHERE prev_clicks IS NOT NULL
        ORDER BY date DESC
        LIMIT 7;
    "
}

# Get API health status
get_api_health() {
    sqlite3 "$DB_PATH" -header -column "
        SELECT * FROM api_health;
    "
}

# Update goal progress
update_goal_progress() {
    local goal_type="$1"
    local current_value="$2"
    
    sqlite3 "$DB_PATH" "
        UPDATE goals 
        SET current_value = $current_value,
            status = CASE 
                WHEN current_value >= target_value THEN 'achieved'
                WHEN date('now') > period_end THEN 'missed'
                ELSE 'active'
            END
        WHERE goal_type = '$goal_type' 
        AND status = 'active'
        AND date('now') BETWEEN period_start AND period_end;
    "
}

# Get goal status
get_goal_status() {
    sqlite3 "$DB_PATH" -header -column "
        SELECT 
            goal_type,
            target_value,
            current_value,
            ROUND((current_value * 100.0 / target_value), 1) as progress_pct,
            status,
            period_end
        FROM goals 
        WHERE date('now') BETWEEN period_start AND period_end
        ORDER BY goal_type;
    "
}

# Export data as JSON for external use
export_metrics_json() {
    local days="${1:-7}"
    
    sqlite3 "$DB_PATH" -json "
        SELECT * FROM daily_metrics 
        WHERE date >= date('now', '-${days} days')
        ORDER BY date DESC;
    "
}

# Database maintenance
vacuum_database() {
    sqlite3 "$DB_PATH" "VACUUM;" >/dev/null 2>&1
    echo "✓ Database vacuumed"
}

# Backup database
backup_database() {
    local backup_dir="$PROJECT_ROOT/.claude/data/backups"
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$backup_dir/metrics_backup_$timestamp.db"
    
    mkdir -p "$backup_dir"
    
    if cp "$DB_PATH" "$backup_file"; then
        echo "✓ Database backed up to $backup_file"
        
        # Keep only last 10 backups
        ls -t "$backup_dir"/metrics_backup_*.db | tail -n +11 | xargs rm -f 2>/dev/null || true
    else
        echo "✗ Failed to backup database" >&2
        return 1
    fi
}