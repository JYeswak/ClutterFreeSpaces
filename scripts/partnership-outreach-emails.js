#!/usr/bin/env node

/**
 * Partnership Outreach Email Templates for ClutterFreeSpaces
 * Supporting flyer distribution campaign at Bretz RV and local RV parks
 */

const partnershipEmailTemplates = {
  // Email for Bretz RV Dealership Partnership
  bretz_rv_partnership: {
    subject:
      "Partnership Opportunity: Add Value for Your RV Customers - ClutterFreeSpaces",
    to: "manager@bretzrv.com", // Update with actual contact
    template: `
Hi [Manager Name],

I hope this message finds you well! My name is Chanel, and I'm the founder of ClutterFreeSpaces - Montana's only professional organizing service specializing specifically in RV organization.

I've been following Bretz RV's excellent reputation in the Missoula area, and I believe we could create real value for your customers together.

**What ClutterFreeSpaces Offers:**
• Professional RV organization specifically designed for Montana adventures
• Weight optimization strategies that improve fuel efficiency and safety
• Climate-specific storage solutions for our extreme weather
• 8+ years of professional organizing experience
• Google My Business verified with 5-star reviews

**Partnership Opportunity:**
Many of your customers invest heavily in their dream RV, then struggle with organization and storage once they hit the road. We'd love to:

• Offer your customers a **$30 discount** on our RV organization service
• Provide educational flyers for your showroom about RV organization best practices
• Create referral incentives that benefit both businesses
• Offer **complimentary organization consultations** during your RV shows/events

**The Challenge We Solve:**
Most RVers don't realize how much proper organization affects:
- Fuel efficiency on mountain passes
- Safety during travel (weight distribution)
- Enjoyment of their RV investment
- Stress levels during setup/breakdown

**Next Steps:**
Would you be open to a 15-minute conversation about how we might work together? I'm happy to meet at your location or discuss over the phone at your convenience.

I can also provide references from other RV customers who've seen dramatic improvements in their RV experience.

Looking forward to potentially partnering with Missoula's premier RV dealer!

Best regards,

Chanel
ClutterFreeSpaces
Montana's Premier RV & Home Organization
(406) 285-1525
contact@clutter-free-spaces.com
www.clutter-free-spaces.com

P.S. I'd love to bring by some of our educational materials and show you exactly what makes RV organization different from regular home organization. Montana's unique challenges require specialized solutions!
`,
  },

  // Email for RV Parks/Campgrounds
  rv_park_partnership: {
    subject:
      "Help Your Guests Maximize Their RV Investment - Local Partnership Opportunity",
    template: `
Hi [Park Manager Name],

My name is Chanel from ClutterFreeSpaces, and I'm reaching out because I believe we share a common goal: helping RVers get the most out of their Montana adventures.

**About ClutterFreeSpaces:**
• Montana's only professional organizing service specializing in RV organization
• 8+ years of experience helping RVers maximize their space
• Focus on weight optimization, climate storage, and travel-safe organization
• Google My Business verified with 5-star customer reviews

**How This Benefits Your Guests:**
Many of your guests struggle with:
- Limited RV storage space affecting their comfort
- Poor organization leading to frustrated family trips
- Weight distribution issues affecting fuel costs and safety
- Difficulty finding items when needed most

**Partnership Proposal:**
• **Guest Discount:** $30 off RV organization services for [Park Name] guests
• **Educational Materials:** Provide RV organization tip sheets for your office
• **Referral Benefits:** Revenue sharing for successful referrals
• **Seasonal Services:** Special rates for long-term guests preparing for travel seasons

**Why Partner With Us:**
1. **Local Montana Expertise:** We understand Big Sky Country's unique RV challenges
2. **Professional Service:** Licensed, insured, and experienced
3. **Customer Satisfaction:** Our organized clients enjoy their RV time more (and stay longer!)
4. **Marketing Support:** We'll help promote your park to our RV client network

**No Cost to You:**
This partnership requires no investment from [Park Name] - just permission to leave educational materials and offer services to interested guests.

**Next Steps:**
Would you have 10 minutes for a brief phone conversation about how this might work? I'm happy to:
- Provide references from satisfied RV customers
- Show you examples of our work
- Explain exactly how our RV organization process works

I truly believe organized RVers are happier RVers, and happy guests are repeat guests!

Best regards,

Chanel
ClutterFreeSpaces
Montana's Premier RV Organization Specialist
(406) 285-1525
contact@clutter-free-spaces.com

P.S. I'd be happy to offer a complimentary RV organization consultation to you personally if you'd like to experience our service first-hand!
`,
  },

  // Follow-up email template for non-responders
  partnership_follow_up: {
    subject: "Following up: Partnership opportunity for your RV customers",
    template: `
Hi [Name],

I wanted to follow up on my message from last week about a potential partnership between ClutterFreeSpaces and [Business Name].

I understand you're busy, especially during [RV season/busy period], so I'll keep this brief.

**Quick Recap:**
• ClutterFreeSpaces specializes in RV organization for Montana adventures
• We'd like to offer your customers a $30 discount on our services
• No cost or commitment required from you
• Simple way to add value for your RV customers

**One Question:**
Would you be interested in a 5-minute phone call to discuss how this might work? 

If not, no worries at all - I respect your time and decision.

Thanks for considering it!

Chanel
ClutterFreeSpaces
(406) 285-1525
`,
  },

  // Thank you email after partnership agreement
  partnership_welcome: {
    subject: "Welcome to the ClutterFreeSpaces Partner Network!",
    template: `
Hi [Name],

Thank you so much for agreeing to partner with ClutterFreeSpaces! I'm excited about the value we can provide to [Business Name]'s customers.

**What Happens Next:**

**This Week:**
• I'll deliver professional flyers and business cards for your location
• Set up your unique referral tracking system
• Provide you with our customer discount codes

**Ongoing:**
• Monthly check-ins to see how the partnership is performing
• New educational materials as we develop them
• First priority for any special promotions or seasonal offers

**Your Referral Benefits:**
• $25 for each customer referral that books our service
• Quarterly partnership reviews to optimize results
• Co-marketing opportunities with your customer base

**Marketing Materials Included:**
• Professional flyers explaining RV organization benefits
• Business cards with your location's discount code
• Educational tip sheets about Montana RV storage

**Contact Information:**
Feel free to reach out anytime with questions, feedback, or referral updates.

Direct: (406) 285-1525
Email: contact@clutter-free-spaces.com

I'm looking forward to helping [Business Name]'s customers get the most out of their RV investments!

Best regards,

Chanel
ClutterFreeSpaces
Your Partner in RV Organization Excellence

P.S. I'll schedule delivery of your marketing materials within the next few days. Please let me know the best time and person to coordinate with at your location.
`,
  },
};

