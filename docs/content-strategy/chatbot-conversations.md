# ClutterFreeSpaces Chatbot Conversation Scripts

## Primary Qualification Flow

### Opening Sequence
```
BOT: Hi! I'm Clara, Chanel's virtual assistant 👋 Welcome to ClutterFreeSpaces!

I help Montana families and RVers transform chaotic spaces into organized sanctuaries.

What type of space are you looking to organize?

[Quick Reply Buttons]
🏠 Home/Apartment
🚐 RV/Motorhome  
🏢 Office/Business
💭 Just Exploring Options
```

### PATH A: Home Organization

```
USER: [Selects Home/Apartment]

BOT: Perfect! Home organization is so rewarding. Let me learn a bit about your project so Chanel can best help you.

What's your biggest organization challenge right now?

[Quick Reply Buttons]
📦 Too much stuff, need to declutter
🏠 Moving or downsizing
👶 New life change (baby, marriage, etc.)
🔄 Need better storage systems
😰 Feeling overwhelmed, don't know where to start

---

USER: [Selects "Too much stuff"]

BOT: You're not alone! Decluttering is the #1 reason people call us. 

Which area is your priority?

[Quick Reply Buttons]
🛏️ Bedroom/Closets
🍳 Kitchen/Pantry
🏠 Entire Home
🚪 Garage/Storage
📚 Home Office
🧸 Kids' Rooms

---

USER: [Selects area]

BOT: Great choice! To give you an accurate quote, what's the approximate size of your {selected area}?

For reference:
• Small = Under 100 sq ft (closet, pantry)
• Medium = 100-200 sq ft (bedroom, office)
• Large = 200+ sq ft (master suite, garage)

[Quick Reply Buttons]
Small (Under 100 sq ft)
Medium (100-200 sq ft)
Large (200+ sq ft)
Not Sure

---

USER: [Selects size]

BOT: Perfect! Now, this is important - are you located in Montana? 

We currently serve all of Montana with in-person organizing. I just need your ZIP code to confirm we can reach you:

[Text Input Field]

---

USER: [Enters ZIP - Montana]

BOT: Wonderful! {City} is definitely in our service area. 

Professional organizing typically ranges from $300-1500 depending on the project size and complexity. 

What's your budget range for this project?

[Quick Reply Buttons]
💵 Under $300
💵 $300-600  
💵 $600-1,000
💵 $1,000-2,000
💵 $2,000+
❓ Need more info first

---

USER: [Selects $600-1,000]

BOT: That's a great budget for achieving real transformation! 

When would you like to get started?

[Quick Reply Buttons]
🏃 ASAP (this week)
📅 Next 1-2 weeks
📅 This month
📅 Next month
🤔 Just planning ahead

---

USER: [Selects timeframe]

BOT: Perfect! Based on what you've told me, you're an ideal fit for our services.

I'd love to connect you with Chanel for a free 30-minute consultation where she can:
✓ Assess your specific needs
✓ Provide a detailed quote
✓ Share her organizing approach
✓ Answer all your questions

What's the best way to reach you?

[Form Fields]
First Name: ________
Phone: ________
Email: ________

[Submit Button: Schedule My Free Consultation]
```

### PATH B: RV Organization

```
USER: [Selects RV/Motorhome]

BOT: Fantastic! RV organization is Chanel's specialty - she's helped over 50 Montana RVers maximize their space.

What type of RV do you have?

[Quick Reply Buttons]
🚌 Class A Motorhome (26-45 ft)
🚐 Class B/C (20-30 ft)  
🏕️ Travel Trailer
🚛 Fifth Wheel
🚙 Van/Conversion
❓ Other/Custom

---

USER: [Selects RV type]

BOT: Great! {RV type} organization is one of our most popular services.

Are you:

[Quick Reply Buttons]
🏡 Full-time RVing
⛺ Part-time/Seasonal
🆕 New to RVing (need setup help)
🔧 Experienced (need optimization)

---

USER: [Selects status]

BOT: Perfect! Every {status} RVer has unique needs.

What's your biggest RV organization challenge?

[Multiple Selection Checkboxes]
☐ Kitchen storage and meal prep
☐ Clothing and personal items
☐ Bathroom/toiletries organization  
☐ Tools and outdoor gear
☐ Office/work space setup
☐ Kids' items and toys
☐ General decluttering
☐ Maximizing basement storage

[Continue Button]

---

USER: [Makes selections]

BOT: Those are exactly the areas where Chanel excels!

Quick question - where is your RV currently located? (ZIP code)

This helps us schedule efficiently and ensure we can reach you.

[Text Input]

---

USER: [Enters Montana ZIP]

BOT: Excellent! {City} is definitely in our service area.

RV organization projects typically range from $400-1,200 depending on RV size and scope.

This includes:
✓ Custom storage solutions
✓ Product recommendations
✓ Complete setup/reorganization
✓ Maintenance plan

What's your budget range?

[Quick Reply Buttons]
💵 $300-500
💵 $500-750
💵 $750-1,000  
💵 $1,000+
❓ Tell me more first

---

[Continues similar to Home path...]
```

