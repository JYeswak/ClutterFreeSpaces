# Make.com Social Media Automation for ClutterFreeSpaces

## Overview
Create automated weekly social media posts that drive traffic to your organization quiz and booking system. Chanel can trigger these with one click each week.

## Scenario 1: Weekly Content Posting

### Trigger: Manual Button
- **Module**: Webhooks > Custom Webhook
- **URL**: https://hook.make.com/SOCIAL_WEBHOOK_ID
- **Method**: POST
- **Usage**: Chanel clicks a bookmark or button to trigger

### Step 1: Content Selection
- **Module**: Tools > Set Variables
- **Variables**:
```javascript
// Rotating weekly content themes
const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7)) % 4;
const contentThemes = [
  "RV Organization Tips",
  "Before & After Transformations", 
  "Organization Psychology",
  "Quick Wins & DIY"
];

// Content templates for each theme
const rvTips = [
  {
    text: "🚐 RV STORAGE HACK: Use over-the-door shoe organizers on cabinet doors for toiletries, cleaning supplies, and small items. Maximizes vertical space without adding weight! \n\n✨ What's your biggest RV organization challenge? Take our 2-minute quiz to get personalized tips! 👇",
    hashtags: "#RVLife #RVOrganization #RVTips #ClutterFree #RVHacks #Montana #RVTravel",
    cta: "Take the Organization Style Quiz",
    link: "https://clutterfreespaces.com/organization-style-quiz.html"
  },
  {
    text: "🏠 SMALL SPACE, BIG IMPACT: In RVs, every inch counts! Use drawer dividers, stackable containers, and vacuum-sealed bags for seasonal items. \n\n💡 Pro tip: Group like items together and label everything - you'll thank yourself later!",
    hashtags: "#RVOrganization #SmallSpaceOrganizing #RVLife #OrganizationTips #RVStorage",
    cta: "Book Free Consultation",
    link: "https://calendly.com/chanelnbasolo/30min"
  }
];

const beforeAfter = [
  {
    text: "🔥 TRANSFORMATION TUESDAY: From chaotic RV kitchen to functional culinary space! \n\n✅ Grouped items by use\n✅ Added drawer organizers  \n✅ Created a spice system\n✅ Maximized counter space\n\nResult: Cooking became a joy instead of a struggle! 👨‍🍳",
    hashtags: "#TransformationTuesday #RVKitchen #BeforeAndAfter #OrganizationWorks #RVLife",
    cta: "See More Transformations",
    link: "https://clutterfreespaces.com/portfolio"
  }
];

// Select content based on theme
let selectedContent;
switch(contentThemes[weekNumber]) {
  case "RV Organization Tips":
    selectedContent = rvTips[Math.floor(Math.random() * rvTips.length)];
    break;
  case "Before & After Transformations":
    selectedContent = beforeAfter[0];
    break;
  // Add more themes...
  default:
    selectedContent = rvTips[0];
}

return {
  content: selectedContent,
  theme: contentThemes[weekNumber],
  postTime: new Date().toISOString()
};
```

### Step 2: Facebook Page Post
- **Module**: Facebook Pages > Create a Post
- **Page**: ClutterFreeSpaces Facebook Page
- **Message**: {{content.text}}
- **Link**: {{content.link}}
- **Hashtags**: {{content.hashtags}}
- **Scheduled**: Immediate (or set for optimal time)

### Step 3: Instagram Business Post
- **Module**: Instagram for Business > Create a Post
- **Account**: ClutterFreeSpaces Instagram
- **Caption**: {{content.text}} {{content.hashtags}}
- **Media**: Stock organization photos or Chanel's content

### Step 4: Log Social Media Activity
- **Module**: Airtable > Create Record
- **Table**: Analytics
- **Fields**:
```
Date: {{formatDate(now, "YYYY-MM-DD")}}
Lead Sources: "Social Media Post: {{theme}}"
Notes: "Posted: {{content.text|truncate(100)}}"
New Leads: 0 (will be updated later)
```

## Scenario 2: Content Library System

### Pre-Built Content Templates

#### RV Organization Tips (Rotate Weekly):
```javascript
const rvContent = [
  {
    week: 1,
    post: "🚐 RV ORGANIZATION SECRET: The 'One In, One Out' rule saves space and sanity! For every new item that enters your RV, remove something else. \n\n🎯 This prevents accumulation and keeps your space functional. What's one thing you could remove from your RV today?",
    hashtags: "#RVLife #Minimalism #RVOrganization #ClutterFree #RVTips",
    link: "quiz"
  },
  {
    week: 2, 
    post: "💡 GENIUS RV HACK: Use tension rods inside cabinets to create instant dividers! Perfect for plates, cutting boards, or baking sheets. \n\n✨ Cost: Under $10\n⏰ Time: 5 minutes\n📈 Impact: HUGE space savings!",
    hashtags: "#RVHacks #RVStorage #OrganizationHacks #RVLife #BudgetFriendly",
    link: "consultation"
  },
  {
    week: 3,
    post: "🏔️ MONTANA RV LIFE: Preparing for seasonal storage? Here's my 3-step system:\n\n1️⃣ Sort: Keep, Store, Donate\n2️⃣ Pack: Label everything clearly  \n3️⃣ Access: Most-used items in front\n\nProper preparation = stress-free retrieval! 🙌",
    hashtags: "#Montana #RVStorage #SeasonalOrganization #RVLife #OrganizationTips",
    link: "quiz"
  },
  {
    week: 4,
    post: "🚛 WEIGHT MATTERS: Every RV has payload limits! Choose lightweight organization products:\n\n✅ Fabric storage bins vs plastic\n✅ Mesh organizers vs rigid dividers\n✅ Collapsible containers vs fixed\n\nStay organized AND under weight limits! ⚖️",
    hashtags: "#RVSafety #RVOrganization #WeightManagement #RVTips #SafeTravel",
    link: "consultation"
  }
];
```

