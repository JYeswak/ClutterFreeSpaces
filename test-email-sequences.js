#!/usr/bin/env node

/**
 * ClutterFreeSpaces Email Sequence Testing Script
 *
 * Tests the deployed email sequences with real SendGrid template IDs
 *
 * Usage: node test-email-sequences.js
 */

const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// SendGrid API configuration
const SENDGRID_API_KEY = process.env.SendGrid_API_Key;
sgMail.setApiKey(SENDGRID_API_KEY);

// Real template IDs from deployment
const SEQUENCE_TEMPLATES = {
  "hot-leads": {
    email_1: "d-f1a6898e10e641e6b50c90c7e2f14a2f",
    email_2: "d-fe0bcba3de744a979adf56dd9a39a986",
    email_3: "d-a28f0d1925384df8bc5e7d7e96725bc7",
    email_4: "d-507bc5eec63d49d4b0780584173bb442",
    email_5: "d-607cdd56799d47f4819a016ca98c7e22",
  },
  "warm-leads": {
    email_1: "d-ecfda28c118b48918adae29481dabcce",
    email_2: "d-a15abb3393d949e7888a068900658a42",
    email_3: "d-6fd109d0a63d4a84bce61952a1990173",
    email_4: "d-6b352c4b7d8e4c548d94406dfe3bd8cc",
    email_5: "d-447d7f5acc244b50a3ca4547dd011dd1",
  },
  "cold-leads": {
    email_1: "d-e3ee97cb417940d0b3afd72c91950569",
    email_2: "d-48e78d5ea51340ff95e2fd267bdc2217",
    email_3: "d-74188478217e423491750a72a9f5be9d",
    email_4: "d-f6ad5c67fe13429db310f55073514271",
    email_5: "d-73bd6a14f1634afe8c42fd55c0f69da8",
  },
};

// Test data for personalization
const TEST_LEAD_DATA = {
  hot: {
    email: "josh+hot-test@clutter-free-spaces.com",
    first_name: "Sarah",
    rv_type: "Class A Motorhome",
    challenge: "Kitchen Organization",
    segment: "HOT",
  },
  warm: {
    email: "josh+warm-test@clutter-free-spaces.com",
    first_name: "Mike",
    rv_type: "Travel Trailer",
    challenge: "Storage Bays",
    segment: "WARM",
  },
  cold: {
    email: "josh+cold-test@clutter-free-spaces.com",
    first_name: "Linda",
    rv_type: "Fifth Wheel",
    challenge: "Bedroom Organization",
    segment: "COLD",
  },
};

// Send test email function
async function sendTestEmail(segment, emailNumber, testData) {
  try {
    const templateId =
      SEQUENCE_TEMPLATES[`${segment.toLowerCase()}-leads`][
        `email_${emailNumber}`
      ];

    if (!templateId) {
      throw new Error(
        `Template ID not found for ${segment} email ${emailNumber}`,
      );
    }

    const msg = {
      to: testData.email,
      from: {
        email: "chanel@clutter-free-spaces.com",
        name: "Chanel @ ClutterFreeSpaces",
      },
      templateId: templateId,
      dynamicTemplateData: {
        first_name: testData.first_name,
        rv_type: testData.rv_type,
        challenge: testData.challenge,
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

    await sgMail.send(msg);
    console.log(
      `✅ ${segment} Email ${emailNumber} sent successfully to ${testData.email}`,
    );
    console.log(`   Template ID: ${templateId}`);
    console.log(
      `   Personalization: ${testData.first_name}, ${testData.rv_type}, ${testData.challenge}`,
    );

    return { success: true, templateId, segment, emailNumber };
  } catch (error) {
    console.error(
      `❌ Failed to send ${segment} Email ${emailNumber}:`,
      error.response?.body || error.message,
    );
    return { success: false, error: error.message, segment, emailNumber };
  }
}

// Test all welcome emails (Email 1 from each sequence)
async function testWelcomeEmails() {
  console.log("🧪 Testing Welcome Emails (Email 1 from each sequence)...\n");

  const results = [];

  // Test HOT leads welcome email
  console.log("🔥 Testing HOT leads welcome email...");
  const hotResult = await sendTestEmail("HOT", 1, TEST_LEAD_DATA.hot);
  results.push(hotResult);

  // Wait 2 seconds between sends
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test WARM leads welcome email
  console.log("\n🌟 Testing WARM leads welcome email...");
  const warmResult = await sendTestEmail("WARM", 1, TEST_LEAD_DATA.warm);
  results.push(warmResult);

  // Wait 2 seconds between sends
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test COLD leads welcome email
  console.log("\n❄️  Testing COLD leads welcome email...");
  const coldResult = await sendTestEmail("COLD", 1, TEST_LEAD_DATA.cold);
  results.push(coldResult);

  return results;
}

// Generate test report
function generateTestReport(results) {
  console.log("\n📊 EMAIL SEQUENCE TEST REPORT");
  console.log("=".repeat(50));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => r.success === false);

  console.log(`\n✅ Successful sends: ${successful.length}`);
  console.log(`❌ Failed sends: ${failed.length}`);
  console.log(
    `📈 Success rate: ${((successful.length / results.length) * 100).toFixed(1)}%`,
  );

  if (successful.length > 0) {
    console.log("\n🎉 SUCCESSFUL SENDS:");
    successful.forEach((result) => {
      console.log(
        `   ✅ ${result.segment} Email ${result.emailNumber}: ${result.templateId}`,
      );
    });
  }

  if (failed.length > 0) {
    console.log("\n💥 FAILED SENDS:");
    failed.forEach((result) => {
      console.log(
        `   ❌ ${result.segment} Email ${result.emailNumber}: ${result.error}`,
      );
    });
  }

  console.log("\n📧 TEST EMAIL ADDRESSES:");
  console.log("   HOT leads: josh+hot-test@clutter-free-spaces.com");
  console.log("   WARM leads: josh+warm-test@clutter-free-spaces.com");
  console.log("   COLD leads: josh+cold-test@clutter-free-spaces.com");

  console.log("\n🔍 VERIFICATION CHECKLIST:");
  console.log("   □ Check inbox for test emails");
  console.log("   □ Verify personalization variables populated correctly");
  console.log("   □ Test all links (consultation, quiz, newsletter archive)");
  console.log("   □ Confirm unsubscribe links work");
  console.log("   □ Check mobile rendering");
  console.log("   □ Verify SendGrid analytics tracking");
}

// Main test function
async function main() {
  console.log("🎯 ClutterFreeSpaces Email Sequence Testing");
  console.log("=".repeat(50));
  console.log("Testing deployed email templates with real SendGrid IDs...\n");

  try {
    // Test welcome emails from each sequence
    const welcomeResults = await testWelcomeEmails();

    // Generate report
    generateTestReport(welcomeResults);

    console.log("\n🎉 EMAIL TESTING COMPLETE!");
    console.log("Check your email inbox to verify the test sends.");
  } catch (error) {
    console.error("\n💥 TESTING FAILED:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  sendTestEmail,
  testWelcomeEmails,
  generateTestReport,
};
