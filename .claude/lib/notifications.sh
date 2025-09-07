#!/bin/bash
# ClutterFreeSpaces Notification System
# Smart alerts for business metrics and opportunities

# Notification configuration
NOTIFICATION_ENABLED=${NOTIFICATION_ENABLED:-true}
NOTIFICATION_THRESHOLD_HIGH=${NOTIFICATION_THRESHOLD_HIGH:-"high"}
NOTIFICATION_THRESHOLD_MEDIUM=${NOTIFICATION_THRESHOLD_MEDIUM:-"medium"}
NOTIFICATION_THRESHOLD_LOW=${NOTIFICATION_THRESHOLD_LOW:-"low"}

# Notification colors
RED='\033[0;31m'
ORANGE='\033[0;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Icons
ALERT_ICON="🚨"
WARNING_ICON="⚠️ "
SUCCESS_ICON="✅"
INFO_ICON="ℹ️ "

# Check if notifications are enabled
is_notifications_enabled() {
    [[ "$NOTIFICATION_ENABLED" == "true" ]]
}

# Send notification (with color and icon)
send_notification() {
    local priority="$1"
    local title="$2"
    local message="$3"
    local color="$4"
    local icon="$5"
    
    if ! is_notifications_enabled; then
        return 0
    fi
    
    echo -e "${color}${icon} ${title}${NC}"
    echo -e "   ${message}"
    echo ""
    
    # Log notification to database if available
    log_notification "$priority" "$title" "$message" >/dev/null 2>&1 || true
}

# High priority alerts (critical business issues)
send_alert() {
    local title="$1"
    local message="$2"
    send_notification "high" "$title" "$message" "$RED" "$ALERT_ICON"
}

# Medium priority warnings
send_warning() {
    local title="$1"
    local message="$2"
    send_notification "medium" "$title" "$message" "$ORANGE" "$WARNING_ICON"
}

# Success notifications
send_success() {
    local title="$1"
    local message="$2"
    send_notification "low" "$title" "$message" "$GREEN" "$SUCCESS_ICON"
}

# Informational notifications
send_info() {
    local title="$1"
    local message="$2"
    send_notification "low" "$title" "$message" "$BLUE" "$INFO_ICON"
}

# Log notification to database
log_notification() {
    local priority="$1"
    local title="$2"
    local message="$3"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    if check_database 2>/dev/null; then
        sqlite3 "$DB_PATH" "
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                priority TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        " 2>/dev/null || true
        
        sqlite3 "$DB_PATH" "
            INSERT INTO notifications (priority, title, message) 
            VALUES ('$priority', '$title', '$message');
        " 2>/dev/null || true
    fi
}

# Check business metrics and send appropriate notifications
check_business_metrics() {
    local all_data="$1"
    
    if [[ -z "$all_data" ]]; then
        send_warning "Data Collection Issue" "Unable to fetch current business metrics. Check API configurations."
        return 1
    fi
    
    # Extract metrics
    local gsc_clicks=$(echo "$all_data" | jq -r '.gsc.clicks // 0')
    local gsc_impressions=$(echo "$all_data" | jq -r '.gsc.impressions // 0')
    local gsc_position=$(echo "$all_data" | jq -r '.gsc.position // 0')
    local calendly_bookings=$(echo "$all_data" | jq -r '.calendly.bookings // 0')
    local calendly_leads=$(echo "$all_data" | jq -r '.calendly.new_leads // 0')
    
    # SEO Performance Alerts
    check_seo_alerts "$gsc_clicks" "$gsc_impressions" "$gsc_position"
    
    # Booking Performance Alerts  
    check_booking_alerts "$calendly_bookings" "$calendly_leads" "$gsc_clicks"
    
    # Conversion Rate Alerts
    if [[ $gsc_clicks -gt 0 && $calendly_bookings -gt 0 ]]; then
        local conversion_rate=$(echo "scale=2; $calendly_bookings * 100 / $gsc_clicks" | bc 2>/dev/null || echo "0")
        check_conversion_alerts "$conversion_rate"
    fi
    
    # Success notifications
    check_success_metrics "$gsc_clicks" "$calendly_bookings" "$gsc_position"
}

