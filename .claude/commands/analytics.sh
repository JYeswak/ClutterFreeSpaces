#!/bin/bash
# ClutterFreeSpaces Analytics Dashboard
# Quick command to check website performance and email campaign results

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "📊 CLUTTERFREEESPACES ANALYTICS DASHBOARD"
echo "========================================================"
echo "📅 $(date '+%B %d, %Y at %I:%M %p')"
echo ""

# Check if GA4 analytics script is working
if python3 -c "from google.analytics.data_v1beta import BetaAnalyticsDataClient; print('GA4 API Available')" 2>/dev/null; then
    echo "🔗 Running GA4 Analytics Query..."
    echo "----------------------------------------"
    
    if python3 scripts/ga4_analytics.py 2>/dev/null; then
        echo "✅ GA4 data retrieved successfully"
    else
        echo "⚠️ GA4 connection issue - using manual checks instead"
        echo ""
        echo "📋 MANUAL ANALYTICS CHECKLIST:"
        echo "   1. Check GA4 dashboard: https://analytics.google.com/analytics/web/#/p441154484"
        echo "   2. View Realtime → Current active users"
        echo "   3. Check Acquisition → Traffic acquisition → Email traffic"
        echo "   4. Review Engagement → Events → Email clicks"
        echo "   5. Monitor Conversions → Contact form submissions"
    fi
else
    echo "📋 GA4 MANUAL DASHBOARD CHECKLIST"
    echo "----------------------------------------"
    echo "🔗 GA4 Dashboard: https://analytics.google.com/analytics/web/#/p441154484"
    echo ""
    echo "📈 KEY METRICS TO CHECK:"
    echo "   □ Realtime visitors (current active users)"
    echo "   □ Today's sessions vs yesterday"
    echo "   □ Email traffic in Acquisition reports"
    echo "   □ Engagement time from email visitors"
    echo "   □ Contact form conversions"
    echo ""
    echo "📧 EMAIL CAMPAIGN PERFORMANCE:"
    echo "   □ Open rates in SendGrid dashboard"
    echo "   □ Click-through rates by campaign"
    echo "   □ Website sessions from email source"
    echo "   □ Time spent on site by email visitors"
    echo ""
fi

echo ""
echo "🎯 SENDGRID CAMPAIGN STATUS"
echo "----------------------------------------"

# Check recent SendGrid activity (if we can access it)
echo "🔗 SendGrid Dashboard: https://app.sendgrid.com/statistics"
echo ""
echo "📊 KEY SENDGRID METRICS:"
echo "   □ Daily send quota usage (check against 100 limit)"
echo "   □ Delivery rate (should be >98%)"
echo "   □ Open rates by campaign type"
echo "   □ Click rates and engagement"
echo "   □ Bounce and spam complaint rates"
echo ""

# Show Day 2 campaign plan
echo "📅 TODAY'S CAMPAIGN PLAN"
echo "----------------------------------------"
current_hour=$(date +%H)
echo "🕐 Current Time: $(date '+%I:%M %p MDT')"
echo ""

if [ "$current_hour" -lt 10 ]; then
    echo "⏰ NEXT: Morning Batch (8:00 AM)"
    echo "   • 20 RV Dealers + 5 Moving Companies = 25 emails"
    echo "   • Run: python3 scripts/day2_campaign_launcher.py"
elif [ "$current_hour" -lt 16 ]; then
    echo "⏰ NEXT: Afternoon Batch (1:00 PM)"
    echo "   • 15 RV Dealers + 10 Moving Companies = 25 emails"
    echo "   • Run: python3 scripts/day2_campaign_launcher.py"
elif [ "$current_hour" -lt 19 ]; then
    echo "⏰ NEXT: Evening Batch (4:00 PM)"
    echo "   • 15 Real Estate Agents = 15 emails"
    echo "   • Run: python3 scripts/day2_campaign_launcher.py"
else
    echo "⏰ NEXT: Tomorrow's campaigns"
    echo "   • Day 3: Cleaning companies + Storage facilities"
fi

echo ""
echo "🎯 PERFORMANCE TARGETS"
echo "----------------------------------------"
echo "📈 Open Rate: >20% (excellent for B2B cold email)"
echo "🖱️ Click Rate: >2% (driving website traffic)"
echo "📞 Reply Rate: >1% (generating leads)"
echo "💰 Conversion Rate: 5% (email → booking)"

echo ""
echo "🔍 QUICK ACTIONS"
echo "----------------------------------------"
echo "📊 Check Analytics:    /checkin"
echo "📧 Launch Campaign:     python3 scripts/day2_campaign_launcher.py"
echo "🎯 View Full Plan:      cat .claude-context | grep -A 30 'B2B Outreach'"
echo "📈 Traffic Patterns:    Manual GA4 dashboard review"

echo ""
echo "✅ Analytics dashboard complete!"
echo "   Next: Monitor email performance and website traffic"