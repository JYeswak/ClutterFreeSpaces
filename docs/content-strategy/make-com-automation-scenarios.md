# Make.com Automation Scenarios for ClutterFreeSpaces

## Overview
Make.com serves as the central automation hub connecting all ClutterFreeSpaces systems:
- ManyChat (Facebook/Instagram lead qualification)
- Website Quiz (organization style assessment) 
- Calendly (consultation booking)
- Airtable (CRM database)
- SendGrid (email marketing)

## Scenario 1: ManyChat Lead Processing

### Trigger: ManyChat Webhook
**URL**: `https://hook.make.com/YOUR_WEBHOOK_ID_1`

### Flow Steps:

#### Step 1: Receive ManyChat Data
- **Module**: Webhooks > Custom Webhook
- **Method**: POST
- **Expected Data Structure**:
```json
{
  "subscriber_id": "string",
  "first_name": "string", 
  "last_name": "string",
  "email": "string",
  "phone": "string",
  "space_type": "RV|Home|Office|Multiple",
  "challenge_type": "Storage|Clutter|Layout|System",
  "budget_range": "Under $300|$300-800|$800-1200|Over $1200",
  "timeline": "ASAP|2 weeks|1 month|2-3 months|Exploring",
  "lead_score": "number (25-100)",
  "consultation_interest": "High|Medium|Low"
}
```

#### Step 2: Create Airtable Lead Record
- **Module**: Airtable > Create Record
- **Base**: ClutterFreeSpaces CRM  
- **Table**: Leads
- **Field Mapping**:
```
Name: {{first_name}} {{last_name}}
Email: {{email}}
Phone: {{phone}}
Lead Score: {{lead_score}}
Organization Style: "Flexible" (default until quiz taken)
Lead Source: "ManyChat"
Status: "New Lead"
Space Type: [{{space_type}}]
Budget Range: {{budget_range}}
Timeline: {{timeline}}
Notes: "ManyChat qualification: {{challenge_type}} challenge, {{consultation_interest}} interest"
Quiz Answers: JSON string with ManyChat responses
Date Created: {{now}}
```

#### Step 3: Route by Lead Score
- **Module**: Router
- **Routes**:
  - **Hot Leads (75-100)**: Immediate high-priority follow-up
  - **Warm Leads (50-74)**: Standard follow-up sequence
  - **Cold Leads (25-49)**: Educational nurture sequence

#### Step 4a: Hot Lead Processing (Score 75-100)
- **Module**: SendGrid > Send Email
- **Template**: Hot Lead Welcome & Urgent Consultation Offer
- **Variables**:
  - `first_name`: {{first_name}}
  - `space_type`: {{space_type}}
  - `consultation_url`: https://calendly.com/chanelnbasolo/30min
  - `challenge_type`: {{challenge_type}}

#### Step 4b: Warm Lead Processing (Score 50-74)
- **Module**: SendGrid > Send Email  
- **Template**: Warm Lead Welcome & Consultation Invite
- **Variables**:
  - `first_name`: {{first_name}}
  - `space_type`: {{space_type}}
  - `consultation_url`: https://calendly.com/chanelnbasolo/30min

#### Step 4c: Cold Lead Processing (Score 25-49)
- **Module**: SendGrid > Send Email
- **Template**: Educational Welcome & Quiz Invitation
- **Variables**:
  - `first_name`: {{first_name}}
  - `quiz_url`: https://clutterfreespaces.com/organization-style-quiz.html

#### Step 5: Create Follow-up Task
- **Module**: Airtable > Create Record
- **Table**: Tasks
- **Field Mapping**:
```
Task: "Follow up with {{first_name}} {{last_name}} (ManyChat lead)"
Related Lead: [Link to created lead record]
Task Type: "Follow-up Call"
Priority: {{if lead_score >= 75 then "High" else if lead_score >= 50 then "Medium" else "Low"}}
Due Date: {{if lead_score >= 75 then addDays(now, 1) else addDays(now, 3)}}
Status: "To Do"
Notes: "Lead Score: {{lead_score}}, Source: ManyChat {{challenge_type}} challenge"
```

