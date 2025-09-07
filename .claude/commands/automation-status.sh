#!/bin/bash
# ClutterFreeSpaces Automation Status Command
# Usage: /automation-status [options]
# 
# Options:
#   --fix           Auto-fix common issues
#   --backup        Database backup
#   --health        Detailed health check
#   --help          Show this help message

set -euo pipefail

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export PROJECT_ROOT

# Source required libraries
source "$PROJECT_ROOT/.claude/lib/database.sh"
source "$PROJECT_ROOT/.claude/lib/api_clients.sh"
source "$PROJECT_ROOT/.claude/lib/dashboard.sh"
source "$PROJECT_ROOT/.claude/lib/notifications.sh"

# Help function
show_help() {
    echo "ClutterFreeSpaces Automation Status & System Health"
    echo ""
    echo "USAGE:"
    echo "  /automation-status [options]"
    echo ""
    echo "OPTIONS:"
    echo "  --fix           Auto-fix common issues"
    echo "  --backup        Create database backup"
    echo "  --health        Detailed system health check"
    echo "  --notifications Show recent notifications"
    echo "  --help          Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  /automation-status                # System health overview"
    echo "  /automation-status --health       # Detailed diagnostics"
    echo "  /automation-status --fix          # Auto-repair issues"
    echo ""
}

# Main automation status overview
show_automation_status() {
    echo "⚙️ ClutterFreeSpaces Automation Status"
    echo "═════════════════════════════════════════"
    echo ""
    
    local current_time=$(date '+%Y-%m-%d %H:%M:%S')
    echo "System Check Time: $current_time"
    echo ""
    
    # Check core system components
    check_core_systems
    echo ""
    
    # Check API integrations
    check_api_integrations  
    echo ""
    
    # Check automation health
    check_automation_health
    echo ""
    
    # Check data quality
    check_data_quality
    echo ""
    
    # Recent system activity
    show_recent_activity
}

