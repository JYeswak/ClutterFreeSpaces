#!/usr/bin/env node

/**
 * Enhanced SendGrid Email Template Setup for Complete Resource Bundle
 * This creates a personalized email template that delivers all resources
 * regardless of what was specifically requested
 */

const axios = require("axios");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;

if (!SENDGRID_API_KEY) {
  console.error("❌ SendGrid_API_Key environment variable is required");
  process.exit(1);
}

const templateData = {
  name: "CFS Complete Resource Bundle 2024",
  generation: "dynamic",
  subject: "Your {{requested_guide}} + Complete Organization Library!",
  html_content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Complete Organization Library</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .email-container {
            background: white;
            margin: 20px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #2D5A87 0%, #1e3a5f 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 700;
        }
        
        .header p {
            margin: 0;
            opacity: 0.9;
            font-size: 16px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        
        .intro-text {
            background: #f8f9fa;
            border-left: 4px solid #2D5A87;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        
        .intro-text p {
            margin: 0 0 10px 0;
            font-style: italic;
        }
        
        .download-section {
            margin: 30px 0;
        }
        
        .download-section h2 {
            color: #2D5A87;
            font-size: 22px;
            margin: 0 0 20px 0;
            text-align: center;
        }
        
        .resource-grid {
            display: grid;
            gap: 15px;
            margin: 25px 0;
        }
        
        .resource-item {
            background: #f8f9fa;
            border: 2px solid #2D5A87;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .resource-item h3 {
            color: #2D5A87;
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        
        .resource-item p {
            margin: 0 0 15px 0;
            font-size: 14px;
            color: #666;
        }
        
        .download-btn {
            background: #2D5A87;
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 6px;
            display: inline-block;
            font-weight: 600;
            font-size: 16px;
            margin: 5px;
        }
        
        .download-btn:hover {
            background: #1e3a5f;
        }
        
        .bonus-section {
            background: linear-gradient(135deg, #28a745 0%, #20663b 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
        }
        
        .bonus-section h3 {
            margin: 0 0 15px 0;
            font-size: 20px;
        }
        
        .bonus-section p {
            margin: 0 0 15px 0;
        }
        
        .bonus-btn {
            background: white;
            color: #28a745;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 6px;
            display: inline-block;
            font-weight: 600;
            font-size: 16px;
            margin: 5px;
        }
        
        .cta-section {
            background: #e9ecef;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
        }
        
        .cta-section h3 {
            color: #2D5A87;
            margin: 0 0 15px 0;
            font-size: 22px;
        }
        
        .cta-btn {
            background: #2D5A87;
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            display: inline-block;
            font-weight: 600;
            font-size: 18px;
            margin: 10px;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #666;
        }
        
        .footer p {
            margin: 5px 0;
            font-size: 14px;
        }
        
        .social-links {
            margin: 15px 0;
        }
        
        .social-links a {
            color: #2D5A87;
            text-decoration: none;
            margin: 0 10px;
            font-weight: 600;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
            }
            
            .content {
                padding: 25px 20px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎁 Your Complete Organization Library</h1>
            <p>Everything you need to organize your Montana home!</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hi {{first_name}},
            </div>
            
            <div class="intro-text">
                <p><strong>You requested our {{requested_guide}} – it's below along with our complete organization library as a bonus!</strong></p>
                
                <p>I believe in giving you everything you need to succeed, so you're getting our entire collection of professional organizing resources. This is the same library I use with all my Montana clients.</p>
            </div>
            
            <div class="download-section">
                <h2>📥 Your Complete PDF Guide Library</h2>
                
                <div class="resource-grid">
                    <div class="resource-item">
                        <h3>🍳 Kitchen Organization Essentials</h3>
                        <p>Pantry systems, cabinet optimization, and counter clutter solutions</p>
                        <a href="https://clutterfreespaces-production.up.railway.app/downloads/kitchen-organization-essentials.html" class="download-btn">Download PDF</a>
                    </div>
                    
                    <div class="resource-item">
                        <h3>🏔️ Montana Seasonal Gear Organization</h3>
                        <p>Ski equipment, camping gear, hunting supplies, and seasonal rotation</p>
                        <a href="https://clutterfreespaces-production.up.railway.app/downloads/montana-seasonal-gear-guide.html" class="download-btn">Download PDF</a>
                    </div>
                    
                    <div class="resource-item">
                        <h3>✅ Daily Maintenance Routine</h3>
                        <p>Simple habits to keep your organized home functioning perfectly</p>
                        <a href="https://clutterfreespaces-production.up.railway.app/downloads/daily-maintenance-routine.html" class="download-btn">Download PDF</a>
                    </div>
                    
                    <div class="resource-item">
                        <h3>👕 Closet & Bedroom Organization</h3>
                        <p>Create peaceful bedrooms and functional closets for Montana's seasons</p>
                        <a href="https://clutterfreespaces-production.up.railway.app/downloads/closet-bedroom-organization.html" class="download-btn">Download PDF</a>
                    </div>
                    
                    <div class="resource-item">
                        <h3>🏢 Home Office Setup</h3>
                        <p>Design a productive workspace whether you work from home or manage family life</p>
                        <a href="https://clutterfreespaces-production.up.railway.app/downloads/home-office-setup.html" class="download-btn">Download PDF</a>
                    </div>
                    
                    <div class="resource-item">
                        <h3>🥾 Mudroom & Entryway Solutions</h3>
                        <p>Keep Montana's mud, snow, and outdoor elements from taking over your home</p>
                        <a href="https://clutterfreespaces-production.up.railway.app/downloads/mudroom-entryway-solutions.html" class="download-btn">Download PDF</a>
                    </div>
                </div>
            </div>
            
            <div class="bonus-section">
                <h3>🎯 BONUS: Digital Tools & Templates</h3>
                <p>Professional labels, checklists, and planning worksheets used in our client sessions</p>
                
                <a href="https://clutterfreespaces-production.up.railway.app/downloads/printable-labels-templates.html" class="bonus-btn">Labels & Templates</a>
                <a href="https://clutterfreespaces-production.up.railway.app/downloads/organization-checklists.html" class="bonus-btn">Organization Checklists</a>
                <a href="https://clutterfreespaces-production.up.railway.app/downloads/planning-worksheets.html" class="bonus-btn">Planning Worksheets</a>
            </div>
            
            <p><strong>What's Next?</strong> Start with the guide you originally requested, then explore the others as you're ready. Every Montana home is different, and these resources will help you create systems that actually work for your family's lifestyle.</p>
            
            <p>Questions about any of these strategies? Just reply to this email – I personally read and respond to every message.</p>
            
            <div class="cta-section">
                <h3>Ready for Personalized Help?</h3>
                <p>These guides are powerful, but every home is unique. Get customized solutions for your specific space and family needs.</p>
                <a href="https://calendly.com/chanelnbasolo/30min" class="cta-btn">Schedule Free 30-Min Consultation</a>
                <p style="font-size: 14px; margin-top: 15px; color: #666;">No pressure, no sales pitch – just practical advice for your specific situation.</p>
            </div>
            
            <p>Here's to creating a home that supports your Montana lifestyle!</p>
            
            <p><strong>Chanel Basolo</strong><br>
            Professional Organizer<br>
            Clutter Free Spaces<br>
            (406) 551-3364</p>
        </div>
        
        <div class="footer">
            <p><strong>Clutter Free Spaces</strong> | Professional Home Organization</p>
            <p>Serving Missoula, Hamilton, Stevensville, Florence, Lolo, and Western Montana</p>
            
            <div class="social-links">
                <a href="https://www.clutter-free-spaces.com">Website</a>
                <a href="tel:+14065513364">Call (406) 551-3364</a>
                <a href="mailto:contact@clutter-free-spaces.com">Email</a>
            </div>
            
            <p style="font-size: 12px; margin-top: 20px;">
                You received this email because you requested our organization resources. 
                <a href="{{unsubscribe_url}}" style="color: #2D5A87;">Unsubscribe here</a> if you no longer want these helpful tips.
            </p>
        </div>
    </div>
</body>
</html>`,

  plain_content: `Hi {{first_name}},

You requested our {{requested_guide}} – it's below along with our complete organization library as a bonus!

I believe in giving you everything you need to succeed, so you're getting our entire collection of professional organizing resources. This is the same library I use with all my Montana clients.

YOUR COMPLETE PDF GUIDE LIBRARY:

🍳 Kitchen Organization Essentials
Pantry systems, cabinet optimization, and counter clutter solutions
Download: https://clutterfreespaces-production.up.railway.app/downloads/kitchen-organization-essentials.html

🏔️ Montana Seasonal Gear Organization  
Ski equipment, camping gear, hunting supplies, and seasonal rotation
Download: https://clutterfreespaces-production.up.railway.app/downloads/montana-seasonal-gear-guide.html

✅ Daily Maintenance Routine
Simple habits to keep your organized home functioning perfectly
Download: https://clutterfreespaces-production.up.railway.app/downloads/daily-maintenance-routine.html

👕 Closet & Bedroom Organization
Create peaceful bedrooms and functional closets for Montana's seasons
Download: https://clutterfreespaces-production.up.railway.app/downloads/closet-bedroom-organization.html

🏢 Home Office Setup
Design a productive workspace whether you work from home or manage family life  
Download: https://clutterfreespaces-production.up.railway.app/downloads/home-office-setup.html

🥾 Mudroom & Entryway Solutions
Keep Montana's mud, snow, and outdoor elements from taking over your home
Download: https://clutterfreespaces-production.up.railway.app/downloads/mudroom-entryway-solutions.html

BONUS DIGITAL TOOLS:
• Labels & Templates: https://clutterfreespaces-production.up.railway.app/downloads/printable-labels-templates.html
• Organization Checklists: https://clutterfreespaces-production.up.railway.app/downloads/organization-checklists.html  
• Planning Worksheets: https://clutterfreespaces-production.up.railway.app/downloads/planning-worksheets.html

What's Next? Start with the guide you originally requested, then explore the others as you're ready. Every Montana home is different, and these resources will help you create systems that actually work for your family's lifestyle.

Questions about any of these strategies? Just reply to this email – I personally read and respond to every message.

READY FOR PERSONALIZED HELP?
These guides are powerful, but every home is unique. Get customized solutions for your specific space and family needs.

Schedule Free 30-Min Consultation: https://calendly.com/chanelnbasolo/30min
(No pressure, no sales pitch – just practical advice for your specific situation.)

Here's to creating a home that supports your Montana lifestyle!

Chanel Basolo
Professional Organizer  
Clutter Free Spaces
(406) 551-3364
contact@clutter-free-spaces.com

---
Clutter Free Spaces | Professional Home Organization
Serving Missoula, Hamilton, Stevensville, Florence, Lolo, and Western Montana
www.clutter-free-spaces.com

You received this email because you requested our organization resources.
Unsubscribe: {{unsubscribe_url}}`,
};

async function createEnhancedTemplate() {
  try {
    console.log("🎨 Creating enhanced SendGrid email template...");

    const response = await axios.post(
      "https://api.sendgrid.com/v3/templates",
      templateData,
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Enhanced email template created successfully!");
    console.log(`📧 Template ID: ${response.data.id}`);
    console.log(`📧 Template Name: ${response.data.name}`);
    console.log("");
    console.log("🔧 Next steps:");
    console.log("1. Update your API server to use this new template ID");
    console.log("2. The template expects these variables:");
    console.log("   - {{first_name}} - User's first name");
    console.log("   - {{requested_guide}} - The specific guide they requested");
    console.log("");
    console.log(
      "💡 This template delivers ALL resources regardless of selection",
    );
    console.log(
      "   and personalizes the opening message based on their request.",
    );

    return response.data.id;
  } catch (error) {
    console.error(
      "❌ Error creating email template:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// Run the script
if (require.main === module) {
  createEnhancedTemplate()
    .then((templateId) => {
      console.log(`\n🎯 SUCCESS: Template ${templateId} is ready to use!`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 FAILED: Could not create template");
      process.exit(1);
    });
}

module.exports = { createEnhancedTemplate };