## Scenario 2: Website Quiz Processing

### Trigger: Website Quiz Webhook
**URL**: `https://hook.make.com/YOUR_WEBHOOK_ID_2`

### Flow Steps:

#### Step 1: Receive Quiz Data
- **Module**: Webhooks > Custom Webhook
- **Expected Data**:
```json
{
  "email": "string",
  "style": "Detailed|Visual|Flexible|Simple", 
  "score": "number",
  "source": "quiz",
  "answers": "object with quiz responses",
  "consultation_booked": "boolean"
}
```

#### Step 2: Check Existing Lead
- **Module**: Airtable > Search Records
- **Table**: Leads
- **Filter**: Email equals {{email}}

#### Step 3: Router - New vs Existing Lead
- **Route 1**: New lead (no existing record)
- **Route 2**: Existing lead (update record)

#### Step 3a: Create New Lead (Route 1)
- **Module**: Airtable > Create Record
- **Table**: Leads
- **Field Mapping**:
```
Email: {{email}}
Lead Score: {{score}}
Organization Style: {{style}}
Lead Source: "Quiz"
Status: {{if consultation_booked then "Consultation Scheduled" else "New Lead"}}
Space Type: [Extract from quiz answers]
Budget Range: [Extract from quiz answers]
Timeline: [Extract from quiz answers]
Notes: "Completed organization style quiz"
Quiz Answers: {{stringify(answers)}}
```

#### Step 3b: Update Existing Lead (Route 2)
- **Module**: Airtable > Update Record
- **Record ID**: {{search_result.id}}
- **Fields**:
```
Lead Score: {{max(existing_score, score)}}
Organization Style: {{style}}
Quiz Answers: {{stringify(answers)}}
Notes: "Updated with quiz results: {{style}} style"
```

#### Step 4: Send Personalized Guide
- **Module**: SendGrid > Send Email
- **Template**: Organization Style Guide (Dynamic)
- **Template Selection**:
  - Detailed: d-1234abcd (detailed organizers)
  - Visual: d-5678efgh (visual organizers)
  - Flexible: d-9101ijkl (flexible organizers)  
  - Simple: d-1213mnop (simple organizers)
- **Variables**:
  - `first_name`: {{email split @ first part}}
  - `style`: {{style}}
  - `consultation_url`: https://calendly.com/chanelnbasolo/30min

## Scenario 3: Calendly Booking Processing

### Trigger: Calendly Webhook
**URL**: `https://hook.make.com/YOUR_WEBHOOK_ID_3`

### Flow Steps:

#### Step 1: Receive Calendly Data
- **Module**: Webhooks > Custom Webhook
- **Expected Data**: Calendly webhook payload

#### Step 2: Extract Lead Information
- **Module**: Tools > Set Variables
- **Variables**:
```
email: {{payload.invitee.email}}
name: {{payload.invitee.name}}
event_type: {{payload.event_type.name}}
start_time: {{payload.start_time}}
utm_source: {{payload.tracking.utm_source}}
organization_style: {{payload.tracking.style}}
```

#### Step 3: Find Existing Lead
- **Module**: Airtable > Search Records  
- **Table**: Leads
- **Filter**: Email equals {{email}}

#### Step 4: Update Lead Status
- **Module**: Airtable > Update Record
- **Record ID**: {{search_result.id}}
- **Fields**:
```
Status: "Consultation Scheduled"
Calendly Booking URL: {{payload.uri}}
Last Contact: {{now}}
Next Follow-up: {{payload.start_time}}
Notes: "{{existing_notes}}\n\nConsultation scheduled for {{start_time}}"
```

#### Step 5: Create Project Record
- **Module**: Airtable > Create Record
- **Table**: Projects
- **Field Mapping**:
```
Project Name: "{{name}} - Initial Consultation"
Client: [Link to lead record]
Project Type: "Free Consultation"
Status: "Scheduled"
Scheduled Date: {{start_time}}
Duration (Hours): 0.5
Revenue: $0
Notes: "Initial consultation via {{utm_source}}"
```

