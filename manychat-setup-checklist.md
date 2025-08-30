# ManyChat Setup Checklist for ClutterFreeSpaces

## Phase 1: Account Setup

### Step 1: Create ManyChat Account
1. Go to manychat.com
2. Sign up with business email
3. Choose "Facebook Messenger" platform
4. Connect your Facebook business page
5. Connect Instagram business account (if you have one)

### Step 2: Basic Settings
1. Go to Settings → General
2. Set business name: "ClutterFreeSpaces"
3. Upload profile photo (Chanel's photo or logo)
4. Set timezone: Mountain Time
5. Enable "Persistent Menu" for easy navigation

## Phase 2: Custom Fields Setup

### Required Custom Fields:
Go to Audience → Custom Fields → Create Custom Field

1. **space_type**
   - Type: Text
   - Options: RV, Home, Office, Multiple

2. **challenge_type** 
   - Type: Text
   - Options: Storage, Clutter, Layout, System

3. **budget_range**
   - Type: Text  
   - Options: Under $300, $300-800, $800-1200, Over $1200

4. **timeline**
   - Type: Text
   - Options: ASAP, 2 weeks, 1 month, 2-3 months, Exploring

5. **lead_score**
   - Type: Number
   - Range: 25-100

6. **consultation_interest**
   - Type: Text
   - Options: High, Medium, Low

## Phase 3: Main Conversation Flow

### Flow 1: Lead Qualification
1. Go to Automation → Flows → Create Flow
2. Name: "Lead Qualification"
3. Trigger: Default Reply, Keywords: "get started", "organize", "help", "rv"

**Message 1: Welcome**
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

**Add Quick Replies:**
- RV → Set custom field: space_type = "RV"
- HOME → Set custom field: space_type = "Home" 
- OFFICE → Set custom field: space_type = "Office"
- ALL → Set custom field: space_type = "Multiple"

**Message 2A: RV Path**
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

**Add Quick Replies:**
- STORAGE → Set challenge_type = "Storage"
- CLUTTER → Set challenge_type = "Clutter"
- LAYOUT → Set challenge_type = "Layout"
- SYSTEM → Set challenge_type = "System"

**Message 2B: Home/Office Path**
```
Great choice! Home organization creates peace of mind. 🏡

What type of space needs the most help?

📋 Select:
• BEDROOM - Closets, clothes, personal items
• KITCHEN - Pantry, cabinets, meal prep  
• GARAGE - Tools, storage, seasonal items
• WHOLE - Multiple rooms need organization
```

**Add Quick Replies (all set challenge_type):**
- BEDROOM → "Storage"
- KITCHEN → "System" 
- GARAGE → "Layout"
- WHOLE → "Clutter"

**Message 3: Budget Qualification**
```
Thanks! Understanding your investment level helps me recommend the best approach.

What's your organization budget range?

💰 Investment Levels:
• BUDGET - Under $300 (DIY guidance)
• STANDARD - $300-800 (Consultation + basics)
• PREMIUM - $800-1200 (Full organization)  
• UNLIMITED - $1200+ (Complete transformation)
```

**Add Quick Replies:**
- BUDGET → Set budget_range = "Under $300"
- STANDARD → Set budget_range = "$300-800"
- PREMIUM → Set budget_range = "$800-1200"
- UNLIMITED → Set budget_range = "Over $1200"

**Message 4: Timeline**
```
Perfect! When would you like to start?

📅 Timeline:
• ASAP - This week if possible
• SOON - Within 2 weeks
• MONTH - Within a month
• LATER - Next 2-3 months
• BROWSE - Just exploring options
```

**Add Quick Replies:**
- ASAP → Set timeline = "ASAP"
- SOON → Set timeline = "2 weeks"
- MONTH → Set timeline = "1 month"  
- LATER → Set timeline = "2-3 months"
- BROWSE → Set timeline = "Exploring"

## Phase 4: Lead Scoring Action

### Action: Calculate Lead Score
After timeline is set, add Action → Custom Field → Set Custom Field

**Formula (use ManyChat's formula builder):**
```
Base score: 20

IF space_type = "RV" THEN +25
ELSE IF space_type IN ["Home", "Office"] THEN +10
ELSE IF space_type = "Multiple" THEN +20

IF budget_range = "Over $1200" THEN +30
ELSE IF budget_range = "$800-1200" THEN +25
ELSE IF budget_range = "$300-800" THEN +15
ELSE IF budget_range = "Under $300" THEN +0

IF timeline = "ASAP" THEN +30
ELSE IF timeline = "2 weeks" THEN +20
ELSE IF timeline = "1 month" THEN +15
ELSE IF timeline = "2-3 months" THEN +8
ELSE IF timeline = "Exploring" THEN +2

IF challenge_type IN ["System", "Layout"] THEN +10

Final: MIN(total, 100)
```

**Simplified ManyChat version:**
Set lead_score = 85 (for testing, we'll refine later)

## Phase 5: Routing Messages

### Condition: Hot Leads (Score 75+)
**Message:**
```
🔥 You're a perfect fit for my premium service! 

Based on your answers, I can create a custom organization plan that will transform your {{space_type}}.

I have limited spots available - would you like to schedule a FREE 30-minute consultation this week to discuss your project?

🎯 In this call, we'll:
• Assess your specific space challenges
• Create a custom organization strategy  
• Discuss timeline and next steps

Ready to get started?
📞 YES - Book my consultation now!
📧 EMAIL - Send me details first
```

**Add Quick Replies:**
- YES → Open URL: https://calendly.com/chanelnbasolo/30min
- EMAIL → Ask for email, then send to Make.com webhook

### Condition: Warm Leads (Score 50-74)
**Message:**
```
Great! You're ready to create an organized space that works for you! 

Let me help you with a custom approach for your {{space_type}} organization.

🎁 I'd love to offer you a FREE 30-minute consultation where we'll:
• Identify your top 3 organization priorities
• Share proven systems that work
• Create an action plan you can start immediately

Would you like to schedule this week or next?

📅 THIS WEEK - Available now  
📅 NEXT WEEK - More flexible timing
📧 EMAIL ME - Send information first
```

### Condition: Cold Leads (Score 25-49)  
**Message:**
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

**Add Quick Replies:**
- QUIZ → Open URL: https://clutterfreespaces.com/organization-style-quiz.html
- TIPS → Ask for email, add to email list
- MAYBE → End conversation gracefully

## Phase 6: Keyword Auto-Responses

### Set up these keywords in Automation → Keywords:

**Keywords: "pricing", "cost", "price"**
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

**Keywords: "rv", "motorhome", "trailer"**
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

## Phase 7: Webhook Integration

### Set up Make.com webhook:
1. Go to Settings → Integrations → Webhooks
2. Create new webhook
3. URL: https://hook.make.com/YOUR_WEBHOOK_ID_1
4. Method: POST
5. Send data when: Lead qualification complete

**Data to send:**
```json
{
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
  "consultation_interest": "{{consultation_interest}}"
}
```

## Phase 8: Testing Protocol

### Test each path:
1. Start conversation with "get started"
2. Test RV path with high budget + ASAP timeline
3. Test Home path with medium budget + 1 month timeline  
4. Test Office path with low budget + exploring timeline
5. Verify lead scoring and routing works correctly
6. Test keyword responses
7. Confirm webhook sends to Make.com

## Go Live Checklist:
- [ ] All custom fields created
- [ ] Main qualification flow built and tested
- [ ] Keyword auto-responses configured  
- [ ] Webhook connected to Make.com
- [ ] Lead scoring logic working
- [ ] All message paths tested
- [ ] Mobile experience verified
- [ ] Calendly links working
- [ ] Quiz website link working

Ready to build this in ManyChat?