#### Psychology & Motivation Posts:
```javascript
const psychologyContent = [
  {
    post: "🧠 ORGANIZATION PSYCHOLOGY: Your space affects your mood more than you think! \n\nCluttered spaces = Cluttered mind\nOrganized spaces = Clear thinking\n\n🌟 When your RV is organized, you feel:\n• More relaxed\n• Less stressed  \n• Ready for adventure\n\nWhat mood does your current space create?",
    hashtags: "#OrganizationPsychology #Mindfulness #RVLife #MentalHealth #ClutterFree"
  }
];
```

#### Quick Wins & DIY:
```javascript
const quickWins = [
  {
    post: "⚡ 15-MINUTE RV ORGANIZATION WIN: Tackle your spice situation!\n\n🎯 Quick steps:\n1. Empty spice cabinet\n2. Check expiration dates\n3. Group by cuisine type\n4. Use a small bin or magnetic strips\n\n✨ Result: Cooking becomes easier and you stop buying duplicates!",
    hashtags: "#QuickWin #RVKitchen #OrganizationTips #DIY #15MinuteChallenge"
  }
];
```

## Scenario 3: Engagement Automation

### Auto-Respond to Comments
- **Trigger**: Facebook/Instagram > New Comment
- **Filter**: Contains keywords: "help", "organize", "consultation", "rv", "tips"
- **Action**: Reply with personalized message

**Auto-Reply Templates:**
```
For "help" or "organize":
"Thanks for your interest! 🌟 I'd love to help you create an organized space. Take my free 2-minute quiz to get personalized tips: [quiz link] or book a free consultation: [calendly link]"

For "rv":
"RV organization is my specialty! 🚐 I've helped hundreds of RV owners in Montana create functional spaces. Check out my free RV organization guide: [link] or let's chat about your specific needs: [calendly link]"
```

### Story Highlights Automation
- **Trigger**: New Instagram post
- **Action**: Automatically add to relevant story highlight
- **Categories**: "RV Tips", "Before/After", "Quick Wins", "Client Love"

## Scenario 4: Analytics & Tracking

### Social Media Performance Tracking
- **Trigger**: Daily at 11 PM
- **Action**: Pull social media metrics

#### Step 1: Get Facebook Metrics
- **Module**: Facebook Pages > Get Page Insights
- **Metrics**: Post reach, engagement, clicks

#### Step 2: Get Instagram Metrics  
- **Module**: Instagram for Business > Get Insights
- **Metrics**: Impressions, reach, website clicks

#### Step 3: Update Analytics Table
- **Module**: Airtable > Update Record
- **Table**: Analytics
- **Fields**:
```
Date: {{today}}
Lead Sources: "Social Media - FB: {{fb_clicks}} clicks, IG: {{ig_clicks}} clicks"
Notes: "FB Reach: {{fb_reach}}, IG Impressions: {{ig_impressions}}"
```

## Scenario 5: Lead Source Attribution

### Track Social Media Conversions
- **Trigger**: New Airtable record in Leads table
- **Filter**: Lead Source contains "Quiz" OR "Social"
- **Action**: Update social media ROI tracking

## Implementation Steps:

### Phase 1: Basic Setup (Week 1)
1. Create Make.com account
2. Connect Facebook Pages
3. Connect Instagram Business  
4. Connect Airtable
5. Build Scenario 1 (Weekly Content)

### Phase 2: Content Library (Week 2)  
1. Input all content templates
2. Test rotation system
3. Schedule first posts
4. Monitor engagement

### Phase 3: Automation (Week 3)
1. Set up auto-replies
2. Add analytics tracking
3. Create performance dashboard

### Phase 4: Optimization (Week 4)
1. Review performance data
2. A/B test content themes
3. Optimize posting times
4. Refine auto-responses

## Usage Instructions for Chanel:

### Weekly Content Trigger:
1. Visit: https://hook.make.com/SOCIAL_WEBHOOK_ID
2. OR bookmark this URL for one-click posting
3. Posts automatically go to Facebook & Instagram
4. Content rotates weekly through 4 themes

### Content Customization:
- Log into Make.com
- Edit Step 1 content templates
- Add new photos/videos
- Adjust posting schedule

### Performance Review:
- Check Airtable Analytics table weekly
- Review which content gets most engagement
- Update content based on performance

## Cost Analysis:
- Make.com Free: 1,000 operations/month
- Estimated usage: ~50 operations/month
- Well within free limits
- Upgrade to $9/month if needed for more automation

This system will consistently drive traffic to your quiz and booking system while keeping Chanel's workload minimal - just one click per week!