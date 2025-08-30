#!/usr/bin/env node

/**
 * Send corrected template test directly to Josh's email
 */

const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;
sgMail.setApiKey(SENDGRID_API_KEY);

async function testJoshDirect() {
  console.log("🧪 Testing Corrected Template - Direct to Josh\n");

  const templateEmail = {
    to: "joshua@zirkel.us",
    from: {
      email: "contact@clutter-free-spaces.com",
      name: "Chanel Basolo - ClutterFreeSpaces",
    },
    templateId: "d-f1a6898e10e641e6b50c90c7e2f14a2f", // HOT Email 1 with corrected version
    dynamicTemplateData: {
      first_name: "Josh",
      rv_type: "Class A Motorhome",
      challenge: "Kitchen Organization",
      consultation_url: "https://calendly.com/chanelnbasolo/30min",
      book_consultation_url: "https://calendly.com/chanelnbasolo/30min",
    },
  };

  try {
    console.log("📧 Sending corrected template test...");
    console.log("   To: joshua@zirkel.us");
    console.log(
      "   Template: d-f1a6898e10e641e6b50c90c7e2f14a2f (corrected version)",
    );
    console.log("   Expected: Chanel Basolo, 30-minute consultation");

    const response = await sgMail.send(templateEmail);
    console.log("✅ Template email sent successfully!");
    console.log("📊 Response:");
    console.log("   Status:", response[0].statusCode);
    console.log("   Message ID:", response[0].headers["x-message-id"]);

    console.log("\n✅ CHECK YOUR EMAIL:");
    console.log("   Should show: Chanel Basolo (not Sarah Mitchell)");
    console.log(
      "   Should show: 30-minute consultation (not 20-minute breakthrough)",
    );
    console.log(
      "   Links should work: https://calendly.com/chanelnbasolo/30min",
    );
  } catch (error) {
    console.error("❌ Template test failed:");
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.body, null, 2));
    }
  }
}

testJoshDirect().catch(console.error);
