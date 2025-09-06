const authService = require("./auth-oauth");
const { google } = require("googleapis");

class GMBEnhancementService {
  constructor() {
    this.seasonalContent = {
      spring: {
        tips: [
          "Spring cleaning season! Perfect time to declutter your RV for summer adventures 🌸",
          "Organize your garage before summer projects begin! We make it simple 🌱",
          "Fresh start, fresh space! Spring organization tips from ClutterFreeSpaces ✨",
          "Planning summer road trips? Start with an organized RV that makes travel a breeze! 🚐",
          "Spring = new beginnings! Time to create organized systems that actually work for your family 💚",
          "Montana spring means project season! Get your workshop organized first 🔨",
          "Muddy boots and spring gear cluttering your entryway? Let's create a functional mudroom! 👢",
          "Fresh spring energy deserves a fresh, organized home! Ready to transform your space? 🌿",
          "Before the busy summer season hits, let's organize your home for maximum efficiency! ⚡",
          "Spring cleaning overwhelm? We break it down into manageable, lasting systems 📋",
        ],
        hashtags: [
          "#SpringCleaning",
          "#OrganizeYourLife",
          "#MontanaOrganizing",
          "#RVLife",
          "#SpringOrganization",
          "#FreshStart",
          "#OrganizedHome",
          "#MissoulaOrganizing",
        ],
      },
      summer: {
        tips: [
          "Heading out on RV adventures? Let us organize your home base first! 🚐",
          "Summer projects piling up? Start with an organized garage! 🏠",
          "Vacation rental prep? We organize so you can relax 🌞",
          "Camping gear everywhere? Create a system that makes packing a breeze! ⛺",
          "Summer entertaining made easy with an organized kitchen and outdoor space! 🍃",
          "Kids home for summer? Organize playrooms and bedrooms for peaceful days 👶",
          "Hot Montana summers are perfect for organizing - cool indoor projects! 🌡️",
          "Before school shopping begins, organize closets and create systems that last 👕",
          "RV maintenance season? Organize your tools and parts for easy access 🔧",
          "Summer visitors coming? Guest rooms and bathrooms organized in no time! 🛏️",
        ],
        hashtags: [
          "#SummerOrganizing",
          "#RVPrep",
          "#VacationReady",
          "#MontanaLife",
          "#CampingOrganization",
          "#OrganizedKitchen",
          "#PlayroomOrganization",
        ],
      },
      fall: {
        tips: [
          "Prep your home for the holidays with professional organization 🍂",
          "Back-to-school chaos? Create systems that work for your family 📚",
          "Hunting season prep starts with an organized gear room 🦌",
          "Fall decorating made easy when you have organized storage systems! 🎃",
          "Cozy fall nights deserve organized, peaceful spaces to relax in 🍁",
          "Holiday hosting prep begins now! Organized dining and kitchen spaces 🦃",
          "Montana winters are coming - organize your cold weather gear now! 🧥",
          "Thanksgiving prep stress? An organized kitchen makes all the difference! 🥧",
          "Fall activities = more gear! Create systems for sports equipment and supplies ⚽",
          "Pumpkin spice and organized spaces - the perfect fall combination! ☕",
          "Before holiday decorations come out, let's organize storage areas first! 📦",
          "Shorter days = more time indoors. Make your home an organized sanctuary! 🏡",
        ],
        hashtags: [
          "#FallOrganizing",
          "#HolidayPrep",
          "#BackToSchool",
          "#HuntingPrep",
          "#CozyHome",
          "#MontanaFall",
          "#OrganizedKitchen",
          "#HolidayHosting",
        ],
      },
      winter: {
        tips: [
          "Winter storage solutions for your RV and seasonal gear ❄️",
          "Holiday decoration storage that makes sense! 🎄",
          "Cozy winter = organized home. Let us help! ☃️",
          "Montana winters are perfect for indoor organization projects! 🌨️",
          "New Year, new organized systems! Start 2026 with functional spaces 🎊",
          "Ski season gear taking over? Create organized sports equipment storage ⛷️",
          "Winter blues got you down? Organized spaces boost mood and productivity! 💙",
          "Holiday gifts creating clutter? Let's organize and create new systems! 🎁",
          "Cabin fever? Channel that energy into organizing projects that last! 🏠",
          "Cold days, warm organized homes! Perfect time for decluttering sessions ☕",
          "Winter entertaining prep - organized spaces make hosting a joy! 🥂",
          "Snow day activities organized and ready - no more searching for supplies! 🎨",
        ],
        hashtags: [
          "#WinterStorage",
          "#HolidayStorage",
          "#CozyHome",
          "#MontanaWinter",
          "#NewYearOrganizing",
          "#WinterOrganization",
          "#IndoorProjects",
        ],
      },
    };

    this.serviceContent = {
      "whole-house": {
        beforeAfter: "Transform your entire home into an organized sanctuary",
        benefits: [
          "Reduced stress",
          "More time with family",
          "Easier maintenance",
          "Better functionality",
          "Improved home value",
          "Peaceful environment",
        ],
        cta: "Ready for a total home transformation?",
        posts: [
          "Whole house organization isn't just about decluttering - it's about creating systems that work for YOUR lifestyle! ✨",
          "From kitchen chaos to bedroom bliss - we transform every space in your Montana home! 🏠",
          "Overwhelmed by your entire house? We break it down room by room, system by system 📋",
          "Complete home transformations that last! No more reverting to chaos after a few weeks 💪",
          "Every room connected with smart organization systems - your home will finally flow! 🌊",
        ],
      },
      "single-room": {
        beforeAfter: "One room at a time, we create organized spaces that work",
        benefits: [
          "Focused approach",
          "Budget-friendly",
          "Quick results",
          "Easy to maintain",
          "Immediate impact",
          "Build momentum",
        ],
        cta: "Which room needs organization first?",
        posts: [
          "Start small, think big! Single room organization that creates momentum for your whole home 🎯",
          "That one room that drives you crazy? Let's turn it into your favorite space! 💜",
          "Perfect for busy families - transform one room at a time without the overwhelm 📅",
          "Home office driving you nuts? A organized workspace boosts productivity instantly! 💻",
          "Guest room looking more like storage? Let's make it welcoming for visitors! 🛏️",
        ],
      },
      "rv-organization": {
        beforeAfter: "Maximize your RV space for comfortable adventures",
        benefits: [
          "More storage space",
          "Easier travel prep",
          "Comfortable living",
          "Organized adventures",
          "Faster setup/breakdown",
          "Stress-free trips",
        ],
        cta: "Ready to love your RV space?",
        posts: [
          "RV life doesn't mean sacrificing organization! Every inch can have a purpose 🚐",
          "Montana RV adventures made easier with smart storage solutions! ⛰️",
          "From tiny trailers to big rigs - we organize every type of RV! 🏕️",
          "Pack light, live organized! RV systems that make full-time living comfortable 🏠",
          "Weekend warriors or full-timers - organized RVs make every trip better! ✨",
          "Before your next adventure, let's organize your home on wheels! 🛣️",
        ],
      },
      "garage-organization": {
        beforeAfter: "Turn your garage from chaos to functional workspace",
        benefits: [
          "Find tools easily",
          "More parking space",
          "Seasonal storage",
          "Workshop ready",
          "Weather protection",
          "Increased home value",
        ],
        cta: "Ready to reclaim your garage?",
        posts: [
          "Can't park in your garage? Let's change that! Reclaim your space today 🚗",
          "From storage dumping ground to functional workshop - garage transformations! 🔧",
          "Seasonal gear, tools, sports equipment - organized systems for everything! ⚽",
          "Montana weather is tough on vehicles - let's get them back in the garage! ❄️",
          "Your garage is prime real estate! Stop letting clutter take over valuable space 🏠",
          "Tool organization that actually works - no more hunting for what you need! 🔨",
        ],
      },
      "kitchen-organization": {
        beforeAfter: "Transform your kitchen into a cooking paradise",
        benefits: [
          "Faster meal prep",
          "Less food waste",
          "Easier cleanup",
          "More counter space",
          "Efficient cooking",
          "Family gathering hub",
        ],
        cta: "Ready to love cooking again?",
        posts: [
          "The heart of your home deserves organized systems that work! Kitchen magic ✨",
          "Meal prep made easy with smart kitchen organization systems! 🍳",
          "Pantry chaos got you down? Let's create a system that saves time AND money! 🥫",
          "Holiday cooking stress? An organized kitchen makes entertaining a joy! 🦃",
          "From cluttered counters to cooking paradise - kitchen transformations! 👩‍🍳",
        ],
      },
      "closet-organization": {
        beforeAfter: "Create closets that make getting dressed a pleasure",
        benefits: [
          "Find clothes easily",
          "Maximize space",
          "Protect garments",
          "Morning efficiency",
          "Style confidence",
          "Seasonal rotation",
        ],
        cta: "Ready to transform your closets?",
        posts: [
          "Nothing to wear? Maybe you just can't find it! Closet organization reveals your style ✨",
          "Master closets that work as hard as you do - Montana style! 👔",
          "From chaos to calm - closet systems that make mornings easier! ⏰",
          "Kids' closets that actually stay organized? Yes, it's possible! 👕",
          "Seasonal clothing storage done right - protect and organize! 🧥",
        ],
      },
      "home-office": {
        beforeAfter: "Design productive workspace that inspires success",
        benefits: [
          "Increased productivity",
          "Reduced stress",
          "Better focus",
          "Professional appearance",
          "Efficient workflow",
          "Work-life balance",
        ],
        cta: "Ready to boost your productivity?",
        posts: [
          "Work from home productivity starts with an organized office space! 💼",
          "Paper piles and digital chaos? Let's create systems that work! 📄",
          "Your home office should inspire, not frustrate! Professional organization ✨",
          "Small space, big productivity! Home office organization for any size 🏠",
          "Remote work made better with organized, functional workspace! 💻",
        ],
      },
    };

    // Organization Tips
    this.organizationTips = [
      "💡 Quick Tip: The 15-minute rule! Set a timer and tackle one area for 15 minutes daily",
      "✨ Pro Tip: Like goes with like - always group similar items together for easy access",
      "🎯 Organization Hack: Use clear containers so you can see what you have at a glance",
      "💜 Gentle Reminder: Start with easy wins! Organize one drawer to build momentum",
      "🏠 Home Tip: Everything needs a home - assign a specific place for every item",
      "📦 Storage Secret: Vertical space is your friend - think walls and door backs!",
      "⏰ Time Saver: Make it easier to put away than to leave out - organization wins!",
      "🌟 Success Tip: Maintenance is easier than organization - invest in good systems",
      "🎨 Visual Tip: Color coding and labels aren't just pretty - they keep families organized!",
      "💪 Motivation: You don't have to be perfect, just make progress one step at a time",
    ];

    // Motivational Posts
    this.motivationalPosts = [
      "Your home should be your sanctuary, not a source of stress! Let's make it happen ✨",
      "Clutter isn't just physical - it's mental too. Clear space = clear mind 🧠",
      "You deserve to live in a space that supports and inspires you every day! 💜",
      "Progress over perfection! Every small step toward organization counts 👣",
      "An organized home doesn't happen overnight, but the peace it brings is worth it 🕊️",
      "You're not messy, you just need systems that work for YOUR lifestyle! 🎯",
      "Home organization isn't about having less - it's about loving what you have more ❤️",
      "The magic isn't in the organizing - it's in the living that happens afterward ✨",
      "Your time is precious! Let's create systems that give you more of it ⏰",
      "Organized doesn't mean perfect - it means functional for your family! 👨‍👩‍👧‍👦",
    ];

    // Behind-the-Scenes Content
    this.behindTheScenes = [
      "Behind the scenes: Every project starts with understanding how YOU live and work! 🔍",
      "Client love: 'I actually look forward to cooking now!' - Kitchen transformation magic ✨",
      "Real talk: The hardest part isn't organizing - it's deciding what truly matters to you 💭",
      "Project spotlight: This garage went from unusable to a functional workshop in one day! 🔧",
      "Fun fact: We've organized over 500 Montana homes and every single one was unique! 🏠",
      "Before we organize, we listen. Your story guides every system we create 👂",
      "Teamwork makes the dream work! Chanel and her team bring the expertise, you bring the vision 🤝",
      "The best part of our job? Seeing families reconnect with their homes and each other 💕",
      "Every 'after' photo tells a story of transformation, but the real magic is how it feels ✨",
      "We don't just organize stuff - we organize lives, routines, and peace of mind 🧘‍♀️",
    ];

    // Local Montana Content
    this.montanaContent = [
      "Montana living means seasonal gear! Let's organize so you can find your hiking boots AND your snow boots 🥾",
      "From Glacier Park adventures to backyard BBQs - Montana homes need organization that works for every season! 🏔️",
      "Big Sky, organized home! Montana families deserve spaces as beautiful as our state ✨",
      "Missoula families know: organized homes = more time for what matters most 💚",
      "Whether you're in Bozeman, Helena, or Missoula - every Montana home deserves organization that works! 🏡",
      "Ranch life or city life - we organize homes across Montana to work for YOUR lifestyle 🤠",
      "Montana hospitality starts with an organized, welcoming home! 🤗",
      "From hunting season to holiday hosting - organized Montana homes handle it all! 🦌",
      "Cabin retreats and family homes - we organize every type of Montana dwelling 🏘️",
      "Supporting local Montana families with organization that lasts through all four seasons! ❄️🌸☀️🍂",
    ];

    // Client testimonials for social proof posts
    this.clientTestimonials = [
      {
        quote:
          "Chanel transformed our entire RV in just one day! Now everything has a place and we're road-ready in minutes instead of hours. Worth every penny!",
        client: "Sarah & Mike J.",
        service: "RV Organization",
        result: "Reduced packing time from 3 hours to 30 minutes",
      },
      {
        quote:
          "I never thought my garage could look this good! Chanel created systems that actually work for our family of 5. Six months later and it's still perfectly organized!",
        client: "Jennifer M.",
        service: "Garage Organization",
        result: "Found 200 sq ft of usable space we forgot we had",
      },
      {
        quote:
          "As a busy mom of three, I was drowning in clutter. ClutterFreeSpaces gave me my sanity back with systems that my whole family can maintain.",
        client: "Amanda T.",
        service: "Whole House Organization",
        result: "Morning routine went from chaos to calm",
      },
      {
        quote:
          "Professional, efficient, and truly understands Montana lifestyle! Our mudroom went from disaster zone to functional family command center.",
        client: "Tom & Lisa C.",
        service: "Single Room Organization",
        result: "No more hunting for keys, boots, or backpacks",
      },
      {
        quote:
          "Chanel doesn't just organize, she teaches you how to maintain it. Three years later and our systems are still working perfectly!",
        client: "David & Rachel W.",
        service: "Whole House Organization",
        result: "Saved 2+ hours per week on household management",
      },
      {
        quote:
          "I was skeptical about hiring an organizer, but Chanel's approach is so practical. She gets how real families live and work in Montana.",
        client: "Maria S.",
        service: "Kitchen & Pantry Organization",
        result: "Cut grocery shopping time in half with better systems",
      },
      {
        quote:
          "Our home office went from paper avalanche to productivity paradise! Working from home in Montana has never been more enjoyable.",
        client: "Brian P.",
        service: "Home Office Organization",
        result: "Increased productivity by 40% with organized workspace",
      },
      {
        quote:
          "Best investment we've made for our home! The before/after photos don't even capture how much easier daily life has become.",
        client: "Kelly & James R.",
        service: "Master Bedroom & Closet",
        result: "Getting ready takes 5 minutes instead of 20",
      },
    ];

    // Problem-solution focused posts
    this.problemSolutionPosts = [
      {
        problem: "Can't find anything in your garage?",
        solution:
          "We create labeled zones and vertical storage systems that make every tool and seasonal item easy to find - even in the dark!",
        cta: "Ready to reclaim your garage space?",
      },
      {
        problem: "RV packing taking hours before every trip?",
        solution:
          "Our RV organization systems mean everything has a designated spot. Pack in 30 minutes, not 3 hours!",
        cta: "Make RV travel stress-free!",
      },
      {
        problem: "Kids' rooms always a disaster despite constant cleaning?",
        solution:
          "We design kid-friendly systems that make cleanup fun and automatic. Even toddlers can maintain these organized spaces!",
        cta: "Turn cleanup time into success time!",
      },
      {
        problem: "Paper piles taking over every surface?",
        solution:
          "Digital filing systems + strategic paper management = surfaces that stay clear and bills that get paid on time!",
        cta: "Conquer the paper chaos once and for all!",
      },
      {
        problem: "Closet bursting but nothing to wear?",
        solution:
          "We streamline wardrobes and create visibility systems so you love and wear everything you own!",
        cta: "Rediscover your perfect wardrobe!",
      },
      {
        problem: "Kitchen cabinets are a black hole?",
        solution:
          "Strategic placement + clear containers + lazy susans = kitchens where cooking is actually enjoyable again!",
        cta: "Make your kitchen your favorite room!",
      },
    ];

    // FAQ educational posts
    this.faqPosts = [
      {
        question: "How long does it take to organize a whole house?",
        answer:
          "Most whole house projects take 2-5 days, depending on size and scope. We work efficiently while ensuring every system is sustainable for your lifestyle!",
        tip: "Pro tip: Start with high-impact areas like kitchen and master bedroom for immediate daily benefits!",
      },
      {
        question: "Will the organization systems actually last?",
        answer:
          "Absolutely! We design systems based on how you naturally live and work. Our clients report maintained organization years later because the systems fit their real life!",
        tip: "The key is creating systems that are easier to maintain than mess up!",
      },
      {
        question: "Do I need to buy a lot of expensive organizing products?",
        answer:
          "Not at all! We focus on smart systems first, products second. Many solutions use items you already have or simple, affordable organizers that really work!",
        tip: "The best organizing solutions are often the simplest ones!",
      },
      {
        question: "What if I'm embarrassed about the mess?",
        answer:
          "There's zero judgment here! We've seen it all and our only focus is creating solutions that work for you. Your current state is just our starting point!",
        tip: "Every organized space started as someone's 'disaster zone' - you're not alone!",
      },
      {
        question: "Can you work around my schedule?",
        answer:
          "Yes! We offer flexible scheduling including evenings and weekends. Montana families are busy - we work around your life, not the other way around!",
        tip: "Most clients are amazed how little disruption our process creates!",
      },
    ];

    // Daily themed posting schedule
    this.weeklySchedule = {
      0: {
        // Sunday - Motivation Monday Prep
        theme: "sunday_prep",
        postType: "motivation",
        focus: "Week preparation and goal setting",
      },
      1: {
        // Monday - Motivation Monday
        theme: "motivation_monday",
        postType: "motivation",
        focus: "Inspirational organizing content to start the week",
      },
      2: {
        // Tuesday - Tip Tuesday
        theme: "tip_tuesday",
        postType: "tip",
        focus: "Practical organizing tips and hacks",
      },
      3: {
        // Wednesday - Wisdom Wednesday
        theme: "wisdom_wednesday",
        postType: "faq",
        focus: "Educational content and expert advice",
      },
      4: {
        // Thursday - Transformation Thursday
        theme: "transformation_thursday",
        postType: "transformation",
        focus: "Before/after stories and dramatic changes",
      },
      5: {
        // Friday - Feature Friday
        theme: "feature_friday",
        postType: "testimonial",
        focus: "Client success stories and reviews",
      },
      6: {
        // Saturday - Solutions Saturday
        theme: "solutions_saturday",
        postType: "problemSolution",
        focus: "Problem-focused content addressing pain points",
      },
    };

    // Daily motivational content for Sundays and Mondays
    this.motivationalDaily = {
      sunday: [
        "Sunday Reset: Take 15 minutes today to prepare your spaces for a successful week ahead! 🌟",
        "Sunday Planning: An organized week starts with Sunday preparation. What's your organizing goal this week? 📋",
        "Weekend Wrap-Up: Spend Sunday evening resetting your home for Monday morning success! ✨",
        "Sunday Reflection: Look at the organized spaces you've created this week. Feel proud of your progress! 💪",
        "Preparation Day: Use Sunday to set yourself up for an organized, stress-free week ahead 🎯",
      ],
      monday: [
        "Monday Motivation: You've got this! Start your week with one organized space and watch the momentum build 🚀",
        "Fresh Start Monday: New week, new opportunities to create the organized home you deserve! 💜",
        "Monday Mindset: Organization isn't about perfection - it's about creating systems that work for YOUR life 🏡",
        "Week Ahead: This Monday, choose one space to focus on. Small steps lead to big transformations! ⭐",
        "Monday Magic: The most organized homes started with one small step on a Monday morning ✨",
      ],
    };
  }

