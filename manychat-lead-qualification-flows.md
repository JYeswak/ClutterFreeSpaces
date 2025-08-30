# ManyChat Lead Qualification Flows for ClutterFreeSpaces

## Overview
ManyChat will serve as the primary lead qualification system for ClutterFreeSpaces, capturing leads from Facebook/Instagram and qualifying them before routing to appropriate consultation types.

## Flow Structure

### Main Lead Qualification Flow
**Trigger**: New subscriber or "Get Started" keyword

#### Step 1: Welcome Message
```
Welcome to ClutterFreeSpaces! 🏠✨ 

I'm Chanel, a professional organizer specializing in RV organization. I help people transform their spaces from chaotic to calm.

Quick question: What space are you looking to organize? 

📱 Reply with:
• RV for RV/Motorhome
• HOME for home spaces
• OFFICE for workspace
• ALL for multiple areas
```

#### Step 2: Space Type Qualification
**Condition: User replies "RV"**
```
Perfect! RV organization is my specialty! 🚐

Montana has 45,000+ RVs, and I've helped hundreds of RV owners create functional, beautiful spaces.

What's your biggest RV organization challenge?

🔥 Quick Options:
• STORAGE - Not enough storage space
• CLUTTER - Too much stuff, don't know what to keep
• LAYOUT - Poor space utilization
• SYSTEM - Need better organization systems
```

**Condition: User replies "HOME" or "OFFICE"**
```
Great choice! Home organization creates peace of mind. 🏡

What type of space needs the most help?

📋 Select:
• BEDROOM - Closets, clothes, personal items
• KITCHEN - Pantry, cabinets, meal prep
• GARAGE - Tools, storage, seasonal items
• WHOLE - Multiple rooms need organization
```

#### Step 3: Budget Qualification
```
Thanks! Understanding your investment level helps me recommend the best approach.

What's your organization budget range?

💰 Investment Levels:
• BUDGET - Under $300 (DIY guidance)
• STANDARD - $300-800 (Consultation + basics)
• PREMIUM - $800-1200 (Full organization)
• UNLIMITED - $1200+ (Complete transformation)
```

#### Step 4: Timeline Qualification
```
Perfect! When would you like to start?

📅 Timeline:
• ASAP - This week if possible
• SOON - Within 2 weeks
• MONTH - Within a month
• LATER - Next 2-3 months
• BROWSE - Just exploring options
```

#### Step 5: Lead Scoring and Routing

**Hot Leads (Score 75-100)**
- Budget: PREMIUM/UNLIMITED + Timeline: ASAP/SOON
- Space: RV + Budget: STANDARD+ + Timeline: ASAP/SOON/MONTH

```
🔥 You're a perfect fit for my premium service! 

Based on your answers, I can create a custom organization plan that will transform your [SPACE_TYPE].

I have limited spots available - would you like to schedule a FREE 30-minute consultation this week to discuss your project?

🎯 In this call, we'll:
• Assess your specific space challenges
• Create a custom organization strategy
• Discuss timeline and next steps

Ready to get started?
📞 YES - Book my consultation now!
📧 EMAIL - Send me details first
```

**Warm Leads (Score 50-74)**
- Budget: STANDARD + any timeline
- Budget: BUDGET + Timeline: ASAP/SOON

```
Great! You're ready to create an organized space that works for you! 

Let me help you with a custom approach for your [SPACE_TYPE] organization.

🎁 I'd love to offer you a FREE 30-minute consultation where we'll:
• Identify your top 3 organization priorities
• Share proven systems that work
• Create an action plan you can start immediately

Would you like to schedule this week or next?

📅 THIS WEEK - Available now
📅 NEXT WEEK - More flexible timing
📧 EMAIL ME - Send information first
```

**Cold Leads (Score 25-49)**
- Budget: BUDGET + Timeline: LATER/BROWSE
- Any Timeline: BROWSE

