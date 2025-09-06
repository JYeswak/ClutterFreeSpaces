# ClutterFreeSpaces Technical Configuration Guide

## API Keys & Webhooks Setup

### ManyChat Configuration

**Webhook URLs** (to be created in Make.com first):
```
New Lead Webhook: https://hook.us1.make.com/[YOUR_WEBHOOK_ID]
Conversation Update: https://hook.us1.make.com/[YOUR_UPDATE_WEBHOOK_ID]
```

**Custom Fields to Create:**
```json
{
  "lead_score": "number",
  "budget_range": "text", 
  "project_type": "text",
  "zip_code": "text",
  "timeline": "text",
  "source": "text",
  "qualified": "boolean"
}
```

**Keywords Setup:**
```
ORGANIZE → Flow: "Main Qualification"
RV → Flow: "RV Organization Specialist" 
PRICE → Action: Send message with pricing guide
HELP → Action: Connect to human agent
STOP → Action: Unsubscribe from all
MORE → Action: Send calendar booking link
```

### Airtable API Configuration

**Base ID**: Found in API documentation for your base
**Table Names** (must match exactly):
- `Leads`  
- `Interactions`
- `Projects`

**API Key**: Generate in Account → API section

**Webhook Endpoints**:
```
Create Lead: POST https://api.airtable.com/v0/[BASE_ID]/Leads
Update Lead: PATCH https://api.airtable.com/v0/[BASE_ID]/Leads/[RECORD_ID]
Search Lead: GET https://api.airtable.com/v0/[BASE_ID]/Leads?filterByFormula=({Email}='email@domain.com')
```

### Make.com Scenarios Configuration

**Scenario 1: ManyChat to Airtable**
```javascript
// Lead Scoring Formula
let leadScore = 0;

// Location scoring (Montana ZIP codes)
const montanaZips = ['59718', '59801', '59802', '59803', '59804', '59808', '59812'];
if (montanaZips.includes(bundle.inputData.zip_code)) {
    leadScore += 20;
}

// Distance scoring (if not Montana)
const distance = parseFloat(bundle.inputData.distance_miles);
if (distance < 15) leadScore += 20;
else if (distance < 30) leadScore += 15; 
else if (distance < 50) leadScore += 10;

// Budget scoring
switch(bundle.inputData.budget_range) {
    case '$1000+': leadScore += 30; break;
    case '$600-1000': leadScore += 20; break;
    case '$300-600': leadScore += 10; break;
    default: leadScore += 0;
}

// Timeline scoring  
switch(bundle.inputData.timeline) {
    case 'ASAP': leadScore += 25; break;
    case 'This week': leadScore += 20; break;
    case 'This month': leadScore += 15; break;
    case '1-2 months': leadScore += 10; break;
    default: leadScore += 0;
}

// Source scoring
switch(bundle.inputData.source) {
    case 'Referral': leadScore += 20; break;
    case 'Google': leadScore += 15; break;  
    case 'Facebook': leadScore += 10; break;
    default: leadScore += 5;
}

// Engagement scoring
if (bundle.inputData.completed_chat) leadScore += 10;
if (bundle.inputData.downloaded_guide) leadScore += 5;

return { leadScore: leadScore };
```

**Scenario 2: High-Value Lead Alert**
```javascript
// Trigger: Airtable record updated
// Condition: Lead Score >= 75

const smsMessage = `🔥 HOT LEAD: ${bundle.inputData.Name} from ${bundle.inputData.City}
Score: ${bundle.inputData['Lead Score']}/100
Budget: ${bundle.inputData['Budget Range']}  
Project: ${bundle.inputData['Project Type']}
Phone: ${bundle.inputData.Phone}
Timeline: ${bundle.inputData.Timeline}

Reply CALL to get full details.`;

// Send via Twilio to Chanel's phone
```

**Scenario 3: Calendly to Airtable**
```javascript
// Webhook payload from Calendly
const appointmentData = {
    lead_email: bundle.inputData.invitee.email,
    appointment_time: bundle.inputData.event.start_time,
    event_type: bundle.inputData.event.event_type.name,
    meeting_location: bundle.inputData.event.location.location,
    questions_answers: bundle.inputData.invitee.questions_and_answers
};

// Update lead status to "Consultation Scheduled"
// Create interaction record
// Send confirmation SMS
```

### Twilio Configuration

**Account SID**: Found in Console Dashboard
**Auth Token**: Found in Console Dashboard  
**Phone Number**: Purchase Montana number (406 area code)