  /**
   * Generate seasonal GMB posts
   */
  async generateSeasonalPost() {
    const season = this.getCurrentSeason();
    const content = this.seasonalContent[season];
    const randomTip =
      content.tips[Math.floor(Math.random() * content.tips.length)];

    return {
      content: randomTip,
      hashtags: content.hashtags.join(" "),
      callToAction: "Book your free consultation at clutterfreespaces.com",
      imagePrompt: `Professional home organization, ${season} theme, Montana, before and after`,
      postType: "TIP",
    };
  }

  /**
   * Generate service-focused posts
   */
  async generateServicePost(serviceType = null) {
    const service =
      serviceType ||
      Object.keys(this.serviceContent)[
        Math.floor(Math.random() * Object.keys(this.serviceContent).length)
      ];
    const content = this.serviceContent[service];

    // Choose random format - either benefits list or direct post
    const useDirectPost = Math.random() > 0.5;

    if (useDirectPost && content.posts) {
      const randomPost =
        content.posts[Math.floor(Math.random() * content.posts.length)];
      return {
        content: `${randomPost}\n\n${content.cta}`,
        callToAction: "Book your free consultation at clutterfreespaces.com",
        serviceType: service,
        imagePrompt: `Professional ${service.replace("-", " ")} organization, before and after photos`,
        postType: "SERVICE_DIRECT",
      };
    } else {
      return {
        content: `${content.beforeAfter}\n\n✨ Benefits:\n${content.benefits.map((b) => `• ${b}`).join("\n")}\n\n${content.cta}`,
        callToAction: "Schedule your consultation today!",
        serviceType: service,
        imagePrompt: `Professional ${service.replace("-", " ")} organization, before and after photos`,
        postType: "SERVICE_BENEFITS",
      };
    }
  }

