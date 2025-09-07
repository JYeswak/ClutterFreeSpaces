#!/bin/bash
# ClutterFreeSpaces Dashboard Setup Script
# Usage: /setup [option]

set -euo pipefail

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export PROJECT_ROOT

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

show_help() {
    echo "ClutterFreeSpaces Dashboard Setup"
    echo ""
    echo "USAGE:"
    echo "  /setup [option]"
    echo ""
    echo "OPTIONS:"
    echo "  --env-template      Create .env template with all required variables"
    echo "  --gsc-setup         Help setup Google Search Console API"
    echo "  --calendly-setup    Help setup Calendly API"
    echo "  --airtable-setup    Help setup Airtable API"
    echo "  --test-apis         Test all API connections"
    echo "  --help              Show this help message"
    echo ""
}

create_env_template() {
    local env_file="$PROJECT_ROOT/.env"
    
    if [[ -f "$env_file" ]]; then
        echo -e "${YELLOW}⚠️  .env file already exists. Creating backup...${NC}"
        cp "$env_file" "$env_file.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    echo -e "${BLUE}📝 Creating .env template...${NC}"
    
    cat > "$env_file" << 'EOF'
# ClutterFreeSpaces Business Dashboard Configuration
# Copy this template and fill in your actual API credentials

# Calendly API Configuration (Required)
CALENDLY_PERSONAL_ACCESS_TOKEN=your_calendly_token_here
# Get from: https://calendly.com/integrations/api_webhooks

# Airtable API Configuration (Required) 
AIRTABLE_API_KEY=your_airtable_token_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
# Get from: https://airtable.com/create/tokens

# Google Search Console Configuration (Optional but recommended)
GSC_SERVICE_ACCOUNT_KEY_PATH=/path/to/your/service-account.json
GSC_SITE_URL=https://clutterfreespaces.com
# Create service account at: https://console.cloud.google.com/

# Google Analytics 4 Configuration (Optional)
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=your_ga4_api_secret_here
# Get from: Google Analytics > Admin > Data Streams

# Other API Keys (from existing configuration)
SendGrid_API_Key=your_sendgrid_api_key
GOOGLECLOUD_API_KEY=your_google_cloud_api_key
GCP_PROJECT_ID=your_gcp_project_id

# Twilio Configuration  
TWILIO_SID=your_twilio_sid
TWILIO_SECRET=your_twilio_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid

# Railway Deployment
RAILWAY_URL=https://clutterfreespaces-production.up.railway.app
EOF
    
    echo -e "${GREEN}✅ .env template created at: $env_file${NC}"
    echo -e "${YELLOW}📝 Please edit this file and add your actual API credentials.${NC}"
    echo ""
}

setup_gsc() {
    echo -e "${BOLD}${BLUE}🔍 Google Search Console API Setup${NC}"
    echo "═════════════════════════════════════════════"
    echo ""
    
    echo "📋 Step-by-Step Instructions:"
    echo ""
    echo "1. Go to Google Cloud Console:"
    echo "   https://console.cloud.google.com/"
    echo ""
    echo "2. Create or select a project"
    echo ""
    echo "3. Enable the Google Search Console API:"
    echo "   https://console.cloud.google.com/apis/library/searchconsole.googleapis.com"
    echo ""
    echo "4. Create Service Account:"
    echo "   • Go to IAM & Admin > Service Accounts"
    echo "   • Click 'Create Service Account'"
    echo "   • Name: clutterfreespaces-dashboard"
    echo "   • Role: Basic > Viewer"
    echo ""
    echo "5. Create and Download Key:"
    echo "   • Click on created service account"
    echo "   • Go to Keys tab"
    echo "   • Click 'Add Key' > 'Create New Key'"
    echo "   • Choose JSON format"
    echo "   • Download the key file"
    echo ""
    echo "6. Add Service Account to Search Console:"
    echo "   • Go to https://search.google.com/search-console"
    echo "   • Select your property"
    echo "   • Go to Settings > Users and permissions"
    echo "   • Add User: use the service account email"
    echo "   • Permission: Full"
    echo ""
    echo "7. Update your .env file:"
    echo "   GSC_SERVICE_ACCOUNT_KEY_PATH=/path/to/downloaded/key.json"
    echo "   GSC_SITE_URL=https://clutterfreespaces.com"
    echo ""
    
    local data_dir="$PROJECT_ROOT/.claude/data"
    echo -e "${YELLOW}💡 Tip: Place your service account key at:${NC}"
    echo "   $data_dir/gsc-service-account.json"
    echo "   (This is the default location the dashboard will look for)"
    echo ""
}

