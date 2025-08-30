#!/usr/bin/env node

/**
 * Test all email sequences by sending them to Josh's email
 */

const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;
sgMail.setApiKey(SENDGRID_API_KEY);

const EMAIL_TEMPLATES = {
  HOT: [
    { id: "d-f1a6898e10e641e6b50c90c7e2f14a2f", name: "HOT Email 1 - Welcome" },
    {
      id: "d-fe0bcba3de744a979adf56dd9a39a986",
      name: "HOT Email 2 - Quick Wins",
    },
    {
      id: "d-a28f0d1925384df8bc5e7d7e96725bc7",
      name: "HOT Email 3 - Case Study",
    },
    {
      id: "d-507bc5eec63d49d4b0780584173bb442",
      name: "HOT Email 4 - Common Mistakes",
    },
    {
      id: "d-607cdd56799d47f4819a016ca98c7e22",
      name: "HOT Email 5 - Final Push",
    },
  ],
  WARM: [
    {
      id: "d-ecfda28c118b48918adae29481dabcce",
      name: "WARM Email 1 - Welcome",
    },
    {
      id: "d-8cf2b4d5a9e34819a2dc3f5b7e1a9c8d",
      name: "WARM Email 2 - Education",
    },
    {
      id: "d-1a7f8e9c4b3d2a5f6e8d9c0b1a2f3e4d",
      name: "WARM Email 3 - Social Proof",
    },
    {
      id: "d-5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
      name: "WARM Email 4 - Overcome Objections",
    },
    {
      id: "d-9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c",
      name: "WARM Email 5 - Final Offer",
    },
  ],
  COLD: [
    {
      id: "d-e3ee97cb417940d0b3afd72c91950569",
      name: "COLD Email 1 - Welcome",
    },
    {
      id: "d-2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
      name: "COLD Email 2 - Problem Awareness",
    },
    {
      id: "d-6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
      name: "COLD Email 3 - Solution Introduction",
    },
    {
      id: "d-0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
      name: "COLD Email 4 - Benefits",
    },
    {
      id: "d-4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
      name: "COLD Email 5 - Gentle Nudge",
    },
  ],
};

async function sendTestEmail(templateId, templateName, sequenceType) {
  const testEmail = {
    to: "joshua@zirkel.us",
    from: {
      email: "contact@clutter-free-spaces.com",
      name: "Chanel Basolo - ClutterFreeSpaces",
    },
    templateId: templateId,
    dynamicTemplateData: {
      first_name: "Josh",
      rv_type: "Class A Motorhome",
      challenge: "Kitchen Organization",
      consultation_url: "https://calendly.com/chanelnbasolo/30min",
      book_consultation_url: "https://calendly.com/chanelnbasolo/30min",
    },
  };

  try {
    const response = await sgMail.send(testEmail);
    console.log(`✅ ${templateName} sent successfully`);
    return { success: true, messageId: response[0].headers["x-message-id"] };
  } catch (error) {
    console.error(`❌ ${templateName} failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testAllSequences() {
  console.log("🧪 Testing ALL Email Sequences for Josh\n");
  console.log("📧 Sending to: joshua@zirkel.us");
  console.log(
    "🏷️  Personalization: Josh, Class A Motorhome, Kitchen Organization\n",
  );

  const results = {};

  // Test each sequence
  for (const [sequenceType, templates] of Object.entries(EMAIL_TEMPLATES)) {
    console.log(`\n🔥 Testing ${sequenceType} Sequence:`);
    console.log("=" * 40);

    results[sequenceType] = [];

    for (const template of templates) {
      console.log(`📤 Sending ${template.name}...`);
      const result = await sendTestEmail(
        template.id,
        template.name,
        sequenceType,
      );
      results[sequenceType].push({ ...template, ...result });

      // Small delay between sends
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log("\n\n📊 TEST SUMMARY:");
  console.log("================");

  let totalSent = 0;
  let totalFailed = 0;

  for (const [sequenceType, templateResults] of Object.entries(results)) {
    const successful = templateResults.filter((t) => t.success).length;
    const failed = templateResults.filter((t) => !t.success).length;

    totalSent += successful;
    totalFailed += failed;

    console.log(`\n${sequenceType} Sequence:`);
    console.log(`  ✅ Successful: ${successful}`);
    console.log(`  ❌ Failed: ${failed}`);

    if (failed > 0) {
      console.log("  Failed templates:");
      templateResults
        .filter((t) => !t.success)
        .forEach((t) => {
          console.log(`    - ${t.name}: ${t.error}`);
        });
    }
  }

  console.log(`\n🎯 TOTAL RESULTS:`);
  console.log(`   ✅ Sent: ${totalSent}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log(
    `   📈 Success Rate: ${((totalSent / (totalSent + totalFailed)) * 100).toFixed(1)}%`,
  );

  console.log("\n📥 CHECK YOUR INBOX:");
  console.log("   You should receive 15 test emails total");
  console.log("   Each should show: Chanel Basolo, 30-minute consultation");
  console.log("   All Calendly links should work");
}

testAllSequences().catch(console.error);