  /**
   * Generate Q&A content for GMB
   */
  getCommonQAs() {
    return [
      {
        question:
          "Do you work with clients who have ADHD or other organizing challenges?",
        answer:
          "Absolutely! We specialize in creating systems that work for different thinking styles and life situations. Our approach is judgment-free and focused on what works for YOU.",
      },
      {
        question: "How long does a typical organization project take?",
        answer:
          "It depends on the space and your goals! A single room typically takes 4-8 hours, while whole-house projects can take several days spread over 2-3 weeks. We work at your pace.",
      },
      {
        question: "Do I need to buy organizing products before you arrive?",
        answer:
          "Not at all! We assess your space first, then recommend products that actually work for your lifestyle. We can shop for you or provide a custom shopping list.",
      },
      {
        question: "Are you licensed and insured?",
        answer:
          "Yes! We're fully licensed and insured for your peace of mind. We treat your home and belongings with the utmost care and respect.",
      },
      {
        question: "Do you service RVs and tiny homes?",
        answer:
          "We love small space organization! RVs, tiny homes, and compact living spaces are our specialty. We maximize every inch while keeping it livable.",
      },
      {
        question: "What's your service area around Missoula?",
        answer:
          "We primarily serve Missoula and surrounding areas within 50 miles. Contact us to confirm service to your location - we love helping Montana families get organized!",
      },
    ];
  }

