#!/bin/bash
# API client functions for ClutterFreeSpaces dashboard
# Handles all external API integrations with error handling and caching

# Set PROJECT_ROOT if not already set
if [[ -z "${PROJECT_ROOT:-}" ]]; then
    PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
    export PROJECT_ROOT
fi

source "$PROJECT_ROOT/.claude/lib/database.sh"

# Load environment variables safely
if [[ -f "$PROJECT_ROOT/.env" ]]; then
    # Use a simpler approach - source the file after cleaning
    set -a  # Automatically export all variables
    source <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$PROJECT_ROOT/.env")
    set +a  # Stop auto-export
fi

# Utility function to make HTTP requests with timing
make_request() {
    local method="$1"
    local url="$2"
    local headers="$3"
    local data="$4"
    local service="$5"
    
    # Use seconds instead of milliseconds for better compatibility
    local start_time=$(date +%s)
    local temp_file=$(mktemp)
    local status_code
    
    if [[ "$method" == "GET" ]]; then
        status_code=$(curl -s -w "%{http_code}" -H "$headers" "$url" -o "$temp_file" 2>/dev/null)
    else
        status_code=$(curl -s -w "%{http_code}" -X "$method" -H "$headers" -d "$data" "$url" -o "$temp_file" 2>/dev/null)
    fi
    
    local end_time=$(date +%s)
    local response_time=$((end_time - start_time))
    
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        cat "$temp_file"
        log_api_call "$service" "${url##*/}" "$status_code" "$response_time" "" >/dev/null 2>&1
    else
        local error_message=$(cat "$temp_file" 2>/dev/null | head -1)
        log_api_call "$service" "${url##*/}" "$status_code" "$response_time" "$error_message" >/dev/null 2>&1
        echo "API Error [$service]: $status_code" >&2
        if [[ -n "$error_message" ]]; then
            echo "Response: $error_message" >&2
        fi
        rm -f "$temp_file"
        return 1
    fi
    
    rm -f "$temp_file"
    return 0
}

# Google Search Console API functions
setup_gsc_auth() {
    echo "Setting up Google Search Console authentication..."
    echo "Please ensure you have:"
    echo "1. Enabled the Google Search Console API in Google Cloud Console"
    echo "2. Created service account credentials"
    echo "3. Added the service account email to your Search Console property"
    echo ""
    echo "Required environment variables:"
    echo "- GSC_SERVICE_ACCOUNT_KEY_PATH: Path to service account JSON key file"
    echo "- GSC_SITE_URL: Your website URL (e.g., https://clutterfreespaces.com)"
    
    # Use default values if not set
    if [[ -z "${GSC_SERVICE_ACCOUNT_KEY_PATH:-}" ]]; then
        GSC_SERVICE_ACCOUNT_KEY_PATH="$PROJECT_ROOT/.claude/data/gsc-service-account.json"
    fi
    
    if [[ -z "${GSC_SITE_URL:-}" ]]; then
        GSC_SITE_URL="https://clutterfreespaces.com"
    fi
    
    if [[ ! -f "$GSC_SERVICE_ACCOUNT_KEY_PATH" ]]; then
        echo "⚠️  Google Search Console service account key not found at: $GSC_SERVICE_ACCOUNT_KEY_PATH"
        echo "    Create service account key and place it at this location, or set GSC_SERVICE_ACCOUNT_KEY_PATH"
        return 1
    fi
    
    return 0
}

get_gsc_access_token() {
    local key_file="$GSC_SERVICE_ACCOUNT_KEY_PATH"
    
    if [[ ! -f "$key_file" ]]; then
        echo "Service account key file not found: $key_file" >&2
        return 1
    fi
    
    # Create JWT and get access token (simplified version)
    # In production, use a proper JWT library or Google client library
    python3 -c "
import json
import jwt
import time
import requests

with open('$key_file', 'r') as f:
    key_data = json.load(f)

now = int(time.time())
payload = {
    'iss': key_data['client_email'],
    'scope': 'https://www.googleapis.com/auth/webmasters.readonly',
    'aud': 'https://oauth2.googleapis.com/token',
    'exp': now + 3600,
    'iat': now
}

token = jwt.encode(payload, key_data['private_key'], algorithm='RS256')

response = requests.post('https://oauth2.googleapis.com/token', data={
    'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    'assertion': token
})

if response.status_code == 200:
    print(response.json()['access_token'])
else:
    exit(1)
" 2>/dev/null
}

