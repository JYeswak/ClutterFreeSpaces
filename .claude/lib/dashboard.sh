#!/bin/bash
# Dashboard output formatter for ClutterFreeSpaces checkin command

source "$PROJECT_ROOT/.claude/lib/database.sh"

# Color definitions for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Icons for visual appeal
ICON_UP="↗️ "
ICON_DOWN="↘️ "
ICON_FLAT="→ "
ICON_GOAL="🎯"
ICON_WARNING="⚠️ "
ICON_SUCCESS="✅"
ICON_ERROR="❌"
ICON_INFO="ℹ️ "

# Helper function to format numbers with commas
format_number() {
    local num="$1"
    printf "%'.0f" "$num" 2>/dev/null || echo "$num"
}

# Helper function to determine trend direction
get_trend_icon() {
    local current="$1"
    local previous="$2"
    
    if [[ -z "$previous" || "$previous" == "0" ]]; then
        echo "$ICON_FLAT"
        return
    fi
    
    local change=$(echo "scale=2; ($current - $previous) / $previous * 100" | bc 2>/dev/null || echo "0")
    local change_int=$(echo "$change" | cut -d. -f1)
    
    if [[ $change_int -gt 5 ]]; then
        echo "$ICON_UP"
    elif [[ $change_int -lt -5 ]]; then
        echo "$ICON_DOWN"
    else
        echo "$ICON_FLAT"
    fi
}

# Helper function to format percentage change
format_change() {
    local current="$1"
    local previous="$2"
    local inverse="$3" # Set to 1 for metrics where lower is better (like bounce rate, position)
    
    if [[ -z "$previous" || "$previous" == "0" ]]; then
        echo "N/A"
        return
    fi
    
    local change=$(echo "scale=1; ($current - $previous) / $previous * 100" | bc 2>/dev/null || echo "0")
    local abs_change=$(echo "$change" | sed 's/-//')
    
    if [[ "$change" == "0.0" ]]; then
        echo "${CYAN}0.0%${NC}"
    elif [[ "${change:0:1}" == "-" ]]; then
        if [[ "$inverse" == "1" ]]; then
            echo "${GREEN}-${abs_change}%${NC}"
        else
            echo "${RED}${change}%${NC}"
        fi
    else
        if [[ "$inverse" == "1" ]]; then
            echo "${RED}+${change}%${NC}"
        else
            echo "${GREEN}+${change}%${NC}"
        fi
    fi
}

