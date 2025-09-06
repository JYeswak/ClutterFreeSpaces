const sgMail = require("@sendgrid/mail");
const sgClient = require("@sendgrid/client");
require("dotenv").config();

// Set API key
sgMail.setApiKey(process.env.SendGrid_API_Key);
sgClient.setApiKey(process.env.SendGrid_API_Key);

const emailTemplates = [
  {
    name: "Welcome Series - Email 1",
    subject: "{{name}}, Welcome to ClutterFreeSpaces!",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Hi {{name}},</h1>
      
      <p>I'm so excited you're ready to transform your space!</p>
      
      <p>I'm Chanel, and I've helped over 100 Montana families and RVers go from overwhelmed to organized. Whether you're dealing with a cluttered closet or a chaotic RV, I've got you covered.</p>
      
      <h2>Here's what happens next:</h2>
      
      <ol>
        <li><strong>Take your organization style quiz</strong> (3 minutes)<br>
        <a href="{{quiz_url}}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Discover My Style</a></li>
        
        <li><strong>Browse our before & after gallery</strong><br>
        <a href="{{gallery_url}}">See Real Transformations</a></li>
        
        <li><strong>Schedule your free consultation</strong><br>
        <a href="{{calendar_url}}" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Book My Free Call</a></li>
      </ol>
      
      <p><strong>Quick question:</strong> What made you reach out today?<br>
      (Just hit reply - I personally read every response!)</p>
      
      <p>Looking forward to your transformation,</p>
      
      <p>Chanel<br>
      Founder, ClutterFreeSpaces</p>
      
      <p><strong>P.S.</strong> Montana residents get 15% off their first project this month. No pressure, but I wanted you to know!</p>
      
      <hr>
      <p style="font-size: 12px; color: #666;">
      📞 406-555-0100<br>
      📧 chanel@clutterfreespaces.com<br>
      🌐 clutterfreespaces.com
      </p>
    </div>`,
  },

  {
    name: "Welcome Series - Email 2 - Social Proof",
    subject: "Sarah's RV Went From Chaos to Calm (photos inside)",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Hi {{name}},</h1>
      
      <p>Want to see something amazing?</p>
      
      <p>Last week, I helped Sarah from Billings transform her 32-foot travel trailer. She was literally in tears (happy ones!) when we finished.</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <img src="{{before_photo_url}}" style="width: 45%; margin-right: 10px;" alt="Before photo">
        <span style="font-size: 24px;">→</span>
        <img src="{{after_photo_url}}" style="width: 45%; margin-left: 10px;" alt="After photo">
      </div>
      
      <p><strong>Sarah's biggest challenge?</strong> "I couldn't find anything, and my husband was ready to sell the RV!"</p>
      
      <h2>Here's what we did:</h2>
      <ul>
        <li>✓ Created zones for each family member</li>
        <li>✓ Installed custom storage solutions ($47 total!)</li>
        <li>✓ Labeled everything with her Cricut</li>
        <li>✓ Set up a simple maintenance system</li>
      </ul>
      
      <p>The result? They're now full-timing and LOVING it.</p>
      
      <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; font-style: italic;">
        "I wish we'd called Chanel sooner. She turned our cramped RV into a functional home. Worth every penny!" - Sarah
      </blockquote>
      
      <p>Ready for your transformation?</p>
      
      <a href="{{calendar_url}}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Schedule My Free Consultation</a>
      
      <p>Or reply with your biggest organization challenge - I love brainstorming solutions!</p>
      
      <p>Organized wishes,</p>
      <p>Chanel</p>
      
      <p><strong>P.S.</strong> Sarah's project took 6 hours and cost $640. Most projects range from $300-800.</p>
    </div>`,
  },

  {
    name: "Hot Lead - SMS Follow-up Email",
    subject: "Your {{space_type}} Organization Slot is Still Available",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Hi {{name}},</h1>
      
      <p>I just texted but wanted to make sure you got my message!</p>
      
      <p>You mentioned needing help with your {{space_type}} ASAP, and I happen to have a cancellation this {{day}} at {{time}}.</p>
      
      <p><strong>This rarely happens - I'm usually booked 2 weeks out!</strong></p>
      
      <a href="{{booking_url}}" style="background: #FF5722; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Grab This Spot</a>
      
      <p>If that doesn't work, here are my other openings this week:</p>
      <ul>
        <li>{{day1}} at {{time1}}</li>
        <li>{{day2}} at {{time2}}</li>
        <li>{{day3}} at {{time3}}</li>
      </ul>
      
      <a href="{{calendar_url}}" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">See All Times</a>
      
      <h2>These urgent spots always include:</h2>
      <ul>
        <li>✓ Free consultation (30 min)</li>
        <li>✓ Same-day organization start</li>
        <li>✓ 10% urgency discount</li>
        <li>✓ After-hours availability</li>
      </ul>
      
      <p>Questions? Just reply or call: 406-555-0100</p>
      
      <p>Ready when you are,</p>
      <p>Chanel</p>
      
      <p><strong>P.S.</strong> If you're not ready this week, no pressure! But these spots will definitely fill by tomorrow.</p>
    </div>`,
  },

  {
    name: "RV Owners - Velcro Storage Hack",
    subject: "The RV Storage Hack I Learned From Full-Timers",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>{{name}},</h1>
      
      <p>Last month, I organized 12 RVs.</p>
      
      <p>The game-changer everyone loved? <strong>VERTICAL VELCRO STRIPS.</strong></p>
      
      <h2>Here's why:</h2>
      <ul>
        <li>Holds items while driving</li>
        <li>Removable without damage</li>
        <li>Works on ANY surface</li>
        <li>Costs under $20</li>
      </ul>
      
      <h2>Where to use them:</h2>
      <ul>
        <li>✓ Behind cabinet doors (cleaning supplies)</li>
        <li>✓ Bedroom walls (remotes, phones)</li>
        <li>✓ Bathroom walls (toiletry bags)</li>
        <li>✓ Kitchen backsplash (spice containers)</li>
      </ul>
      
      <a href="{{photo_gallery_url}}">See Photos of Velcro Magic</a>
      
      <p>Want more RV-specific tips?</p>
      
      <div style="background: #E3F2FD; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Join my free RV Organization Workshop:</h3>
        <p>📅 Next Saturday, 10am<br>
        📍 Online via Zoom<br>
        🎁 Free RV checklist for attendees</p>
        
        <a href="{{workshop_url}}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Save My Spot</a>
      </div>
      
      <p>See you there?</p>
      
      <p>Chanel</p>
      
      <p><strong>P.S.</strong> Workshop attendees get 20% off services booked that day!</p>
    </div>`,
  },

  {
    name: "30-Day Post-Service Check-In",
    subject: "How's Your Organized {{space_type}} Holding Up?",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>{{name}},</h1>
      
      <p>It's been a month since we transformed your {{space_type}}!</p>
      
      <p><strong>Quick check-in:</strong></p>
      
      <div style="margin: 20px 0;">
        <a href="{{survey_url}}?status=great" style="display: block; background: #4CAF50; color: white; padding: 10px; text-decoration: none; border-radius: 5px; margin: 5px 0; text-align: center;">😍 Still organized and loving it</a>
        
        <a href="{{survey_url}}?status=mostly" style="display: block; background: #FF9800; color: white; padding: 10px; text-decoration: none; border-radius: 5px; margin: 5px 0; text-align: center;">😊 Mostly good, few problem areas</a>
        
        <a href="{{survey_url}}?status=slipping" style="display: block; background: #FF5722; color: white; padding: 10px; text-decoration: none; border-radius: 5px; margin: 5px 0; text-align: center;">😐 Starting to slip</a>
        
        <a href="{{survey_url}}?status=chaos" style="display: block; background: #F44336; color: white; padding: 10px; text-decoration: none; border-radius: 5px; margin: 5px 0; text-align: center;">😟 Help! It's chaos again</a>
      </div>
      
      <p>If you're struggling, remember:</p>
      <ul>
        <li>New habits take 66 days to stick</li>
        <li>Small slips are NORMAL</li>
        <li>Systems might need tweaking</li>
      </ul>
      
      <p>Want a free 15-minute tune-up call?</p>
      
      <a href="{{tuneup_url}}" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Schedule Tune-Up Call</a>
      
      <p>Or book a Maintenance Session (past clients get 30% off):</p>
      
      <a href="{{maintenance_url}}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Book Maintenance Session</a>
      
      <p>Always here for you,</p>
      <p>Chanel</p>
      
      <p><strong>P.S.</strong> Your referrals mean the world! Know someone who needs help? You both get $50 off: <a href="{{referral_url}}">Get Referral Link</a></p>
    </div>`,
  },
];

async function createTemplates() {
  console.log("Creating SendGrid email templates...\n");

  for (const template of emailTemplates) {
    try {
      const request = {
        url: "/v3/templates",
        method: "POST",
        body: {
          name: template.name,
          generation: "dynamic",
        },
      };

      const [response] = await sgClient.request(request);
      const templateId = response.body.id;

      console.log(`✅ Created template: ${template.name} (ID: ${templateId})`);

      // Create version with content
      const versionRequest = {
        url: `/v3/templates/${templateId}/versions`,
        method: "POST",
        body: {
          template_id: templateId,
          active: 1,
          name: `${template.name} - Version 1`,
          html_content: template.html,
          subject: template.subject,
          generate_plain_content: true,
        },
      };

      await sgClient.request(versionRequest);
      console.log(`   📝 Added content version\n`);
    } catch (error) {
      console.error(
        `❌ Error creating template ${template.name}:`,
        error.response?.body || error.message,
      );
    }
  }

  console.log("🎉 All templates created successfully!");
}

// Run the script
createTemplates().catch(console.error);
