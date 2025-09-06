#!/usr/bin/env node

/**
 * Ultra-basic SendGrid template - plain text focus
 */

const axios = require("axios");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;

const basicTemplate = {
  name: "CFS Basic Text Resources",
  generation: "dynamic",
  subject: "Your {{requested_guide}} Resources",
  html_content: `
<p>Hi {{first_name}},</p>

<p>Thanks for requesting the {{requested_guide}}. Here are your resources:</p>

<p><strong>Kitchen Organization Guide:</strong><br>
<a href="https://clutterfreespaces-production.up.railway.app/downloads/kitchen-organization-essentials.html">Download Here</a></p>

<p>Questions? Reply to this email.</p>

<p>Best regards,<br>
Chanel<br>
Clutter Free Spaces</p>

<p><small><a href="{{unsubscribe_url}}">Unsubscribe</a></small></p>
`,

  plain_content: `Hi {{first_name}},

Thanks for requesting the {{requested_guide}}. Here are your resources:

Kitchen Organization Guide:
https://clutterfreespaces-production.up.railway.app/downloads/kitchen-organization-essentials.html

Questions? Reply to this email.

Best regards,
Chanel
Clutter Free Spaces

Unsubscribe: {{unsubscribe_url}}`,
};

async function createBasicTemplate() {
  try {
    console.log("📝 Creating ultra-basic text template...");

    const response = await axios.post(
      "https://api.sendgrid.com/v3/templates",
      basicTemplate,
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Basic template created!");
    console.log(`📧 Template ID: ${response.data.id}`);

    return response.data.id;
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

if (require.main === module) {
  createBasicTemplate()
    .then((templateId) => {
      console.log(`\n🎯 Ultra-basic template ${templateId} ready!`);
    })
    .catch(console.error);
}

module.exports = { createBasicTemplate };