  /**
   * Generate review response templates
   */
  getReviewResponseTemplates() {
    return {
      positive5Star: [
        "Thank you so much, {customerName}! It was wonderful working with you to transform your {serviceType}. We're thrilled you're loving your organized space! 🌟",
        "We're delighted to hear about your positive experience, {customerName}! Your {serviceType} transformation was such a joy to work on. Thank you for trusting ClutterFreeSpaces! ✨",
        "{customerName}, your kind words made our day! We loved helping you create an organized {serviceType} that works for your lifestyle. Enjoy your beautiful space! 💕",
      ],
      positive4Star: [
        "Thank you for the great review, {customerName}! We're so glad we could help with your {serviceType}. Your feedback helps us continue improving our service! 🙏",
        "We appreciate your thoughtful review, {customerName}! It was a pleasure organizing your {serviceType}. Thank you for choosing ClutterFreeSpaces! ⭐",
      ],
      constructive: [
        "Thank you for your feedback, {customerName}. We truly value your input and will use it to improve our services. Please reach out if there's anything we can do to make things right. 💙",
        "We appreciate you taking the time to share your experience, {customerName}. Your feedback is important to us, and we're committed to continuous improvement. Thank you! 🙏",
      ],
      generic: [
        "Thank you for your review! We appreciate your feedback and are grateful for the opportunity to serve you. 😊",
        "We value your feedback! Thank you for choosing ClutterFreeSpaces for your organization needs. 🌟",
      ],
    };
  }

