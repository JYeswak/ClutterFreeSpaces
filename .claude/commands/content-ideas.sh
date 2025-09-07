#!/bin/bash
# ClutterFreeSpaces Content Ideas Generator
# Usage: /content-ideas [options]
# 
# Options:
#   --seasonal       Seasonal content opportunities
#   --seo           SEO-optimized topic suggestions
#   --social        Social media content ideas
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
    echo "ClutterFreeSpaces Content Ideas Generator"
    echo ""
    echo "USAGE:"
    echo "  /content-ideas [options]"
    echo ""
    echo "OPTIONS:"
    echo "  --seasonal       Seasonal content opportunities for Montana"
    echo "  --seo           SEO-optimized topic suggestions"
    echo "  --social        Social media content ideas"
    echo "  --blog          Blog post topic suggestions"
    echo "  --help          Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  /content-ideas                # Generate Montana-specific topics"
    echo "  /content-ideas --seasonal     # Seasonal content calendar"
    echo "  /content-ideas --seo          # SEO keyword-focused topics"
    echo "  /content-ideas --social       # Social media post ideas"
    echo ""
}

# Generate Montana-specific content ideas
generate_montana_ideas() {
    echo "🏔️ Montana-Specific Content Ideas"
    echo "═══════════════════════════════════"
    echo ""
    
    local current_month=$(date '+%B')
    echo "📅 Current Month: $current_month"
    echo ""
    
    echo "🏠 Montana Lifestyle Organization:"
    echo "   1. 'Organizing Your Montana Ranch: From Barn to Basement'"
    echo "   2. 'RV Organization for Montana's Best Camping Spots'"
    echo "   3. 'Cabin Organization: Making the Most of Small Mountain Spaces'"
    echo "   4. 'Organizing for Montana's Long Winters: Storage Solutions'"
    echo "   5. 'Flathead Lake Vacation Home Organization Tips'"
    echo ""
    
    echo "🎯 Local Market Focus:"
    echo "   1. 'Professional Organizer Missoula: What to Expect'"
    echo "   2. 'Downsizing in Retirement: Montana Senior Living Guide'"
    echo "   3. 'University of Montana Student Housing Organization'"
    echo "   4. 'Bozeman Family Home Organization: Growing with Your Kids'"
    echo "   5. 'Kalispell Home Office Setup for Remote Workers'"
    echo ""
    
    echo "⛰️ Montana-Specific Challenges:"
    echo "   1. 'Organizing Outdoor Gear: Montana Adventure Storage'"
    echo "   2. 'Mudroom Must-Haves for Montana Weather'"
    echo "   3. 'Organizing Firewood and Winter Supplies'"
    echo "   4. 'Small Town Living: Maximizing Storage in Older Homes'"
    echo "   5. 'Ranch Life Organization: Tools, Equipment, and Supplies'"
    echo ""
}

# Generate seasonal content
generate_seasonal_ideas() {
    echo "🍂 Seasonal Content Calendar - Montana Focus"
    echo "═══════════════════════════════════════════"
    echo ""
    
    local current_month=$(date '+%m')
    local season=""
    
    if [[ $current_month -ge 3 && $current_month -le 5 ]]; then
        season="Spring"
    elif [[ $current_month -ge 6 && $current_month -le 8 ]]; then
        season="Summer"
    elif [[ $current_month -ge 9 && $current_month -le 11 ]]; then
        season="Fall"
    else
        season="Winter"
    fi
    
    echo "Current Season: $season"
    echo ""
    
    case $season in
        "Spring")
            echo "🌸 SPRING CONTENT IDEAS (March-May):"
            echo "   1. 'Spring Cleaning Montana Style: A Room-by-Room Guide'"
            echo "   2. 'Organizing for Glacier National Park Season'"
            echo "   3. 'Decluttering Before Montana's Tourist Season'"
            echo "   4. 'Organizing Your Garden Shed for Montana Growing Season'"
            echo "   5. 'Spring Break University Housing Organization'"
            echo ""
            echo "📝 Content Focus: Renewal, fresh starts, outdoor prep"
            ;;
        "Summer")
            echo "☀️ SUMMER CONTENT IDEAS (June-August):"
            echo "   1. 'Organizing for Montana Family Reunions'"
            echo "   2. 'RV Organization for Yellowstone Adventures'"
            echo "   3. 'Summer Cabin Organization: Maximizing Guest Space'"
            echo "   4. 'Organizing Kids' Rooms During Summer Break'"
            echo "   5. 'Farmers Market Organization: Storage and Prep'"
            echo ""
            echo "📝 Content Focus: Family time, travel, outdoor activities"
            ;;
        "Fall")
            echo "🍂 FALL CONTENT IDEAS (September-November):"
            echo "   1. 'Preparing Montana Homes for Winter Storage'"
            echo "   2. 'Back-to-School Organization for Montana Families'"
            echo "   3. 'Organizing Hunting and Fishing Gear for Season'"
            echo "   4. 'Holiday Preparation: Organizing for Montana Winters'"
            echo "   5. 'Downsizing Before Montana's Harsh Winter'"
            echo ""
            echo "📝 Content Focus: Preparation, cozy spaces, winter prep"
            ;;
        "Winter")
            echo "❄️ WINTER CONTENT IDEAS (December-February):"
            echo "   1. 'Organizing Small Spaces During Long Montana Winters'"
            echo "   2. 'Holiday Storage Solutions for Montana Homes'"
            echo "   3. 'Cabin Fever Solutions: Organizing for Mental Health'"
            echo "   4. 'New Year Decluttering: Fresh Start for Montana Homes'"
            echo "   5. 'Organizing Winter Gear: Skis, Snowshoes, and More'"
            echo ""
            echo "📝 Content Focus: Comfort, indoor activities, fresh starts"
            ;;
    esac
    
    echo ""
    echo "📅 QUARTERLY CONTENT THEMES:"
    echo "   Q1 (Jan-Mar): New Year, Fresh Starts, Winter Organization"
    echo "   Q2 (Apr-Jun): Spring Cleaning, Outdoor Prep, Travel Ready"
    echo "   Q3 (Jul-Sep): Summer Living, Family Time, Back-to-School"
    echo "   Q4 (Oct-Dec): Holiday Prep, Winter Storage, Year-End Reviews"
    echo ""
}