#### Step 6: Send Confirmation Email
- **Module**: SendGrid > Send Email
- **Template**: Consultation Confirmation
- **Variables**:
  - `first_name`: {{name split space first}}
  - `consultation_date`: {{formatDate(start_time, "MMMM D, YYYY")}}
  - `consultation_time`: {{formatDate(start_time, "h:mm A")}}
  - `meeting_link`: {{payload.join_url}}
  - `organization_style`: {{organization_style}}

#### Step 7: Create Reminder Tasks
- **Modules**: Two parallel Airtable > Create Record
- **24 Hour Reminder**:
```
Task: "Consultation reminder for {{name}}"
Related Project: [Link to project]
Task Type: "Send Email"
Due Date: {{addDays(start_time, -1)}}
Status: "To Do"
Notes: "Send 24hr reminder email"
```
- **Prep Task**:
```
Task: "Prepare for {{name}} consultation"
Related Project: [Link to project]
Task Type: "Check-in"
Due Date: {{addHours(start_time, -2)}}
Status: "To Do"
Notes: "Review lead profile, prepare consultation materials"
```

## Scenario 4: Email Automation Follow-ups

### Trigger: Scheduled (Daily at 9 AM)

#### Step 1: Find Due Follow-ups
- **Module**: Airtable > Search Records
- **Table**: Tasks
- **Filter**: 
  - Status = "To Do"
  - Task Type = "Follow-up Call" OR "Send Email"
  - Due Date <= Today

#### Step 2: Process Each Task
- **Module**: Iterator (processes each task)

#### Step 3: Get Lead Details
- **Module**: Airtable > Get Record
- **Table**: Leads  
- **Record ID**: {{Related Lead ID}}

#### Step 4: Route by Task Type
- **Module**: Router
- **Route 1**: Send Email tasks
- **Route 2**: Follow-up Call tasks

#### Step 4a: Send Follow-up Email
- **Module**: SendGrid > Send Email
- **Template Selection** (based on lead data):
  - Hot leads: Urgent follow-up template
  - Warm leads: Standard follow-up template  
  - Cold leads: Educational content template

#### Step 4b: Create Call Reminder
- **Module**: Airtable > Create Record
- **Table**: Tasks
- **Fields**:
```
Task: "CALL: {{lead.name}} - {{lead.space_type}} organization"
Priority: "High"  
Due Date: {{now}}
Status: "To Do"
Notes: "Lead Score: {{lead.lead_score}}, Last Contact: {{lead.last_contact}}"
```

#### Step 5: Mark Task Complete
- **Module**: Airtable > Update Record
- **Table**: Tasks
- **Record ID**: {{task.id}}
- **Fields**:
```
Status: "Completed"
Completed Date: {{now}}
```

## Scenario 5: Lead Scoring Updates

### Trigger: Airtable > Watch Records (Leads table)

#### Step 1: Calculate Updated Score
- **Module**: Tools > Set Variables
- **Score Calculation**:
```javascript
let score = 25; // Base score

// Organization style bonus
if (organization_style === "Detailed") score += 10;
else if (organization_style === "Visual") score += 15;
else if (organization_style === "Flexible") score += 20;
else if (organization_style === "Simple") score += 15;

// Budget scoring
switch (budget_range) {
  case "Over $1200": score += 25; break;
  case "$800-1200": score += 20; break;
  case "$300-800": score += 15; break;
  case "Under $300": score += 5; break;
}

// Timeline scoring
switch (timeline) {
  case "ASAP": score += 25; break;
  case "Within 2 weeks": score += 20; break;
  case "Within a month": score += 15; break;
  case "Next 2-3 months": score += 10; break;
  case "Just exploring": score += 5; break;
}

// Status bonus
if (status === "Consultation Scheduled") score += 20;
else if (status === "Client") score += 30;

return Math.min(score, 100);
```

