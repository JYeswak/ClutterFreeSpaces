# ClutterFreeSpaces Complete Automation Setup Guide

## Overview: Your 24/7 Business Assistant

This system will transform ClutterFreeSpaces into a fully automated lead generation and qualification machine that works while you sleep. By the end of this setup, you'll have:

- **Automated lead capture** from multiple sources
- **AI-powered lead qualification** (scores 0-100)
- **Automatic follow-up sequences** via email and SMS
- **Social media content creation** and posting
- **Appointment scheduling** without manual intervention
- **Partner/referral tracking** and commission automation

**Total Monthly Cost**: $94 initially, scaling to $200+ as you grow
**Setup Time**: 6-8 hours over 3 days
**ROI**: Expected 4,000%+ in month 1

---

## Phase 1: Foundation Setup (Day 1 - 2 hours)

### Step 1: ManyChat Chatbot (30 minutes)

**Purpose**: Capture and qualify leads 24/7 on Facebook, Instagram, and your website.

1. **Create Account**
   - Visit [manychat.com](https://manychat.com)
   - Sign up with your Facebook Business account
   - Select "Pro" plan ($15/month)

2. **Connect Your Pages**
   - Settings → Channels → Facebook
   - Connect ClutterFreeSpaces Facebook page
   - Enable all Messenger permissions
   - Connect Instagram if you have it

3. **Import Lead Qualification Flow**
   - Go to Flows → Import Flow
   - Use the conversation scripts from `chatbot-conversations.md`
   - Set up these main paths:
     - Home Organization Flow
     - **RV Organization Flow (PRIORITY)**
     - Budget Qualification
     - Out-of-State Virtual Consultation

4. **Configure Keywords**
   - "ORGANIZE" → Start qualification flow
   - "RV" → RV-specific flow  
   - "PRICE" → Send pricing guide
   - "HELP" → Connect to human

5. **Add Growth Tools**
   - Chat Widget for Squarespace website
   - Facebook comment auto-responder
   - Instagram story mention triggers
   - QR codes for print materials

**Success Metric**: Chatbot responds to messages within 30 seconds

### Step 2: Airtable CRM (45 minutes)

**Purpose**: Central database for all leads, projects, and business operations.

1. **Create Workspace**
   ```
   Workspace Name: ClutterFreeSpaces
   Base Name: CRM & Operations
   ```

2. **Create Tables** (Copy structure from implementation-guide.md)

   **LEADS TABLE:**
   ```
   Fields:
   - Name (Single line text)
   - Email (Email)  
   - Phone (Phone)
   - Source (Single select: Facebook, Google, Referral, Website)
   - Lead Score (Number) 
   - Status (Single select: New, Qualified, Nurturing, Client, Lost)
   - Project Type (Multiple select: Home, RV, Office, Garage)
   - Budget Range (Single select: <$300, $300-600, $600-1000, $1000+)
   - ZIP Code (Single line text)
   - Distance from Missoula (Number - auto-calculated)
   - Priority (Single select: Hot, Warm, Cold)
   - Notes (Long text)
   - Created Date (Date)
   - Last Contact (Date) 
   - Next Follow-up (Date)
   - Assigned To (Single select: Chanel)
   ```

   **INTERACTIONS TABLE:**
   ```
   Fields:
   - Lead (Link to Leads table)
   - Date & Time (Date & time)
   - Type (Single select: Email, SMS, Call, Meeting, Chat, Website)
   - Direction (Single select: Inbound, Outbound)
   - Content Summary (Long text)
   - Outcome (Single select: Interested, Not Ready, Scheduled, Lost)
   - Next Action Required (Long text)
   - Automated (Checkbox) - marks if this was automated
   ```

   **PROJECTS TABLE:**
   ```
   Fields:
   - Client (Link to Leads table)
   - Project Name (Single line text)
   - Service Type (Single select: Home Org, RV Org, Office, Garage)
   - Start Date (Date)
   - Estimated Hours (Number)
   - Hourly Rate (Currency - default $100)
   - Estimated Total (Formula: Hours × Rate)
   - Actual Hours (Number)
   - Actual Total (Currency)
   - Status (Single select: Quoted, Scheduled, In Progress, Completed)
   - Before Photos (Attachment)
   - After Photos (Attachment) 
   - Client Testimonial (Long text)
   - Referral Generated (Checkbox)
   ```

3. **Create Views**
   - **Hot Leads**: Filter by Lead Score ≥ 75
   - **Today's Follow-ups**: Filter by Next Follow-up = Today
   - **This Week's Appointments**: Projects starting this week
   - **Stale Leads**: Last Contact > 14 days ago
   - **RV Clients**: Project Type contains "RV"
   - **Revenue Dashboard**: Sum of completed projects

**Success Metric**: All leads automatically appear in Airtable within 2 minutes

### Step 3: Calendly Scheduling (20 minutes)

**Purpose**: Let qualified leads book consultations automatically.

1. **Create Event Types**

   **Free Consultation (30 minutes)**
   ```
   Availability: Monday-Friday 9am-5pm
   Buffer Time: 15 minutes after each appointment
   Location: Phone call
   
   Required Questions:
   - What space needs organizing? (Home/RV/Office/Other)
   - What's your timeline? (ASAP/This Month/Planning Ahead)
   - What's your budget range? (<$300/$300-600/$600-1000/$1000+)
   - Your ZIP code?
   - How did you hear about us?
   ```

   **RV Assessment (45 minutes)** 
   ```
   Availability: Tuesday-Thursday 10am-4pm  
   Buffer Time: 30 minutes (travel time)
   Location: Client address
   
   Required Questions:
   - RV Make/Model/Year?
   - Current location (address)?
   - Full-time or part-time RVing?
   - Biggest organization challenge?
   - Can you send photos? (optional)
   ```

2. **Integration Settings**
   - Connect to Google Calendar
   - Enable Zoom for virtual consultations
   - Set up SMS reminders (24hr and 2hr before)
   - Customize confirmation emails

**Success Metric**: Bookings automatically appear in Google Calendar

---

## Phase 2: Automation Setup (Day 2 - 3 hours)

### Step 4: Make.com Workflows (60 minutes)

**Purpose**: Connect all systems so data flows automatically.

1. **Create Account**
   - Visit [make.com](https://make.com)
   - Choose Basic plan ($9/month)

2. **Build Core Scenarios**

   **Scenario 1: ManyChat → Airtable Lead Creation**
   ```
   Trigger: ManyChat webhook (new lead)
   
   Module 1: Webhook receiver
   Module 2: Airtable - Search for existing lead by email
   Module 3: Router
     Path A (If lead exists): Update existing record
     Path B (If new lead): Create new record
   Module 4: Calculate lead score based on:
     - Location (Montana ZIP = +20 points)
     - Budget ($1000+ = +30 points)
     - Timeline (ASAP = +25 points)
     - Source (Referral = +20 points)
   Module 5: If score ≥ 75, send SMS alert to Chanel
   ```

   **Scenario 2: Calendly → Project Creation**
   ```
   Trigger: Calendly webhook (appointment booked)
   
   Module 1: Find lead in Airtable by email
   Module 2: Update lead status to "Consultation Scheduled"
   Module 3: Create calendar event in Google Calendar
   Module 4: Send confirmation SMS via Twilio
   Module 5: Add to email nurture sequence
   ```

   **Scenario 3: Daily Lead Nurture**
   ```
   Trigger: Schedule (daily at 9am)
   
   Module 1: Get leads from Airtable needing follow-up
   Module 2: Determine email type based on:
     - Days since last contact
     - Lead score
     - Project type (RV gets different emails)
   Module 3: Send personalized email via SendGrid
   Module 4: Update "Last Contact" date in Airtable
   Module 5: Schedule next follow-up date
   ```

**Success Metric**: Lead data flows between systems within 60 seconds

### Step 5: Twilio SMS System (20 minutes)

**Purpose**: Automated SMS for hot leads and appointment reminders.

1. **Account Setup**
   - Sign up at [twilio.com](https://twilio.com)
   - Add $20 credit
   - Buy local Montana number (406 area code)

2. **Configure SMS Templates**
   ```javascript
   // Hot Lead Alert (to Chanel)
   "🔥 HOT LEAD: {name} from {city}. Score: {score}/100. 
   Budget: {budget}. Project: {project_type}. 
   Reply CALL to get their number."

   // Lead Welcome SMS  
   "Hi {name}! Chanel here from ClutterFreeSpaces. 
   Thanks for your interest in {service}. I'll review your 
   info and text within 2 hours with availability. 
   Text STOP to opt out."

   // Appointment Reminder
   "Reminder: Your organization consultation is tomorrow 
   at {time}. Location: {location}. Reply C to confirm 
   or R to reschedule. -Chanel"
   ```

3. **Set Up Auto-Responses**
   - "STOP" → Remove from all lists
   - "HELP" → Send contact information  
   - "MORE" → Send link to calendar booking

**Success Metric**: SMS messages send within 30 seconds of trigger

### Step 6: SendGrid Email System (40 minutes)

**Purpose**: Automated email sequences that nurture leads to conversion.

1. **Account Setup**
   - Create [SendGrid](https://sendgrid.com) account
   - Verify domain (clutterfreespaces.com)
   - Set up sender authentication

2. **Import Email Templates**
   - Use sequences from `email-sequences.md`
   - Create these key sequences:
     - **Welcome Series** (4 emails over 14 days)
     - **Hot Lead Nurture** (SMS + Email combo)
     - **RV-Specific Sequence** (specialized content)
     - **Post-Service Follow-up** (reviews + referrals)

3. **Set Up Dynamic Content**
   ```handlebars
   {{#if lead_score > 74}}
     <p>I'm excited to work with you ASAP! I have availability this week.</p>
   {{else if lead_score > 49}} 
     <p>I'd love to help transform your space. Let's find a time that works.</p>
   {{else}}
     <p>Here are some resources to get you started on your organization journey.</p>
   {{/if}}
   ```

**Success Metric**: Email sequences send automatically based on lead behavior

---

## Phase 3: Website Integration (Day 3 - 2 hours)

### Step 7: Squarespace Updates (60 minutes)

**Purpose**: Transform website into lead generation machine with RV focus.

1. **Add New Pages**
   ```
   /rv-organization → RV-specific landing page
   /services → Updated service packages
   /about-chanel → Personal story + Montana connection
   /book-consultation → Calendly embed
   /free-rv-checklist → Lead magnet
   ```

2. **Install Integrations**
   ```html
   <!-- ManyChat Widget (before </body>) -->
   <script src="//widget.manychat.com/YOUR_ID.js" defer="defer"></script>

   <!-- Facebook Pixel -->
   <script>
   !function(f,b,e,v,n,t,s)...
   fbq('init', 'YOUR_PIXEL_ID');
   fbq('track', 'PageView');
   </script>

   <!-- Calendly Embed -->
   <div class="calendly-inline-widget" 
        data-url="https://calendly.com/clutterfreespaces"
        style="min-width:320px;height:630px;">
   </div>
   ```

3. **SEO Optimization**
   - Primary keyword: "RV organization Montana"
   - Secondary: "professional organizer Missoula"
   - Local schema markup
   - Google Analytics 4 setup

### Step 8: Social Media Automation (45 minutes)

**Purpose**: Consistent social media presence without daily management.

1. **Content Calendar Setup**
   - Use calendar from `social-media-content-calendar.md`
   - Focus 70% on RV content, 30% general organizing

2. **Hootsuite/Later Integration** 
   - Schedule 2 weeks of posts in advance
   - Auto-repost top-performing content
   - Monitor mentions for engagement opportunities

3. **Facebook Group Strategy**
   - Join 10 high-value Montana groups (list in facebook-business-setup.md)
   - Share value-first content 3x per week
   - Never directly pitch services

**Success Metric**: 5-10 social media interactions daily without manual posting

### Step 9: Analytics & Monitoring (15 minutes)

**Purpose**: Track performance and optimize what's working.

1. **Dashboard Setup**
   - Google Data Studio dashboard
   - Connect Airtable, Google Analytics, Facebook
   - Key metrics:
     - Lead volume by source
     - Lead score distribution  
     - Conversion rate (lead → consultation → client)
     - Revenue by service type
     - Cost per acquisition

2. **Alert System**
   ```javascript
   // Hot lead Slack notification
   if (leadScore >= 75) {
     sendSlackAlert({
       channel: '#leads',
       text: `🔥 HOT LEAD: ${name} from ${city}`,
       attachments: [{
         fields: [
           {title: 'Score', value: leadScore},
           {title: 'Budget', value: budget},
           {title: 'Project', value: projectType}
         ]
       }]
     });
   }
   ```

---

## Testing Checklist

Before going live, test every component:

### ManyChat Tests
- [ ] Bot responds to Facebook messages within 30 seconds
- [ ] All conversation paths reach conclusion
- [ ] Lead data captures correctly
- [ ] Keywords trigger correct flows
- [ ] Mobile experience works smoothly

### Airtable Integration Tests  
- [ ] New leads appear in correct table
- [ ] Lead scores calculate accurately
- [ ] Status updates trigger correctly
- [ ] Views filter properly
- [ ] Duplicate detection works

### Automation Tests
- [ ] ManyChat → Airtable flow works
- [ ] Calendly → Airtable integration works
- [ ] Email sequences send at correct times
- [ ] SMS messages include opt-out
- [ ] Hot lead alerts trigger for score ≥ 75

### Website Tests
- [ ] Chat widget appears on all pages
- [ ] Calendly booking works correctly
- [ ] Contact forms submit to Airtable
- [ ] Mobile site loads quickly
- [ ] All integrations fire correctly

---

## Go-Live Sequence

### Week 1: Soft Launch
1. Turn on chatbot for existing followers
2. Start email sequences for current contacts
3. Test all automations with 5-10 leads
4. Fix any bugs or workflow issues

### Week 2: Marketing Push  
1. Announce new RV specialization
2. Launch Facebook/Instagram ads
3. Begin content marketing schedule
4. Activate referral partner program

### Week 3: Optimization
1. Analyze conversion data
2. A/B test email subject lines
3. Optimize chatbot flows based on drop-off
4. Increase ad spend on winning campaigns

---

## Monthly Maintenance (30 minutes)

### Week 1: Performance Review
- Review lead quality scores
- Check conversion rates by source
- Update chatbot responses based on FAQs
- Refresh social media content calendar

### Week 2: Content Updates
- Write new blog post using content automation pipeline
- Create 10+ social media posts from blog content  
- Update email sequences based on seasonal trends
- Add new testimonials/photos to website

### Week 3: Partnership Development
- Reach out to 5 new potential referral partners
- Update partner commission structure
- Send partner performance reports
- Plan joint marketing initiatives

### Week 4: Growth Planning
- Analyze month's metrics vs. goals
- Plan next month's marketing campaigns
- Identify automation improvements
- Budget for scaling successful channels

---

## Emergency Contacts & Resources

**Technical Support:**
- ManyChat: Live chat support 9am-5pm MT
- Make.com: Email support (24-48hr response)
- Twilio: Phone support for account issues
- SendGrid: Email delivery issues

**Account Recovery:**
- All passwords stored in Chanel's password manager
- Backup admin access through Josh's accounts
- API keys documented in secure note

**Performance Benchmarks:**
- Month 1: 100+ leads, 20 consultations, 8 clients, $4,000 revenue
- Month 2: 200+ leads, 35 consultations, 15 clients, $9,000 revenue
- Month 3: 300+ leads, 50 consultations, 25 clients, $17,500 revenue

---

*This automation system is designed to scale from solo operation to multi-person business without losing efficiency. Each component builds on the previous one to create a comprehensive lead generation and nurture system that works 24/7.*