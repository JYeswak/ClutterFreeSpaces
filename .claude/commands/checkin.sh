#!/bin/bash
# ClutterFreeSpaces Daily Business Checkin Command
# Usage: /checkin [options]
# 
# Options:
#   --init          Initialize database and setup
#   --reset-cache   Clear all API cache
#   --export-json   Export data as JSON
#   --help          Show this help message

set -euo pipefail

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export PROJECT_ROOT

# Source required libraries
source "$PROJECT_ROOT/.claude/lib/database.sh"
source "$PROJECT_ROOT/.claude/lib/api_clients.sh"
source "$PROJECT_ROOT/.claude/lib/dashboard.sh"

# Help function
show_help() {
    echo "ClutterFreeSpaces Business Dashboard - Daily Checkin Command"
    echo ""
    echo "USAGE:"
    echo "  /checkin [options]"
    echo ""
    echo "OPTIONS:"
    echo "  --init          Initialize database and setup configuration"
    echo "  --reset-cache   Clear all cached API responses"
    echo "  --export-json   Export today's metrics as JSON"
    echo "  --history       Show last 7 days of metrics"
    echo "  --goals         Show and update business goals"
    echo "  --setup-apis    Show API setup instructions"
    echo "  --backup        Backup database"
    echo "  --health        Show detailed API health status"
    echo "  --help          Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  /checkin                    # Run daily checkin dashboard"
    echo "  /checkin --init             # Initialize for first use"
    echo "  /checkin --setup-apis       # Show API setup instructions"
    echo "  /checkin --export-json      # Export data for external tools"
    echo ""
    echo "CONFIGURATION:"
    echo "  Required environment variables in $PROJECT_ROOT/.env:"
    echo "  - CALENDLY_PERSONAL_ACCESS_TOKEN"
    echo "  - AIRTABLE_API_KEY"
    echo "  - AIRTABLE_BASE_ID"
    echo "  - GSC_SERVICE_ACCOUNT_KEY_PATH (optional)"
    echo "  - GSC_SITE_URL (optional)"
    echo "  - GA4_MEASUREMENT_ID (optional)"
    echo ""
}