**SMS Templates:**
```javascript
const templates = {
    hotLeadAlert: `🔥 HOT LEAD: {{name}} from {{city}}. Score: {{score}}/100. Budget: {{budget}}. Project: {{project}}. Reply CALL for their number.`,
    
    welcomeMessage: `Hi {{name}}! Chanel here from ClutterFreeSpaces. Thanks for your interest in {{service}}. I'll review your info and text you within 2 hours with availability. Reply STOP to opt out.`,
    
    appointmentReminder: `Reminder: Organization consultation tomorrow at {{time}}. Location: {{location}}. Reply C to confirm or R to reschedule. See you soon! -Chanel`,
    
    followUpMessage: `Hi {{name}}, it's been a week since our chat about organizing your {{space}}. Still need help? Reply YES to schedule or STOP to opt out.`
};

const autoResponses = {
    'STOP': 'You have been unsubscribed from ClutterFreeSpaces messages. Text START to re-subscribe.',
    'START': 'Welcome back! You\'re now subscribed to updates from ClutterFreeSpaces. Text HELP for options.',
    'HELP': 'ClutterFreeSpaces - Professional Organization Services\n📞 (406) 285-1525\n📧 chanel@clutterfreespaces.com\n🌐 clutterfreespaces.com\nReply STOP to unsubscribe.',
    'MORE': 'Ready to get organized? Book your free consultation: https://calendly.com/clutterfreespaces',
    'CALL': 'Chanel will call you within 2 hours during business hours (9am-5pm MT) at the number you texted from.'
};
```

### SendGrid Email Configuration

**API Key**: Generate in Settings → API Keys
**Domain Authentication**: Set up for clutterfreespaces.com
**Sender Identity**: chanel@clutterfreespaces.com

**Email Templates Structure:**
```handlebars
{{#if custom_field.lead_score}}
  {{#if (gt custom_field.lead_score 74)}}
    <div class="priority-header" style="background-color: #ff4444; color: white; padding: 10px;">
      🔥 HIGH PRIORITY LEAD - RESPOND WITHIN 2 HOURS
    </div>
  {{/if}}
{{/if}}

<h1>Hi {{first_name}},</h1>

{{#eq custom_field.project_type "RV"}}
  <p>As Montana's only RV organization specialist, I'm excited to help transform your mobile home!</p>
{{else}}
  <p>I'm excited to help you create an organized, peaceful space in your Montana home.</p>
{{/eq}}

{{#if custom_field.timeline}}
  {{#eq custom_field.timeline "ASAP"}}
    <div class="urgent-message" style="border-left: 4px solid #ff4444; padding-left: 15px; margin: 20px 0;">
      <p><strong>I see you need help quickly!</strong> I have emergency availability this week.</p>
      <a href="https://calendly.com/clutterfreespaces/urgent" style="background-color: #ff4444; color: white; padding: 10px 20px; text-decoration: none;">Book Emergency Session</a>
    </div>
  {{/eq}}
{{/if}}

<!-- Dynamic content based on lead score, location, project type -->
```

### Google Calendar Integration

**Calendar API Setup:**
1. Enable Google Calendar API in Google Cloud Console
2. Create service account with calendar access
3. Share calendar with service account email

**Calendly Webhook Configuration:**
```json
{
  "webhook_url": "https://hook.us1.make.com/[CALENDLY_WEBHOOK_ID]",
  "events": [
    "invitee.created",
    "invitee.canceled"
  ],
  "organization": "https://api.calendly.com/organizations/[ORG_UUID]",
  "scope": "organization"
}
```

### Squarespace Integration Code

**ManyChat Widget Integration:**
```html
<!-- Add to Settings → Advanced → Code Injection → Footer -->
<script>
  window.mcAsyncInit = function() {
    MC.init({
      facebook: {
        pageId: 'YOUR_FACEBOOK_PAGE_ID',
        buttonColor: '#26A2C7',  // ClutterFreeSpaces brand color
        greetingMessage: 'Hi! Need help organizing your space? I\'m Clara, Chanel\'s assistant. Ask me anything! 👋',
        bodyColor: '#ffffff',
        position: 'right'
      }
    });
  };

  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//widget.manychat.com/YOUR_WIDGET_ID.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'mcwidget-chat'));
</script>
```

**Lead Capture Forms:**
```html
<!-- Free RV Checklist Form -->
<form id="rv-checklist-form" action="#" method="post">
    <input type="hidden" name="source" value="website">
    <input type="hidden" name="lead_magnet" value="rv-checklist">
    
    <div class="form-group">
        <input type="text" name="first_name" placeholder="First Name" required>
        <input type="email" name="email" placeholder="Email Address" required>
    </div>
    
    <div class="form-group">
        <select name="rv_type">
            <option value="">Select RV Type</option>
            <option value="class-a">Class A Motorhome</option>
            <option value="class-b">Class B Van</option>
            <option value="class-c">Class C Motorhome</option>
            <option value="travel-trailer">Travel Trailer</option>
            <option value="fifth-wheel">Fifth Wheel</option>
        </select>
    </div>
    
    <div class="form-group">
        <input type="text" name="zip_code" placeholder="ZIP Code" required>
    </div>
    
    <button type="submit">Get Free RV Organization Checklist</button>
</form>

<script>
document.getElementById('rv-checklist-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Send to Make.com webhook
    fetch('https://hook.us1.make.com/YOUR_FORM_WEBHOOK_ID', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(() => {
        // Redirect to thank you page with download link
        window.location.href = '/rv-checklist-download';
    })
    .catch(console.error);
});
</script>
```

**Google Analytics 4 + Facebook Pixel:**
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_GA4_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-YOUR_GA4_ID');
  
  // Custom events for lead tracking
  function trackLead(leadType, source) {
    gtag('event', 'generate_lead', {
      'lead_type': leadType,
      'source': source,
      'event_category': 'Lead Generation',
      'value': 50  // Estimated lead value
    });
  }
</script>

<!-- Facebook Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');

// Custom events
function trackFBLead(value) {
    fbq('track', 'Lead', {
        value: value,
        currency: 'USD',
        content_category: 'Organization Services'
    });
}
</script>
```

### Social Media Automation Setup

**Hootsuite/Later Configuration:**
```json
{
  "posting_schedule": {
    "facebook": ["9:00AM", "3:00PM", "7:00PM"],
    "instagram": ["11:00AM", "5:00PM"],
    "google_business": ["10:00AM", "2:00PM"]
  },
  "content_categories": {
    "RV_tips": 40,
    "before_after": 25, 
    "client_testimonials": 15,
    "behind_scenes": 10,
    "montana_lifestyle": 10
  },
  "hashtag_sets": {
    "RV": "#RVOrganization #MontanaRV #RVLife #MobileLiving #RVStorage #FullTimeRV #TravelTrailer #RVTips #ClutterFreeSpaces #MontanaOrganizing",
    "Home": "#HomeOrganization #MontanaHomes #OrganizedHome #Declutter #MissoulaOrganizer #ProfessionalOrganizer #HomeOrganizing #ClutterFree #OrganizedLife #MontanaLiving",
    "Local": "#Missoula #Montana #BigSkyCountry #MontanaLifestyle #MissoulaSmallBusiness #SupportLocal #MontanaWomen #MontanaEntrepreneur"
  }
}
```

### Error Handling & Monitoring

**Make.com Error Handling:**
```javascript
// Add to each scenario for error logging
try {
    // Main scenario logic
} catch (error) {
    // Log to Airtable errors table
    const errorLog = {
        "Scenario": "ManyChat to Airtable",
        "Error Message": error.message,
        "Timestamp": new Date().toISOString(),
        "Input Data": JSON.stringify(bundle.inputData),
        "Status": "Needs Review"
    };
    
    // Send error to monitoring webhook
    fetch('https://hook.us1.make.com/ERROR_WEBHOOK_ID', {
        method: 'POST',
        body: JSON.stringify(errorLog)
    });
}
```

**Health Check Endpoints:**
```javascript
// Daily health check scenario
const healthChecks = [
    { name: "ManyChat API", url: "https://api.manychat.com/fb/sending/sendContent", expected: "unauthorized" },
    { name: "Airtable API", url: "https://api.airtable.com/v0/meta/bases", expected: "200" },
    { name: "Twilio API", url: "https://api.twilio.com/2010-04-01/Accounts.json", expected: "401" },
    { name: "SendGrid API", url: "https://api.sendgrid.com/v3/user/profile", expected: "200" }
];

// Run checks and send status report
```

### Performance Monitoring

**Key Metrics Dashboard:**
```sql
-- Daily automation performance
SELECT 
    DATE(created_date) as date,
    COUNT(*) as total_leads,
    AVG(lead_score) as avg_score,
    COUNT(CASE WHEN lead_score >= 75 THEN 1 END) as hot_leads,
    COUNT(CASE WHEN status = 'Client' THEN 1 END) as conversions
FROM Leads 
WHERE created_date >= DATE('now', '-30 days')
GROUP BY DATE(created_date)
ORDER BY date DESC;
```

**Alert Thresholds:**
```json
{
  "daily_lead_minimum": 5,
  "hot_lead_response_time_max": 120,  // minutes
  "email_bounce_rate_max": 5,         // percent
  "sms_delivery_rate_min": 95,        // percent
  "automation_failure_rate_max": 2    // percent
}
```

---

## Security Configuration

**API Key Management:**
- Store all keys in environment variables
- Rotate keys quarterly
- Use least-privilege access
- Monitor API usage for anomalies

**Data Protection:**
- Enable 2FA on all accounts
- Regular backup of Airtable data
- GDPR compliance for email handling
- SMS opt-out compliance

**Access Control:**
- Chanel: Admin access to all systems
- Josh: Technical admin for setup/maintenance
- VA (future): Limited access to lead management only

---

*All configurations should be tested in a staging environment before applying to production systems.*