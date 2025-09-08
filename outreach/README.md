# ClutterFreeSpaces B2B Outreach System

## 🚀 Overview
Comprehensive B2B outreach system targeting strategic partners in Montana who can refer clients to ClutterFreeSpaces. Supports two parallel campaigns: Home Organization and RV Organization.

## 📁 Directory Structure

### `/scraping/` - Data Collection Scripts
- `google_maps/` - Google Maps/Places API scrapers
- `yelp/` - Yelp business directory scrapers  
- `websites/` - Website contact extraction tools
- `facebook/` - Facebook business page scrapers

### `/data/` - Data Storage
- `raw/` - Unprocessed scraped data (JSON/CSV)
- `processed/` - Clean, enriched contact data
- `backups/` - Data backups and versioning

### `/enriched/` - Enhanced Contact Data
- Processed contacts with additional intelligence
- Business scoring and prioritization
- Contact verification status

### `/templates/` - Email & Outreach Templates
- `home_campaign/` - Templates for home organization partners
- `rv_campaign/` - Templates for RV organization partners

### `/campaigns/` - Campaign Management
- `active/` - Currently running campaigns
- `completed/` - Finished campaigns with results
- `drafts/` - Campaign templates and staging

### `/exports/` - Data Exports
- CSV exports for CRM integration
- Analytics reports
- Partner lists for other tools

### `/lib/` - Shared Libraries
- Common functions for scraping
- Database utilities
- Email sending utilities

### `/config/` - Configuration Files
- API keys and settings
- Scraping targets and rules
- Campaign parameters

## 🎯 Campaign Targets

### Home Organization Partners
- **Cleaning Companies** - 90% priority, 20% commission
- **Real Estate Agents** - 95% priority, 15% commission  
- **Property Management** - 80% priority, 20% commission
- **Moving Companies** - 85% priority, 25% commission
- **Storage Facilities** - 75% priority, 20% commission
- **Home Staging** - 85% priority, 15% commission
- **Senior Living** - 90% priority, 20% commission

### RV Organization Partners
- **RV Dealers** - 95% priority, 20% commission
- **RV Parks** - 80% priority, 15% commission
- **RV Service Centers** - 85% priority, 20% commission
- **RV Rental Companies** - 75% priority, 25% commission
- **Outdoor Stores** - 70% priority, 15% commission

## 🚀 Quick Start Commands

```bash
# Discover new businesses (Google Maps)
python3 outreach/scraping/google_maps_scraper.py --type=rv_dealer --radius=30

# Enrich contact data with website scraping
python3 outreach/scraping/website_contact_extractor.py --batch=50

# Create new outreach campaign
python3 outreach/campaigns/campaign_builder.py --type=home_organization

# Send daily outreach emails
python3 outreach/campaigns/email_sender.py --limit=20

# View campaign analytics
python3 outreach/campaigns/analytics_dashboard.py
```

## 📊 Database Integration

All data is stored in the main SQLite database (`.claude/data/metrics.db`) with the following key tables:
- `businesses` - Business information and scoring
- `business_contacts` - Individual contact details
- `outreach_campaigns` - Campaign definitions
- `outreach_activities` - Individual outreach actions
- `partnership_opportunities` - Qualified prospects
- `active_partnerships` - Confirmed partners

## 🔧 Configuration

Copy `.env.example` to `.env` and configure:
```bash
# Google Maps API (optional - can scrape without API)
GOOGLE_MAPS_API_KEY=your_key_here

# Email sending (for outreach automation)
SENDGRID_API_KEY=your_sendgrid_key
SMTP_SERVER=smtp.gmail.com
SMTP_USER=your_email
SMTP_PASS=your_app_password

# Rate limiting and scraping behavior
DAILY_DISCOVERY_LIMIT=50
DAILY_OUTREACH_LIMIT=20
SCRAPING_DELAY_SECONDS=2
```

## 🎯 Success Metrics

- **Discovery Target**: 500+ qualified Montana businesses
- **Contact Enrichment**: 80%+ with email addresses
- **Outreach Volume**: 200+ personalized emails sent
- **Response Rate**: 15-20% reply rate target
- **Partnership Goal**: 5-10 active partnerships
- **Revenue Impact**: $5,000+ monthly from referrals

## 📈 Reporting

The system integrates with the main `/checkin` dashboard to provide:
- Daily outreach activity summaries
- Partnership pipeline status
- Revenue projections from B2B relationships
- Response rate analytics by business type

---

*Part of the ClutterFreeSpaces Business Intelligence Platform*
*Last Updated: September 2025*