### PATH C: Not in Montana

```
USER: [Enters non-Montana ZIP]

BOT: I appreciate your interest! Unfortunately, we currently only provide in-person services in Montana.

However, I'd love to help you get organized! Here are some options:

[Quick Reply Buttons]
📱 Virtual Consultation ($97)
📚 DIY RV Organization Guide (FREE)
📧 Join Waitlist for Your Area
💬 Organization Tips via Email

---

USER: [Selects Virtual Consultation]

BOT: Wonderful! Our virtual consultations have helped RVers across the country.

Here's what's included:
✓ 60-minute video session with Chanel
✓ Personalized organization plan
✓ Product recommendation list
✓ Follow-up email support (2 weeks)
✓ Recording of session

Would you like to schedule your virtual consultation?

[Quick Reply Buttons]
Yes, Schedule Now → [Calendly Link]
Email Me Details First
I'll Think About It
```

### PATH D: Budget Under Minimum

```
USER: [Selects Under $300]

BOT: I understand budget is important! While our full-service organizing starts at $300, I have some great alternatives for you:

[Quick Reply Buttons]
📱 Mini Virtual Session ($97)
👥 Group Workshop ($47/person)  
📚 DIY Guide + Email Support ($27)
💡 Free Organization Tips

---

USER: [Selects Group Workshop]

BOT: Perfect! Our group workshops are fun and super practical.

Next workshop: "RV Organization Mastery"
📅 Date: [Next Saturday]
⏰ Time: 10am-12pm
📍 Location: Bozeman Community Center
👥 Limited to 12 people

What you'll learn:
✓ Space-maximizing techniques
✓ Product recommendations
✓ Hands-on practice
✓ Q&A with Chanel

Would you like to reserve your spot?

[Quick Reply Buttons]
Yes, Reserve My Spot
Email Me Details
Not Right Now
```

## Reengagement Flows

### 30-Day Follow-Up
```
BOT: Hi {name}! It's Clara from ClutterFreeSpaces 👋

Last month you were interested in organizing your {space_type}. 

I wanted to check in - have you made any progress on your organization project?

[Quick Reply Buttons]
✅ Yes, all done!
🤔 Still need help
⏸️ On hold for now
🚫 No longer interested

---

USER: [Still need help]

BOT: No worries! Sometimes it helps to break big projects into smaller steps.

Good news - Chanel has a few openings this month and she's offering 15% off for returning inquiries.

Would you like to schedule that free consultation we talked about?

[Quick Reply Buttons]
Yes, let's do it!
What was included again?
Maybe next month
```

### Seasonal Check-In
```
BOT: Hi {name}! 🍂 Fall is here - perfect time for organizing!

Many Montanans are preparing their RVs for winter storage or getting homes ready for the holidays.

Chanel has a special Fall Refresh Package:
✓ 4-hour organizing session
✓ Seasonal storage swap
✓ Holiday decoration organization
✓ Only $397 (reg $497)

Interested?

[Quick Reply Buttons]
Tell me more
Book fall refresh
Not right now
```

## Referral Partner Flow

### Real Estate Agent Referral
```
BOT: Welcome! I see you were referred by {agent_name} - they're one of our favorite partners!

As a valued referral, you'll receive:
✓ Priority scheduling
✓ 10% discount on first service
✓ Free 30-min consultation

Are you:

[Quick Reply Buttons]
📦 Preparing to sell
🏡 Just moved in
🔄 Estate cleanout
🏠 General organizing

---

[Continues with modified pricing showing 10% discount automatically applied]
```

## Special Situations

### Urgency Flow
```
USER: [Selects ASAP/This week]

BOT: I understand you need help quickly! Let me check Chanel's emergency availability.

For urgent projects, we offer:
✓ Same-week service (based on availability)
✓ Extended hours (evenings/weekends)
✓ Rush processing

There's a 20% rush fee for booking within 48 hours.

Your estimated total: ${calculated_amount}

Is this timeframe worth the rush fee?

[Quick Reply Buttons]
Yes, I need it ASAP
I can wait a week
Let me check my schedule
```