#### Step 2: Update Lead Score
- **Module**: Airtable > Update Record
- **Table**: Leads
- **Record ID**: {{trigger.id}}
- **Fields**:
```
Lead Score: {{calculated_score}}
```

#### Step 3: Route High-Value Leads
- **Module**: Filter
- **Condition**: Lead Score >= 80 AND Status != "Client"

#### Step 4: Create High-Priority Task
- **Module**: Airtable > Create Record
- **Table**: Tasks
- **Fields**:
```
Task: "HIGH VALUE: Contact {{name}} immediately"
Related Lead: [Link to lead]
Task Type: "Follow-up Call"
Priority: "High"
Due Date: {{addHours(now, 2)}}
Status: "To Do"
Notes: "Lead score increased to {{calculated_score}} - immediate action required"
```

## Make.com Setup Instructions

### Account Setup
1. Go to make.com and create account
2. Connect integrations:
   - Airtable (using API key)
   - SendGrid (using API key)
   - Calendly (OAuth connection)
   - Webhooks (built-in)

### Scenario Creation Process
1. Create new scenario for each automation above
2. Configure webhook triggers with unique URLs
3. Set up all modules with proper field mappings
4. Test each scenario with sample data
5. Enable scenarios after testing

### Webhook URLs to Configure

#### In ManyChat:
- Webhook URL: `https://hook.make.com/WEBHOOK_ID_1`
- Send on: Lead qualification complete

#### In Quiz Website:
- Update `api-server.js` webhook URL
- Add Make.com webhook for guide delivery

#### In Calendly:
- Organization Settings > Webhooks
- Add webhook: `https://hook.make.com/WEBHOOK_ID_3`
- Events: invitee.created, invitee.canceled

### Testing Protocol

#### Pre-Launch Testing
- [ ] Test ManyChat webhook with sample data
- [ ] Verify Airtable record creation
- [ ] Test SendGrid email delivery
- [ ] Confirm Calendly webhook reception
- [ ] Validate lead scoring calculations
- [ ] Test all email templates

#### Live Testing
- [ ] Complete ManyChat conversation flow
- [ ] Take organization style quiz  
- [ ] Book Calendly consultation
- [ ] Verify CRM data accuracy
- [ ] Check email delivery timing
- [ ] Confirm task creation

### Monitoring & Optimization

#### Weekly Reviews
1. Check scenario execution history
2. Review failed operations
3. Monitor email open/click rates
4. Analyze lead conversion rates
5. Optimize low-performing scenarios

#### Key Metrics Dashboard
- Leads processed per week
- Email delivery success rate
- Booking conversion rate
- Lead score accuracy
- Task completion rate
- Revenue per automated lead

### Error Handling

#### Common Issues & Solutions
1. **Webhook timeout**: Add retry logic
2. **Airtable field mismatch**: Validate field names
3. **SendGrid delivery failure**: Check sender reputation
4. **Calendly API limits**: Implement rate limiting
5. **Lead score calculation error**: Add data validation

#### Backup Procedures
- Manual lead entry process
- Email template fallbacks
- Alternative booking methods
- CRM data export procedures

## Integration Testing Checklist

### End-to-End Flow Testing
- [ ] ManyChat → Make.com → Airtable → SendGrid
- [ ] Quiz → Make.com → Airtable → Guide Delivery
- [ ] Calendly → Make.com → Project Creation → Confirmations
- [ ] Scheduled Follow-ups → Task Management
- [ ] Lead Scoring Updates → Priority Routing

### Data Validation
- [ ] Lead information accuracy
- [ ] Email personalization correctness
- [ ] Booking details synchronization
- [ ] Task creation timing
- [ ] Score calculation verification

This comprehensive Make.com automation system will handle all lead processing, email marketing, booking management, and CRM updates automatically, allowing Chanel to focus on delivering excellent organization services while the system manages lead nurturing and client communication.