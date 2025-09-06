#!/usr/bin/env node

/**
 * Minimal SendGrid Email Template for Resource Delivery
 * Simplified version to improve deliverability
 */

const axios = require("axios");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;

const minimalTemplate = {
  name: "CFS Minimal Resource Bundle",
  generation: "dynamic",
  subject: "Your {{requested_guide}} - Plus Bonus Resources",
  html_content: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Your Organization Resources</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: #2D5A87; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .resource { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
        .download-btn { background: #2D5A87; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; display: inline-block; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Your Organization Resources</h1>
    </div>
    
    <div class="content">
        <p>Hi {{first_name}},</p>
        
        <p>Here's your requested {{requested_guide}}, plus a few bonus resources:</p>
        
        <div class="resource">
            <h3>🍳 Kitchen Organization Essentials</h3>
            <a href="https://clutterfreespaces-production.up.railway.app/downloads/kitchen-organization-essentials.html" class="download-btn">Download PDF</a>
        </div>
        
        <div class="resource">
            <h3>🏔️ Montana Seasonal Gear Guide</h3>
            <a href="https://clutterfreespaces-production.up.railway.app/downloads/montana-seasonal-gear-guide.html" class="download-btn">Download PDF</a>
        </div>
        
        <div class="resource">
            <h3>✅ Daily Maintenance Routine</h3>
            <a href="https://clutterfreespaces-production.up.railway.app/downloads/daily-maintenance-routine.html" class="download-btn">Download PDF</a>
        </div>
        
        <p>Questions? Just reply to this email.</p>
        
        <p>Best,<br>
        Chanel Basolo<br>
        Clutter Free Spaces<br>
        (406) 551-3364</p>
    </div>
    
    <div class="footer">
        <p>Clutter Free Spaces | Professional Home Organization</p>
        <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
</body>
</html>`,

  plain_content: `Hi {{first_name}},

Here's your requested {{requested_guide}}, plus a few bonus resources:

🍳 Kitchen Organization Essentials
Download: https://clutterfreespaces-production.up.railway.app/downloads/kitchen-organization-essentials.html

🏔️ Montana Seasonal Gear Guide  
Download: https://clutterfreespaces-production.up.railway.app/downloads/montana-seasonal-gear-guide.html

✅ Daily Maintenance Routine
Download: https://clutterfreespaces-production.up.railway.app/downloads/daily-maintenance-routine.html

Questions? Just reply to this email.

Best,
Chanel Basolo
Clutter Free Spaces
(406) 551-3364

---
Unsubscribe: {{unsubscribe_url}}`,
};

async function createMinimalTemplate() {
  try {
    console.log("🎨 Creating minimal resource template...");

    const response = await axios.post(
      "https://api.sendgrid.com/v3/templates",
      minimalTemplate,
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Minimal template created successfully!");
    console.log(`📧 Template ID: ${response.data.id}`);
    console.log("\n🔧 Next steps:");
    console.log("1. Update API server to use this template ID");
    console.log("2. Test email delivery with simplified content");

    return response.data.id;
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

if (require.main === module) {
  createMinimalTemplate()
    .then((templateId) => {
      console.log(`\n🎯 Template ${templateId} ready for testing!`);
    })
    .catch(console.error);
}

module.exports = { createMinimalTemplate };
