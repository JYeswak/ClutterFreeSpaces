# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Project Overview

ClutterFreeSpaces is a comprehensive business platform built for Chanel's professional organizing service in Missoula, Montana. The platform combines automated B2B outreach, business intelligence dashboards, and complete website integration to grow her RV organization specialty from zero to profitable operation (first client: 9/5/2025).

## 🏗️ System Architecture

### **Three Core Systems:**

**1. Website & Lead Generation** (Squarespace + Custom Code Injections)
- Custom HTML/JS injections in `squarespace-forms/`
- SEO-optimized pages with tracking
- Resource download system with email capture
- GA4/GTM conversion tracking with IP exclusion

**2. B2B Outreach Engine** (Python + SendGrid)
- Google Places API business discovery (`scripts/scrapers/`)
- Email validation via Hunter.io
- Multi-sequence campaign system (`outreach/campaigns/`)
- Smart exclusion logic to prevent duplicate sends

**3. Business Intelligence Dashboard** (Shell Scripts + APIs)
- Daily analytics via `/checkin` command
- SEO monitoring and competitor tracking
- Lead pipeline analysis with Airtable/Calendly integration
- Goal tracking with SQLite databases

## 📊 Core Development Commands

### **Daily Operations**
```bash
# Primary business intelligence dashboard
/checkin                    # Daily metrics, leads, SEO performance
/checkin --init             # First-time setup
/checkin --health           # API connection status

# Analytics & Monitoring  
/seo-audit                  # SEO health check
/competitor-check           # Market intelligence
/lead-report               # Pipeline analysis
/weekly-report             # Client-ready summaries
/content-ideas             # AI content generation
```

### **B2B Campaign Management**
```bash
# Launch email campaigns with smart exclusion
python3 scripts/day2_campaign_launcher.py

# Schedule campaigns for optimal timing (8 AM, 1 PM, 4 PM)
python3 scripts/schedule_campaigns.py

# View scheduled jobs
atq

# Cancel scheduled job
atrm <job_id>
```

### **Server & Webhooks**
```bash
# Start Railway webhook server for Calendly/form integrations
npm start

# Development mode with auto-restart
npm run dev
```

## 🎯 Campaign Types & Templates

### **Active Campaign Types:**
- `bretz_warm` - RV dealer warm connections
- `rv_dealer` - RV dealership outreach
- `rv_parks` - RV park partnerships  
- `senior_living` - Downsizing services
- `moving_company` - Moving partnerships
- `real_estate_agent` - Realtor collaborations
- `storage_facilities` - Storage partnerships
- `cleaning_companies` - Service bundling
- `government` - Municipal contracts

### **Email Template Convention:**
Templates located in `outreach/campaigns/templates/`
- Format: `{campaign_type}_email{sequence_number}.html`
- Example: `rv_dealer_email1.html`, `senior_living_email2.html`
- Missing templates prevent campaign sends (check logs)

## 🔧 Critical Configuration

### **SendGrid Setup (REQUIRED)**
- **Account Type**: Paid ($19.95/month minimum)
- **API Key**: Full Access permissions
- **Unsubscribe Group ID**: 27918 (configured in EmailCampaignManager)
- **Domain Authentication**: em8622.clutter-free-spaces.com
- **Sender Email**: contact@clutter-free-spaces.com

### **Database Schemas**
- `outreach/data/b2b_outreach.db` - Campaign tracking, contact management
- `.claude/data/metrics.db` - Business intelligence metrics
- Both are SQLite databases, backed up automatically

### **Environment Variables (.env)**
```bash
# SendGrid
SENDGRID_API_KEY=SG.xxx
SendGrid_API_Key=SG.xxx  # Both formats supported

# Google APIs  
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLECLOUD_API_KEY=xxx

# CRM & Bookings
AIRTABLE_API_KEY=xxx
AIRTABLE_BASE_ID=xxx
CALENDLY_PERSONAL_ACCESS_TOKEN=xxx

# Optional Integrations
TWILIO_SID=xxx
TWILIO_SECRET=xxx
```

### **GA4 Internal Traffic Filtering**
- **IP Addresses Excluded**: 65.117.210.114, 72.165.29.7
- **GTM Configuration**: Exception trigger on Google Tag
- **Method**: JavaScript IP detection with fetch to ipify.org

## 🚀 EmailCampaignManager Architecture

### **Core Class Structure:**
```python
# Located: outreach/campaigns/email_campaign_manager.py
EmailCampaignManager()
├── get_campaign_contacts(campaign_type)  # Fetch contacts by type
├── launch_campaign(campaign_type)        # Launch full campaign
├── start_campaign_sequence(contact, type) # Add contact to sequence
├── process_scheduled_emails()           # Send queued emails
└── send_email(contact, template_data)   # Individual email send
```