fetch_gsc_data() {
    local cache_key="gsc_data_$(date +%Y%m%d)"
    local cached_data
    
    # Check cache first
    cached_data=$(get_cached_response "$cache_key")
    if [[ -n "$cached_data" ]]; then
        echo "$cached_data"
        return 0
    fi
    
    if ! setup_gsc_auth >/dev/null 2>&1; then
        echo '{"error": "GSC not configured", "clicks": 0, "impressions": 0, "position": 0, "ctr": 0}'
        return 0
    fi
    
    local access_token
    access_token=$(get_gsc_access_token)
    
    if [[ -z "$access_token" ]]; then
        echo '{"error": "GSC auth failed", "clicks": 0, "impressions": 0, "position": 0, "ctr": 0}'
        return 0
    fi
    
    local start_date=$(date -d '7 days ago' '+%Y-%m-%d' 2>/dev/null || date -v '-7d' '+%Y-%m-%d')
    local end_date=$(date '+%Y-%m-%d')
    
    local response
    response=$(make_request "POST" \
        "https://www.googleapis.com/webmasters/v3/sites/${GSC_SITE_URL}/searchAnalytics/query" \
        "Authorization: Bearer $access_token" \
        "{\"startDate\": \"$start_date\", \"endDate\": \"$end_date\", \"dimensions\": [\"date\"]}" \
        "gsc")
    
    if [[ $? -eq 0 && -n "$response" ]]; then
        # Parse and aggregate the response
        local parsed_data
        parsed_data=$(echo "$response" | python3 -c "
import json
import sys

try:
    data = json.load(sys.stdin)
    if 'rows' in data:
        total_clicks = sum(row['clicks'] for row in data['rows'])
        total_impressions = sum(row['impressions'] for row in data['rows'])
        avg_position = sum(row['position'] for row in data['rows']) / len(data['rows'])
        avg_ctr = total_clicks / total_impressions if total_impressions > 0 else 0
        
        result = {
            'clicks': total_clicks,
            'impressions': total_impressions,
            'position': round(avg_position, 2),
            'ctr': round(avg_ctr, 4)
        }
    else:
        result = {'clicks': 0, 'impressions': 0, 'position': 0, 'ctr': 0}
    
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({'error': str(e), 'clicks': 0, 'impressions': 0, 'position': 0, 'ctr': 0}))
")
        
        # Cache for 4 hours
        cache_api_response "$cache_key" "gsc" "$parsed_data" 240
        echo "$parsed_data"
    else
        echo '{"error": "GSC API failed", "clicks": 0, "impressions": 0, "position": 0, "ctr": 0}'
    fi
}