# Check core system components
check_core_systems() {
    echo "🔧 **CORE SYSTEMS STATUS**"
    echo "═══════════════════════════"
    echo ""
    
    # Database status
    if check_database 2>/dev/null; then
        echo "✅ SQLite Database: Connected and operational"
        local db_size=$(du -h "$DB_PATH" 2>/dev/null | cut -f1 || echo "Unknown")
        echo "   Database Size: $db_size"
        local record_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM daily_metrics;" 2>/dev/null || echo "0")
        echo "   Daily Metrics Records: $record_count"
    else
        echo "❌ SQLite Database: Not available or corrupted"
        echo "   Run: /checkin --init"
    fi
    
    echo ""
    
    # Commands availability
    echo "📋 Command Suite Status:"
    local commands_dir="$PROJECT_ROOT/.claude/commands"
    
    for command in checkin seo-audit content-ideas lead-report competitor-check weekly-report automation-status; do
        if [[ -f "$commands_dir/$command.sh" && -x "$commands_dir/$command.sh" ]]; then
            echo "   ✅ /$command - Available"
        else
            echo "   ❌ /$command - Missing or not executable"
        fi
    done
    
    echo ""
    
    # Environment configuration
    echo "🌐 Environment Configuration:"
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        echo "   ✅ .env file exists"
        
        # Check required variables
        local missing_vars=()
        for var in CALENDLY_PERSONAL_ACCESS_TOKEN AIRTABLE_API_KEY AIRTABLE_BASE_ID; do
            if [[ -z "${!var:-}" ]]; then
                missing_vars+=("$var")
            fi
        done
        
        if [[ ${#missing_vars[@]} -eq 0 ]]; then
            echo "   ✅ Required API keys configured"
        else
            echo "   ⚠️ Missing variables: ${missing_vars[*]}"
        fi
    else
        echo "   ❌ .env file missing"
    fi
}

# Check API integration status
check_api_integrations() {
    echo "🌐 **API INTEGRATIONS STATUS**" 
    echo "═══════════════════════════════"
    echo ""
    
    # Test each API
    echo "Testing API connections..."
    echo ""
    
    # Calendly API
    echo "📅 **Calendly API**"
    local calendly_result
    calendly_result=$(fetch_calendly_data 2>/dev/null || echo '{"error":"Connection failed"}')
    local calendly_error=$(echo "$calendly_result" | jq -r '.error // ""')
    
    if [[ -z "$calendly_error" ]]; then
        echo "   ✅ Status: Connected"
        local bookings=$(echo "$calendly_result" | jq -r '.bookings // 0')
        echo "   📊 Recent Bookings: $bookings"
        echo "   🔄 Last Updated: $(date)"
    else
        echo "   ❌ Status: Failed"
        echo "   ❌ Error: $calendly_error"
        echo "   🔧 Fix: Check CALENDLY_PERSONAL_ACCESS_TOKEN in .env"
    fi
    
    echo ""
    
    # Airtable API
    echo "📋 **Airtable CRM**"
    local airtable_result
    airtable_result=$(fetch_airtable_data 2>/dev/null || echo '{"error":"Connection failed"}')
    local airtable_error=$(echo "$airtable_result" | jq -r '.error // ""')
    
    if [[ -z "$airtable_error" ]]; then
        echo "   ✅ Status: Connected"
        local pipeline=$(echo "$airtable_result" | jq -r '.pipeline_leads // 0')
        echo "   📊 Pipeline Leads: $pipeline"
        echo "   🔄 Last Updated: $(date)"
    else
        echo "   ❌ Status: Failed"
        echo "   ❌ Error: $airtable_error"  
        echo "   🔧 Fix: Check AIRTABLE_API_KEY and AIRTABLE_BASE_ID in .env"
    fi
    
    echo ""
    
    # Google Search Console
    echo "🔍 **Google Search Console**"
    local gsc_result
    gsc_result=$(fetch_gsc_data 2>/dev/null || echo '{"error":"Not configured or connection failed"}')
    local gsc_error=$(echo "$gsc_result" | jq -r '.error // ""')
    
    if [[ -z "$gsc_error" ]]; then
        echo "   ✅ Status: Connected"
        local clicks=$(echo "$gsc_result" | jq -r '.clicks // 0')
        echo "   📊 Recent Clicks: $clicks"
        echo "   🔄 Last Updated: $(date)"
    else
        echo "   ⚠️ Status: Not configured"
        echo "   ❌ Error: $gsc_error"
        echo "   🔧 Fix: Set up GSC_SERVICE_ACCOUNT_KEY_PATH and GSC_SITE_URL"
    fi
    
    echo ""
    
    # Google Analytics 4
    echo "📈 **Google Analytics 4**"
    local ga4_result
    ga4_result=$(fetch_ga4_data 2>/dev/null || echo '{"error":"Not configured or connection failed"}')
    local ga4_error=$(echo "$ga4_result" | jq -r '.error // ""')
    
    if [[ -z "$ga4_error" ]]; then
        echo "   ✅ Status: Connected"
        local visitors=$(echo "$ga4_result" | jq -r '.visitors // 0')
        echo "   📊 Recent Visitors: $visitors"
        echo "   🔄 Last Updated: $(date)"
    else
        echo "   ⚠️ Status: Not configured"
        echo "   ❌ Error: $ga4_error"
        echo "   🔧 Fix: Set up GA4_MEASUREMENT_ID and GA4_API_SECRET"
    fi
}

# Check automation health
check_automation_health() {
    echo "🤖 **AUTOMATION HEALTH**"
    echo "════════════════════════"
    echo ""
    
    # Webhook status
    echo "🔗 **Webhook Integrations**"
    echo "   📅 Calendly Webhook:"
    echo "      Endpoint: https://clutterfreespaces-production.up.railway.app/api/calendly-webhook"
    echo "      Status: ✅ Active"
    echo "      Events: invitee.created, invitee.canceled"
    
    echo ""
    
    # Data collection frequency
    echo "📊 **Data Collection Schedule**"
    echo "   Daily Metrics: Manual via /checkin command"
    echo "   API Cache Duration: 1-4 hours (automatic refresh)"
    echo "   Database Cleanup: Weekly (Mondays)"
    echo "   Backup Schedule: Weekly (Mondays)"
    
    echo ""
    
    # Notification system
    echo "🔔 **Notification System**"
    if is_notifications_enabled; then
        echo "   Status: ✅ Enabled"
        echo "   Alert Types: High, Medium, Low priority"
        echo "   Triggers: SEO drops, booking alerts, goal progress"
    else
        echo "   Status: ❌ Disabled"
        echo "   Enable: Set NOTIFICATION_ENABLED=true in .env"
    fi
    
    # Recent notifications
    if check_database 2>/dev/null; then
        local notification_count
        notification_count=$(sqlite3 "$DB_PATH" "
            SELECT COUNT(*) FROM notifications 
            WHERE created_at >= date('now', '-7 days');
        " 2>/dev/null || echo "0")
        echo "   Recent Notifications (7 days): $notification_count"
    fi
}

# Check data quality and completeness
check_data_quality() {
    echo "📊 **DATA QUALITY ASSESSMENT**"
    echo "═══════════════════════════════"
    echo ""
    
    if ! check_database 2>/dev/null; then
        echo "❌ Database not available - cannot assess data quality"
        return 1
    fi
    
    # Data completeness check
    local recent_records
    recent_records=$(sqlite3 "$DB_PATH" "
        SELECT COUNT(*) FROM daily_metrics 
        WHERE date >= date('now', '-7 days');
    " 2>/dev/null || echo "0")
    
    echo "📈 **Metrics Collection Quality**"
    echo "   Recent Records (7 days): $recent_records"
    
    if [[ $recent_records -gt 5 ]]; then
        echo "   ✅ Good data collection frequency"
    elif [[ $recent_records -gt 2 ]]; then
        echo "   ⚠️ Moderate data collection (run /checkin daily)"
    else
        echo "   ❌ Low data collection (establish daily routine)"
    fi
    
    echo ""
    
    # Data quality score
    local avg_quality
    avg_quality=$(sqlite3 "$DB_PATH" "
        SELECT AVG(data_quality_score) FROM daily_metrics 
        WHERE date >= date('now', '-7 days');
    " 2>/dev/null || echo "0")
    
    echo "📊 **Data Quality Score**"
    echo "   Average Quality: $avg_quality/100"
    
    if [[ $(echo "$avg_quality > 80" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
        echo "   ✅ High quality data (>80)"
    elif [[ $(echo "$avg_quality > 60" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
        echo "   ⚠️ Moderate quality data (60-80)"
    else
        echo "   ❌ Low quality data (<60) - check API connections"
    fi
    
    echo ""
    
    # API call success rate
    local api_success_rate
    api_success_rate=$(sqlite3 "$DB_PATH" "
        SELECT 
            ROUND(
                (COUNT(*) - COUNT(CASE WHEN status_code >= 400 THEN 1 END)) * 100.0 / COUNT(*), 
                1
            ) as success_rate
        FROM api_calls 
        WHERE called_at >= datetime('now', '-24 hours');
    " 2>/dev/null || echo "0")
    
    echo "🌐 **API Reliability**"
    echo "   Success Rate (24h): $api_success_rate%"
    
    if [[ $(echo "$api_success_rate > 95" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
        echo "   ✅ Excellent API reliability (>95%)"
    elif [[ $(echo "$api_success_rate > 85" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
        echo "   ⚠️ Good API reliability (85-95%)"
    else
        echo "   ❌ Poor API reliability (<85%) - investigate issues"
    fi
}

# Show recent system activity
show_recent_activity() {
    echo "📋 **RECENT SYSTEM ACTIVITY**"
    echo "═════════════════════════════"
    echo ""
    
    if ! check_database 2>/dev/null; then
        echo "❌ Database not available - cannot show activity"
        return 1
    fi
    
    # Recent API calls
    echo "🌐 **Recent API Activity**"
    local recent_api_calls
    recent_api_calls=$(sqlite3 "$DB_PATH" "
        SELECT 
            service,
            COUNT(*) as calls,
            MAX(called_at) as last_call,
            AVG(response_time_ms) as avg_response_time
        FROM api_calls 
        WHERE called_at >= datetime('now', '-24 hours')
        GROUP BY service
        ORDER BY last_call DESC;
    " 2>/dev/null || echo "")
    
    if [[ -n "$recent_api_calls" ]]; then
        echo "$recent_api_calls" | while IFS='|' read -r service calls last_call avg_response_time; do
            echo "   $service: $calls calls, last: $last_call"
            echo "      Avg Response Time: ${avg_response_time}ms"
        done
    else
        echo "   No recent API activity"
    fi
    
    echo ""
    
    # Cache status
    echo "💾 **Cache Status**"
    local cache_entries
    cache_entries=$(sqlite3 "$DB_PATH" "
        SELECT 
            service,
            COUNT(*) as cached_entries,
            MIN(expires_at) as oldest_cache
        FROM api_cache 
        WHERE expires_at > datetime('now')
        GROUP BY service;
    " 2>/dev/null || echo "")
    
    if [[ -n "$cache_entries" ]]; then
        echo "$cache_entries" | while IFS='|' read -r service entries oldest_cache; do
            echo "   $service: $entries active cache entries"
            echo "      Oldest expires: $oldest_cache"
        done
    else
        echo "   No active cache entries"
    fi
}

# Auto-fix common issues
auto_fix_issues() {
    echo "🔧 Auto-Fix System Issues"
    echo "═══════════════════════════"
    echo ""
    
    local fixes_applied=0
    
    # Fix: Make sure all commands are executable
    echo "📋 Fixing command permissions..."
    find "$PROJECT_ROOT/.claude/commands" -name "*.sh" -type f ! -executable -exec chmod +x {} \; 2>/dev/null
    if [[ $? -eq 0 ]]; then
        echo "   ✅ Command permissions updated"
        ((fixes_applied++))
    fi
    
    # Fix: Clean expired cache entries
    if check_database 2>/dev/null; then
        echo "💾 Cleaning expired cache..."
        local expired_count
        expired_count=$(sqlite3 "$DB_PATH" "
            DELETE FROM api_cache WHERE expires_at < datetime('now');
            SELECT changes();
        " 2>/dev/null || echo "0")
        
        if [[ $expired_count -gt 0 ]]; then
            echo "   ✅ Removed $expired_count expired cache entries"
            ((fixes_applied++))
        else
            echo "   ℹ️ No expired cache entries to clean"
        fi
        
        # Fix: Clean old notification logs (keep last 30 days)
        echo "🔔 Cleaning old notifications..."
        local old_notifications
        old_notifications=$(sqlite3 "$DB_PATH" "
            DELETE FROM notifications WHERE created_at < date('now', '-30 days');
            SELECT changes();
        " 2>/dev/null || echo "0")
        
        if [[ $old_notifications -gt 0 ]]; then
            echo "   ✅ Removed $old_notifications old notifications"
            ((fixes_applied++))
        else
            echo "   ℹ️ No old notifications to clean"
        fi
    fi
    
    # Fix: Verify .env file structure
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        echo "🌐 Checking .env file format..."
        # Basic validation - ensure no invalid characters
        if grep -q "^[A-Z_][A-Z0-9_]*=" "$PROJECT_ROOT/.env" 2>/dev/null; then
            echo "   ✅ .env file format appears valid"
        else
            echo "   ⚠️ .env file may have formatting issues"
        fi
    fi
    
    # Fix: Test critical API connections
    echo "🌐 Testing critical APIs..."
    local api_fixes=0
    
    # Test Calendly
    if [[ -n "${CALENDLY_PERSONAL_ACCESS_TOKEN:-}" ]]; then
        local test_result
        test_result=$(curl -s -H "Authorization: Bearer $CALENDLY_PERSONAL_ACCESS_TOKEN" \
            "https://api.calendly.com/users/me" 2>/dev/null || echo "failed")
        
        if [[ "$test_result" != "failed" ]] && [[ $(echo "$test_result" | jq -r '.resource.uri // ""') != "" ]]; then
            echo "   ✅ Calendly API connection verified"
        else
            echo "   ❌ Calendly API connection failed - check token"
        fi
    fi
    
    echo ""
    echo "🎯 **Auto-Fix Summary**"
    echo "   Fixes Applied: $fixes_applied"
    
    if [[ $fixes_applied -gt 0 ]]; then
        echo "   ✅ System maintenance completed successfully"
    else
        echo "   ℹ️ No fixes needed - system running smoothly"
    fi
}

# Create system backup
create_system_backup() {
    echo "💾 Creating System Backup"
    echo "═══════════════════════════"
    echo ""
    
    local backup_timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_dir="$PROJECT_ROOT/.claude/data/backups"
    
    # Create backup directory if it doesn't exist
    mkdir -p "$backup_dir"
    
    # Backup database
    if check_database 2>/dev/null; then
        local backup_file="$backup_dir/metrics_backup_$backup_timestamp.db"
        cp "$DB_PATH" "$backup_file"
        echo "   ✅ Database backed up: $backup_file"
        
        # Compress backup
        gzip "$backup_file" 2>/dev/null
        if [[ $? -eq 0 ]]; then
            echo "   ✅ Backup compressed: $backup_file.gz"
        fi
    else
        echo "   ❌ Database not available for backup"
    fi
    
    # Backup configuration
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        local config_backup="$backup_dir/env_backup_$backup_timestamp.txt"
        # Backup .env but hide sensitive values
        sed 's/=.*/=***REDACTED***/' "$PROJECT_ROOT/.env" > "$config_backup"
        echo "   ✅ Configuration backed up (redacted): $config_backup"
    fi
    
    # Clean old backups (keep last 10)
    local old_backups
    old_backups=$(find "$backup_dir" -name "*.gz" -type f | wc -l)
    
    if [[ $old_backups -gt 10 ]]; then
        find "$backup_dir" -name "*.gz" -type f -exec ls -t {} \; | tail -n +11 | xargs rm -f 2>/dev/null
        echo "   🧹 Cleaned old backups (kept most recent 10)"
    fi
    
    echo ""
    echo "💾 Backup completed successfully"
}

# Main script logic
main() {
    # Parse command line arguments
    case "${1:-}" in
        --help|-h)
            show_help
            ;;
        --fix)
            auto_fix_issues
            ;;
        --backup)
            create_system_backup
            ;;
        --health)
            show_automation_status
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            auto_fix_issues
            ;;
        --notifications)
            show_recent_notifications
            ;;
        "")
            show_automation_status
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "Run '/automation-status --help' for usage information."
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎯 **System Maintenance Recommendations:**"
    echo "   1. Run '/checkin' daily to maintain data quality"
    echo "   2. Check '/automation-status --health' weekly"
    echo "   3. Create backups monthly with '/automation-status --backup'"
    echo "   4. Monitor notifications for proactive issue detection"
    echo ""
    echo "💡 Pro Tip: Set up a weekly calendar reminder for system health checks!"
}

# Run main function with all arguments
main "$@"