### High-Value Lead Flow
```
USER: [Selects $2000+ budget]

BOT: Wonderful! With that budget, we can create a complete transformation.

For premium projects, Chanel offers her Signature Complete Home System:

✓ Full home assessment
✓ Custom organization plan
✓ Professional organizing (16-20 hours)
✓ Product sourcing & installation
✓ 3-month maintenance support
✓ Quarterly refresh sessions

Instead of going through more questions here, would you prefer Chanel to call you directly to discuss your vision?

[Quick Reply Buttons]
Yes, have her call me
I prefer to schedule online
Send me details first

---

USER: [Yes, have her call]

BOT: Perfect! Chanel will personally call you within 2 hours (during business hours) or first thing tomorrow morning.

What's the best number to reach you?

[Phone Input]

And your name?

[Name Input]

BOT: Thank you {name}! Chanel is excited to discuss your project. She'll call you at {phone} soon.

In the meantime, here's our portfolio of transformation projects: [link]
```

## Error Handling & Edge Cases

### Invalid ZIP Code
```
BOT: Hmm, I don't recognize that ZIP code. Let's make sure I have it right.

Could you please re-enter your 5-digit ZIP code?

[Text Input]

[After 2 failures]
BOT: I'm having trouble with the ZIP code. No worries! 

Would you mind telling me the nearest city in Montana?

[Text Input]
```

### Abandoned Chat Recovery
```
[User returns after 24 hours]

BOT: Welcome back {name}! 👋

I saved your information from yesterday. You were interested in organizing your {space_type} with a budget of {budget}.

Ready to pick up where we left off?

[Quick Reply Buttons]
Yes, continue
Start over
Just browsing
```

### Indecisive Lead
```
USER: [Selects "Need more info" multiple times]

BOT: I totally understand - organizing is a big decision!

How about this: Instead of more questions, would you prefer to:

[Quick Reply Buttons]
📞 Quick 5-min phone call with Chanel
📧 Receive our info packet via email
📱 Watch our 3-min intro video
💬 Ask me a specific question

---

USER: [Email info packet]

BOT: Perfect! I'll send you our complete info packet with:
✓ Service descriptions
✓ Pricing guide
✓ Before/after galleries
✓ Client testimonials
✓ FAQ document

What's your email address?

[Email Input]

BOT: Thanks! You'll receive the info packet within 5 minutes. 

Chanel will follow up personally tomorrow to answer any questions.

One last thing - what's the best time to reach you?

[Quick Reply Buttons]
Morning (9am-12pm)
Afternoon (12pm-5pm)
Evening (5pm-8pm)
Anytime is fine
```

## Post-Conversion Flows

### Appointment Confirmed
```
BOT: 🎉 Fantastic! Your consultation with Chanel is confirmed for:

📅 {day}, {date}
⏰ {time}
📍 {location or "Video Call"}

You'll receive:
✓ Email confirmation (check your inbox)
✓ SMS reminder 24 hours before
✓ Prep checklist

To prepare for your consultation:
1. Take photos of spaces you want organized
2. Make a list of your biggest frustrations
3. Think about your organization goals

Any questions before your appointment?

[Quick Reply Buttons]
What should I prepare?
How long will it take?
What if I need to reschedule?
All set, thanks!
```

### Service Completion Follow-Up
```
BOT: Hi {name}! Chanel mentioned she just finished organizing your {space}. 

How are you feeling about your newly organized space?

[Quick Reply Buttons]
😍 LOVE IT!
😊 Very happy
😐 It's okay
😕 Have concerns

---

USER: [LOVE IT!]

BOT: That's wonderful to hear! 🎉

Would you mind sharing your experience in a quick review? It really helps other Montana families find us.

[Quick Reply Buttons]
Sure, happy to!
Maybe later
Send me the link

---

USER: [Sure, happy to!]

BOT: You're the best! Here's the link:

[Google Review Button]

Also, if you know anyone who could use Chanel's help, you'll both get $50 off when they book! 

Want your personal referral code?

[Quick Reply Buttons]
Yes please!
Not right now
```

---

*These conversation flows are designed to qualify leads while maintaining a friendly, helpful tone that reflects the ClutterFreeSpaces brand. Each path is optimized for conversion while respecting the user's time and budget.*