# Generate SEO-optimized content ideas
generate_seo_ideas() {
    echo "🔍 SEO-Optimized Content Topics"
    echo "══════════════════════════════"
    echo ""
    
    echo "🎯 PRIMARY KEYWORD TARGETS:"
    echo ""
    echo "1. 'Professional Organizer Missoula Montana' (High Competition)"
    echo "   - 'What to Expect When Hiring a Professional Organizer in Missoula'"
    echo "   - 'Professional Organizer vs DIY: Missoula Montana Guide'"
    echo "   - 'Cost of Professional Organizing Services in Missoula'"
    echo ""
    
    echo "2. 'Home Organization Services Montana' (Medium Competition)"
    echo "   - 'Complete Guide to Home Organization Services in Montana'"
    echo "   - '10 Signs You Need Home Organization Services in Montana'"
    echo "   - 'Montana Home Organization: Before and After Transformations'"
    echo ""
    
    echo "3. 'Senior Downsizing Services Missoula' (Low Competition)"
    echo "   - 'Senior Downsizing in Missoula: A Step-by-Step Guide'"
    echo "   - 'Emotional Support During Senior Downsizing in Montana'"
    echo "   - 'Downsizing Checklist for Montana Seniors'"
    echo ""
    
    echo "🔑 LONG-TAIL KEYWORD OPPORTUNITIES:"
    echo ""
    echo "4. 'Kitchen Organization Missoula Montana'"
    echo "   - 'Small Montana Kitchen Organization Ideas That Work'"
    echo "   - 'Pantry Organization for Montana Families'"
    echo ""
    
    echo "5. 'Garage Organization Services Montana'"
    echo "   - 'Montana Garage Organization: Tools, Equipment, and Storage'"
    echo "   - 'Seasonal Garage Organization for Montana Weather'"
    echo ""
    
    echo "6. 'Moving Organization Help Missoula'"
    echo "   - 'Moving to Missoula? Organization Tips for Your New Home'"
    echo "   - 'Packing and Organization Services for Montana Moves'"
    echo ""
    
    echo "📊 SEO CONTENT STRATEGY:"
    echo "   ✅ Create pillar pages for each service area"
    echo "   ✅ Build topic clusters around main keywords"
    echo "   ✅ Target featured snippets with FAQ formats"
    echo "   ✅ Include local schema markup in all posts"
    echo ""
}

# Generate social media content ideas
generate_social_ideas() {
    echo "📱 Social Media Content Ideas"
    echo "════════════════════════════"
    echo ""
    
    echo "📸 INSTAGRAM CONTENT:"
    echo ""
    echo "Before & After Posts:"
    echo "   1. Kitchen pantry transformations with Montana-made products"
    echo "   2. Closet organization featuring winter gear storage"
    echo "   3. Home office setups for Montana remote workers"
    echo "   4. Garage organization showcasing outdoor equipment"
    echo ""
    
    echo "Montana Lifestyle Posts:"
    echo "   1. 'Organizing Your Montana Adventure Gear' (Reels)"
    echo "   2. 'Mudroom Organization for Montana Weather' (Carousel)"
    echo "   3. 'Small Cabin, Big Organization Solutions' (Stories)"
    echo "   4. 'Ranch Life Organization Hacks' (IGTV)"
    echo ""
    
    echo "📘 FACEBOOK CONTENT:"
    echo ""
    echo "Educational Posts:"
    echo "   1. Weekly organization tips for Montana families"
    echo "   2. Seasonal decluttering challenges"
    echo "   3. Senior downsizing support group discussions"
    echo "   4. Live Q&A sessions about organization challenges"
    echo ""
    
    echo "Community Engagement:"
    echo "   1. Share client success stories (with permission)"
    echo "   2. Montana-specific organization challenges polls"
    echo "   3. Local business partnerships and features"
    echo "   4. Seasonal organization tips and reminders"
    echo ""
    
    echo "🐦 TWITTER/X CONTENT:"
    echo "   1. Quick daily organization tips (daily threads)"
    echo "   2. Montana weather-related organization reminders"
    echo "   3. Engage with Montana lifestyle and home accounts"
    echo "   4. Share client testimonials and reviews"
    echo ""
    
    echo "🎥 VIDEO CONTENT IDEAS:"
    echo "   1. 'Day in the Life of a Montana Professional Organizer'"
    echo "   2. 'Organizing Challenge: 15-Minute Montana Mudroom'"
    echo "   3. 'Client Testimonials: Real Montana Families'"
    echo "   4. 'Seasonal Organization Tips for Montana Homes'"
    echo ""
}