```
Perfect! Organization is a journey, and I'm here to help when you're ready! 

Since you're exploring options, let me share some valuable resources:

🎁 FREE Organization Style Quiz
Take my 2-minute quiz to discover your personal organization style and get a custom guide with tips that match how your brain works!

✨ Plus you'll get:
• Weekly organization tips via email
• Access to my free resource library
• Special offers for consultation services

Ready to discover your style?
🧠 QUIZ - Take the style quiz now
📧 TIPS - Just send me weekly tips
❌ MAYBE - Not interested right now
```

### Follow-Up Sequences

#### Hot Lead Follow-Up (No Response After 2 Hours)
```
Hi! Just wanted to make sure you saw my message about scheduling your FREE consultation.

I have very limited spots available this week, and based on your [SPACE_TYPE] goals, I think we'd be a great fit!

⏰ Quick reminder - in our 30-minute call:
• Custom organization assessment
• Proven strategies for your space
• Clear next steps to get organized

Still interested? Just reply YES and I'll send the booking link!
```

#### Warm Lead Follow-Up (No Response After 4 Hours)
```
Hey! Hope you're having a great day! 

I wanted to follow up about your [SPACE_TYPE] organization project. I know it can feel overwhelming to get started!

💡 Here's what most of my clients tell me after our first consultation:
"I wish I had done this sooner - you made it seem so achievable!"

Ready to take that first step? Reply YES and let's schedule your free consultation!
```

#### Cold Lead Follow-Up (No Response After 24 Hours)
```
No worries if you're not ready yet! 

Organization is personal, and timing matters. I'm here when you're ready to make a change.

🎁 In the meantime, grab my FREE Organization Style Quiz - it takes 2 minutes and gives you personalized tips you can use right away:

[QUIZ LINK]

Take care! ✨
```

### Keyword Auto-Responses

#### "PRICING" or "COST" or "PRICE"
```
Great question! My services are designed to fit different needs and budgets:

💰 Service Options:
• FREE Consultation (30 min) - Assessment & strategy
• Quick Win Session ($200-400) - 2-4 hours, one area
• Half Day Organization ($400-600) - 4-6 hours
• Full Day Transformation ($600-1200) - 8+ hours

The exact investment depends on:
• Size and complexity of space
• Amount of items to organize
• Systems and products needed

Want a custom quote? Let's schedule your free consultation!
📞 CONSULT - Book consultation
📧 EMAIL - Send me details
```

#### "RV" or "MOTORHOME" or "TRAILER"
```
🚐 RV ORGANIZATION SPECIALIST! 

You're in the right place! I've organized 100+ RVs in Montana and understand the unique challenges:
• Limited storage space
• Weight restrictions
• Seasonal item rotation
• Multi-functional areas

🏆 RV owners love my approach because I focus on:
✅ Maximizing every inch of space
✅ Systems that work while traveling
✅ Quick setup/breakdown routines
✅ Weight-conscious solutions

Ready to transform your RV into an organized haven?
📞 YES - Book RV consultation
🎁 QUIZ - Take organization style quiz
```

#### "HELP" or "SUPPORT"
```
I'm here to help! Here are your options:

🤝 Get Personal Help:
• Book FREE consultation - Custom assessment
• Take style quiz - Personalized tips
• Email me directly - chanel@clutterfreespaces.com

📚 Free Resources:
• Organization tips and tricks
• RV-specific organization guides
• Before/after inspiration

What would be most helpful?
📞 CONSULTATION - Book free call
🧠 QUIZ - Take style quiz
📧 EMAIL - Direct email support
```

## ManyChat Setup Instructions

### 1. Account Setup
1. Go to manychat.com
2. Connect Facebook/Instagram business pages
3. Enable "General Terms" acceptance
4. Set up growth tools for website integration

### 2. Flow Creation
1. Create new Flow: "Lead Qualification"
2. Set triggers: "Get Started", keywords: "organize", "help", "RV"
3. Build conversation tree using templates above
4. Add custom fields for lead scoring

