#!/usr/bin/env node

/**
 * Create a new corrected version of the HOT Email 1 template
 * Since updating existing templates isn't working, create a new version
 */

const sgClient = require("@sendgrid/client");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;
sgClient.setApiKey(SENDGRID_API_KEY);

async function createCorrectedTemplate() {
  const templateId = "d-f1a6898e10e641e6b50c90c7e2f14a2f";

  // Corrected HTML content
  const correctedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your RV Organization Journey Starts Here</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); color: white; padding: 30px 25px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Welcome to Your Clutter-Free Journey, {{first_name}}!</h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 35px 30px;">
            <p style="font-size: 18px; color: #2c5530; font-weight: 600; margin-bottom: 20px;">Your quiz results show you're scoring 75+ - that means you're already motivated and ready for serious change in your {{rv_type}}.</p>
            
            <p style="margin-bottom: 20px;">Here's what I've learned after helping 200+ RVers across Montana's highways: the difference between those who succeed and those who stay stuck isn't motivation (you've got that!) - it's having the RIGHT system.</p>
            
            <div style="background-color: #f0f7f1; border-left: 4px solid #4a7c59; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-weight: 600; color: #2c5530;"><strong>Your Biggest Challenge:</strong> {{challenge}}</p>
                <p style="margin: 10px 0 0 0;">I've created a specific action plan for this exact issue. It's not generic advice - it's what works in the cramped quarters of Montana RV life.</p>
            </div>
            
            <p>Tomorrow, I'm sending you the "Montana RV Quick-Win Checklist" - 7 items you can tackle in under 2 hours that will give you immediate breathing room. These aren't the obvious tips everyone shares.</p>
            
            <p style="margin-bottom: 30px;">But first, I want to give you something even more valuable...</p>
            
            <!-- CTA Section -->
            <div style="text-align: center; background-color: #fafbfc; padding: 30px 25px; border-radius: 12px; margin: 30px 0; border: 2px solid #e9ecef;">
                <h2 style="color: #2c5530; margin: 0 0 15px 0; font-size: 24px; font-weight: 700;">Book Your Free 30-Minute Consultation</h2>
                <p style="margin: 0 0 25px 0; font-size: 16px; color: #555;">On this call, we'll map out exactly how to transform your {{rv_type}} from chaos to calm - without buying expensive organizers or cramming everything into tiny spaces.</p>
                
                <a href="{{consultation_url}}" style="background: linear-gradient(135deg, #4a7c59 0%, #2c5530 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(44, 85, 48, 0.3);">
                    📅 Book Your Consultation
                </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 16px;">Keep an eye out for tomorrow's checklist!</p>
            
            <!-- Signature -->
            <div style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #e9ecef;">
                <p style="margin-bottom: 0;">Best,<br><strong style="color: #2c5530; font-size: 18px;">Chanel Basolo</strong><br><em style="color: #666;">Montana RV Organization Expert</em></p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 14px; color: #666;">
            <p style="margin: 0;">You're receiving this because you signed up for Montana RV organization tips.</p>
            <p style="margin: 5px 0 0 0;">
                <a href="{{{unsubscribe}}}" style="color: #4a7c59; text-decoration: none;">Unsubscribe</a> | 
                <a href="{{{preferences}}}" style="color: #4a7c59; text-decoration: none;">Update Preferences</a>
            </p>
            <p style="margin: 10px 0 0 0; font-weight: 600;">ClutterFreeSpaces, Montana RV Organization Expert</p>
        </div>
    </div>
</body>
</html>`;

  const correctedText = `Welcome to Your Clutter-Free Journey, {{first_name}}!

Your quiz results show you're scoring 75+ - that means you're already motivated and ready for serious change in your {{rv_type}}.

Here's what I've learned after helping 200+ RVers across Montana's highways: the difference between those who succeed and those who stay stuck isn't motivation (you've got that!) - it's having the RIGHT system.

Your Biggest Challenge: {{challenge}}
I've created a specific action plan for this exact issue. It's not generic advice - it's what works in the cramped quarters of Montana RV life.

Tomorrow, I'm sending you the "Montana RV Quick-Win Checklist" - 7 items you can tackle in under 2 hours that will give you immediate breathing room. These aren't the obvious tips everyone shares.

But first, I want to give you something even more valuable...

BOOK YOUR FREE 30-MINUTE CONSULTATION
On this call, we'll map out exactly how to transform your {{rv_type}} from chaos to calm - without buying expensive organizers or cramming everything into tiny spaces.

Book here: {{consultation_url}}

Keep an eye out for tomorrow's checklist!

Best,
Chanel Basolo
Montana RV Organization Expert

You're receiving this because you signed up for Montana RV organization tips.
Unsubscribe: {{{unsubscribe}}}
ClutterFreeSpaces, Montana RV Organization Expert`;

  try {
    // Create new template version
    const request = {
      url: `/v3/templates/${templateId}/versions`,
      method: "POST",
      body: {
        template_id: templateId,
        active: 1, // Make this the active version
        name: "HOT Lead Email 1 - CORRECTED",
        subject:
          "{{first_name}}, your {{rv_type}} organization score says you're READY!",
        html_content: correctedHtml,
        plain_content: correctedText,
      },
    };

    console.log("🔧 Creating corrected template version...");
    console.log("Template ID:", templateId);

    const [response] = await sgClient.request(request);
    console.log("✅ New template version created successfully!");
    console.log("Version ID:", response.body.id);

    console.log("\n🎉 CORRECTED CONTENT FEATURES:");
    console.log("✅ Chanel Basolo (not Sarah Mitchell)");
    console.log("✅ 30-minute consultation (not 20-minute breakthrough call)");
    console.log("✅ Montana RV Organization Expert (not Specialist)");
    console.log("✅ Working Calendly URL variable: {{consultation_url}}");
    console.log("✅ Professional styling and layout");

    return response.body;
  } catch (error) {
    console.error("❌ Failed to create corrected template:");
    console.error(error.response?.body || error.message);
  }
}

createCorrectedTemplate().catch(console.error);
