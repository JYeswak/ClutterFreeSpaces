#!/usr/bin/env node

/**
 * Test email delivery directly via SendGrid
 * This bypasses our automation to test basic email sending
 */

const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;

async function testEmailDelivery() {
  console.log("🧪 Testing Direct Email Delivery\n");

  if (!SENDGRID_API_KEY) {
    console.error("❌ SendGrid_API_Key not found in environment");
    return;
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  // Simple test email
  const testEmail = {
    to: "joshua@zirkel.us",
    from: {
      email: "contact@clutter-free-spaces.com",
      name: "ClutterFreeSpaces Test",
    },
    subject: "🧪 Direct Email Test - " + new Date().toLocaleTimeString(),
    text: "This is a plain text test email sent directly via SendGrid API to debug delivery issues.",
    html: `
      <h2>🧪 Direct Email Test</h2>
      <p>This is a test email sent directly via SendGrid API.</p>
      <p><strong>Time sent:</strong> ${new Date().toISOString()}</p>
      <p>If you receive this, basic SendGrid delivery is working.</p>
      <hr>
      <p><small>ClutterFreeSpaces Email Test</small></p>
    `,
    // Add tracking
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  try {
    console.log("📧 Sending test email to joshua@zirkel.us...");
    const response = await sgMail.send(testEmail);
    console.log("✅ Email sent successfully!");
    console.log("📊 Response details:");
    console.log("   Status Code:", response[0].statusCode);
    console.log("   Message ID:", response[0].headers["x-message-id"]);
    console.log("   Headers:", JSON.stringify(response[0].headers, null, 2));

    console.log("\n🔍 Next steps:");
    console.log("1. Check joshua@zirkel.us inbox (may take 1-2 minutes)");
    console.log("2. Check spam/junk folder");
    console.log(
      "3. If still no email, there may be a domain authentication issue",
    );
  } catch (error) {
    console.error("❌ Email sending failed:");
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
testEmailDelivery().catch(console.error);