setup_calendly() {
    echo -e "${BOLD}${PURPLE}📅 Calendly API Setup${NC}"
    echo "═════════════════════════════════════════════"
    echo ""
    
    echo "📋 Step-by-Step Instructions:"
    echo ""
    echo "1. Login to your Calendly account"
    echo ""
    echo "2. Go to API & Webhooks:"
    echo "   https://calendly.com/integrations/api_webhooks"
    echo ""
    echo "3. Generate Personal Access Token:"
    echo "   • Click 'Create Personal Access Token'"
    echo "   • Enter a name: ClutterFreeSpaces Dashboard"
    echo "   • Copy the generated token"
    echo ""
    echo "4. Update your .env file:"
    echo "   CALENDLY_PERSONAL_ACCESS_TOKEN=your_token_here"
    echo ""
    echo "⚠️  Important: Keep this token secure and never share it publicly!"
    echo ""
}

setup_airtable() {
    echo -e "${BOLD}${CYAN}🗃️ Airtable API Setup${NC}"
    echo "═════════════════════════════════════════════"
    echo ""
    
    echo "📋 Step-by-Step Instructions:"
    echo ""
    echo "1. Go to Airtable Tokens page:"
    echo "   https://airtable.com/create/tokens"
    echo ""
    echo "2. Create Personal Access Token:"
    echo "   • Click 'Create token'"
    echo "   • Name: ClutterFreeSpaces Dashboard"
    echo "   • Scopes: data.records:read"
    echo "   • Access: Select your base"
    echo "   • Copy the generated token"
    echo ""
    echo "3. Get your Base ID:"
    echo "   • Go to https://airtable.com/api"
    echo "   • Select your base"
    echo "   • The Base ID is shown in the URL and documentation"
    echo "   • Format: app[14 characters]"
    echo ""
    echo "4. Update your .env file:"
    echo "   AIRTABLE_API_KEY=your_token_here"
    echo "   AIRTABLE_BASE_ID=your_base_id_here"
    echo ""
    echo "📝 Expected tables in your base:"
    echo "   • Leads (with Status and Estimated Value fields)"
    echo "   • Projects (with Status field)"
    echo ""
}

test_apis() {
    echo -e "${BOLD}${GREEN}🧪 Testing API Connections${NC}"
    echo "═════════════════════════════════════════════"
    echo ""
    
    # Source the API clients
    if [[ -f "$PROJECT_ROOT/.claude/lib/api_clients.sh" ]]; then
        source "$PROJECT_ROOT/.claude/lib/api_clients.sh"
    else
        echo -e "${RED}❌ API client library not found${NC}"
        return 1
    fi
    
    echo "Testing Calendly API..."
    local calendly_result
    calendly_result=$(fetch_calendly_data 2>/dev/null || echo '{"error": "Test failed"}')
    local calendly_error=$(echo "$calendly_result" | jq -r '.error // ""' 2>/dev/null || echo "JSON parse error")
    
    if [[ -z "$calendly_error" || "$calendly_error" == "null" ]]; then
        echo -e "${GREEN}✅ Calendly API: Connected successfully${NC}"
    else
        echo -e "${RED}❌ Calendly API: $calendly_error${NC}"
    fi
    
    echo ""
    echo "Testing Airtable API..."
    local airtable_result
    airtable_result=$(fetch_airtable_data 2>/dev/null || echo '{"error": "Test failed"}')
    local airtable_error=$(echo "$airtable_result" | jq -r '.error // ""' 2>/dev/null || echo "JSON parse error")
    
    if [[ -z "$airtable_error" || "$airtable_error" == "null" ]]; then
        echo -e "${GREEN}✅ Airtable API: Connected successfully${NC}"
    else
        echo -e "${RED}❌ Airtable API: $airtable_error${NC}"
    fi
    
    echo ""
    echo "Testing Google Search Console API..."
    local gsc_result
    gsc_result=$(fetch_gsc_data 2>/dev/null || echo '{"error": "Test failed"}')
    local gsc_error=$(echo "$gsc_result" | jq -r '.error // ""' 2>/dev/null || echo "JSON parse error")
    
    if [[ -z "$gsc_error" || "$gsc_error" == "null" ]]; then
        echo -e "${GREEN}✅ Google Search Console: Connected successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Google Search Console: $gsc_error${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📊 Test complete! Run '/checkin --health' for detailed API diagnostics.${NC}"
    echo ""
}

main() {
    case "${1:-}" in
        --help|-h)
            show_help
            ;;
        --env-template)
            create_env_template
            ;;
        --gsc-setup)
            setup_gsc
            ;;
        --calendly-setup)
            setup_calendly
            ;;
        --airtable-setup)
            setup_airtable
            ;;
        --test-apis)
            test_apis
            ;;
        "")
            echo -e "${BOLD}${BLUE}🚀 ClutterFreeSpaces Dashboard Setup${NC}"
            echo ""
            echo "Choose a setup option:"
            echo ""
            echo "1. Create .env template     (/setup --env-template)"
            echo "2. Setup Google Search Console (/setup --gsc-setup)"
            echo "3. Setup Calendly API      (/setup --calendly-setup)" 
            echo "4. Setup Airtable API      (/setup --airtable-setup)"
            echo "5. Test all APIs           (/setup --test-apis)"
            echo ""
            echo "Or run '/setup --help' for all options."
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "Run '/setup --help' for available options."
            exit 1
            ;;
    esac
}

main "$@"