### 3. Custom Fields Required
- space_type (RV, Home, Office, Multiple)
- challenge_type (Storage, Clutter, Layout, System)
- budget_range (Under $300, $300-800, $800-1200, Over $1200)
- timeline (ASAP, 2 weeks, 1 month, 2-3 months, Exploring)
- lead_score (calculated: 25-100)
- consultation_interest (High, Medium, Low)

### 4. Integrations Setup
- Webhook to Make.com for lead scoring
- Email integration with SendGrid
- Calendar booking with Calendly
- CRM integration with Airtable

### 5. Growth Tools
- Facebook/Instagram ad integration
- Website chat widget
- Comment auto-reply for posts
- Story mention triggers

## Lead Scoring Algorithm (ManyChat Variables)

```javascript
// Base score
let score = 25;

// Space type scoring
if (space_type === "RV") score += 25; // RV is specialty
else if (space_type === "Home" || space_type === "Office") score += 15;
else if (space_type === "Multiple") score += 20;

// Budget scoring  
if (budget_range === "Over $1200") score += 25;
else if (budget_range === "$800-1200") score += 20;
else if (budget_range === "$300-800") score += 15;
else if (budget_range === "Under $300") score += 5;

// Timeline scoring
if (timeline === "ASAP") score += 25;
else if (timeline === "2 weeks") score += 20; 
else if (timeline === "1 month") score += 15;
else if (timeline === "2-3 months") score += 10;
else if (timeline === "Exploring") score += 5;

// Challenge type bonus
if (challenge_type === "System" || challenge_type === "Layout") score += 10;

// Final score: 25-100 range
return Math.min(score, 100);
```

## Webhook Payload for Make.com

```json
{
  "lead_source": "ManyChat",
  "platform": "Facebook/Instagram", 
  "subscriber_id": "{{subscriber_id}}",
  "first_name": "{{first_name}}",
  "last_name": "{{last_name}}",
  "email": "{{email}}",
  "phone": "{{phone}}",
  "space_type": "{{space_type}}",
  "challenge_type": "{{challenge_type}}", 
  "budget_range": "{{budget_range}}",
  "timeline": "{{timeline}}",
  "lead_score": "{{lead_score}}",
  "consultation_interest": "{{consultation_interest}}",
  "conversation_history": "{{conversation}}",
  "created_at": "{{current_time}}",
  "tags": ["manychat", "facebook", "{{space_type}}", "{{timeline}}"]
}
```

## Testing Checklist

### Pre-Launch Testing
- [ ] Test all conversation paths
- [ ] Verify lead scoring calculation
- [ ] Test webhook delivery to Make.com
- [ ] Confirm Calendly booking links work
- [ ] Test email integration
- [ ] Verify Airtable lead creation

### Live Testing
- [ ] Test from Facebook page
- [ ] Test from Instagram DMs
- [ ] Test keyword auto-responses
- [ ] Test follow-up sequences
- [ ] Verify lead routing by score
- [ ] Test consultation booking flow

## Performance Monitoring

### Key Metrics to Track
- Subscriber growth rate
- Conversation completion rate
- Lead qualification rate  
- Consultation booking rate
- Lead score distribution
- Revenue per lead by source

### Monthly Review Process
1. Analyze conversation abandonment points
2. Review lead quality vs. lead score accuracy
3. Optimize low-performing message sequences
4. Test new qualification questions
5. Update follow-up timing based on response rates

## Integration Points

### Make.com Webhooks
- New subscriber webhook
- Lead qualification complete webhook  
- Consultation booked webhook
- Follow-up sequence triggers

### Airtable CRM
- Automatic lead creation
- Lead score assignment
- Activity logging
- Follow-up task creation

### Calendly Integration
- Direct booking links by lead type
- Custom booking parameters
- Automatic CRM updates

### SendGrid Integration
- Welcome email sequences
- Organization style quiz delivery
- Follow-up email campaigns
- Custom guide delivery