// Local RV Parks and Campgrounds in Missoula Area
const missoulaRVParks = [
  {
    name: "Missoula KOA",
    email: "manager@missoulakoa.com", // Placeholder - verify actual contact
    manager: "Park Manager",
    notes: "Large KOA with many traveling families",
  },
  {
    name: "Jellystone Park Missoula",
    email: "info@jellystonemissoula.com", // Placeholder
    manager: "General Manager",
    notes: "Family-oriented park, good for organization services",
  },
  {
    name: "Jim & Mary's RV Park",
    email: "info@jimandmarysrv.com", // Placeholder
    manager: "Jim or Mary",
    notes: "Local family-owned park",
  },
  {
    name: "Outpost RV Park",
    email: "info@outpostrv.com", // Placeholder
    manager: "Park Manager",
    notes: "Newer park with full hookups",
  },
];

// Business contact information for partnerships
const partnershipContacts = {
  bretz_rv: {
    name: "Bretz RV",
    address: "Missoula, MT",
    phone: "", // To be researched
    website: "", // To be researched
    notes: "Major RV dealer, good partnership opportunity for new RV buyers",
  },
  other_dealers: [
    // Additional RV dealers to research and contact
    "RV dealers in Kalispell area",
    "Camping World locations",
    "Local independent dealers",
  ],
};

// Email sequence for partnerships
const partnershipSequence = {
  day_1: "Initial outreach email",
  day_7: "Follow-up if no response",
  day_14: "Final follow-up with different approach",
  day_30: "Add to quarterly re-outreach list",
};

// Tracking template for partnership outreach
const partnershipTracking = {
  business_name: "",
  contact_person: "",
  email: "",
  phone: "",
  date_first_contact: "",
  response_status: "", // interested, not_interested, no_response
  follow_up_needed: "",
  partnership_status: "", // pending, active, declined
  referrals_generated: 0,
  revenue_generated: 0,
  notes: "",
};

module.exports = {
  partnershipEmailTemplates,
  missoulaRVParks,
  partnershipContacts,
  partnershipSequence,
  partnershipTracking,
};

/**
 * Usage Instructions:
 *
 * 1. Research actual contact information for each business
 * 2. Customize email templates with specific business names
 * 3. Send initial outreach emails
 * 4. Track responses in Airtable or spreadsheet
 * 5. Follow up according to sequence schedule
 * 6. Measure partnership success through referral tracking
 */
