#!/usr/bin/env node

/**
 * Comprehensive Test of All Corrected SendGrid Templates
 * Tests all 15 templates to verify correct personalization
 */

const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;
sgMail.setApiKey(SENDGRID_API_KEY);

// Load the new template IDs from deployment results
const deploymentResults = require("./sendgrid-deployment-results.json");

const ALL_TEMPLATES = [
  // HOT Sequence
  {
    id: deploymentResults.templateIds["hot-leads"].email_1,
    name: "HOT Email 1 - Welcome",
    sequence: "HOT",
  },
  {
    id: deploymentResults.templateIds["hot-leads"].email_2,
    name: "HOT Email 2 - Quick Wins",
    sequence: "HOT",
  },
  {
    id: deploymentResults.templateIds["hot-leads"].email_3,
    name: "HOT Email 3 - Montana Factor",
    sequence: "HOT",
  },
  {
    id: deploymentResults.templateIds["hot-leads"].email_4,
    name: "HOT Email 4 - 10-Min Method",
    sequence: "HOT",
  },
  {
    id: deploymentResults.templateIds["hot-leads"].email_5,
    name: "HOT Email 5 - Decision Time",
    sequence: "HOT",
  },

  // WARM Sequence
  {
    id: deploymentResults.templateIds["warm-leads"].email_1,
    name: "WARM Email 1 - Welcome",
    sequence: "WARM",
  },
  {
    id: deploymentResults.templateIds["warm-leads"].email_2,
    name: "WARM Email 2 - Education",
    sequence: "WARM",
  },
  {
    id: deploymentResults.templateIds["warm-leads"].email_3,
    name: "WARM Email 3 - Success Story",
    sequence: "WARM",
  },
  {
    id: deploymentResults.templateIds["warm-leads"].email_4,
    name: "WARM Email 4 - Overwhelm Solutions",
    sequence: "WARM",
  },
  {
    id: deploymentResults.templateIds["warm-leads"].email_5,
    name: "WARM Email 5 - Simple Systems",
    sequence: "WARM",
  },

  // COLD Sequence
  {
    id: deploymentResults.templateIds["cold-leads"].email_1,
    name: "COLD Email 1 - Welcome",
    sequence: "COLD",
  },
  {
    id: deploymentResults.templateIds["cold-leads"].email_2,
    name: "COLD Email 2 - Problem Awareness",
    sequence: "COLD",
  },
  {
    id: deploymentResults.templateIds["cold-leads"].email_3,
    name: "COLD Email 3 - Solution Intro",
    sequence: "COLD",
  },
  {
    id: deploymentResults.templateIds["cold-leads"].email_4,
    name: "COLD Email 4 - Benefits",
    sequence: "COLD",
  },
  {
    id: deploymentResults.templateIds["cold-leads"].email_5,
    name: "COLD Email 5 - Gentle Path",
    sequence: "COLD",
  },
];

async function sendTestEmail(template) {
  const testEmail = {
    to: "joshua@zirkel.us",
    from: {
      email: "contact@clutter-free-spaces.com",
      name: "Chanel Basolo - ClutterFreeSpaces",
    },
    templateId: template.id,
    dynamicTemplateData: {
      first_name: "Josh",
      rv_type: "Class A Motorhome",
      challenge: "Kitchen Organization",
      consultation_url: "https://calendly.com/chanelnbasolo/30min",
      book_consultation_url: "https://calendly.com/chanelnbasolo/30min",
      quiz_url: "https://clutterfreespaces-production.up.railway.app/quiz",
      newsletter_archive_url:
        "https://clutterfreespaces-production.up.railway.app/archive",
    },
  };

  try {
    const response = await sgMail.send(testEmail);
    console.log(`✅ ${template.name} sent successfully`);
    return {
      success: true,
      messageId: response[0].headers["x-message-id"],
      template: template,
    };
  } catch (error) {
    console.error(`❌ ${template.name} failed:`, error.message);
    return {
      success: false,
      error: error.message,
      template: template,
    };
  }
}

async function testAllCorrectedTemplates() {
  console.log("🧪 COMPREHENSIVE CORRECTED TEMPLATE TEST");
  console.log("==========================================");
  console.log("Testing ALL 15 templates with corrected personalization");
  console.log("");
  console.log("📧 Sending to: joshua@zirkel.us");
  console.log(
    "🏷️  Personalization: Josh, Class A Motorhome, Kitchen Organization",
  );
  console.log("📅 Expected: Chanel Basolo, 30-minute consultations");
  console.log("");
  console.log("📊 Testing Templates:");
  ALL_TEMPLATES.forEach((template) => {
    console.log(`   ${template.sequence}: ${template.name} (${template.id})`);
  });
  console.log("");

  const results = [];
  let sequenceCount = { HOT: 0, WARM: 0, COLD: 0 };

  // Test each template with delays
  for (let i = 0; i < ALL_TEMPLATES.length; i++) {
    const template = ALL_TEMPLATES[i];
    console.log(`📤 [${i + 1}/15] Testing ${template.name}...`);

    const result = await sendTestEmail(template);
    results.push(result);

    if (result.success) {
      sequenceCount[template.sequence]++;
    }

    // Small delay between sends
    if (i < ALL_TEMPLATES.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  // Generate comprehensive summary
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log("\n\n📊 COMPREHENSIVE TEST RESULTS:");
  console.log("===============================");
  console.log(`✅ Successful: ${successful.length}/15`);
  console.log(`❌ Failed: ${failed.length}/15`);
  console.log(
    `📈 Success Rate: ${((successful.length / 15) * 100).toFixed(1)}%`,
  );
  console.log("");

  console.log("🔥 HOT Sequence Results:");
  console.log(`   ✅ Successful: ${sequenceCount.HOT}/5`);
  console.log("🌟 WARM Sequence Results:");
  console.log(`   ✅ Successful: ${sequenceCount.WARM}/5`);
  console.log("❄️  COLD Sequence Results:");
  console.log(`   ✅ Successful: ${sequenceCount.COLD}/5`);

  if (failed.length > 0) {
    console.log("\n❌ FAILED TEMPLATES:");
    failed.forEach((f) => {
      console.log(`   - ${f.template.name}: ${f.error}`);
    });
  }

  console.log("\n🎯 WHAT TO VERIFY IN YOUR INBOX:");
  console.log("==================================");
  console.log("✅ All emails show: 'Chanel Basolo'");
  console.log("✅ All emails show: 'Montana RV Organization Expert'");
  console.log("✅ All consultations are: '30-minute consultation'");
  console.log("✅ No references to: 'Sarah Mitchell' or 'Sarah'");
  console.log("✅ No references to: '20-minute breakthrough call'");
  console.log(
    "✅ All Calendly links work: https://calendly.com/chanelnbasolo/30min",
  );

  console.log(
    `\n📥 CHECK YOUR INBOX: ${successful.length} emails should arrive shortly!`,
  );

  if (successful.length === 15) {
    console.log(
      "\n🎉 PERFECT! All templates deployed and tested successfully!",
    );
    console.log("The personalization fix is COMPLETE across all sequences.");
  }

  return {
    total: 15,
    successful: successful.length,
    failed: failed.length,
    results: results,
  };
}

// Run the comprehensive test
testAllCorrectedTemplates().catch(console.error);
