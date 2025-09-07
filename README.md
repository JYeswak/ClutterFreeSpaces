# ClutterFreeSpaces Business Intelligence Platform

**Private business repository for ClutterFreeSpaces - Montana's premier professional organizing service**

## 🎯 **Project Overview**

ClutterFreeSpaces transforms a traditional service business into a data-driven, high-performing enterprise. This comprehensive platform integrates multiple data sources, provides actionable insights, and automates the path from content ideation to client acquisition.

### **Business Goals**
- 🥇 **Rank #1** for "professional organizer Missoula Montana"
- 📈 **Generate 20+ qualified leads** per month
- 💰 **Achieve $10K monthly revenue** by Q2 2026
- 🏔️ **Establish ClutterFreeSpaces** as Montana's organizing authority

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 16+ 
- SQLite3
- `jq` and `bc` command-line tools

```bash
# Install dependencies (macOS)
brew install sqlite3 jq bc

# Install dependencies (Linux)
apt-get install sqlite3 jq bc

# Clone and setup
git clone https://github.com/JYeswak/ClutterFreeSpaces.git
cd ClutterFreeSpaces
npm install
```

### **Initial Setup**
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Configure API credentials (see Setup Guide below)
# Edit .env with your API keys

# 3. Initialize the business intelligence system
./.claude/commands/checkin.sh --init

# 4. Run your first daily checkin
./.claude/commands/checkin.sh
```

## 📊 **Core Features**

### **🌅 Daily Operations Dashboard**
- Real-time SEO metrics from Google Search Console
- Booking and lead data from Calendly
- CRM pipeline status from Airtable
- AI-powered insights and recommendations

### **🔍 Business Intelligence Suite**
- SEO audit and competitor analysis
- Content idea generation with Montana focus
- Lead attribution and conversion funnel analysis
- Weekly business reports with HTML export

### **🤖 Automation & Monitoring**
- Smart notifications for business alerts
- API health monitoring and auto-fix
- Data quality scoring and validation
- Automated content pipeline tracking

## 🛠️ **Command Reference**

| Command | Purpose | Example |
|---------|---------|---------|
| `/checkin` | Daily business dashboard | `./checkin.sh` |
| `/seo-audit` | SEO health and competitor analysis | `./seo-audit.sh --competitor` |
| `/content-ideas` | Content generation for Montana market | `./content-ideas.sh --seasonal` |
| `/lead-report` | Lead source attribution analysis | `./lead-report.sh --funnel` |
| `/competitor-check` | Montana market intelligence | `./competitor-check.sh --deep` |
| `/weekly-report` | Client-ready business reports | `./weekly-report.sh --export` |
| `/automation-status` | System health and diagnostics | `./automation-status.sh --health` |

See [claude.md](./claude.md) for complete documentation.

## ⚙️ **Setup Guide**

### **Required API Integrations**

#### **1. Calendly API** (Required)
```bash
# Get Personal Access Token from developer.calendly.com
CALENDLY_PERSONAL_ACCESS_TOKEN=your_token_here
```

#### **2. Airtable CRM** (Required)
```bash
# Get API key and base ID from airtable.com/api
AIRTABLE_API_KEY=your_api_key_here
AIRTABLE_BASE_ID=your_base_id_here
```

#### **3. Google Search Console** (Recommended)
```bash
# Service account setup for automated access
GSC_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account.json
GSC_SITE_URL=https://www.clutter-free-spaces.com
```

#### **4. Google Analytics 4** (Optional)
```bash
# GA4 Measurement ID and API secret
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=your_api_secret
```

### **Railway Deployment**

The API server is deployed on Railway with webhook endpoints:

```bash
# Production endpoints
GET  /api/calendly-webhook       # Booking conversion tracking
POST /api/google/cloud/search-console   # SEO data retrieval
GET  /api/system-health          # API monitoring
```

## 📁 **Project Structure**

```
ClutterFreeSpaces/
├── 📋 claude.md                      # Complete documentation
├── ⚙️  config/
│   ├── api-server.js                 # Railway API server
│   └── google-services/              # Google API integrations
├── 🤖 .claude/
│   ├── commands/                     # Business intelligence commands
│   ├── lib/                          # Core libraries (API, DB, notifications)
│   └── data/                         # SQLite database and backups
├── 📝 content-pipeline/              # Content strategy and workflow
│   ├── ideas/                        # Content brainstorming
│   ├── research/                     # SEO and keyword research
│   └── drafts/                       # Work-in-progress content
├── 🌐 squarespace-forms/             # Website integration code
└── 📊 scripts/                       # Utility and test scripts
```

## 🎯 **Business Intelligence Features**

### **📈 Key Performance Indicators**
- **SEO Metrics**: Organic clicks, search position, CTR
- **Conversion Metrics**: Website → Booking rate, lead quality
- **Content Performance**: Blog traffic, social engagement
- **Business Health**: Monthly revenue, customer acquisition

### **🔔 Smart Notifications**
- 🚨 **Critical**: Booking rate drops, API failures
- ⚠️ **Warning**: SEO ranking changes, conversion issues
- ✅ **Success**: Goal achievements, traffic milestones
- ℹ️ **Info**: Seasonal opportunities, competitor updates

### **📊 Automated Reporting**
- Daily business dashboards
- Weekly performance summaries
- Monthly goal tracking
- Quarterly strategic reviews

## 🏔️ **Montana Market Focus**

### **Target Keywords**
- "professional organizer Missoula Montana"
- "home organization services Montana" 
- "senior downsizing services Missoula"

### **Content Strategy**
- **40% Montana Lifestyle**: RV organization, ranch solutions
- **30% Family & Home**: Kitchen, office, children's rooms
- **20% Life Transitions**: Senior downsizing, moving help
- **10% Psychology & Wellness**: Stress reduction, mindful organizing

### **Competitive Advantage**
- Modern technology stack with online booking
- Data-driven marketing and optimization
- Comprehensive service offerings
- Professional client experience

## 🚀 **Deployment**

### **Railway (Production)**
```bash
# Automatic deployment on git push
git push origin main