# SEO-specific alerts
check_seo_alerts() {
    local clicks="$1"
    local impressions="$2"
    local position="$3"
    
    # Traffic drop alert
    if [[ $(echo "$clicks < 15" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
        send_alert "Low Organic Traffic" "Only $clicks clicks in last 7 days. Target: 50+ weekly. Check content calendar and SEO strategy."
    fi
    
    # Poor ranking position
    if [[ $(echo "$position > 30" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
        send_alert "Poor Search Rankings" "Average position: $position. Target: <20. Focus on content creation and link building."
    fi
    
    # Low impressions (visibility issue)
    if [[ $(echo "$impressions < 100" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
        send_warning "Low Search Visibility" "Only $impressions impressions. Create more content targeting Montana organizing keywords."
    fi
    
    # CTR opportunities
    if [[ $impressions -gt 0 && $clicks -gt 0 ]]; then
        local ctr=$(echo "scale=2; $clicks * 100 / $impressions" | bc 2>/dev/null || echo "0")
        if [[ $(echo "$ctr < 2" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
            send_warning "Low Click-Through Rate" "CTR: $ctr%. Target: >3%. Optimize meta titles and descriptions for Montana terms."
        fi
    fi
}

# Booking and lead alerts
check_booking_alerts() {
    local bookings="$1"
    local leads="$2" 
    local clicks="$3"
    
    # No bookings alert (critical)
    if [[ $bookings -eq 0 ]]; then
        send_alert "No Bookings This Week" "Zero bookings in last 7 days. Check Calendly setup, website conversion flow, and follow up on leads."
    fi
    
    # Low booking rate
    if [[ $bookings -lt 2 && $bookings -gt 0 ]]; then
        send_warning "Low Booking Rate" "Only $bookings booking(s) this week. Target: 3-5 weekly. Review pricing, testimonials, and call-to-action clarity."
    fi
    
    # Lead generation issue
    if [[ $leads -lt $bookings ]]; then
        send_warning "Lead Tracking Issue" "Leads ($leads) less than bookings ($bookings). Check lead source attribution setup."
    fi
}

# Conversion rate alerts
check_conversion_alerts() {
    local conversion_rate="$1"
    
    if [[ $(echo "$conversion_rate < 3" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
        send_alert "Low Conversion Rate" "Conversion rate: $conversion_rate%. Target: >5%. Optimize website experience, testimonials, and booking flow."
    elif [[ $(echo "$conversion_rate < 5" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
        send_warning "Conversion Rate Below Target" "Conversion rate: $conversion_rate%. Close to target (5%) but could improve. Test different CTAs."
    fi
}

# Success and positive notifications
check_success_metrics() {
    local clicks="$1"
    local bookings="$2" 
    local position="$3"
    
    # Strong traffic
    if [[ $(echo "$clicks > 50" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
        send_success "Strong Organic Traffic" "$clicks clicks this week! Above target (50+). Keep up the great content strategy."
    fi
    
    # Good bookings
    if [[ $bookings -gt 4 ]]; then
        send_success "Excellent Booking Rate" "$bookings bookings this week! Above target (4+). Your marketing is working well."
    fi
    
    # Ranking improvements  
    if [[ $(echo "$position < 15" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
        send_success "Strong Search Rankings" "Average position: $position (under 15). Excellent SEO performance!"
    fi
}

# Check for seasonal opportunities
check_seasonal_opportunities() {
    local current_month=$(date '+%m')
    local current_day=$(date '+%d')
    
    case $current_month in
        "01") # January
            if [[ $current_day -lt 15 ]]; then
                send_info "New Year Content Opportunity" "Create 'New Year Organization' content. High search volume for decluttering topics."
            fi
            ;;
        "03") # March  
            send_info "Spring Cleaning Season" "March-May is peak season for organization services. Increase content creation and social media activity."
            ;;
        "08") # August
            send_info "Back-to-School Season" "Create University of Montana student content. High demand for dorm and apartment organization."
            ;;
        "09") # September
            send_info "Fall Organization Season" "September-October is second peak season. Focus on winter preparation content."
            ;;
        "11") # November
            send_info "Holiday Preparation Content" "Create holiday organization content. Good conversion rates for family organization services."
            ;;
    esac
}

# Check competitor activity (manual checks for now)
check_competitor_alerts() {
    # This would be enhanced with actual competitor monitoring
    local day_of_week=$(date '+%u')
    
    # Weekly reminder to check competitors
    if [[ $day_of_week -eq 1 ]]; then # Monday
        send_info "Weekly Competitor Check" "Review competitor websites, social media, and Google rankings. Run '/competitor-check' command."
    fi
}

# Check goal progress and send alerts
check_goal_progress() {
    if ! check_database 2>/dev/null; then
        return 0
    fi
    
    local goals_data
    goals_data=$(sqlite3 "$DB_PATH" "
        SELECT 
            goal_type,
            target_value,
            current_value,
            ROUND((current_value * 100.0 / target_value), 1) as progress_pct
        FROM goals 
        WHERE status = 'active' 
        AND date('now') BETWEEN period_start AND period_end;
    " 2>/dev/null || echo "")
    
    if [[ -n "$goals_data" ]]; then
        echo "$goals_data" | while IFS='|' read -r goal_type target_value current_value progress_pct; do
            case "$goal_type" in
                "monthly_bookings")
                    if [[ $(echo "$progress_pct < 50" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
                        send_warning "Monthly Booking Goal Behind" "Bookings: $current_value/$target_value ($progress_pct%). Increase marketing efforts."
                    elif [[ $(echo "$progress_pct > 100" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
                        send_success "Monthly Booking Goal Exceeded!" "$current_value bookings vs $target_value target. Great month!"
                    fi
                    ;;
                "organic_clicks")
                    if [[ $(echo "$progress_pct < 40" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
                        send_warning "Organic Traffic Goal Behind" "Clicks: $current_value/$target_value ($progress_pct%). Create more content."
                    fi
                    ;;
            esac
        done
    fi
}

# Check API health and send alerts
check_api_health() {
    if ! check_database 2>/dev/null; then
        return 0
    fi
    
    local api_health
    api_health=$(sqlite3 "$DB_PATH" "
        SELECT 
            service,
            COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
            COUNT(*) as total_calls,
            MAX(called_at) as last_call
        FROM api_calls 
        WHERE called_at >= datetime('now', '-24 hours')
        GROUP BY service;
    " 2>/dev/null || echo "")
    
    if [[ -n "$api_health" ]]; then
        echo "$api_health" | while IFS='|' read -r service error_count total_calls last_call; do
            if [[ $error_count -gt 0 ]]; then
                local error_rate=$(echo "scale=1; $error_count * 100 / $total_calls" | bc 2>/dev/null || echo "0")
                if [[ $(echo "$error_rate > 20" | bc 2>/dev/null || echo "0") -eq 1 ]]; then
                    send_alert "$service API Issues" "$error_count/$total_calls calls failed ($error_rate% error rate). Check API credentials and limits."
                fi
            fi
        done
    fi
}

# Main notification check function
run_notification_check() {
    local all_data="$1"
    
    if ! is_notifications_enabled; then
        return 0
    fi
    
    echo "🔔 Running Business Intelligence Notifications"
    echo "═════════════════════════════════════════════"
    echo ""
    
    # Business metrics alerts
    check_business_metrics "$all_data"
    
    # Seasonal opportunities
    check_seasonal_opportunities
    
    # Competitor reminders
    check_competitor_alerts
    
    # Goal progress
    check_goal_progress
    
    # API health
    check_api_health
    
    echo "🎯 Notification check complete. Focus on high-priority alerts first."
    echo ""
}

# Configure notification preferences
configure_notifications() {
    echo "⚙️ Notification Configuration"
    echo "═════════════════════════════"
    echo ""
    
    echo "Current Settings:"
    echo "   Enabled: $NOTIFICATION_ENABLED"
    echo "   High Priority: $NOTIFICATION_THRESHOLD_HIGH"
    echo "   Medium Priority: $NOTIFICATION_THRESHOLD_MEDIUM"
    echo "   Low Priority: $NOTIFICATION_THRESHOLD_LOW"
    echo ""
    
    echo "To customize notifications, add to your .env file:"
    echo "   NOTIFICATION_ENABLED=true"
    echo "   NOTIFICATION_THRESHOLD_HIGH=high"
    echo "   NOTIFICATION_THRESHOLD_MEDIUM=medium"  
    echo "   NOTIFICATION_THRESHOLD_LOW=low"
    echo ""
}

# Show recent notifications
show_recent_notifications() {
    if ! check_database 2>/dev/null; then
        echo "⚠️ Database not available - cannot show notification history"
        return 1
    fi
    
    echo "📋 Recent Notifications (Last 7 Days)"
    echo "════════════════════════════════════"
    echo ""
    
    local recent_notifications
    recent_notifications=$(sqlite3 "$DB_PATH" "
        SELECT 
            date(created_at) as date,
            priority,
            title,
            message
        FROM notifications 
        WHERE created_at >= date('now', '-7 days')
        ORDER BY created_at DESC
        LIMIT 10;
    " 2>/dev/null || echo "")
    
    if [[ -n "$recent_notifications" ]]; then
        echo "$recent_notifications" | while IFS='|' read -r date priority title message; do
            local icon="$INFO_ICON"
            case "$priority" in
                "high") icon="$ALERT_ICON" ;;
                "medium") icon="$WARNING_ICON" ;;
                "low") icon="$SUCCESS_ICON" ;;
            esac
            
            echo "$icon $date - $title"
            echo "   $message"
            echo ""
        done
    else
        echo "No recent notifications found."
    fi
}