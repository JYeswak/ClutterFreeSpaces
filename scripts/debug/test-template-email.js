#!/usr/bin/env node

/**
 * Test SendGrid template email directly
 */

const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SendGrid_API_Key);

async function testTemplateEmail() {
  try {
    const msg = {
      to: "joshua@zirkel.us",
      from: {
        email: "contact@clutter-free-spaces.com",
        name: "Chanel @ Clutter Free Spaces",
      },
      templateId: "d-42661a0c34ba4cb08a1ae161bcd6f1ca",
      dynamicTemplateData: {
        first_name: "Josh",
        requested_guide: "Kitchen Organization Essentials",
      },
    };

    console.log("📧 Sending template test email...");
    console.log("Template ID:", msg.templateId);
    console.log("To:", msg.to);
    console.log("From:", msg.from.email);
    console.log("Template Data:", msg.dynamicTemplateData);

    await sgMail.send(msg);
    console.log("✅ Template email sent successfully!");
  } catch (error) {
    console.error("❌ Template email error:", error);
    if (error.response) {
      console.error("Response body:", error.response.body);
    }
  }
}

testTemplateEmail();