# Display header with current date and business info
display_header() {
    local current_date=$(date '+%A, %B %d, %Y')
    local current_time=$(date '+%I:%M %p %Z')
    
    echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${BLUE}║${NC}                      ${BOLD}ClutterFreeSpaces Business Dashboard${NC}                     ${BOLD}${BLUE}║${NC}"
    echo -e "${BOLD}${BLUE}║${NC}                           ${current_date}                            ${BOLD}${BLUE}║${NC}"
    echo -e "${BOLD}${BLUE}║${NC}                              ${current_time}                               ${BOLD}${BLUE}║${NC}"
    echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Display SEO metrics section
display_seo_metrics() {
    local data="$1"
    
    # Parse current data
    local clicks=$(echo "$data" | jq -r '.gsc.clicks // 0')
    local impressions=$(echo "$data" | jq -r '.gsc.impressions // 0')
    local position=$(echo "$data" | jq -r '.gsc.position // 0')
    local ctr=$(echo "$data" | jq -r '.gsc.ctr // 0')
    
    # Get historical data for comparison
    local yesterday_data=$(sqlite3 "$DB_PATH" "
        SELECT organic_clicks, organic_impressions, average_position, click_through_rate
        FROM daily_metrics 
        WHERE date = date('now', '-1 day');
    " 2>/dev/null)
    
    local prev_clicks=0
    local prev_impressions=0
    local prev_position=0
    local prev_ctr=0
    
    if [[ -n "$yesterday_data" ]]; then
        IFS='|' read -r prev_clicks prev_impressions prev_position prev_ctr <<< "$yesterday_data"
    fi
    
    echo -e "${BOLD}${GREEN}📊 SEO Performance (Last 7 Days)${NC}"
    echo -e "${BOLD}${GREEN}═══════════════════════════════════════${NC}"
    
    printf "%-20s %10s %15s\n" "Metric" "Current" "vs Yesterday"
    echo "────────────────────────────────────────────────────────────"
    
    local clicks_trend=$(get_trend_icon "$clicks" "$prev_clicks")
    local clicks_change=$(format_change "$clicks" "$prev_clicks")
    printf "%-20s %10s %15s %s\n" "Organic Clicks" "$(format_number $clicks)" "$clicks_change" "$clicks_trend"
    
    local impr_trend=$(get_trend_icon "$impressions" "$prev_impressions")
    local impr_change=$(format_change "$impressions" "$prev_impressions")
    printf "%-20s %10s %15s %s\n" "Impressions" "$(format_number $impressions)" "$impr_change" "$impr_trend"
    
    local pos_trend=$(get_trend_icon "$prev_position" "$position") # Inverse for position
    local pos_change=$(format_change "$position" "$prev_position" 1)
    printf "%-20s %10.1f %15s %s\n" "Avg Position" "$position" "$pos_change" "$pos_trend"
    
    local ctr_trend=$(get_trend_icon "$ctr" "$prev_ctr")
    local ctr_change=$(format_change "$ctr" "$prev_ctr")
    local ctr_percent=$(echo "scale=2; $ctr * 100" | bc 2>/dev/null || echo "0")
    printf "%-20s %9.2f%% %15s %s\n" "Click-through Rate" "$ctr_percent" "$ctr_change" "$ctr_trend"
    
    echo ""
}

# Display booking and conversion metrics
display_booking_metrics() {
    local data="$1"
    
    # Parse current data
    local bookings=$(echo "$data" | jq -r '.calendly.bookings // 0')
    local consultation_bookings=$(echo "$data" | jq -r '.calendly.consultation_bookings // 0')
    local new_leads=$(echo "$data" | jq -r '.calendly.new_leads // 0')
    
    # Calculate conversion rate (bookings from clicks)
    local clicks=$(echo "$data" | jq -r '.gsc.clicks // 1')
    local conversion_rate=0
    if [[ $clicks -gt 0 ]]; then
        conversion_rate=$(echo "scale=2; $bookings / $clicks * 100" | bc 2>/dev/null || echo "0")
    fi
    
    echo -e "${BOLD}${PURPLE}📅 Booking Performance (Last 7 Days)${NC}"
    echo -e "${BOLD}${PURPLE}═══════════════════════════════════════${NC}"
    
    printf "%-25s %10s\n" "Metric" "Count"
    echo "─────────────────────────────────────────"
    
    printf "%-25s %10d\n" "Total Bookings" "$bookings"
    printf "%-25s %10d\n" "Consultation Bookings" "$consultation_bookings"
    printf "%-25s %10d\n" "New Leads" "$new_leads"
    printf "%-25s %9.2f%%\n" "Traffic → Booking Rate" "$conversion_rate"
    
    # Booking goal check
    local booking_goal=$(sqlite3 "$DB_PATH" "
        SELECT target_value FROM goals 
        WHERE goal_type = 'monthly_bookings' 
        AND status = 'active'
        AND date('now') BETWEEN period_start AND period_end;
    " 2>/dev/null)
    
    if [[ -n "$booking_goal" && "$booking_goal" != "" ]]; then
        local days_in_month=$(date '+%d')
        local projected_bookings=$(echo "scale=0; $bookings / 7 * 30" | bc 2>/dev/null || echo "0")
        local goal_status="On Track"
        local goal_color="$GREEN"
        
        if [[ $projected_bookings -lt $booking_goal ]]; then
            goal_status="Behind"
            goal_color="$YELLOW"
        fi
        
        echo ""
        printf "${goal_color}%s Monthly Goal: %d bookings (Projected: %d - %s)${NC}\n" "$ICON_GOAL" "$booking_goal" "$projected_bookings" "$goal_status"
    fi
    
    echo ""
}

# Display CRM and pipeline metrics
display_crm_metrics() {
    local data="$1"
    
    # Parse current data
    local pipeline_leads=$(echo "$data" | jq -r '.airtable.pipeline_leads // 0')
    local active_projects=$(echo "$data" | jq -r '.airtable.active_projects // 0')
    local revenue_pipeline=$(echo "$data" | jq -r '.airtable.revenue_pipeline // 0')
    
    echo -e "${BOLD}${CYAN}🗃️ CRM & Pipeline Status${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════${NC}"
    
    printf "%-25s %10s\n" "Metric" "Value"
    echo "─────────────────────────────────────────"
    
    printf "%-25s %10d\n" "Leads in Pipeline" "$pipeline_leads"
    printf "%-25s %10d\n" "Active Projects" "$active_projects"
    
    if [[ $revenue_pipeline -gt 0 ]]; then
        printf "%-25s %9s\n" "Revenue Pipeline" "\$$(format_number $revenue_pipeline)"
    else
        printf "%-25s %10s\n" "Revenue Pipeline" "N/A"
    fi
    
    echo ""
}

# Display website analytics
display_website_metrics() {
    local data="$1"
    
    # Parse current data
    local visitors=$(echo "$data" | jq -r '.ga4.visitors // 0')
    local page_views=$(echo "$data" | jq -r '.ga4.page_views // 0')
    local bounce_rate=$(echo "$data" | jq -r '.ga4.bounce_rate // 0')
    local session_duration=$(echo "$data" | jq -r '.ga4.session_duration // 0')
    
    # Convert session duration to minutes:seconds
    local duration_min=$((session_duration / 60))
    local duration_sec=$((session_duration % 60))
    
    echo -e "${BOLD}${BLUE}📈 Website Analytics (Last 7 Days)${NC}"
    echo -e "${BOLD}${BLUE}═══════════════════════════════════════${NC}"
    
    printf "%-25s %10s\n" "Metric" "Value"
    echo "─────────────────────────────────────────"
    
    printf "%-25s %10d\n" "Unique Visitors" "$visitors"
    printf "%-25s %10d\n" "Page Views" "$page_views"
    printf "%-25s %9.1f%%\n" "Bounce Rate" "$bounce_rate"
    printf "%-25s %8dm %02ds\n" "Avg Session Duration" "$duration_min" "$duration_sec"
    
    # Note about mock data
    local ga4_note=$(echo "$data" | jq -r '.ga4.note // ""')
    if [[ "$ga4_note" == *"Mock data"* ]]; then
        echo -e "${YELLOW}${ICON_WARNING} Note: Using mock data. Configure GA4 Reporting API for real metrics.${NC}"
    fi
    
    echo ""
}

# Display actionable insights
display_insights() {
    local data="$1"
    
    echo -e "${BOLD}${YELLOW}💡 Actionable Insights${NC}"
    echo -e "${BOLD}${YELLOW}═══════════════════════════════════════${NC}"
    
    local insights=()
    
    # SEO insights
    local clicks=$(echo "$data" | jq -r '.gsc.clicks // 0')
    local position=$(echo "$data" | jq -r '.gsc.position // 0')
    local ctr=$(echo "$data" | jq -r '.gsc.ctr // 0')
    
    if [[ $(echo "$position > 10" | bc 2>/dev/null) -eq 1 ]]; then
        insights+=("${ICON_INFO} Average search position is $position - focus on improving content for target keywords")
    fi
    
    if [[ $(echo "$ctr < 0.05" | bc 2>/dev/null) -eq 1 ]]; then
        local ctr_percent=$(echo "scale=1; $ctr * 100" | bc 2>/dev/null)
        insights+=("${ICON_WARNING} Click-through rate is ${ctr_percent}% - consider improving title tags and meta descriptions")
    fi
    
    # Booking insights
    local bookings=$(echo "$data" | jq -r '.calendly.bookings // 0')
    if [[ $bookings -lt 3 ]]; then
        insights+=("${ICON_WARNING} Only $bookings bookings this week - consider boosting social media or email campaigns")
    fi
    
    # CRM insights
    local pipeline_leads=$(echo "$data" | jq -r '.airtable.pipeline_leads // 0')
    if [[ $pipeline_leads -lt 5 ]]; then
        insights+=("${ICON_WARNING} Pipeline has only $pipeline_leads leads - focus on lead generation activities")
    fi
    
    # Display insights
    if [[ ${#insights[@]} -eq 0 ]]; then
        echo "${ICON_SUCCESS} All metrics look good! Keep up the great work."
    else
        for insight in "${insights[@]}"; do
            echo "• $insight"
        done
    fi
    
    echo ""
}

# Display recommended next steps
display_next_steps() {
    local data="$1"
    
    echo -e "${BOLD}${GREEN}🎯 Recommended Next Steps${NC}"
    echo -e "${BOLD}${GREEN}═══════════════════════════════════════${NC}"
    
    local steps=()
    
    # Get day of week for contextual recommendations
    local day_of_week=$(date '+%u') # 1=Monday, 7=Sunday
    
    # Weekly planning (Monday)
    if [[ $day_of_week -eq 1 ]]; then
        steps+=("📅 Review and plan content calendar for the week")
        steps+=("📊 Set weekly goals and priorities")
    fi
    
    # Mid-week review (Wednesday)
    if [[ $day_of_week -eq 3 ]]; then
        steps+=("🔍 Review progress on weekly goals")
        steps+=("📧 Send follow-up emails to warm leads")
    fi
    
    # End of week review (Friday)  
    if [[ $day_of_week -eq 5 ]]; then
        steps+=("📈 Analyze week's performance and document learnings")
        steps+=("🗓️ Plan next week's content and outreach")
    fi
    
    # Data-driven recommendations
    local clicks=$(echo "$data" | jq -r '.gsc.clicks // 0')
    local bookings=$(echo "$data" | jq -r '.calendly.bookings // 0')
    
    if [[ $clicks -lt 50 ]]; then
        steps+=("✍️ Publish new blog content targeting long-tail keywords")
        steps+=("📱 Share existing content on social media platforms")
    fi
    
    if [[ $bookings -eq 0 ]]; then
        steps+=("🎯 Create urgency with limited-time consultation offers")
        steps+=("💌 Send personalized outreach to past website visitors")
    fi
    
    # Always include these
    steps+=("🔄 Update CRM with latest lead interactions")
    steps+=("📞 Follow up on pending proposals and estimates")
    
    # Display steps
    for i in "${!steps[@]}"; do
        printf "%2d. %s\n" "$((i + 1))" "${steps[$i]}"
    done
    
    echo ""
}

# Display quick questions for reflection
display_questions() {
    echo -e "${BOLD}${PURPLE}❓ Quick Reflection Questions${NC}"
    echo -e "${BOLD}${PURPLE}═══════════════════════════════════════${NC}"
    
    local questions=(
        "What was your biggest win from yesterday?"
        "Which marketing channel is performing best this week?"
        "What's blocking potential clients from booking consultations?"
        "How can you improve your conversion rate from traffic to leads?"
        "What content topic should you focus on next?"
    )
    
    # Show 3 random questions
    local selected_questions=()
    for i in {1..3}; do
        local random_index=$((RANDOM % ${#questions[@]}))
        selected_questions+=("${questions[$random_index]}")
        unset 'questions[$random_index]'
        questions=("${questions[@]}")  # Reindex array
    done
    
    for i in "${!selected_questions[@]}"; do
        printf "%2d. %s\n" "$((i + 1))" "${selected_questions[$i]}"
    done
    
    echo ""
}

# Display API health status
display_api_status() {
    local data="$1"
    
    echo -e "${BOLD}${CYAN}🔌 System Status${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════${NC}"
    
    # Check each API for errors
    local gsc_error=$(echo "$data" | jq -r '.gsc.error // ""')
    local calendly_error=$(echo "$data" | jq -r '.calendly.error // ""')
    local airtable_error=$(echo "$data" | jq -r '.airtable.error // ""')
    local ga4_error=$(echo "$data" | jq -r '.ga4.error // ""')
    
    printf "%-20s %s\n" "Google Search Console" "$([ -z "$gsc_error" ] && echo "${GREEN}${ICON_SUCCESS} Connected${NC}" || echo "${RED}${ICON_ERROR} $gsc_error${NC}")"
    printf "%-20s %s\n" "Calendly API" "$([ -z "$calendly_error" ] && echo "${GREEN}${ICON_SUCCESS} Connected${NC}" || echo "${RED}${ICON_ERROR} $calendly_error${NC}")"
    printf "%-20s %s\n" "Airtable CRM" "$([ -z "$airtable_error" ] && echo "${GREEN}${ICON_SUCCESS} Connected${NC}" || echo "${RED}${ICON_ERROR} $airtable_error${NC}")"
    printf "%-20s %s\n" "Google Analytics" "$([ -z "$ga4_error" ] && echo "${GREEN}${ICON_SUCCESS} Connected${NC}" || echo "${YELLOW}${ICON_WARNING} $ga4_error${NC}")"
    
    # Show data quality score
    local quality_score=$(echo "$data" | jq -r '.quality_score // 0')
    local quality_color="$RED"
    if [[ $(echo "$quality_score >= 75" | bc 2>/dev/null) -eq 1 ]]; then
        quality_color="$GREEN"
    elif [[ $(echo "$quality_score >= 50" | bc 2>/dev/null) -eq 1 ]]; then
        quality_color="$YELLOW"
    fi
    
    printf "%-20s ${quality_color}%.0f%%${NC}\n" "Data Quality Score" "$quality_score"
    
    echo ""
}

# Main dashboard display function
display_dashboard() {
    local data="$1"
    
    if [[ -z "$data" ]]; then
        echo "${RED}${ICON_ERROR} No data available for dashboard display${NC}"
        return 1
    fi
    
    # Clear screen and display dashboard
    clear
    
    display_header
    display_seo_metrics "$data"
    display_booking_metrics "$data" 
    display_crm_metrics "$data"
    display_website_metrics "$data"
    display_insights "$data"
    display_next_steps "$data"
    display_questions
    display_api_status "$data"
    
    # Footer with last update time
    local timestamp=$(echo "$data" | jq -r '.timestamp // ""')
    if [[ -n "$timestamp" ]]; then
        local formatted_time=$(date -d "$timestamp" '+%I:%M %p' 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%S" "$timestamp" '+%I:%M %p' 2>/dev/null || echo "$timestamp")
        echo -e "${BOLD}${BLUE}Last updated: $formatted_time${NC}"
    fi
    
    echo ""
}