### **Smart Exclusion Logic:**
- Tracks all sent emails in `campaign_sends` table
- Prevents duplicate sends within campaign sequences
- Day-to-day exclusion prevents re-targeting same recipients
- Located in `day2_campaign_launcher.py:get_yesterday_recipients()`

## 🔍 Business Intelligence Features

### **Daily Metrics Tracking:**
- SEO rankings and organic traffic (Google Search Console)
- Booking conversions (Calendly webhooks)  
- CRM pipeline status (Airtable API)
- Website analytics (GA4 API)
- Revenue and goal tracking

### **Automated Insights:**
- Keyword opportunity detection
- Competitor ranking changes
- Lead source attribution
- Conversion funnel analysis
- Content performance metrics

## 📁 Directory Structure

```
ClutterFreeSpaces/
├── scripts/                    # All automation scripts
│   ├── day2_campaign_launcher.py    # Main campaign system
│   ├── schedule_campaigns.py        # Staggered timing system
│   ├── scrapers/                   # Business discovery tools
│   └── config-setup/              # OAuth and API setup
├── outreach/                   # B2B outreach system
│   ├── campaigns/                  # Email templates & logic
│   ├── data/b2b_outreach.db       # Campaign database
│   └── scrapers/                  # Contact discovery
├── squarespace-forms/          # Website code injections
├── config/                     # Node.js server & Google services
│   ├── api-server.js              # Webhook handling
│   └── google-services/           # GA4, GMB, SEO services
├── .claude/                    # Business intelligence
│   ├── commands/                  # Shell script commands
│   └── data/metrics.db           # Analytics database
└── archived/                   # Historical/obsolete files
```

## 🧪 Testing & Validation

### **Campaign Testing:**
```python
# Test single campaign without sending
manager = EmailCampaignManager()
contacts = manager.get_campaign_contacts('rv_dealer')
print(f"Found {len(contacts)} contacts")

# Test with limit to avoid accidental mass sends
sent = manager.launch_campaign('rv_dealer', test_mode=True)  # Limits to 3
```

### **SendGrid Diagnostics:**
```bash
# Check API connectivity and account status
python3 archived/2025-09-09-sendgrid-troubleshooting/sendgrid_diagnostics.py
```

### **Database Inspection:**
```bash
# Check campaign status
sqlite3 outreach/data/b2b_outreach.db "SELECT campaign_type, COUNT(*) FROM campaign_contacts GROUP BY campaign_type;"

# View recent sends  
sqlite3 outreach/data/b2b_outreach.db "SELECT * FROM campaign_sends ORDER BY sent_date DESC LIMIT 10;"
```

## 🚨 Common Issues & Solutions

### **SendGrid 401 Errors:**
- Ensure paid account (free trials have separate API quotas)
- Verify unsubscribe group ID exists (27918)
- Check API key has Full Access permissions

### **Missing Email Templates:**
- Campaign contacts get queued but won't send without template
- Create: `outreach/campaigns/templates/{type}_email1.html`
- Follow existing template structure and personalization

### **Campaign Exclusion Not Working:**
- Check `get_yesterday_recipients()` method in day2_campaign_launcher.py
- Verify database contains previous send records
- Test exclusion logic before mass sends

### **GA4 Tracking Internal Traffic:**
- Confirm GTM exception trigger is published
- Test with different networks to verify IP filtering
- Use GA4 Real-Time reports to validate exclusion

## 💡 Development Tips

### **Safe Campaign Development:**
1. Always test with small contact lists first
2. Use `test_mode=True` parameters when available  
3. Check `atq` before scheduling mass campaigns
4. Monitor SendGrid dashboard during sends
5. Verify exclusion logic with known test emails

### **Business Intelligence Workflow:**
1. Run `/checkin` each morning for daily metrics
2. Use `/lead-report` after new inquiries  
3. Schedule `/weekly-report` for client updates
4. Monitor `/competitor-check` for market changes

### **Email Template Best Practices:**
- Use existing templates as reference for personalization
- Include unsubscribe links (handled by SendGrid)
- Test HTML rendering across email clients
- Montana-specific content performs better

## 📈 Success Metrics

### **Current Status (September 2025):**
- **First Client**: 9/5/2025 (multi-day project, 10-15 hours)
- **Daily Email Volume**: 61 sent on 9/9/2025
- **SendGrid Reputation**: 99%
- **Campaign Types**: 9 active sequences
- **Website**: Full Google indexing in progress

### **Growth Targets:**
- 20+ qualified leads per month
- #1 ranking for "professional organizer Missoula Montana"  
- $10K monthly revenue by Q2 2026
- Establish Montana organizing authority

---

*This platform transforms ClutterFreeSpaces from a startup into a data-driven, automated business generating consistent leads and revenue through systematic outreach and optimization.*