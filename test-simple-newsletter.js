#!/usr/bin/env node

/**
 * Test simple newsletter email WITHOUT template or ASM groups
 * This will help isolate if the issue is with templates or suppression
 */

const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;

async function testSimpleNewsletter() {
  console.log("🧪 Testing Simple Newsletter Email (No Template)\n");

  if (!SENDGRID_API_KEY) {
    console.error("❌ SendGrid_API_Key not found in environment");
    return;
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  // Simple email without template - just like the working test email
  const simpleEmail = {
    to: "joshua@zirkel.us",
    from: {
      email: "contact@clutter-free-spaces.com",
      name: "Chanel - ClutterFreeSpaces Newsletter Test",
    },
    subject: "🚐 Your RV Organization Guide is Here! (Simple Test)",
    text: `Hi Josh!

Welcome to ClutterFreeSpaces! We're excited to help you organize your Fifth Wheel.

Here's your personalized RV organization checklist:
https://clutter-free-spaces.com/downloads/rv-checklist.pdf

Since you mentioned your biggest challenge is kitchen organization, here are 3 quick tips:
1. Use magnetic spice containers on the refrigerator
2. Install pull-out drawers in deep cabinets  
3. Use over-sink cutting boards to maximize counter space

Ready for a consultation? Book here:
https://calendly.com/clutterfree-montana/rv-consultation

Happy organizing!
Chanel
Montana RV Organization Expert`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🚐 Welcome to ClutterFreeSpaces!</h2>
        <p>Hi Josh!</p>
        <p>We're excited to help you organize your <strong>Fifth Wheel</strong>.</p>
        
        <h3>Your RV Organization Checklist</h3>
        <p><a href="https://clutter-free-spaces.com/downloads/rv-checklist.pdf" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">📋 Download Your Checklist</a></p>
        
        <h3>Kitchen Organization Tips</h3>
        <p>Since you mentioned your biggest challenge is <strong>kitchen organization</strong>, here are 3 quick tips:</p>
        <ol>
          <li>Use magnetic spice containers on the refrigerator</li>
          <li>Install pull-out drawers in deep cabinets</li>
          <li>Use over-sink cutting boards to maximize counter space</li>
        </ol>
        
        <h3>Ready for Expert Help?</h3>
        <p><a href="https://calendly.com/clutterfree-montana/rv-consultation" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">📅 Book Your Consultation</a></p>
        
        <p>Happy organizing!<br>
        <strong>Chanel</strong><br>
        Montana RV Organization Expert</p>
        
        <hr>
        <p style="font-size: 12px; color: #666;">This is a test of the newsletter system without SendGrid templates.</p>
      </div>
    `,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
    // NO ASM/unsubscribe group - this might be blocking emails
  };

  try {
    console.log("📧 Sending simple newsletter test...");
    console.log("   To: joshua@zirkel.us");
    console.log("   From: contact@clutter-free-spaces.com");
    console.log(
      "   Subject: Your RV Organization Guide is Here! (Simple Test)",
    );
    console.log("   ASM Groups: NONE (testing if suppression is the issue)");

    const response = await sgMail.send(simpleEmail);
    console.log("✅ Simple newsletter sent successfully!");
    console.log("📊 Response details:");
    console.log("   Status Code:", response[0].statusCode);
    console.log("   Message ID:", response[0].headers["x-message-id"]);

    console.log("\n🔍 This tests if the issue is:");
    console.log("1. SendGrid templates (bypassed)");
    console.log("2. ASM/unsubscribe groups (disabled)");
    console.log("3. Basic email delivery (should work like direct test)");
  } catch (error) {
    console.error("❌ Simple newsletter failed:");
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
testSimpleNewsletter().catch(console.error);