# Manual Railway CLI deployment
railway up
```

### **Environment Variables**
Set the following in Railway dashboard or `.env`:

```bash
# Required
CALENDLY_PERSONAL_ACCESS_TOKEN=
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=

# Optional
GSC_SERVICE_ACCOUNT_KEY_PATH=
GSC_SITE_URL=
GA4_MEASUREMENT_ID=
GA4_API_SECRET=

# Production
NODE_ENV=production
PORT=3000
```

## 📊 **Success Metrics**

### **30-Day Targets**
- ✅ Daily check-ins established
- ✅ All API integrations functional
- 📈 Baseline metrics documented
- 📝 Content pipeline active

### **90-Day Targets**
- 🎯 20+ monthly bookings achieved
- 📊 Top 10 rankings for target keywords
- 💰 $5K monthly revenue milestone
- 🤖 Full automation operational

### **1-Year Vision**
- 👑 #1 Montana organizing authority
- 💼 100+ satisfied clients
- 💰 $100K annual revenue
- 🌟 Recognized regional brand

## 🔒 **Security & Privacy**

- **Local Data Storage**: All metrics stored locally in SQLite
- **API Key Security**: Environment variables only, never committed
- **Workload Identity**: Secure GCP authentication via Railway
- **Encrypted Communications**: HTTPS for all API endpoints

## 🤝 **Contributing**

This is a private business repository. For feature requests or bug reports:

1. Create detailed issues with business impact
2. Follow the existing code patterns
3. Test thoroughly with `/automation-status --health`
4. Document changes in relevant command help

## 📞 **Support**

- **System Health**: Run `/automation-status --health`
- **API Issues**: Check `.env` configuration and API credentials
- **Database Problems**: Use `/checkin --init` to reset
- **Documentation**: See comprehensive [claude.md](./claude.md)

## 📜 **License**

MIT License - see [LICENSE](./LICENSE) for details.

---

**Built with ❤️ for Montana's Professional Organizing Market**

*This system transforms ClutterFreeSpaces from a service business into a data-driven, scalable enterprise. Every decision is backed by data, every opportunity is identified automatically, and every client interaction is optimized for maximum impact.*

🤖 *Generated with [Claude Code](https://claude.ai/code) - Business Intelligence Platform*