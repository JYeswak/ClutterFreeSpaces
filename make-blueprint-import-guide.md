# Make.com Blueprint Import Guide

## What You're Getting

✅ **Ready-to-import JSON blueprint** for ClutterFreeSpaces social media automation
✅ **4-week rotating content** (RV Tips, Transformations, Psychology, Quick Wins)  
✅ **Automatic posting** to Facebook & Instagram
✅ **Analytics tracking** in your Airtable CRM
✅ **Manual trigger system** - one click per week

## Step-by-Step Import Process

### Phase 1: Prepare Make.com Account

1. **Create Make.com Account**
   - Go to make.com
   - Sign up with business email
   - Choose EU region (blueprint is configured for eu1.make.com)

2. **Connect Required Apps**
   - Facebook Pages (for posting)
   - Instagram for Business (for IG posts)
   - Airtable (for analytics tracking)

### Phase 2: Import the Blueprint

1. **Create New Scenario**
   - In Make.com, click "Create a new scenario"
   - Don't add any modules yet

2. **Import Blueprint**
   - Click the gear icon (⚙️) in top menu
   - Select "Import Blueprint"
   - Choose the file: `clutterfreespaces-social-media-blueprint.json`
   - Click "Import"

3. **Verify Import**
   - You should see 6 connected modules:
     - Webhook (trigger)
     - Array Iterator (content)
     - Set Variables (week calculation)
     - Facebook Post
     - Instagram Post
     - Airtable Record

### Phase 3: Configure Connections

#### 1. Facebook Pages Connection
- Click the Facebook module
- Click "Create a connection"
- Log in with Facebook account that manages your business page
- Grant permissions
- Select "ClutterFreeSpaces" page
- **IMPORTANT:** Copy your Page ID and update in module settings

#### 2. Instagram Business Connection
- Click the Instagram module  
- Create connection (must be Instagram Business account)
- Link to same Facebook page
- **IMPORTANT:** Copy your Instagram Business ID and update in module

#### 3. Airtable Connection
- Click the Airtable module
- Create connection using your API key
- Verify Base ID: `appctzgHffSFd4Nq7`
- Confirm table: "Analytics"

### Phase 4: Webhook Setup

1. **Get Webhook URL**
   - Click the Webhook module
   - Click "Copy address to clipboard"
   - URL will look like: `https://hook.eu1.make.com/abcd1234...`

2. **Update Trigger Button**
   - Open `social-media-trigger-button.html`
   - Replace `YOUR_SOCIAL_WEBHOOK_ID_HERE` with your webhook URL
   - Save the file

### Phase 5: Test the System

1. **Test Webhook**
   - Open the updated trigger button HTML file
   - Click "Post This Week's Content"
   - Check Make.com execution log

2. **Verify Posts**
   - Check Facebook page for new post
   - Check Instagram for new post
   - Check Airtable Analytics table for new record

3. **Week Rotation Test**
   - Content should rotate weekly automatically
   - Week 1: RV Organization Tips
   - Week 2: RV Hacks  
   - Week 3: Before & After Transformations
   - Week 4: Organization Psychology

## Troubleshooting

### Common Issues:

**"Connection failed"**
- Ensure Facebook/Instagram accounts are business accounts
- Check API permissions and tokens
- Verify page/account ownership

**"Airtable record not created"**
- Confirm Base ID matches your CRM
- Check table name is exactly "Analytics"  
- Verify field names match your Airtable setup

**"Webhook not triggering"**
- Copy webhook URL exactly
- Test with a simple POST request first
- Check Make.com execution history

**"Content not rotating"**
- Week calculation is based on Unix timestamp
- Should automatically change weekly
- Force test by modifying week calculation if needed

### Customization Options:

**Update Content:**
- Edit the Array Iterator module
- Modify post text, hashtags, links
- Add more content variations

**Change Posting Schedule:**
- Add a Schedule module before webhook
- Set specific days/times for automatic posting
- Remove manual trigger if desired

**Add More Platforms:**
- Add LinkedIn, Twitter modules
- Copy existing post format
- Connect additional social accounts

## Success Metrics

After setup, you should see:

📊 **Weekly Analytics in Airtable:**
- Date of post
- Content theme
- Facebook/Instagram post IDs
- Lead source tracking

📱 **Social Media Posts:**
- Professional, rotating content
- Consistent branding and hashtags
- Quiz and consultation links included

🎯 **Lead Generation:**
- Traffic directed to organization quiz
- Consultation bookings from social
- CRM tracking of social media leads

## Maintenance

**Weekly (5 minutes):**
- Click trigger button to post content
- Review analytics in Airtable

**Monthly (30 minutes):**
- Review post performance
- Update content if needed  
- Check link functionality

**Quarterly (1 hour):**
- Analyze social media ROI
- Optimize content themes
- A/B test posting times

## Files You Need:

1. ✅ `clutterfreespaces-social-media-blueprint.json` - Import this into Make.com
2. ✅ `social-media-trigger-button.html` - Update webhook URL and bookmark for Chanel
3. ✅ This guide - Follow step-by-step

Your social media automation will be ready to generate consistent leads for your ClutterFreeSpaces business!