# Calendly API functions  
fetch_calendly_data() {
    local cache_key="calendly_data_$(date +%Y%m%d)"
    local cached_data
    
    # Check cache first
    cached_data=$(get_cached_response "$cache_key")
    if [[ -n "$cached_data" ]]; then
        echo "$cached_data"
        return 0
    fi
    
    # Load token directly from .env if not in environment
    if [[ -z "${CALENDLY_PERSONAL_ACCESS_TOKEN:-}" ]]; then
        CALENDLY_PERSONAL_ACCESS_TOKEN=$(grep "^CALENDLY_PERSONAL_ACCESS_TOKEN=" "$PROJECT_ROOT/.env" | cut -d'=' -f2- 2>/dev/null || echo "")
    fi
    
    if [[ -z "$CALENDLY_PERSONAL_ACCESS_TOKEN" ]]; then
        echo '{"error": "Calendly not configured", "bookings": 0, "consultation_bookings": 0, "new_leads": 0}'
        return 0
    fi
    
    # Get user info first
    local user_response
    user_response=$(make_request "GET" \
        "https://api.calendly.com/users/me" \
        "Authorization: Bearer $CALENDLY_PERSONAL_ACCESS_TOKEN" \
        "" \
        "calendly")
    
    if [[ $? -ne 0 ]]; then
        echo '{"error": "Calendly auth failed", "bookings": 0, "consultation_bookings": 0, "new_leads": 0}'
        return 0
    fi
    
    local user_uri
    user_uri=$(echo "$user_response" | python3 -c "
import json
import sys
try:
    data = json.load(sys.stdin)
    print(data['resource']['uri'])
except:
    print('')
")
    
    if [[ -z "$user_uri" ]]; then
        echo '{"error": "Calendly user URI not found", "bookings": 0, "consultation_bookings": 0, "new_leads": 0}'
        return 0
    fi
    
    # Get scheduled events from last 7 days
    local start_time=$(date -d '7 days ago' '+%Y-%m-%dT00:00:00Z' 2>/dev/null || date -v '-7d' '+%Y-%m-%dT00:00:00Z')
    local end_time=$(date '+%Y-%m-%dT23:59:59Z')
    
    local events_response
    events_response=$(make_request "GET" \
        "https://api.calendly.com/scheduled_events?user=${user_uri}&min_start_time=${start_time}&max_start_time=${end_time}" \
        "Authorization: Bearer $CALENDLY_PERSONAL_ACCESS_TOKEN" \
        "" \
        "calendly")
    
    if [[ $? -eq 0 && -n "$events_response" ]]; then
        local parsed_data
        parsed_data=$(echo "$events_response" | python3 -c "
import json
import sys

try:
    data = json.load(sys.stdin)
    events = data.get('collection', [])
    
    total_bookings = len(events)
    consultation_bookings = sum(1 for event in events if 'consultation' in event.get('name', '').lower())
    # Assume each booking is a new lead (can be refined with CRM data)
    new_leads = total_bookings
    
    result = {
        'bookings': total_bookings,
        'consultation_bookings': consultation_bookings,
        'new_leads': new_leads
    }
    
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({'error': str(e), 'bookings': 0, 'consultation_bookings': 0, 'new_leads': 0}))
")
        
        # Cache for 2 hours
        cache_api_response "$cache_key" "calendly" "$parsed_data" 120
        echo "$parsed_data"
    else
        echo '{"error": "Calendly API failed", "bookings": 0, "consultation_bookings": 0, "new_leads": 0}'
    fi
}

# Airtable API functions
fetch_airtable_data() {
    local cache_key="airtable_data_$(date +%Y%m%d)"
    local cached_data
    
    # Check cache first
    cached_data=$(get_cached_response "$cache_key")
    if [[ -n "$cached_data" ]]; then
        echo "$cached_data"
        return 0
    fi
    
    # Load tokens directly from .env if not in environment
    if [[ -z "${AIRTABLE_API_KEY:-}" ]]; then
        AIRTABLE_API_KEY=$(grep "^AIRTABLE_API_KEY=" "$PROJECT_ROOT/.env" | cut -d'=' -f2- 2>/dev/null || echo "")
    fi
    if [[ -z "${AIRTABLE_BASE_ID:-}" ]]; then
        AIRTABLE_BASE_ID=$(grep "^AIRTABLE_BASE_ID=" "$PROJECT_ROOT/.env" | cut -d'=' -f2- 2>/dev/null || echo "")
    fi
    
    if [[ -z "$AIRTABLE_API_KEY" || -z "$AIRTABLE_BASE_ID" ]]; then
        echo '{"error": "Airtable not configured", "pipeline_leads": 0, "active_projects": 0, "revenue_pipeline": 0}'
        return 0
    fi
    
    # Get leads data
    local leads_response
    leads_response=$(make_request "GET" \
        "https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Leads?filterByFormula=AND({Status}!='Closed')" \
        "Authorization: Bearer $AIRTABLE_API_KEY" \
        "" \
        "airtable")
    
    if [[ $? -ne 0 ]]; then
        echo '{"error": "Airtable API failed", "pipeline_leads": 0, "active_projects": 0, "revenue_pipeline": 0}'
        return 0
    fi
    
    # Get projects data  
    local projects_response
    projects_response=$(make_request "GET" \
        "https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Projects?filterByFormula=AND({Status}='Active')" \
        "Authorization: Bearer $AIRTABLE_API_KEY" \
        "" \
        "airtable")
    
    local parsed_data
    parsed_data=$(python3 -c "
import json
import sys

try:
    leads_data = json.loads('$leads_response')
    projects_data = json.loads('$projects_response') if '$projects_response' else {'records': []}
    
    pipeline_leads = len(leads_data.get('records', []))
    active_projects = len(projects_data.get('records', []))
    
    # Calculate revenue pipeline from leads
    revenue_pipeline = 0
    for record in leads_data.get('records', []):
        fields = record.get('fields', {})
        estimated_value = fields.get('Estimated Value', 0)
        if isinstance(estimated_value, (int, float)):
            revenue_pipeline += estimated_value
    
    result = {
        'pipeline_leads': pipeline_leads,
        'active_projects': active_projects,
        'revenue_pipeline': revenue_pipeline
    }
    
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({'error': str(e), 'pipeline_leads': 0, 'active_projects': 0, 'revenue_pipeline': 0}))
")
    
    # Cache for 1 hour
    cache_api_response "$cache_key" "airtable" "$parsed_data" 60
    echo "$parsed_data"
}

# Google Analytics 4 functions (simplified - would need proper GA4 Reporting API setup)
fetch_ga4_data() {
    local cache_key="ga4_data_$(date +%Y%m%d)"
    local cached_data
    
    # Check cache first
    cached_data=$(get_cached_response "$cache_key")
    if [[ -n "$cached_data" ]]; then
        echo "$cached_data"
        return 0
    fi
    
    if [[ -z "${GA4_MEASUREMENT_ID:-}" ]]; then
        echo '{"error": "GA4 not configured", "visitors": 0, "page_views": 0, "bounce_rate": 0, "session_duration": 0, "conversion_rate": 0}'
        return 0
    fi
    
    # For now, return mock data since GA4 Reporting API setup is complex
    # In production, implement proper GA4 Reporting API integration
    local mock_data
    mock_data=$(python3 -c "
import json
import random

# Generate realistic mock data
visitors = random.randint(50, 200)
page_views = random.randint(visitors * 2, visitors * 5)
bounce_rate = round(random.uniform(30, 70), 2)
session_duration = random.randint(120, 300)
conversion_rate = round(random.uniform(2, 8), 2)

result = {
    'visitors': visitors,
    'page_views': page_views,
    'bounce_rate': bounce_rate,
    'session_duration': session_duration,
    'conversion_rate': conversion_rate,
    'note': 'Mock data - implement GA4 Reporting API for real data'
}

print(json.dumps(result))
")
    
    # Cache for 4 hours
    cache_api_response "$cache_key" "ga4" "$mock_data" 240
    echo "$mock_data"
}

# Aggregate all API data
fetch_all_data() {
    echo "Fetching data from all APIs..."
    
    # Clean expired cache entries first
    clean_cache
    
    echo "📊 Fetching Google Search Console data..."
    local gsc_data
    gsc_data=$(fetch_gsc_data)
    
    echo "📅 Fetching Calendly booking data..."
    local calendly_data
    calendly_data=$(fetch_calendly_data)
    
    echo "🗃️ Fetching Airtable CRM data..."
    local airtable_data
    airtable_data=$(fetch_airtable_data)
    
    echo "📈 Fetching Google Analytics data..."
    local ga4_data
    ga4_data=$(fetch_ga4_data)
    
    # Combine all data into a single JSON object
    python3 -c "
import json

gsc = json.loads('$gsc_data')
calendly = json.loads('$calendly_data')  
airtable = json.loads('$airtable_data')
ga4 = json.loads('$ga4_data')

combined = {
    'gsc': gsc,
    'calendly': calendly,
    'airtable': airtable,
    'ga4': ga4,
    'timestamp': '$(date -Iseconds)',
    'quality_score': 100  # Calculate based on successful API calls
}

print(json.dumps(combined, indent=2))
"
}