  /**
   * Generate organization tip posts
   */
  async generateTipPost() {
    const randomTip =
      this.organizationTips[
        Math.floor(Math.random() * this.organizationTips.length)
      ];

    return {
      content: randomTip,
      callToAction: "Need more organizing help? We're here for you!",
      hashtags:
        "#OrganizingTips #MontanaOrganizing #OrganizeYourLife #HomeOrganization",
      imagePrompt: "Organization tips, home organizing hack, Montana home",
      postType: "TIP",
    };
  }

  /**
   * Generate motivational posts
   */
  async generateMotivationalPost() {
    const randomMotivation =
      this.motivationalPosts[
        Math.floor(Math.random() * this.motivationalPosts.length)
      ];

    return {
      content: randomMotivation,
      callToAction:
        "Ready to transform your space? Book your free consultation!",
      hashtags:
        "#OrganizingMotivation #HomeInspiration #OrganizedLife #MontanaLife",
      imagePrompt: "Inspiring organized home, peaceful space, home sanctuary",
      postType: "MOTIVATION",
    };
  }

  /**
   * Generate behind-the-scenes posts
   */
  async generateBehindTheScenesPost() {
    const randomBTS =
      this.behindTheScenes[
        Math.floor(Math.random() * this.behindTheScenes.length)
      ];

    return {
      content: randomBTS,
      callToAction: "Experience the ClutterFree difference yourself!",
      hashtags:
        "#BehindTheScenes #OrganizingTeam #ClientLove #MontanaOrganizing",
      imagePrompt:
        "Professional organizer at work, team collaboration, happy clients",
      postType: "BEHIND_SCENES",
    };
  }

  /**
   * Generate Montana-specific content
   */
  async generateMontanaPost() {
    const randomMontana =
      this.montanaContent[
        Math.floor(Math.random() * this.montanaContent.length)
      ];

    return {
      content: randomMontana,
      callToAction: "Proudly serving Montana families since day one!",
      hashtags:
        "#MontanaLiving #MissoulaOrganizing #BigSkyCountry #MontanaHomes",
      imagePrompt:
        "Montana home organization, Big Sky country, mountain living",
      postType: "LOCAL",
    };
  }

  /**
   * Generate random post (any type)
   */
  async generateRandomPost() {
    const postTypes = [
      "seasonal",
      "service",
      "tip",
      "motivation",
      "behindScenes",
      "montana",
      "testimonial",
      "problemSolution",
      "faq",
      "transformation",
    ];
    const randomType = postTypes[Math.floor(Math.random() * postTypes.length)];

    switch (randomType) {
      case "seasonal":
        return await this.generateSeasonalPost();
      case "service":
        return await this.generateServicePost();
      case "tip":
        return await this.generateTipPost();
      case "motivation":
        return await this.generateMotivationalPost();
      case "behindScenes":
        return await this.generateBehindTheScenesPost();
      case "montana":
        return await this.generateMontanaPost();
      case "testimonial":
        return await this.generateTestimonialPost();
      case "problemSolution":
        return await this.generateProblemSolutionPost();
      case "faq":
        return await this.generateFAQPost();
      case "transformation":
        return await this.generateTransformationPost();
      default:
        return await this.generateSeasonalPost();
    }
  }

