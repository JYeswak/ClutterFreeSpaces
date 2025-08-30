#!/usr/bin/env node

/**
 * Test the specific HOT email template used in newsletter automation
 */

const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;

async function testNewsletterTemplate() {
  console.log("🧪 Testing Newsletter HOT Email Template\n");

  if (!SENDGRID_API_KEY) {
    console.error("❌ SendGrid_API_Key not found in environment");
    return;
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  // Use the exact same template and data as the newsletter automation
  const templateEmail = {
    to: "joshua@zirkel.us",
    from: {
      email: "contact@clutter-free-spaces.com",
      name: "Chanel - Montana RV Organization",
    },
    templateId: "d-f1a6898e10e641e6b50c90c7e2f14a2f", // HOT Email 1 template
    dynamicTemplateData: {
      first_name: "Josh",
      rv_type: "fifth-wheel",
      challenge: "kitchen",
      consultation_url:
        "https://calendly.com/clutterfree-montana/rv-consultation",
      quiz_url: "https://clutter-free-spaces.com/organization-quiz",
      newsletter_archive_url: "https://clutter-free-spaces.com/rv-tips",
      book_consultation_url:
        "https://calendly.com/clutterfree-montana/rv-consultation",
    },
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
    asm: {
      group_id: 25257,
      groups_to_display: [25257],
    },
  };

  try {
    console.log("📧 Sending HOT template test email...");
    console.log("   Template ID: d-f1a6898e10e641e6b50c90c7e2f14a2f");
    console.log("   To: joshua@zirkel.us");
    console.log("   From: contact@clutter-free-spaces.com");
    console.log(
      "   Data:",
      JSON.stringify(templateEmail.dynamicTemplateData, null, 2),
    );

    const response = await sgMail.send(templateEmail);
    console.log("✅ Template email sent successfully!");
    console.log("📊 Response details:");
    console.log("   Status Code:", response[0].statusCode);
    console.log("   Message ID:", response[0].headers["x-message-id"]);

    console.log("\n🔍 If you receive this email, the template works!");
    console.log(
      "If not, the issue is with the SendGrid template configuration.",
    );
  } catch (error) {
    console.error("❌ Template email failed:");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    if (error.response) {
      console.error(
        "Response body:",
        JSON.stringify(error.response.body, null, 2),
      );
    }
  }
}

// Run the test
testNewsletterTemplate().catch(console.error);