# Initialize database and setup
init_checkin() {
    echo "🚀 Initializing ClutterFreeSpaces Business Dashboard..."
    echo ""
    
    # Check if database exists and initialize if needed
    if ! check_database; then
        echo "❌ Database initialization failed"
        return 1
    fi
    
    echo "✅ Database initialized successfully"
    
    # Check environment variables
    echo ""
    echo "🔍 Checking API configuration..."
    
    local missing_configs=()
    
    if [[ -z "${CALENDLY_PERSONAL_ACCESS_TOKEN:-}" ]]; then
        missing_configs+=("CALENDLY_PERSONAL_ACCESS_TOKEN")
    else
        echo "✅ Calendly API configured"
    fi
    
    if [[ -z "${AIRTABLE_API_KEY:-}" || -z "${AIRTABLE_BASE_ID:-}" ]]; then
        missing_configs+=("AIRTABLE_API_KEY or AIRTABLE_BASE_ID")
    else
        echo "✅ Airtable API configured"
    fi
    
    if [[ -z "${GSC_SERVICE_ACCOUNT_KEY_PATH:-}" || -z "${GSC_SITE_URL:-}" ]]; then
        echo "⚠️  Google Search Console not configured (optional)"
    else
        echo "✅ Google Search Console configured"
    fi
    
    if [[ -z "${GA4_MEASUREMENT_ID:-}" ]]; then
        echo "⚠️  Google Analytics 4 not configured (optional)"
    else
        echo "✅ Google Analytics 4 configured"
    fi
    
    if [[ ${#missing_configs[@]} -gt 0 ]]; then
        echo ""
        echo "❌ Missing required configuration:"
        for config in "${missing_configs[@]}"; do
            echo "   - $config"
        done
        echo ""
        echo "Please add these to your $PROJECT_ROOT/.env file"
        echo "Run '/checkin --setup-apis' for detailed setup instructions"
        return 1
    fi
    
    echo ""
    echo "🎉 Dashboard initialization complete!"
    echo "Run '/checkin' to start your daily business checkin."
    echo ""
}

# Show API setup instructions
show_api_setup() {
    echo "🔧 API Setup Instructions for ClutterFreeSpaces Dashboard"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    
    echo "1. CALENDLY API SETUP (Required)"
    echo "   - Go to https://calendly.com/integrations/api_webhooks"
    echo "   - Click 'Create Personal Access Token'"
    echo "   - Copy the token and add to .env as:"
    echo "     CALENDLY_PERSONAL_ACCESS_TOKEN=your_token_here"
    echo ""
    
    echo "2. AIRTABLE API SETUP (Required)"
    echo "   - Go to https://airtable.com/create/tokens"
    echo "   - Create a personal access token with data.records:read scope"
    echo "   - Get your base ID from the API documentation for your base"
    echo "   - Add to .env as:"
    echo "     AIRTABLE_API_KEY=your_token_here"
    echo "     AIRTABLE_BASE_ID=your_base_id_here"
    echo ""
    
    echo "3. GOOGLE SEARCH CONSOLE SETUP (Optional but recommended)"
    echo "   - Go to Google Cloud Console"
    echo "   - Enable the Search Console API"
    echo "   - Create a service account and download JSON key file"
    echo "   - Add the service account email to your Search Console property"
    echo "   - Add to .env as:"
    echo "     GSC_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account.json"
    echo "     GSC_SITE_URL=https://your-website.com"
    echo ""
    
    echo "4. GOOGLE ANALYTICS 4 SETUP (Optional)"
    echo "   - Get your GA4 Measurement ID from Google Analytics"
    echo "   - Set up GA4 Reporting API (complex setup - consult GA4 docs)"
    echo "   - Add to .env as:"
    echo "     GA4_MEASUREMENT_ID=G-XXXXXXXXXX"
    echo "     GA4_API_SECRET=your_api_secret"
    echo ""
    
    echo "5. TEST YOUR SETUP"
    echo "   Run: /checkin --health"
    echo "   This will test all API connections and show any errors"
    echo ""
}

# Show detailed API health
show_api_health() {
    echo "🏥 API Health Check"
    echo "═══════════════════"
    echo ""
    
    # Test each API
    echo "Testing Calendly API..."
    local calendly_result
    calendly_result=$(fetch_calendly_data)
    local calendly_error=$(echo "$calendly_result" | jq -r '.error // ""')
    if [[ -z "$calendly_error" ]]; then
        echo "✅ Calendly: Connected successfully"
    else
        echo "❌ Calendly: $calendly_error"
    fi
    
    echo ""
    echo "Testing Airtable API..."
    local airtable_result
    airtable_result=$(fetch_airtable_data)
    local airtable_error=$(echo "$airtable_result" | jq -r '.error // ""')
    if [[ -z "$airtable_error" ]]; then
        echo "✅ Airtable: Connected successfully"
    else
        echo "❌ Airtable: $airtable_error"
    fi
    
    echo ""
    echo "Testing Google Search Console API..."
    local gsc_result
    gsc_result=$(fetch_gsc_data)
    local gsc_error=$(echo "$gsc_result" | jq -r '.error // ""')
    if [[ -z "$gsc_error" ]]; then
        echo "✅ Google Search Console: Connected successfully"
    else
        echo "⚠️  Google Search Console: $gsc_error"
    fi
    
    echo ""
    echo "Testing Google Analytics API..."
    local ga4_result
    ga4_result=$(fetch_ga4_data)
    local ga4_error=$(echo "$ga4_result" | jq -r '.error // ""')
    if [[ -z "$ga4_error" ]]; then
        echo "✅ Google Analytics: Connected successfully"
    else
        echo "⚠️  Google Analytics: $ga4_error"
    fi
    
    echo ""
    echo "📊 Recent API Performance:"
    get_api_health
    
    echo ""
}

# Show historical metrics
show_history() {
    echo "📈 Last 7 Days Performance"
    echo "══════════════════════════"
    echo ""
    
    get_recent_metrics
    
    echo ""
    echo "📊 Trend Analysis:"
    get_trend_data
    
    echo ""
}

# Show and manage goals
manage_goals() {
    echo "🎯 Business Goals Management"
    echo "═══════════════════════════"
    echo ""
    
    echo "Current Goals Status:"
    get_goal_status
    
    echo ""
    echo "Would you like to update any goals? (y/n)"
    read -r update_goals
    
    if [[ "$update_goals" =~ ^[Yy]$ ]]; then
        echo ""
        echo "Available goal types: monthly_bookings, organic_clicks, conversion_rate"
        echo -n "Enter goal type to update: "
        read -r goal_type
        
        echo -n "Enter new target value: "
        read -r target_value
        
        # Update goal
        sqlite3 "$DB_PATH" "
            UPDATE goals 
            SET target_value = $target_value,
                updated_at = CURRENT_TIMESTAMP
            WHERE goal_type = '$goal_type' 
            AND status = 'active'
            AND date('now') BETWEEN period_start AND period_end;
        "
        
        echo "✅ Goal updated successfully"
        echo ""
        get_goal_status
    fi
}

# Export data as JSON
export_json_data() {
    local days="${1:-7}"
    echo "📤 Exporting last $days days of data..."
    
    local json_data
    json_data=$(export_metrics_json "$days")
    
    local output_file="$PROJECT_ROOT/.claude/data/metrics_export_$(date +%Y%m%d).json"
    echo "$json_data" > "$output_file"
    
    echo "✅ Data exported to: $output_file"
    echo ""
    echo "Preview:"
    echo "$json_data" | jq '.[0:3]' 2>/dev/null || echo "$json_data" | head -20
}

# Reset cache
reset_cache() {
    echo "🔄 Clearing API cache..."
    
    sqlite3 "$DB_PATH" "DELETE FROM api_cache;" 2>/dev/null || true
    
    echo "✅ Cache cleared successfully"
    echo ""
}

# Main checkin function
run_daily_checkin() {
    echo "🌅 Starting daily business checkin..."
    echo ""
    
    # Ensure database is ready
    if ! check_database; then
        echo "❌ Database not ready. Run '/checkin --init' first."
        return 1
    fi
    
    # Fetch all data
    echo "📡 Fetching data from all sources..."
    local all_data
    all_data=$(fetch_all_data)
    
    if [[ -z "$all_data" ]]; then
        echo "❌ Failed to fetch data. Check your API configurations."
        echo "Run '/checkin --health' to diagnose issues."
        return 1
    fi
    
    # Parse and store in database
    echo "💾 Storing metrics in database..."
    
    local today=$(date '+%Y-%m-%d')
    
    # Extract values from JSON
    local gsc_clicks=$(echo "$all_data" | jq -r '.gsc.clicks // 0')
    local gsc_impressions=$(echo "$all_data" | jq -r '.gsc.impressions // 0')
    local gsc_position=$(echo "$all_data" | jq -r '.gsc.position // 0')
    local gsc_ctr=$(echo "$all_data" | jq -r '.gsc.ctr // 0')
    
    local ga4_visitors=$(echo "$all_data" | jq -r '.ga4.visitors // 0')
    local ga4_page_views=$(echo "$all_data" | jq -r '.ga4.page_views // 0')
    local ga4_conversion_rate=$(echo "$all_data" | jq -r '.ga4.conversion_rate // 0')
    local ga4_bounce_rate=$(echo "$all_data" | jq -r '.ga4.bounce_rate // 0')
    local ga4_session_duration=$(echo "$all_data" | jq -r '.ga4.session_duration // 0')
    
    local calendly_bookings=$(echo "$all_data" | jq -r '.calendly.bookings // 0')
    local calendly_consultation=$(echo "$all_data" | jq -r '.calendly.consultation_bookings // 0')
    local calendly_new_leads=$(echo "$all_data" | jq -r '.calendly.new_leads // 0')
    
    local airtable_pipeline=$(echo "$all_data" | jq -r '.airtable.pipeline_leads // 0')
    local airtable_projects=$(echo "$all_data" | jq -r '.airtable.active_projects // 0')
    local airtable_revenue=$(echo "$all_data" | jq -r '.airtable.revenue_pipeline // 0')
    
    # Ensure all variables have valid numeric values (handle empty/null from jq)
    gsc_clicks=${gsc_clicks:-0}
    gsc_impressions=${gsc_impressions:-0}  
    gsc_position=${gsc_position:-0}
    gsc_ctr=${gsc_ctr:-0}
    
    ga4_visitors=${ga4_visitors:-0}
    ga4_page_views=${ga4_page_views:-0}
    ga4_conversion_rate=${ga4_conversion_rate:-0}
    ga4_bounce_rate=${ga4_bounce_rate:-0}
    ga4_session_duration=${ga4_session_duration:-0}
    
    calendly_bookings=${calendly_bookings:-0}
    calendly_consultation=${calendly_consultation:-0}
    calendly_new_leads=${calendly_new_leads:-0}
    
    airtable_pipeline=${airtable_pipeline:-0}
    airtable_projects=${airtable_projects:-0}
    airtable_revenue=${airtable_revenue:-0}
    
    # Calculate booking conversion rate
    local booking_conversion=0
    if [[ $gsc_clicks -gt 0 && $calendly_bookings -gt 0 ]]; then
        booking_conversion=$(echo "scale=4; $calendly_bookings / $gsc_clicks" | bc 2>/dev/null || echo "0")
    fi
    
    local quality_score=$(echo "$all_data" | jq -r '.quality_score // 0')
    quality_score=${quality_score:-0}
    
    # Insert into database
    insert_daily_metrics "$today" \
        "$gsc_clicks" "$gsc_impressions" "$gsc_position" "$gsc_ctr" \
        "$ga4_visitors" "$ga4_page_views" "$ga4_conversion_rate" "$ga4_bounce_rate" "$ga4_session_duration" \
        "$calendly_bookings" "$calendly_consultation" "$calendly_new_leads" "$booking_conversion" \
        "$airtable_pipeline" "$airtable_projects" "$airtable_revenue" \
        "$quality_score"
    
    # Update goal progress
    update_goal_progress "monthly_bookings" "$calendly_bookings"
    update_goal_progress "organic_clicks" "$gsc_clicks"
    update_goal_progress "conversion_rate" "$booking_conversion"
    
    echo "✅ Data stored successfully"
    echo ""
    
    # Display the dashboard
    display_dashboard "$all_data"
    
    # Backup database weekly (on Mondays)
    local day_of_week=$(date '+%u')
    if [[ $day_of_week -eq 1 ]]; then
        echo "🗄️  Creating weekly database backup..."
        backup_database >/dev/null 2>&1 || true
    fi
    
    # Clean old cache entries
    clean_cache >/dev/null 2>&1 || true
    
    echo "🎉 Daily checkin complete! Have a great day building your business."
    echo ""
}

# Main script logic
main() {
    # Check for dependencies
    if ! command -v sqlite3 >/dev/null 2>&1; then
        echo "❌ Error: sqlite3 is required but not installed."
        exit 1
    fi
    
    if ! command -v jq >/dev/null 2>&1; then
        echo "❌ Error: jq is required but not installed."
        echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
        exit 1
    fi
    
    if ! command -v bc >/dev/null 2>&1; then
        echo "❌ Error: bc is required but not installed."
        exit 1
    fi
    
    # Parse command line arguments
    case "${1:-}" in
        --help|-h)
            show_help
            ;;
        --init)
            init_checkin
            ;;
        --setup-apis)
            show_api_setup
            ;;
        --health)
            show_api_health
            ;;
        --history)
            show_history
            ;;
        --goals)
            manage_goals
            ;;
        --export-json)
            export_json_data "${2:-7}"
            ;;
        --reset-cache)
            reset_cache
            ;;
        --backup)
            backup_database
            ;;
        "")
            run_daily_checkin
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "Run '/checkin --help' for usage information."
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"