  /**
   * Generate testimonial post from client reviews
   */
  async generateTestimonialPost() {
    try {
      const testimonial =
        this.clientTestimonials[
          Math.floor(Math.random() * this.clientTestimonials.length)
        ];

      const postText = `✨ CLIENT SUCCESS STORY ✨

"${testimonial.quote}"

${testimonial.result ? `🎯 Results: ${testimonial.result}` : ""}

Service: ${testimonial.service}
- ${testimonial.client}

Ready for your transformation? Let's create systems that actually work for YOUR lifestyle! 

#ClientSuccess #OrganizedLife #MontanaOrganizing #ClutterFreeSpaces #TestimonialsThursday`;

      return {
        success: true,
        post: {
          text: postText,
          type: "testimonial",
          hashtags: [
            "#ClientSuccess",
            "#OrganizedLife",
            "#MontanaOrganizing",
            "#ClutterFreeSpaces",
          ],
          callToAction: "Ready for your transformation?",
          photos: [
            {
              suggestion:
                "Before/after photos of similar project (with permission)",
              alt_text: `${testimonial.service} transformation results`,
            },
          ],
        },
      };
    } catch (error) {
      console.error("Testimonial post generation error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate problem-solution focused post
   */
  async generateProblemSolutionPost() {
    try {
      const problemPost =
        this.problemSolutionPosts[
          Math.floor(Math.random() * this.problemSolutionPosts.length)
        ];

      const postText = `🤔 ${problemPost.problem}

💡 ${problemPost.solution}

${problemPost.cta}

DM us or call (406) 551-3364 for your free consultation! 

#ProblemSolved #OrganizingTips #MontanaHomes #ClutterFreeSpaces #OrganizedLiving`;

      return {
        success: true,
        post: {
          text: postText,
          type: "problem_solution",
          hashtags: [
            "#ProblemSolved",
            "#OrganizingTips",
            "#MontanaHomes",
            "#ClutterFreeSpaces",
          ],
          callToAction: problemPost.cta,
          photos: [
            {
              suggestion: "Before photo showing the problem being addressed",
              alt_text: "Common organization challenge",
            },
          ],
        },
      };
    } catch (error) {
      console.error("Problem-solution post generation error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate FAQ educational post
   */
  async generateFAQPost() {
    try {
      const faq =
        this.faqPosts[Math.floor(Math.random() * this.faqPosts.length)];

      const postText = `❓ FREQUENTLY ASKED QUESTION

"${faq.question}"

✅ ${faq.answer}

💡 ${faq.tip}

Have more questions? We love helping Montana families create organized, peaceful homes! 

#FAQ #OrganizingQuestions #MontanaOrganizing #ClutterFreeSpaces #OrganizingEducation`;

      return {
        success: true,
        post: {
          text: postText,
          type: "faq_educational",
          hashtags: [
            "#FAQ",
            "#OrganizingQuestions",
            "#MontanaOrganizing",
            "#ClutterFreeSpaces",
          ],
          callToAction: "Have more questions?",
          photos: [
            {
              suggestion: "Behind-the-scenes photo of organizing process",
              alt_text: "Professional organizing in action",
            },
          ],
        },
      };
    } catch (error) {
      console.error("FAQ post generation error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate before/after transformation post
   */
  async generateTransformationPost() {
    try {
      const transformations = [
        {
          before: "Cluttered garage with items everywhere",
          after: "Organized zones with labeled storage systems",
          timeframe: "1 day",
          impact: "Client can now park their car AND find everything easily!",
        },
        {
          before: "RV storage chaos taking 3+ hours to pack",
          after: "Everything has a designated spot with quick-access systems",
          timeframe: "4 hours",
          impact: "Packing time reduced to 30 minutes!",
        },
        {
          before: "Kitchen cabinets were a black hole of lost items",
          after: "Clear containers, lazy susans, and strategic placement",
          timeframe: "6 hours",
          impact: "Cooking is now enjoyable instead of stressful!",
        },
        {
          before: "Master closet - nothing could be found, clothes everywhere",
          after: "Streamlined wardrobe with visibility systems",
          timeframe: "1 day",
          impact: "Getting ready takes 5 minutes instead of 20!",
        },
      ];

      const transformation =
        transformations[Math.floor(Math.random() * transformations.length)];

      const postText = `🔄 TRANSFORMATION THURSDAY

BEFORE: ${transformation.before}

AFTER: ${transformation.after}

⏱️ Time Investment: ${transformation.timeframe}
🎯 Client Impact: ${transformation.impact}

Every space has potential - even the most chaotic rooms can become functional and beautiful! 

Ready for your transformation? Let's make it happen! 💪

#TransformationThursday #BeforeAndAfter #OrganizedSpaces #MontanaOrganizing #ClutterFreeSpaces`;

      return {
        success: true,
        post: {
          text: postText,
          type: "transformation",
          hashtags: [
            "#TransformationThursday",
            "#BeforeAndAfter",
            "#OrganizedSpaces",
            "#MontanaOrganizing",
          ],
          callToAction: "Ready for your transformation?",
          photos: [
            {
              suggestion: "Split image showing before/after of similar project",
              alt_text: "Before and after organization transformation",
            },
          ],
        },
      };
    } catch (error) {
      console.error("Transformation post generation error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current season for content
   */
  getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "fall";
    return "winter";
  }

  /**
   * Generate business hours updates for holidays
   */
  getHolidayHours() {
    const holidays = {
      "2025-01-01": { name: "New Year's Day", hours: "closed" },
      "2025-07-04": { name: "Independence Day", hours: "closed" },
      "2025-11-28": { name: "Thanksgiving", hours: "closed" },
      "2025-11-29": { name: "Day after Thanksgiving", hours: "10:00-14:00" },
      "2025-12-24": { name: "Christmas Eve", hours: "9:00-12:00" },
      "2025-12-25": { name: "Christmas Day", hours: "closed" },
      "2025-12-31": { name: "New Year's Eve", hours: "9:00-15:00" },
    };

    return holidays;
  }

  /**
   * Generate customer success stories (anonymized)
   */
  generateSuccessStories() {
    return [
      {
        type: "RV Organization",
        story:
          "Helped a Montana family maximize their RV storage for a cross-country adventure. Now they have a place for everything and can set up camp in minutes! 🚐✨",
        outcome: "3x more storage space, stress-free travel prep",
      },
      {
        type: "Garage Transformation",
        story:
          "Transformed a garage from storage nightmare to functional workshop and parking space. The homeowner can now actually park inside AND find all their tools! 🔧🏠",
        outcome: "Reclaimed 2-car garage, organized workshop area",
      },
      {
        type: "Whole House Overhaul",
        story:
          "Worked with a busy family to create systems throughout their entire home. Now morning routines are smooth and everyone knows where everything belongs! 👨‍👩‍👧‍👦🏡",
        outcome: "Reduced morning stress, functional family systems",
      },
      {
        type: "Single Room Focus",
        story:
          "Organized a home office that had become a catch-all room. The client now has a productive workspace and can work from home effectively! 💻📚",
        outcome: "Functional workspace, increased productivity",
      },
    ];

    // Daily themed posting schedule
    this.weeklySchedule = {
      0: {
        // Sunday - Motivation Monday Prep
        theme: "sunday_prep",
        postType: "motivation",
        focus: "Week preparation and goal setting",
      },
      1: {
        // Monday - Motivation Monday
        theme: "motivation_monday",
        postType: "motivation",
        focus: "Inspirational organizing content to start the week",
      },
      2: {
        // Tuesday - Tip Tuesday
        theme: "tip_tuesday",
        postType: "tip",
        focus: "Practical organizing tips and hacks",
      },
      3: {
        // Wednesday - Wisdom Wednesday
        theme: "wisdom_wednesday",
        postType: "faq",
        focus: "Educational content and expert advice",
      },
      4: {
        // Thursday - Transformation Thursday
        theme: "transformation_thursday",
        postType: "transformation",
        focus: "Before/after stories and dramatic changes",
      },
      5: {
        // Friday - Feature Friday
        theme: "feature_friday",
        postType: "testimonial",
        focus: "Client success stories and reviews",
      },
      6: {
        // Saturday - Solutions Saturday
        theme: "solutions_saturday",
        postType: "problemSolution",
        focus: "Problem-focused content addressing pain points",
      },
    };

    // Daily motivational content for Sundays and Mondays
    this.motivationalDaily = {
      sunday: [
        "Sunday Reset: Take 15 minutes today to prepare your spaces for a successful week ahead! 🌟",
        "Sunday Planning: An organized week starts with Sunday preparation. What's your organizing goal this week? 📋",
        "Weekend Wrap-Up: Spend Sunday evening resetting your home for Monday morning success! ✨",
        "Sunday Reflection: Look at the organized spaces you've created this week. Feel proud of your progress! 💪",
        "Preparation Day: Use Sunday to set yourself up for an organized, stress-free week ahead 🎯",
      ],
      monday: [
        "Monday Motivation: You've got this! Start your week with one organized space and watch the momentum build 🚀",
        "Fresh Start Monday: New week, new opportunities to create the organized home you deserve! 💜",
        "Monday Mindset: Organization isn't about perfection - it's about creating systems that work for YOUR life 🏡",
        "Week Ahead: This Monday, choose one space to focus on. Small steps lead to big transformations! ⭐",
        "Monday Magic: The most organized homes started with one small step on a Monday morning ✨",
      ],
    };
  }

  /**
   * Generate daily themed post based on day of week
   */
  async generateDailyPost(dayOfWeek = null) {
    try {
      // Use provided day or current day
      const today = dayOfWeek !== null ? dayOfWeek : new Date().getDay();
      const schedule = this.weeklySchedule[today];

      let post;

      // Generate post based on scheduled theme
      switch (schedule.postType) {
        case "motivation":
          if (today === 0) {
            // Sunday
            post = await this.generateSundayPrep();
          } else {
            // Monday
            post = await this.generateMondayMotivation();
          }
          break;
        case "tip":
          post = await this.generateTipPost();
          break;
        case "faq":
          post = await this.generateFAQPost();
          break;
        case "transformation":
          post = await this.generateTransformationPost();
          break;
        case "testimonial":
          post = await this.generateTestimonialPost();
          break;
        case "problemSolution":
          post = await this.generateProblemSolutionPost();
          break;
        default:
          post = await this.generateSeasonalPost();
      }

      if (post.success) {
        post.post.scheduledTheme = schedule.theme;
        post.post.dayOfWeek = today;
        post.post.themeFocus = schedule.focus;
      }

      return post;
    } catch (error) {
      console.error("Daily post generation error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate Sunday preparation motivation post
   */
  async generateSundayPrep() {
    try {
      const sundayContent = this.motivationalDaily.sunday;
      const randomContent =
        sundayContent[Math.floor(Math.random() * sundayContent.length)];

      const season = this.getCurrentSeason();
      const seasonalHashtags = this.seasonalContent[season].hashtags.slice(
        0,
        3,
      );

      const postText = `🗓️ SUNDAY RESET

${randomContent}

This ${season} season is perfect for creating organized systems that last! What organizing goal will you tackle this week?

Ready to make real progress? We're here to help! 💜

#SundayReset #OrganizingGoals #MontanaOrganizing #ClutterFreeSpaces ${seasonalHashtags.join(" ")}`;

      return {
        success: true,
        post: {
          text: postText,
          type: "sunday_prep",
          hashtags: [
            "#SundayReset",
            "#OrganizingGoals",
            "#MontanaOrganizing",
            "#ClutterFreeSpaces",
            ...seasonalHashtags,
          ],
          callToAction: "Ready to make real progress?",
          photos: [
            {
              suggestion: "Text-based graphic with weekly planning theme",
              alt_text: "Sunday preparation and weekly planning motivation",
            },
          ],
        },
      };
    } catch (error) {
      console.error("Sunday prep post generation error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate Monday motivation post
   */
  async generateMondayMotivation() {
    try {
      const mondayContent = this.motivationalDaily.monday;
      const randomContent =
        mondayContent[Math.floor(Math.random() * mondayContent.length)];

      const season = this.getCurrentSeason();
      const seasonalHashtags = this.seasonalContent[season].hashtags.slice(
        0,
        3,
      );

      const postText = `💪 MOTIVATION MONDAY

${randomContent}

This week in Montana, let's create spaces that support your goals and make daily life easier!

Start with just 10 minutes today - you'll be amazed what you can accomplish! 

#MotivationMonday #OrganizedLife #MontanaOrganizing #ClutterFreeSpaces ${seasonalHashtags.join(" ")}`;

      return {
        success: true,
        post: {
          text: postText,
          type: "monday_motivation",
          hashtags: [
            "#MotivationMonday",
            "#OrganizedLife",
            "#MontanaOrganizing",
            "#ClutterFreeSpaces",
            ...seasonalHashtags,
          ],
          callToAction: "Start with just 10 minutes today",
          photos: [
            {
              suggestion: "Motivational text-based graphic with Monday theme",
              alt_text: "Monday motivation for organizing and productivity",
            },
          ],
        },
      };
    } catch (error) {
      console.error("Monday motivation post generation error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate testimonial post from client reviews
   */
  async generateTestimonialPost() {
    try {
      const testimonial =
        this.clientTestimonials[
          Math.floor(Math.random() * this.clientTestimonials.length)
        ];

      const postText = `✨ CLIENT SUCCESS STORY ✨

"${testimonial.quote}"

${testimonial.result ? `🎯 Results: ${testimonial.result}` : ""}

Service: ${testimonial.service}
- ${testimonial.client}

Ready for your transformation? Let's create systems that actually work for YOUR lifestyle! 

#ClientSuccess #OrganizedLife #MontanaOrganizing #ClutterFreeSpaces #TestimonialsThursday`;

      return {
        success: true,
        post: {
          text: postText,
          type: "testimonial",
          hashtags: [
            "#ClientSuccess",
            "#OrganizedLife",
            "#MontanaOrganizing",
            "#ClutterFreeSpaces",
          ],
          callToAction: "Ready for your transformation?",
          photos: [
            {
              suggestion:
                "Before/after photos of similar project (with permission)",
              alt_text: `${testimonial.service} transformation results`,
            },
          ],
        },
      };
    } catch (error) {
      console.error("Testimonial post generation error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate problem-solution focused post
   */
  async generateProblemSolutionPost() {
    try {
      const problemPost =
        this.problemSolutionPosts[
          Math.floor(Math.random() * this.problemSolutionPosts.length)
        ];

      const postText = `🤔 ${problemPost.problem}

💡 ${problemPost.solution}

${problemPost.cta}

DM us or call (406) 551-3364 for your free consultation! 

#ProblemSolved #OrganizingTips #MontanaHomes #ClutterFreeSpaces #OrganizedLiving`;

      return {
        success: true,
        post: {
          text: postText,
          type: "problem_solution",
          hashtags: [
            "#ProblemSolved",
            "#OrganizingTips",
            "#MontanaHomes",
            "#ClutterFreeSpaces",
          ],
          callToAction: problemPost.cta,
          photos: [
            {
              suggestion: "Before photo showing the problem being addressed",
              alt_text: "Common organization challenge",
            },
          ],
        },
      };
    } catch (error) {
      console.error("Problem-solution post generation error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate FAQ educational post
   */
  async generateFAQPost() {
    try {
      const faq =
        this.faqPosts[Math.floor(Math.random() * this.faqPosts.length)];

      const postText = `❓ FREQUENTLY ASKED QUESTION

"${faq.question}"

✅ ${faq.answer}

💡 ${faq.tip}

Have more questions? We love helping Montana families create organized, peaceful homes! 

#FAQ #OrganizingQuestions #MontanaOrganizing #ClutterFreeSpaces #OrganizingEducation`;

      return {
        success: true,
        post: {
          text: postText,
          type: "faq_educational",
          hashtags: [
            "#FAQ",
            "#OrganizingQuestions",
            "#MontanaOrganizing",
            "#ClutterFreeSpaces",
          ],
          callToAction: "Have more questions?",
          photos: [
            {
              suggestion: "Behind-the-scenes photo of organizing process",
              alt_text: "Professional organizing in action",
            },
          ],
        },
      };
    } catch (error) {
      console.error("FAQ post generation error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate before/after transformation post
   */
  async generateTransformationPost() {
    try {
      const transformations = [
        {
          before: "Cluttered garage with items everywhere",
          after: "Organized zones with labeled storage systems",
          timeframe: "1 day",
          impact: "Client can now park their car AND find everything easily!",
        },
        {
          before: "RV storage chaos taking 3+ hours to pack",
          after: "Everything has a designated spot with quick-access systems",
          timeframe: "4 hours",
          impact: "Packing time reduced to 30 minutes!",
        },
        {
          before: "Kitchen cabinets were a black hole of lost items",
          after: "Clear containers, lazy susans, and strategic placement",
          timeframe: "6 hours",
          impact: "Cooking is now enjoyable instead of stressful!",
        },
        {
          before: "Master closet - nothing could be found, clothes everywhere",
          after: "Streamlined wardrobe with visibility systems",
          timeframe: "1 day",
          impact: "Getting ready takes 5 minutes instead of 20!",
        },
      ];

      const transformation =
        transformations[Math.floor(Math.random() * transformations.length)];

      const postText = `🔄 TRANSFORMATION THURSDAY

BEFORE: ${transformation.before}

AFTER: ${transformation.after}

⏱️ Time Investment: ${transformation.timeframe}
🎯 Client Impact: ${transformation.impact}

Every space has potential - even the most chaotic rooms can become functional and beautiful! 

Ready for your transformation? Let's make it happen! 💪

#TransformationThursday #BeforeAndAfter #OrganizedSpaces #MontanaOrganizing #ClutterFreeSpaces`;

      return {
        success: true,
        post: {
          text: postText,
          type: "transformation",
          hashtags: [
            "#TransformationThursday",
            "#BeforeAndAfter",
            "#OrganizedSpaces",
            "#MontanaOrganizing",
          ],
          callToAction: "Ready for your transformation?",
          photos: [
            {
              suggestion: "Split image showing before/after of similar project",
              alt_text: "Before and after organization transformation",
            },
          ],
        },
      };
    } catch (error) {
      console.error("Transformation post generation error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current season for content
   */
  getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "fall";
    return "winter";
  }

  /**
   * Generate photo upload suggestions
   */
  getPhotoStrategies() {
    return {
      weekly: [
        "Before and after shots (always blur personal items)",
        "Team photos at completed projects",
        "Organized systems in action",
        "Happy client reactions (with permission)",
      ],
      seasonal: [
        "Holiday decoration storage solutions",
        "Seasonal gear organization",
        "RV prep for different seasons",
        "Garage organization for seasonal activities",
      ],
      behind_the_scenes: [
        "Organization products we love",
        "The organizing process in action",
        "Client consultation moments",
        "Chanel working on projects",
      ],
    };
  }
}

module.exports = new GMBEnhancementService();
