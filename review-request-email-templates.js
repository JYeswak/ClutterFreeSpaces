#!/usr/bin/env node

/**
 * Google Review Request Email Templates for SendGrid
 * Deploy these templates to SendGrid Dynamic Templates
 */

const reviewRequestTemplates = {
  // Email 1: Day 3 Post-Service Thank You & Review Request
  day3_thank_you: {
    template_name: "Review Request - Day 3 Thank You",
    subject: "Thank you for trusting ClutterFreeSpaces with your RV! 🏔️",
    html_content: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You - ClutterFreeSpaces</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .mountain-emoji { font-size: 24px; margin-bottom: 10px; }
        .review-button { display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px; }
        .review-button:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(234, 88, 12, 0.3); }
        .prompts { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
        .signature-photo { width: 80px; height: 80px; border-radius: 50%; margin: 10px auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="mountain-emoji">🏔️</div>
            <h1>Thank You, {{firstName}}!</h1>
            <p>Your organized RV looks absolutely amazing!</p>
        </div>
        
        <div class="content">
            <p>Hi {{firstName}},</p>
            
            <p>I'm still smiling thinking about the transformation we achieved in your RV! Seeing your space go from overwhelming to organized and functional is exactly why I love what I do.</p>
            
            <p><strong>You should feel incredibly proud of yourself</strong> for taking action and investing in your peace of mind. I know how hard it can be to ask for help with something so personal.</p>
            
            <div class="prompts">
                <h3>Would you mind sharing your experience?</h3>
                <p>Other Montana RV owners rely on reviews to find trusted help. If you're happy with how your space turned out, would you take 60 seconds to leave a quick review?</p>
                
                <p><strong>Here are some things you might mention:</strong></p>
                <ul>
                    <li>What problem were you hoping to solve?</li>
                    <li>How do you feel in your organized space now?</li>
                    <li>Would you recommend ClutterFreeSpaces to other RVers?</li>
                    <li>What surprised you most about the process?</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="https://g.page/r/CYxeuJdLuPvUEAE/review" class="review-button">
                    ⭐ Leave Your Review (60 seconds) ⭐
                </a>
                <p style="font-size: 14px; color: #64748b;">Takes you directly to Google Reviews</p>
            </div>
            
            <p>Thank you again for trusting me with your space. I hope you're already enjoying the calm and functionality we created together!</p>
            
            <p>Happy travels,<br>
            Chanel</p>
            
            <div style="text-align: center; margin-top: 20px;">
                <img src="[CHANEL_PHOTO_URL]" alt="Chanel from ClutterFreeSpaces" class="signature-photo">
                <p style="font-size: 14px; color: #64748b;">Montana's RV Organization Expert</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>ClutterFreeSpaces</strong><br>
            Montana's Premier RV & Home Organization Service<br>
            (406) 285-1525 | contact@clutter-free-spaces.com</p>
            
            <p style="font-size: 12px;">
                If you have any feedback or concerns, please reply to this email - I read every message personally.
            </p>
        </div>
    </div>
</body>
</html>`,
    plain_content: `Hi {{firstName}},

Thank you so much for trusting ClutterFreeSpaces with your RV organization! 

Your space looks absolutely amazing, and I hope you're already feeling the calm and functionality we created together.

Would you mind taking 60 seconds to share your experience with other Montana RVers? Your review helps others find the help they need.

Leave your review here: https://g.page/r/CYxeuJdLuPvUEAE/review

Here are some things you might mention:
- What problem were you hoping to solve?
- How do you feel in your organized space now?
- Would you recommend ClutterFreeSpaces to other RVers?

Thank you again for allowing me to help transform your space!

Happy travels,
Chanel

ClutterFreeSpaces - Montana's Premier RV & Home Organization
(406) 285-1525 | contact@clutter-free-spaces.com`,
  },

  // Email 2: Day 10 Gentle Reminder
  day10_reminder: {
    template_name: "Review Request - Day 10 Reminder",
    subject: "Quick favor? 30 seconds to help other Montana RVers 🚐",
    html_content: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Help Other RVers - ClutterFreeSpaces</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%); color: white; padding: 25px; text-align: center; }
        .content { padding: 30px; }
        .review-button { display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px; }
        .feedback-link { color: #0f766e; text-decoration: none; font-weight: 600; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Hi {{firstName}} 👋</h1>
            <p>Hope you're loving your organized RV!</p>
        </div>
        
        <div class="content">
            <p>I hope you're settling in beautifully to your newly organized space! It makes my day thinking about how much easier your RV life must be now.</p>
            
            <p><strong>Would you mind doing me (and other Montana RVers) a quick favor?</strong></p>
            
            <p>Other RV owners are struggling with the same clutter challenges you faced. They rely on reviews from people like you to find trusted help.</p>
            
            <div style="text-align: center; background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin-bottom: 15px;"><strong>30 seconds to help fellow RVers:</strong></p>
                <a href="https://g.page/r/CYxeuJdLuPvUEAE/review" class="review-button">
                    ⭐ Leave Your Quick Review ⭐
                </a>
            </div>
            
            <p><strong>Not completely satisfied?</strong> Please <a href="mailto:contact@clutter-free-spaces.com?subject=Feedback from {{firstName}}" class="feedback-link">email me directly</a> - I want to make things right.</p>
            
            <p>Thanks for considering it, {{firstName}}!</p>
            
            <p>Chanel<br>
            <small style="color: #64748b;">Montana's RV Organization Expert</small></p>
        </div>
        
        <div class="footer">
            <p><strong>ClutterFreeSpaces</strong><br>
            (406) 285-1525 | contact@clutter-free-spaces.com</p>
        </div>
    </div>
</body>
</html>`,
    plain_content: `Hi {{firstName}},

Hope you're loving your organized RV!

Quick favor: Would you take 30 seconds to help other Montana RVers who are struggling with clutter?

They rely on reviews from people like you to find trusted help.

Leave your review: https://g.page/r/CYxeuJdLuPvUEAE/review

Not completely satisfied? Email me directly - I want to make things right: contact@clutter-free-spaces.com

Thanks!
Chanel

ClutterFreeSpaces
(406) 285-1525`,
  },

  // Email 3: Day 30 Check-in & Soft Review Request
  day30_checkin: {
    template_name: "Review Request - Day 30 Check-in",
    subject: "How's your organized RV holding up, {{firstName}}? 🏔️",
    html_content: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>30-Day Check-in - ClutterFreeSpaces</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%); color: white; padding: 25px; text-align: center; }
        .content { padding: 30px; }
        .tips-box { background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0369a1; margin: 20px 0; }
        .review-button { display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }
        .referral-section { background: #fefce8; padding: 20px; border-radius: 8px; border-left: 4px solid #eab308; margin: 20px 0; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Hi {{firstName}}! 👋</h1>
            <p>It's been a month since we organized your RV</p>
        </div>
        
        <div class="content">
            <p>I hope your organized RV is still bringing you joy and making your adventures so much easier!</p>
            
            <p>It's been about a month since we transformed your space, and I'm curious - <strong>how are things holding up?</strong></p>
            
            <div class="tips-box">
                <h3>🏔️ Montana RV Organization Tips:</h3>
                <ul>
                    <li><strong>Weekly 10-minute reset:</strong> Put everything back in its designated spot</li>
                    <li><strong>Before each trip:</strong> Do a quick weight distribution check</li>
                    <li><strong>Seasonal rotation:</strong> Swap summer/winter gear as weather changes</li>
                    <li><strong>One in, one out:</strong> When you buy something new, consider what can go</li>
                </ul>
            </div>
            
            <p><strong>Still loving your organized space?</strong></p>
            
            <p>If your RV is still making you smile (and your travels are less stressful), would you consider sharing your experience with other Montana RVers who might be struggling?</p>
            
            <div style="text-align: center;">
                <a href="https://g.page/r/CYxeuJdLuPvUEAE/review" class="review-button">
                    Share Your Experience ⭐
                </a>
            </div>
            
            <div class="referral-section">
                <h3>Know another RVer who could use help?</h3>
                <p>If you know someone struggling with RV clutter, <strong>you both save $30</strong> when you refer them! Just have them mention your name when they book.</p>
                <p><strong>Call/text:</strong> (406) 285-1525</p>
            </div>
            
            <p>As always, if you have any questions or need help maintaining your system, just reply to this email. I'm here to help!</p>
            
            <p>Happy travels,<br>
            Chanel</p>
        </div>
        
        <div class="footer">
            <p><strong>ClutterFreeSpaces</strong><br>
            Montana's Premier RV & Home Organization Service<br>
            (406) 285-1525 | contact@clutter-free-spaces.com</p>
        </div>
    </div>
</body>
</html>`,
    plain_content: `Hi {{firstName}},

It's been about a month since we organized your RV - how are things holding up?

Here are some tips to keep your space organized:
- Weekly 10-minute reset: Put everything back in its spot
- Before trips: Quick weight distribution check  
- Seasonal rotation: Swap summer/winter gear
- One in, one out: Consider what can go when buying new items

Still loving your organized space? Would you consider sharing your experience to help other Montana RVers?

Share your review: https://g.page/r/CYxeuJdLuPvUEAE/review

REFERRAL BONUS: Know another RVer who needs help? You both save $30 when you refer them! Have them mention your name: (406) 285-1525

Questions? Just reply to this email!

Happy travels,
Chanel

ClutterFreeSpaces
(406) 285-1525 | contact@clutter-free-spaces.com`,
  },
};

// Deploy script for SendGrid
const sgMail = require("@sendgrid/mail");
const sgClient = require("@sendgrid/client");

async function deployReviewTemplates() {
  if (!process.env.SendGrid_API_Key) {
    console.log("❌ SendGrid API key not found");
    return;
  }

  sgClient.setApiKey(process.env.SendGrid_API_Key);

  const deployedTemplates = {};

  for (const [key, template] of Object.entries(reviewRequestTemplates)) {
    try {
      console.log(`📧 Deploying: ${template.template_name}`);

      const request = {
        method: "POST",
        url: "/v3/templates",
        body: {
          name: template.template_name,
          generation: "dynamic",
        },
      };

      const [response] = await sgClient.request(request);
      const templateId = response.body.id;

      // Add version with content
      const versionRequest = {
        method: "POST",
        url: `/v3/templates/${templateId}/versions`,
        body: {
          template_id: templateId,
          active: 1,
          name: template.template_name,
          html_content: template.html_content,
          plain_content: template.plain_content,
          subject: template.subject,
        },
      };

      await sgClient.request(versionRequest);

      deployedTemplates[key] = templateId;
      console.log(`✅ Deployed: ${template.template_name} (${templateId})`);
    } catch (error) {
      console.error(
        `❌ Failed to deploy ${template.template_name}:`,
        error.message,
      );
    }
  }

  console.log("\n📋 Template IDs for email-automation-config.js:");
  console.log("const REVIEW_TEMPLATES = {");
  for (const [key, templateId] of Object.entries(deployedTemplates)) {
    console.log(`  ${key}: "${templateId}",`);
  }
  console.log("};");

  return deployedTemplates;
}

// Run deployment if called directly
if (require.main === module) {
  deployReviewTemplates().catch(console.error);
}

module.exports = {
  reviewRequestTemplates,
  deployReviewTemplates,
};
