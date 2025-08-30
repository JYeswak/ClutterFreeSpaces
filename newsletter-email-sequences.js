/**
 * ClutterFreeSpaces Email Sequences
 * Segmented email campaigns based on lead scores
 * Montana RV-specific content with progressive value building
 */

const emailSequences = {
  // HOT LEADS (Score 75+) - 5 emails over 10 days
  hotLeads: {
    metadata: {
      segment: "HOT_LEADS",
      scoreRange: "75+",
      totalEmails: 5,
      duration: "10 days",
      cadence: [0, 2, 4, 7, 10], // Days to send
    },
    emails: [
      {
        id: "hot_email_1",
        day: 0,
        subject:
          "{{first_name}}, your {{rv_type}} organization score says you're READY!",
        preheader: "Skip the overwhelm - here's your fast-track solution",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                Welcome to Your Clutter-Free Journey, {{first_name}}!
              </h1>
              
              <p>Your quiz results show you're scoring 75+ - that means you're already motivated and ready for serious change in your {{rv_type}}.</p>
              
              <p>Here's what I've learned after helping 200+ RVers across Montana's highways: the difference between those who succeed and those who stay stuck isn't motivation (you've got that!) - it's having the RIGHT system.</p>
              
              <div style="background: #f4f1e8; padding: 20px; border-left: 4px solid #8b4513; margin: 25px 0;">
                <h3 style="color: #8b4513; margin-top: 0;">Your Biggest Challenge: {{challenge}}</h3>
                <p>I've created a specific action plan for this exact issue. It's not generic advice - it's what works in the cramped quarters of Montana RV life.</p>
              </div>
              
              <p>Tomorrow, I'm sending you the "Montana RV Quick-Win Checklist" - 7 items you can tackle in under 2 hours that will give you immediate breathing room. These aren't the obvious tips everyone shares.</p>
              
              <p>But first, I want to give you something even more valuable...</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{book_consultation_url}}" style="background: #8b4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Book Your Free 30-Minute Consultation
                </a>
              </div>
              
              <p>On this call, we'll map out exactly how to transform your {{rv_type}} from chaos to calm - without buying expensive organizers or cramming everything into tiny spaces.</p>
              
              <p>Keep an eye out for tomorrow's checklist!</p>
              
              <p>Best,<br>Chanel Basolo<br><em>Montana RV Organization Specialist</em></p>
            </div>
          `,
        },
      },
      {
        id: "hot_email_2",
        day: 2,
        subject:
          "{{first_name}}, your Montana RV Quick-Win Checklist (2-hour transformation)",
        preheader: "7 items that create instant breathing room",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                Your 2-Hour {{rv_type}} Transformation Checklist
              </h1>
              
              <p>Hi {{first_name}},</p>
              
              <p>As promised, here's your Montana RV Quick-Win Checklist. I've tested these with RVers from Glacier to Yellowstone, and they work whether you're parked at a KOA or boondocking in the Beartooths.</p>
              
              <div style="background: #f4f1e8; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #8b4513; margin-top: 0;">✓ Montana RV Quick-Win Checklist</h3>
                <ul style="padding-left: 20px;">
                  <li><strong>The 15-Minute Purge:</strong> Remove 1 item from each storage compartment that hasn't been used in 30 days</li>
                  <li><strong>Vertical Victory:</strong> Install 3 Command strips on cabinet doors for lightweight items</li>
                  <li><strong>The Montana Method:</strong> Create one "launch pad" near your door for keys, sunglasses, and daily essentials</li>
                  <li><strong>Counter Commandment:</strong> Clear all horizontal surfaces except coffee maker and one decorative item</li>
                  <li><strong>Bedside Bliss:</strong> Limit nightstand to 3 items max (including lamp)</li>
                  <li><strong>Galley Grace:</strong> Store only THIS week's meals - everything else goes to overflow storage</li>
                  <li><strong>The 5-Minute Rule:</strong> Set timer for 5 minutes and tackle your biggest {{challenge}} hot spot</li>
                </ul>
              </div>
              
              <p><strong>Montana Reality Check:</strong> Don't try to do all 7 at once. Pick the THREE that address your {{challenge}} directly. That's how you build momentum without burnout.</p>
              
              <p>I'm curious - which of these resonates most with your current {{rv_type}} situation? Hit reply and let me know. I read every email and often share solutions in future newsletters (with permission, of course).</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{book_consultation_url}}" style="background: #8b4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Get Your Custom Organization Plan
                </a>
              </div>
              
              <p>Tomorrow: Why the "one-size-fits-all" RV organization advice fails in Montana (and what works instead).</p>
              
              <p>Happy organizing!<br>Sarah</p>
            </div>
          `,
        },
      },
      {
        id: "hot_email_3",
        day: 4,
        subject:
          "Why RV organization advice fails in Montana (the altitude factor)",
        preheader: "Most experts miss this crucial detail",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                The Montana Factor Most "Experts" Miss
              </h1>
              
              <p>{{first_name}},</p>
              
              <p>Yesterday, a client called me from her {{rv_type}} parked at 6,000 feet near Big Sky. She'd tried every Pinterest organization hack and YouTube tutorial.</p>
              
              <p>Nothing worked.</p>
              
              <p>Here's why: Most RV organization advice comes from people who've never dealt with Montana's unique challenges...</p>
              
              <div style="background: #e8f4f8; padding: 20px; border-left: 4px solid #2980b9; margin: 25px 0;">
                <h3 style="color: #2980b9; margin-top: 0;">Montana RV Reality:</h3>
                <ul style="padding-left: 20px; margin-bottom: 0;">
                  <li><strong>Altitude pressure changes</strong> - Your sealed containers pop open, creating messes</li>
                  <li><strong>Temperature swings</strong> - 40°F differences between day/night mean things expand and contract</li>
                  <li><strong>Wind loads</strong> - Everything needs to be SECURED, not just organized</li>
                  <li><strong>Limited resupply</strong> - You can't just "run to Target" when 200 miles from the nearest town</li>
                  <li><strong>Dust infiltration</strong> - Open storage solutions become dirt magnets</li>
                </ul>
              </div>
              
              <p>That's why your {{challenge}} issue isn't just about finding more space - it's about creating systems that work with Montana's environment, not against it.</p>
              
              <p><strong>Case Study:</strong> My client Sarah (different Sarah!) had the same {{challenge}} struggle in her {{rv_type}}. After we implemented the Montana-specific solutions, she emailed me from Glacier National Park: "I actually ENJOY being inside now. Everything stays put, even on washboard roads!"</p>
              
              <p>The secret isn't buying more organizers. It's understanding the 3 pillars of Montana RV organization:</p>
              
              <ol style="padding-left: 20px;">
                <li><strong>Altitude-Proof Storage</strong> - Solutions that work at sea level AND 7,000 feet</li>
                <li><strong>Wind-Resistant Systems</strong> - Everything secured for those Chinook winds</li>
                <li><strong>Remote-Ready Planning</strong> - Self-sufficient organization for weeks between towns</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{consultation_url}}" style="background: #8b4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Apply These 3 Pillars to Your {{rv_type}}
                </a>
              </div>
              
              <p>Next email: The "Montana Maintenance Method" - how to keep your organization systems working with minimal daily effort.</p>
              
              <p>Chanel Basolo<br><em>Montana RV Organization Specialist</em></p>
            </div>
          `,
        },
      },
      {
        id: "hot_email_4",
        day: 7,
        subject:
          "{{first_name}}, the 10-minute daily system that prevents RV chaos",
        preheader: "Montana Maintenance Method revealed",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                The Montana Maintenance Method
              </h1>
              
              <p>{{first_name}},</p>
              
              <p>Here's a truth bomb: Organization isn't a one-time event. It's a daily practice.</p>
              
              <p>But here's the good news: In your {{rv_type}}, it only takes 10 minutes a day when you do it right.</p>
              
              <p>I call it the Montana Maintenance Method, and it's designed specifically for RV life where:</p>
              <ul style="padding-left: 20px;">
                <li>You're living in 200-400 square feet</li>
                <li>Everything serves multiple purposes</li>
                <li>Clutter multiplies faster than prairie dogs</li>
                <li>Your {{challenge}} can derail your entire day if left unchecked</li>
              </ul>
              
              <div style="background: #f4f1e8; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #8b4513; margin-top: 0;">🏔️ The 10-Minute Montana Method</h3>
                <p><strong>Minutes 1-3: The Montana Sweep</strong><br>
                One lap through your {{rv_type}}, returning 5 items to their homes</p>
                
                <p><strong>Minutes 4-6: The Challenge Check</strong><br>
                Specifically address your {{challenge}} - just one small action</p>
                
                <p><strong>Minutes 7-8: The Weather Prep</strong><br>
                Secure anything that could shift with Montana's sudden weather changes</p>
                
                <p><strong>Minutes 9-10: The Tomorrow Setup</strong><br>
                Prepare 3 items you'll need first thing tomorrow</p>
              </div>
              
              <p><strong>Real Talk:</strong> This sounds simple because it IS simple. But simple doesn't mean easy. The challenge is building the habit, especially when you're tired from a day of Montana adventuring.</p>
              
              <p>That's why I created the complete Montana RV Organization System with habit trackers, checklists, and troubleshooting guides for when life gets in the way.</p>
              
              <p>My most successful clients - the ones still organized 6 months later - use this daily method religiously. It becomes as automatic as checking the weather before heading out.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{consultation_url}}" style="background: #8b4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Get the Complete Montana RV System
                </a>
              </div>
              
              <p>One last email coming tomorrow with your final decision point...</p>
              
              <p>Sarah</p>
            </div>
          `,
        },
      },
      {
        id: "hot_email_5",
        day: 10,
        subject: "{{first_name}}, it's decision time for your {{rv_type}}",
        preheader: "The window for transformation is now",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                Your Moment of Truth, {{first_name}}
              </h1>
              
              <p>It's been 10 days since you scored 75+ on the RV organization quiz.</p>
              
              <p>You've received the Montana Quick-Win Checklist, learned why generic advice fails at altitude, and discovered the 10-minute daily method.</p>
              
              <p>Now comes the moment that separates the dreamers from the doers.</p>
              
              <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0;">
                <h3 style="color: #856404; margin-top: 0;">Two Paths Forward:</h3>
                <p><strong>Path 1:</strong> File these emails away, thinking "I'll deal with my {{challenge}} later." Six months from now, you're still frustrated with your {{rv_type}}, still avoiding certain storage areas, still feeling overwhelmed.</p>
                
                <p><strong>Path 2:</strong> Take decisive action. Book your consultation. Get a custom plan. Transform your space in the next 30 days.</p>
              </div>
              
              <p>{{first_name}}, your high quiz score tells me you're already motivated. You KNOW you need to make a change. The question is: will you act on that knowledge?</p>
              
              <p>Here's what happens on our consultation:</p>
              <ul style="padding-left: 20px;">
                <li><strong>Minutes 1-5:</strong> We assess your specific {{rv_type}} layout and {{challenge}} situation</li>
                <li><strong>Minutes 6-15:</strong> I walk you through the exact system that will work for YOUR space</li>
                <li><strong>Minutes 16-20:</strong> You get a clear 30-day action plan, regardless of whether we work together</li>
              </ul>
              
              <p><strong>Zero pressure. Maximum value.</strong> Even if you never hire me, you'll leave with clarity on exactly how to solve your organization challenges.</p>
              
              <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p style="margin-bottom: 15px; font-size: 18px; color: #8b4513; font-weight: bold;">
                  Ready to Transform Your {{rv_type}}?
                </p>
                <a href="{{consultation_url}}" style="background: #8b4513; color: white; padding: 18px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 18px;">
                  Book Your Free Breakthrough Call
                </a>
                <p style="margin-top: 15px; font-size: 14px; color: #666;">
                  No sales pitch. Just solutions.
                </p>
              </div>
              
              <p>This is your final email in this series. Make it count.</p>
              
              <p>To your organized adventure,<br>Chanel Basolo<br><em>Montana RV Organization Specialist</em></p>
              
              <p style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
                P.S. If you're not ready for a call but want to stay connected, you'll continue receiving my weekly Montana RV tips newsletter. But the intensive transformation guidance ends here.
              </p>
            </div>
          `,
        },
      },
    ],
  },

  // WARM LEADS (Score 50-74) - 5 emails over 21 days
  warmLeads: {
    metadata: {
      segment: "WARM_LEADS",
      scoreRange: "50-74",
      totalEmails: 5,
      duration: "21 days",
      cadence: [0, 3, 7, 14, 21], // Days to send
    },
    emails: [
      {
        id: "warm_email_1",
        day: 0,
        subject:
          "{{first_name}}, your {{rv_type}} organization journey starts here",
        preheader: "Small steps lead to big transformations",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                Welcome to Your Clutter-Free Journey, {{first_name}}!
              </h1>
              
              <p>Your quiz results show you're in that sweet spot - motivated enough to take action, but maybe feeling a bit overwhelmed about where to start with your {{rv_type}}.</p>
              
              <p>Good news: You're in the perfect place to build lasting change.</p>
              
              <p>I've helped hundreds of RVers across Montana, and the ones who succeed long-term aren't always the most motivated at the start. They're the ones who take consistent, small steps.</p>
              
              <div style="background: #f4f1e8; padding: 20px; border-left: 4px solid #8b4513; margin: 25px 0;">
                <h3 style="color: #8b4513; margin-top: 0;">Your Biggest Challenge: {{challenge}}</h3>
                <p>I see this issue constantly with {{rv_type}} owners. The solution isn't what most people think - it's not about finding more storage or buying more organizers.</p>
                <p>It's about creating systems that work with your natural habits, not against them.</p>
              </div>
              
              <p>Over the next 3 weeks, I'm going to share exactly how to tackle your {{challenge}} using methods designed specifically for Montana RV life.</p>
              
              <p><strong>Here's what's coming:</strong></p>
              <ul style="padding-left: 20px;">
                <li>The "15-Minute Rule" that prevents overwhelm</li>
                <li>Montana-specific storage solutions that actually work</li>
                <li>The psychology behind why organization attempts fail (and how to break the cycle)</li>
                <li>Real case studies from {{rv_type}} owners with your exact challenge</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{quiz_url}}" style="background: #8b4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Retake the Quiz for Updated Tips
                </a>
              </div>
              
              <p>First assignment (if you're ready): Pick ONE area in your {{rv_type}} that's been bugging you. Just one. We'll tackle it step-by-step.</p>
              
              <p>More soon,<br>Chanel Basolo<br><em>Montana RV Organization Specialist</em></p>
            </div>
          `,
        },
      },
      {
        id: "warm_email_2",
        day: 3,
        subject:
          "The 15-minute rule that changed everything for {{first_name}}",
        preheader: "Why small chunks beat marathon sessions",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                The 15-Minute Rule
              </h1>
              
              <p>Hi {{first_name}},</p>
              
              <p>Last weekend, I was camping at Yellowstone when a fellow RVer approached my campsite. Her {{rv_type}} was beautiful from the outside, but she confessed she was embarrassed to invite anyone in.</p>
              
              <p>"I keep planning these huge organization days," she said, "but I get overwhelmed and give up."</p>
              
              <p>Sound familiar?</p>
              
              <p>Here's the secret that changed everything for her (and can for you too):</p>
              
              <div style="background: #e8f4f8; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #2980b9; margin-top: 0;">🕐 The Montana 15-Minute Rule</h3>
                <p><strong>Instead of planning marathon organization sessions, commit to just 15 minutes.</strong></p>
                
                <ul style="padding-left: 20px;">
                  <li>Set a timer for exactly 15 minutes</li>
                  <li>Focus on ONE specific area (like your kitchen counter or one cabinet)</li>
                  <li>When the timer goes off, STOP - even if you want to keep going</li>
                  <li>Celebrate the progress, no matter how small</li>
                </ul>
              </div>
              
              <p><strong>Why this works so well for your {{challenge}}:</strong></p>
              <p>Your brain doesn't resist 15 minutes. It's not scary. But here's the magic - once you start, you often want to continue. And if you don't? That's fine too. You still made progress.</p>
              
              <p><strong>This week's challenge:</strong> Set aside 15 minutes for 3 different days. Address your {{challenge}} in small bites. Don't worry about perfection.</p>
              
              <div style="background: #f4f1e8; padding: 20px; border-left: 4px solid #8b4513; margin: 25px 0;">
                <h3 style="color: #8b4513; margin-top: 0;">{{rv_type}} Specific Tip:</h3>
                <p>For your {{challenge}}, start with the most visible area first. Quick wins build momentum faster than tackling the "worst" spot.</p>
              </div>
              
              <p>Next email: The psychology behind why we avoid certain areas of our RV (and how to break that pattern).</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{newsletter_archive_url}}" style="background: #2980b9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Browse More RV Organization Tips
                </a>
              </div>
              
              <p>Happy organizing!<br>Sarah</p>
            </div>
          `,
        },
      },
      {
        id: "warm_email_3",
        day: 7,
        subject:
          "Why you avoid certain areas of your {{rv_type}} (psychology exposed)",
        preheader: "The avoidance pattern and how to break it",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                The Avoidance Pattern
              </h1>
              
              <p>{{first_name}},</p>
              
              <p>Be honest with me: Is there a cabinet, closet, or storage area in your {{rv_type}} that you actively avoid opening?</p>
              
              <p>Maybe it's where your {{challenge}} is worst. Maybe it's that one spot that makes you feel defeated every time you see it.</p>
              
              <p>You're not broken. You're human.</p>
              
              <p>This is what psychologists call "avoidance behavior," and it happens to 90% of my clients. The good news? Once you understand it, you can break free from it.</p>
              
              <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0;">
                <h3 style="color: #856404; margin-top: 0;">The Avoidance Cycle:</h3>
                <ol style="padding-left: 20px; margin-bottom: 0;">
                  <li><strong>Mess accumulates</strong> in one area</li>
                  <li><strong>You feel overwhelmed</strong> when you see it</li>
                  <li><strong>You avoid the area</strong> to avoid the feeling</li>
                  <li><strong>Mess gets worse</strong> because you're not dealing with it</li>
                  <li><strong>Shame increases</strong>, making avoidance stronger</li>
                </ol>
              </div>
              
              <p>In the tight quarters of RV living, this cycle is especially brutal. You can't just "close the door" on problem areas - you live with them every day.</p>
              
              <p><strong>Here's how to break the cycle:</strong></p>
              
              <div style="background: #e8f4f8; padding: 20px; border-left: 4px solid #2980b9; margin: 25px 0;">
                <h3 style="color: #2980b9; margin-top: 0;">The 3-Step Avoidance Breaker</h3>
                <p><strong>Step 1: The 30-Second Look</strong><br>
                Just open the problem area and look for 30 seconds. Don't do anything. Just observe without judgment.</p>
                
                <p><strong>Step 2: The One-Item Victory</strong><br>
                Remove just ONE item. Something obvious - trash, something that belongs somewhere else, or something you definitely don't need.</p>
                
                <p><strong>Step 3: The Celebration</strong><br>
                Acknowledge that you faced the avoided area. That's huge! Many people never get this far.</p>
              </div>
              
              <p>For your specific {{challenge}} in your {{rv_type}}, this approach removes the pressure. You're not trying to solve everything at once - you're just breaking the avoidance pattern.</p>
              
              <p><strong>Client Success Story:</strong> Maria had avoided her bedroom storage for 8 months. After using this method for just one week, she cleaned and reorganized the entire area. "I couldn't believe I'd been so afraid of it," she told me.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{consultation_url}}" style="background: #8b4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Get Personal Help Breaking Your Avoidance Pattern
                </a>
              </div>
              
              <p>Next week: Montana-specific storage solutions that actually work (not Pinterest fantasies).</p>
              
              <p>You've got this,<br>Sarah</p>
            </div>
          `,
        },
      },
      {
        id: "warm_email_4",
        day: 14,
        subject:
          "Montana storage solutions that actually work (not Pinterest fantasies)",
        preheader: "Real-world tested in Big Sky Country",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                Real Montana Storage Solutions
              </h1>
              
              <p>{{first_name}},</p>
              
              <p>Pinterest is full of beautiful RV organization photos. Instagram too. But I'll bet you've tried some of those "perfect" solutions and they didn't work in your {{rv_type}}.</p>
              
              <p>Here's why: Those solutions weren't tested in Montana.</p>
              
              <p>They weren't tested on washboard forest roads. They weren't tested at 7,000 feet elevation. They weren't tested during 40°F temperature swings or Chinook winds.</p>
              
              <p>I've spent 5 years testing storage solutions across Montana's diverse terrain. Here's what actually works:</p>
              
              <div style="background: #f4f1e8; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #8b4513; margin-top: 0;">🏔️ Montana-Tested Solutions for {{challenge}}:</h3>
                
                <p><strong>For Kitchen Organization:</strong></p>
                <ul style="padding-left: 20px;">
                  <li>Magnetic spice jars (stick to fridge even on rough roads)</li>
                  <li>Nested bowls with silicone lids (altitude-proof sealing)</li>
                  <li>Tension rods in cabinets (adjustable, no drilling required)</li>
                </ul>
                
                <p><strong>For Clothing Storage:</strong></p>
                <ul style="padding-left: 20px;">
                  <li>Compression packing cubes (maximize limited closet space)</li>
                  <li>Over-door shoe organizers (doubles as gear storage)</li>
                  <li>Cedar blocks instead of mothballs (Montana cabin smell!)</li>
                </ul>
                
                <p><strong>For General Clutter:</strong></p>
                <ul style="padding-left: 20px;">
                  <li>Clear, stackable bins with LOCKING lids (elevation changes won't pop them open)</li>
                  <li>Command strips rated for outdoor temps (-20°F to 125°F)</li>
                  <li>Bungee cord nets (secure lightweight items during travel)</li>
                </ul>
              </div>
              
              <p><strong>The {{rv_type}} Reality Check:</strong> Don't buy ALL of these at once. Pick 2-3 that directly address your {{challenge}}. Test them for 2 weeks. Then expand if they're working.</p>
              
              <p>I learned this the hard way after my own RV organization attempt turned into a $500 Container Store shopping spree that didn't solve the real problem.</p>
              
              <div style="background: #e8f4f8; padding: 20px; border-left: 4px solid #2980b9; margin: 25px 0;">
                <h3 style="color: #2980b9; margin-top: 0;">Money-Saving Tip:</h3>
                <p>Before buying ANYTHING, try the "one-week test." Live with your current setup but implement better habits. You might find you don't need as many products as you think.</p>
              </div>
              
              <p>Want to know which of these solutions would work best for your specific {{rv_type}} layout and {{challenge}}? I offer quick consultation calls where we can map out exactly what you need (and more importantly, what you DON'T need).</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{consultation_url}}" style="background: #8b4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Get Your Custom Storage Plan
                </a>
              </div>
              
              <p>Final email coming next week with your path forward...</p>
              
              <p>Sarah</p>
            </div>
          `,
        },
      },
      {
        id: "warm_email_5",
        day: 21,
        subject: "{{first_name}}, your 3-week journey reflection + next steps",
        preheader: "Time to choose your path forward",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                Your 3-Week Journey Reflection
              </h1>
              
              <p>{{first_name}},</p>
              
              <p>Three weeks ago, you took the RV organization quiz and identified your biggest challenge: {{challenge}}.</p>
              
              <p>Since then, you've learned:</p>
              <ul style="padding-left: 20px;">
                <li>✓ The 15-minute rule that prevents overwhelm</li>
                <li>✓ How to break avoidance patterns</li>
                <li>✓ Montana-specific storage solutions that actually work</li>
                <li>✓ Why Pinterest solutions fail in real RV life</li>
              </ul>
              
              <p>Now comes the important question: <strong>What progress have you made?</strong></p>
              
              <div style="background: #f4f1e8; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #8b4513; margin-top: 0;">Honest Self-Assessment:</h3>
                <p><strong>If you've made progress:</strong> Congratulations! You're proving that small, consistent actions create real change. Keep building on this momentum.</p>
                
                <p><strong>If you haven't started yet:</strong> That's okay too. Sometimes we need accountability and a clear system to overcome inertia.</p>
                
                <p><strong>If you started but got stuck:</strong> This is the most common scenario. You're not behind - you're right where most people are.</p>
              </div>
              
              <p>Here's what I've learned from helping 300+ RV owners: <strong>Information alone doesn't create transformation.</strong></p>
              
              <p>You need:</p>
              <ul style="padding-left: 20px;">
                <li>A personalized system designed for your specific {{rv_type}} and {{challenge}}</li>
                <li>Accountability to keep you moving forward</li>
                <li>Troubleshooting support when you hit roadblocks</li>
                <li>Someone who understands Montana RV life</li>
              </ul>
              
              <p>That's exactly what I provide in my "Montana RV Transformation" program. It's a 30-day intensive where we work together to create lasting systems for your {{rv_type}}.</p>
              
              <div style="background: #e8f4f8; padding: 20px; border-left: 4px solid #2980b9; margin: 25px 0;">
                <h3 style="color: #2980b9; margin-top: 0;">What You Get:</h3>
                <ul style="padding-left: 20px; margin-bottom: 0;">
                  <li>Personal assessment of your {{rv_type}} layout</li>
                  <li>Custom organization plan addressing your {{challenge}}</li>
                  <li>Weekly check-ins to track progress and troubleshoot</li>
                  <li>Access to my Montana-tested product recommendations</li>
                  <li>Habit-building support to maintain your systems</li>
                </ul>
              </div>
              
              <p>But first, let's see if you're ready for this level of commitment. Book a free 30-minute consultation where we'll:</p>
              <ol style="padding-left: 20px;">
                <li>Assess your current situation honestly</li>
                <li>Identify the #1 thing holding you back</li>
                <li>Create a clear action plan (regardless of whether we work together)</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p style="margin-bottom: 15px; font-size: 18px; color: #8b4513; font-weight: bold;">
                  Ready for Real Transformation?
                </p>
                <a href="{{consultation_url}}" style="background: #8b4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Book Your Free Breakthrough Call
                </a>
              </div>
              
              <p>{{first_name}}, you've invested 3 weeks learning about RV organization. Now it's time to decide: Will you be the same person 3 months from now, or will you be the person enjoying a beautifully organized {{rv_type}} that serves your Montana adventures?</p>
              
              <p>The choice is yours.</p>
              
              <p>To your organized adventure,<br>Chanel Basolo<br><em>Montana RV Organization Specialist</em></p>
              
              <p style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
                P.S. This is your final email in this series, but you'll continue receiving my weekly Montana RV tips newsletter. If you want more intensive, personalized help, the consultation is your next step.
              </p>
            </div>
          `,
        },
      },
    ],
  },

  // COLD LEADS (Score <50) - 5 emails over 30 days
  coldLeads: {
    metadata: {
      segment: "COLD_LEADS",
      scoreRange: "<50",
      totalEmails: 5,
      duration: "30 days",
      cadence: [0, 5, 12, 21, 30], // Days to send
    },
    emails: [
      {
        id: "cold_email_1",
        day: 0,
        subject:
          "{{first_name}}, small steps toward a more organized {{rv_type}}",
        preheader: "No pressure, just helpful tips when you're ready",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                Welcome, {{first_name}}!
              </h1>
              
              <p>Thank you for taking the RV organization quiz. I know that taking any kind of assessment about organization can feel a little vulnerable.</p>
              
              <p>Your results suggest you might be feeling a bit overwhelmed by the idea of organizing your {{rv_type}}. And you know what? That's completely normal.</p>
              
              <p>I've been working with RV owners across Montana for 5 years, and I've learned something important: <strong>The people who feel most overwhelmed at the beginning often make the most dramatic transformations.</strong></p>
              
              <p>Why? Because once they start, they have the most room for improvement. Every small step feels like a victory.</p>
              
              <div style="background: #f4f1e8; padding: 20px; border-left: 4px solid #8b4513; margin: 25px 0;">
                <h3 style="color: #8b4513; margin-top: 0;">Your Biggest Challenge: {{challenge}}</h3>
                <p>This is one of the most common issues I see, especially in {{rv_type}} layouts. The good news? It's absolutely solvable, and you don't need to tackle it all at once.</p>
              </div>
              
              <p>Over the next month, I'll be sending you gentle, actionable tips specifically designed for people who feel overwhelmed by organization. No pressure, no judgment - just simple strategies when you're ready.</p>
              
              <p><strong>For now, here's one tiny step you can take (or not - no pressure):</strong></p>
              
              <div style="background: #e8f4f8; padding: 20px; border-left: 4px solid #2980b9; margin: 25px 0;">
                <p style="margin-bottom: 0;"><strong>The 5-Minute Experiment:</strong> Set a timer for 5 minutes and remove 5 items from your {{rv_type}} that are obviously trash or don't belong. That's it. No sorting, no deep organizing - just removal.</p>
              </div>
              
              <p>If you do this, notice how you feel afterward. If you don't do it, that's fine too. These emails will be here when you're ready.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{newsletter_archive_url}}" style="background: #8b4513; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Browse RV Tips (No Pressure!)
                </a>
              </div>
              
              <p>More gentle guidance coming in a few days.</p>
              
              <p>Warmly,<br>Chanel Basolo<br><em>Montana RV Organization Specialist</em></p>
            </div>
          `,
        },
      },
      {
        id: "cold_email_2",
        day: 5,
        subject: '{{first_name}}, the story of the "impossibly messy" RV',
        preheader: "Sometimes the best transformations start from rock bottom",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                The "Impossibly Messy" RV
              </h1>
              
              <p>Hi {{first_name}},</p>
              
              <p>I want to tell you about Linda, a client who contacted me two years ago. Her first email said: "Sarah, my RV is impossibly messy. I'm embarrassed to even describe it."</p>
              
              <p>She went on to explain that she'd been living in her {{rv_type}} for 8 months and had never had a single visitor inside. She was too ashamed.</p>
              
              <p>Sound familiar? Maybe not that extreme, but maybe you can relate to feeling overwhelmed by your {{challenge}} situation.</p>
              
              <p>Here's what happened with Linda...</p>
              
              <div style="background: #f4f1e8; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #8b4513; margin-top: 0;">Linda's 6-Month Journey:</h3>
                
                <p><strong>Month 1:</strong> She started with just 5 minutes a day. Some days she didn't even do that. No pressure.</p>
                
                <p><strong>Month 2:</strong> She began to see small improvements. Started feeling less anxious about her space.</p>
                
                <p><strong>Month 3:</strong> Had her first "organized day" where everything felt manageable.</p>
                
                <p><strong>Month 4:</strong> Invited her sister for coffee inside the RV for the first time.</p>
                
                <p><strong>Month 6:</strong> Sent me a photo of her beautifully organized {{rv_type}} with the caption: "I can't believe this is the same space!"</p>
              </div>
              
              <p>The secret wasn't motivation (she had very little at the start). The secret wasn't buying organizers (she spent less than $50 total). The secret was starting impossibly small and building gradually.</p>
              
              <p><strong>For your {{challenge}} specifically:</strong> You don't need to solve it all at once. In fact, trying to do too much too fast is usually what leads to giving up.</p>
              
              <div style="background: #e8f4f8; padding: 20px; border-left: 4px solid #2980b9; margin: 25px 0;">
                <h3 style="color: #2980b9; margin-top: 0;">This Week's Gentle Challenge:</h3>
                <p>Spend just 2 minutes (set a timer!) looking at the area where your {{challenge}} is worst. Don't organize. Don't fix. Just observe.</p>
                <p>Ask yourself: "What's the smallest thing I could improve here?"</p>
                <p>Then do that ONE thing. Or don't. Your choice.</p>
              </div>
              
              <p>Linda's transformation didn't happen because she was special or had more willpower. It happened because she gave herself permission to start small and build slowly.</p>
              
              <p>You can do the same.</p>
              
              <p>Gently yours,<br>Sarah</p>
              
              <p style="font-size: 12px; color: #666; font-style: italic;">
                P.S. If you're feeling inspired and want to share your tiny progress, feel free to reply to this email. I read every message and love celebrating small wins!
              </p>
            </div>
          `,
        },
      },
      {
        id: "cold_email_3",
        day: 12,
        subject:
          "{{first_name}}, why organization advice fails (and what works instead)",
        preheader: "The missing piece most experts ignore",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                Why Organization Advice Fails
              </h1>
              
              <p>{{first_name}},</p>
              
              <p>Have you ever watched a home organization show and thought, "That looks amazing, but it would never work for me"?</p>
              
              <p>You're not wrong.</p>
              
              <p>Most organization advice fails because it ignores one crucial factor: <strong>Your unique living situation and personality.</strong></p>
              
              <p>In your {{rv_type}}, this is especially true. You're dealing with:</p>
              <ul style="padding-left: 20px;">
                <li>Limited square footage</li>
                <li>Multi-purpose spaces</li>
                <li>Constant motion and vibration</li>
                <li>Weather extremes (especially in Montana!)</li>
                <li>Your personal {{challenge}} situation</li>
              </ul>
              
              <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0;">
                <h3 style="color: #856404; margin-top: 0;">The Real Reason Most People Give Up:</h3>
                <p>They try to implement someone else's system instead of creating one that works for THEIR life, THEIR space, and THEIR habits.</p>
              </div>
              
              <p>For example, if you're someone who tends to put things down "just for now" (and we all do this!), a system that requires putting everything away immediately will never work long-term.</p>
              
              <p>Instead, you need systems that work WITH your natural tendencies, not against them.</p>
              
              <div style="background: #f4f1e8; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #8b4513; margin-top: 0;">The "Landing Zone" Strategy</h3>
                <p>Instead of fighting the urge to put things down, create designated "landing zones" where it's OKAY to temporarily place items.</p>
                
                <p><strong>For your {{rv_type}}:</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 0;">
                  <li>A small tray by the door for keys and sunglasses</li>
                  <li>A basket on the counter for mail and small items</li>
                  <li>One chair that's allowed to collect clothes (yes, really!)</li>
                </ul>
                
                <p style="margin-top: 15px;"><strong>The rule:</strong> These zones get "reset" once a day, not constantly maintained.</p>
              </div>
              
              <p>This works because it honors how you naturally behave while still maintaining overall organization.</p>
              
              <p><strong>For your specific {{challenge}}:</strong> Instead of fighting against your current patterns, think about how to create systems that accommodate them while gradually improving them.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{quiz_url}}" style="background: #2980b9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Retake Quiz for More Personalized Tips
                </a>
              </div>
              
              <p>Next email: Simple systems that actually stick (Montana tested!).</p>
              
              <p>Working with your nature, not against it,<br>Sarah</p>
            </div>
          `,
        },
      },
      {
        id: "cold_email_4",
        day: 21,
        subject: "Simple systems that actually stick (Montana tested)",
        preheader: "Practical solutions for real RV life",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                Systems That Actually Stick
              </h1>
              
              <p>{{first_name}},</p>
              
              <p>After 5 years of helping RV owners across Montana, I've learned that the best organization systems have 3 things in common:</p>
              
              <ol style="padding-left: 20px;">
                <li><strong>They're simple</strong> - no complex rules to remember</li>
                <li><strong>They're forgiving</strong> - they work even when you're tired or rushed</li>
                <li><strong>They're flexible</strong> - they adapt to changing needs and seasons</li>
              </ol>
              
              <p>Here are 3 systems I've seen work consistently in {{rv_type}} setups, especially for people dealing with {{challenge}} issues:</p>
              
              <div style="background: #f4f1e8; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #8b4513; margin-top: 0;">🔄 System 1: The Daily Reset</h3>
                <p><strong>What it is:</strong> A 10-minute routine before bed where you return things to their "homes."</p>
                <p><strong>Why it works:</strong> It prevents small messes from becoming big problems.</p>
                <p><strong>Montana bonus:</strong> Your {{rv_type}} is always ready for sudden weather that might keep you inside.</p>
              </div>
              
              <div style="background: #e8f4f8; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #2980b9; margin-top: 0;">📦 System 2: The One-Touch Rule</h3>
                <p><strong>What it is:</strong> When you pick something up, try to deal with it completely rather than moving it to another temporary location.</p>
                <p><strong>Why it works:</strong> Reduces the "shuffle cycle" where items get moved around but never put away.</p>
                <p><strong>{{rv_type}} adaptation:</strong> If you can't deal with it immediately, put it in your designated "landing zone."</p>
              </div>
              
              <div style="background: #f0f8f0; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #27ae60; margin-top: 0;">⚡ System 3: The 5-Minute Friday</h3>
                <p><strong>What it is:</strong> Every Friday, spend 5 minutes addressing whatever area feels most chaotic.</p>
                <p><strong>Why it works:</strong> Regular attention prevents any area from getting completely out of control.</p>
                <p><strong>Perfect for {{challenge}}:</strong> Keeps this issue from building up over time.</p>
              </div>
              
              <p><strong>The key to all three systems:</strong> Start with just ONE. Don't try to implement all three at once. Pick the one that feels most doable for your current situation.</p>
              
              <p>Most of my clients start with the 5-Minute Friday because it feels the least overwhelming. Others prefer the Daily Reset because it creates a calming bedtime routine.</p>
              
              <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0;">
                <h3 style="color: #856404; margin-top: 0;">Remember:</h3>
                <p>The goal isn't perfection. It's progress. A system that you follow 60% of the time is infinitely better than a "perfect" system you never use.</p>
              </div>
              
              <p>If you've been following along with these emails but haven't taken action yet, that's completely normal. Sometimes we need to hear about something several times before we're ready to try it.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{consultation_url}}" style="background: #8b4513; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Want Help Choosing the Right System?
                </a>
              </div>
              
              <p>One more email coming next week with your gentle path forward...</p>
              
              <p>Rooting for your success,<br>Sarah</p>
            </div>
          `,
        },
      },
      {
        id: "cold_email_5",
        day: 30,
        subject:
          "{{first_name}}, your gentle path forward (no pressure, truly)",
        preheader: "Reflecting on your month of possibilities",
        template: {
          html: `
            <div style="max-width: 600px; font-family: Georgia, serif; line-height: 1.6; color: #2c3e50;">
              <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 20px;">
                Your Gentle Path Forward
              </h1>
              
              <p>{{first_name}},</p>
              
              <p>It's been a month since you took the RV organization quiz and identified {{challenge}} as your biggest concern.</p>
              
              <p>During these 30 days, you've received gentle suggestions, inspiring stories, and practical systems. Maybe you've tried some things. Maybe you haven't. Maybe you've bookmarked these emails to read "when you're ready."</p>
              
              <p>All of these responses are perfectly valid.</p>
              
              <div style="background: #f4f1e8; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #8b4513; margin-top: 0;">Here's What I Want You to Know:</h3>
                <p><strong>You're not behind.</strong> You're not failing. You're not "bad at organization."</p>
                <p>You're human, living in a {{rv_type}}, dealing with the unique challenges of RV life in Montana. That's a lot.</p>
                <p>Progress isn't always linear, and it doesn't always look the way we think it should.</p>
              </div>
              
              <p>Some people are ready to dive into organization projects immediately. Others need time to mentally prepare. Others need the right season, or the right mindset, or the right level of support.</p>
              
              <p><strong>Wherever you are is exactly where you should be.</strong></p>
              
              <p>That said, if you're feeling ready to take a next step (even a tiny one), here are your gentlest options:</p>
              
              <div style="background: #e8f4f8; padding: 20px; border-left: 4px solid #2980b9; margin: 25px 0;">
                <h3 style="color: #2980b9; margin-top: 0;">Your Options (Choose One, None, or All):</h3>
                
                <p><strong>Option 1: The Micro-Step</strong><br>
                Spend just 5 minutes this week doing ANYTHING that improves your {{challenge}} situation. Literally anything.</p>
                
                <p><strong>Option 2: The Information Gather</strong><br>
                Browse more organization tips and ideas when you feel like it. No timeline, no pressure.</p>
                
                <p><strong>Option 3: The Support Request</strong><br>
                Book a gentle, no-pressure conversation where we talk through your specific situation and create a plan that works for YOU.</p>
              </div>
              
              <p>If Option 3 interests you, I offer what I call "Clarity Calls" - 20-minute conversations where we focus entirely on understanding your unique situation and creating a realistic plan.</p>
              
              <p>These calls are:</p>
              <ul style="padding-left: 20px;">
                <li>✓ Completely judgment-free</li>
                <li>✓ Tailored to your {{rv_type}} and {{challenge}}</li>
                <li>✓ Focused on YOUR timeline and comfort level</li>
                <li>✓ Valuable whether or not we ever work together</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p style="margin-bottom: 15px; font-size: 16px; color: #8b4513; font-weight: bold;">
                  Ready for a Gentle Conversation?
                </p>
                <a href="{{consultation_url}}" style="background: #8b4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Book Your Clarity Call
                </a>
                <p style="margin-top: 15px; font-size: 12px; color: #666;">
                  No sales pitch. Just understanding and practical next steps.
                </p>
              </div>
              
              <p>{{first_name}}, regardless of what you choose to do next, I want you to know that you took a brave step a month ago by acknowledging that you wanted things to be different in your {{rv_type}}.</p>
              
              <p>That awareness is the first step toward any change. Honor that.</p>
              
              <p>You'll continue receiving my weekly Montana RV tips newsletter with gentle, practical advice. These intensive emails are ending, but I'll still be here, sharing what I've learned from years of helping people create more peaceful, organized spaces.</p>
              
              <p>Whenever you're ready for your next step, I'll be here.</p>
              
              <p>With gentle encouragement,<br>Chanel Basolo<br><em>Montana RV Organization Specialist</em></p>
              
              <p style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
                P.S. If you've found any of these emails helpful, I'd be honored if you shared them with another RV owner who might benefit. Sometimes we all need a gentle reminder that progress comes in many forms.
              </p>
            </div>
          `,
        },
      },
    ],
  },
};

/**
 * SendGrid Dynamic Template Configuration
 * Use these templates with SendGrid's dynamic template feature
 *
 * Personalization tokens to replace:
 * - {{first_name}}: Lead's first name
 * - {{rv_type}}: Type of RV (Class A, Class C, Travel Trailer, etc.)
 * - {{challenge}}: Primary organization challenge identified in quiz
 * - {{quiz_url}}: Link to retake the organization quiz
 * - {{consultation_url}}: Link to book consultation call
 * - {{newsletter_archive_url}}: Link to newsletter archive/blog
 * - {{book_consultation_url}}: Alternative consultation booking link
 *
 * Implementation Notes:
 * 1. Create separate dynamic templates in SendGrid for each sequence
 * 2. Use automation/marketing campaigns to trigger sequences based on lead scores
 * 3. Set up proper delays between emails according to cadence arrays
 * 4. Track open rates, click rates, and conversions for each sequence
 * 5. A/B test subject lines for improved performance
 */

module.exports = emailSequences;