# Generate blog post topics
generate_blog_ideas() {
    echo "📝 Blog Post Topic Suggestions"
    echo "═════════════════════════════"
    echo ""
    
    echo "🏆 HIGH-IMPACT BLOG POSTS:"
    echo ""
    echo "1. Ultimate Guides (High SEO Value):"
    echo "   - 'The Complete Guide to Professional Organizing in Montana'"
    echo "   - 'Montana Home Organization: A Room-by-Room Guide'"
    echo "   - 'Senior Downsizing in Montana: Everything You Need to Know'"
    echo ""
    
    echo "2. Local Authority Content:"
    echo "   - 'Best Storage Solutions for Montana's Climate'"
    echo "   - 'Organizing Historic Montana Homes: Challenges and Solutions'"
    echo "   - 'Montana Family Organization: Juggling Work, School, and Adventure'"
    echo ""
    
    echo "3. Service-Specific Deep Dives:"
    echo "   - 'What Happens During a Professional Organizing Session?'"
    echo "   - 'How Much Does Professional Organizing Cost in Montana?'"
    echo "   - 'Preparing for Your First Professional Organizing Session'"
    echo ""
    
    echo "📊 SUPPORTING CONTENT:"
    echo ""
    echo "4. Seasonal How-To Posts:"
    echo "   - 'Preparing Your Montana Home for Winter: Organization Edition'"
    echo "   - 'Spring Cleaning Montana Style: A Professional's Approach'"
    echo "   - 'Summer Organization: Managing Kids and Activities in Montana'"
    echo ""
    
    echo "5. Lifestyle Integration:"
    echo "   - 'Organization for Montana Remote Workers'"
    echo "   - 'RV Living Organization: Montana Road Trip Ready'"
    echo "   - 'Small Space Organization: Montana Apartment Living'"
    echo ""
    
    echo "6. Problem-Solution Posts:"
    echo "   - '5 Organization Mistakes Montana Homeowners Make'"
    echo "   - 'When to DIY vs. Hire a Professional Organizer in Montana'"
    echo "   - 'Organization Solutions for Montana's Unique Storage Challenges'"
    echo ""
    
    echo "✍️ CONTENT CALENDAR SUGGESTIONS:"
    echo "   📅 Weekly: 1 how-to post, 1 local focus post"
    echo "   📅 Bi-weekly: 1 client story/testimonial post"
    echo "   📅 Monthly: 1 comprehensive guide or ultimate resource"
    echo "   📅 Seasonal: 4 season-specific organization posts per year"
    echo ""
}

# Record content idea generation in database
record_content_generation() {
    local content_type="$1"
    local ideas_count="$2"
    local today=$(date '+%Y-%m-%d')
    
    # Insert into content_calendar table if it exists
    sqlite3 "$DB_PATH" "
        INSERT OR IGNORE INTO content_calendar 
        (date, content_type, title, status) 
        VALUES 
        ('$today', '$content_type', 'Generated $ideas_count content ideas', 'planned');
    " 2>/dev/null || true
    
    echo "📝 Content ideas logged to database for tracking"
}

# Main script logic
main() {
    # Ensure database is ready
    if ! check_database; then
        echo "⚠️ Database not available - content ideas will not be logged"
    fi
    
    # Parse command line arguments
    case "${1:-}" in
        --help|-h)
            show_help
            ;;
        --seasonal)
            generate_seasonal_ideas
            record_content_generation "seasonal" "20" 2>/dev/null || true
            ;;
        --seo)
            generate_seo_ideas
            record_content_generation "seo" "15" 2>/dev/null || true
            ;;
        --social)
            generate_social_ideas
            record_content_generation "social_media" "25" 2>/dev/null || true
            ;;
        --blog)
            generate_blog_ideas
            record_content_generation "blog_post" "20" 2>/dev/null || true
            ;;
        "")
            generate_montana_ideas
            record_content_generation "montana_specific" "15" 2>/dev/null || true
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "Run '/content-ideas --help' for usage information."
            exit 1
            ;;
    esac
    
    echo ""
    echo "💡 Next Steps:"
    echo "   1. Choose 2-3 topics that resonate most with your brand"
    echo "   2. Research each topic for 15-30 minutes"
    echo "   3. Create an outline focusing on Montana-specific angles"
    echo "   4. Schedule content creation in your calendar"
    echo ""
    echo "📊 Tip: Run '/checkin' to see how content performance affects your overall metrics!"
}

# Run main function with all arguments
main "$@"