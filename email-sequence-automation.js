/**
 * Email Sequence Automation Script
 *
 * This script handles the automated sending of email sequences based on
 * lead scores and timing configurations defined in the newsletter sequences.
 *
 * Usage:
 * - Can be run as a standalone cron job
 * - Can be integrated into the main API server
 * - Handles delayed email sending for each sequence type
 */

const sgMail = require("@sendgrid/mail");
const sgClient = require("@sendgrid/client");
const emailSequences = require("./newsletter-email-sequences.js");
require("dotenv").config();

// Set up SendGrid
sgMail.setApiKey(process.env.SendGrid_API_Key);
sgClient.setApiKey(process.env.SendGrid_API_Key);

// Email sequence template IDs (from deployment)
const SEQUENCE_TEMPLATES = {
  "hot-leads": {
    email_1: "d-eabed605ddbe4683a7805e95bd662558",
    email_2: "d-62e5f982a60943418c8062150786667d",
    email_3: "d-605986fef15d4aa2ba3101cd5345e4a5",
    email_4: "d-37d3b2c6eb2448daa6e86280c5311e0d",
    email_5: "d-aa61ee5c237448628f6d740b80df4da8",
  },
  "warm-leads": {
    email_1: "d-1e1ebe677c8c4faa8cc294e08ecf63a0",
    email_2: "d-930f412cbdab4572a7c572972ddc3171",
    email_3: "d-bdb8e3c695e74920b7a365dcde9d6bd3",
    email_4: "d-271bfb484fe7412182119ddb4887c45e",
    email_5: "d-687ca0f1692a4ebcb58b24650bb80d7e",
  },
  "cold-leads": {
    email_1: "d-d3aab9271ef94a269ca7f3204042d81a",
    email_2: "d-de8576877049432f96e7a9cffaf6993c",
    email_3: "d-c50bf7f9ffb6491eabe032211561b744",
    email_4: "d-edf036e9ded5414991ed58d14ce3c0b8",
    email_5: "d-2115c2735e3a4233bf5b009f9664db37",
  },
};

/**
 * Schedule email to be sent at a specific time
 * Note: SendGrid only supports scheduling up to 72 hours in advance
 * For longer delays, you'll need a job queue system like Bull/Redis
 */
async function scheduleEmail(emailData, sendAtTimestamp) {
  try {
    const msg = {
      ...emailData,
      sendAt: sendAtTimestamp, // Unix timestamp
    };

    // Only schedule if within SendGrid's 72-hour limit
    const maxSendTime = Math.floor(Date.now() / 1000) + 72 * 60 * 60; // 72 hours from now

    if (sendAtTimestamp <= maxSendTime) {
      await sgMail.send(msg);
      console.log(
        `✅ Scheduled email for ${new Date(sendAtTimestamp * 1000).toISOString()}`,
      );
    } else {
      console.log(
        `⚠️ Email scheduled beyond 72-hour limit, needs job queue implementation`,
      );
      // TODO: Add to job queue for later processing
    }
  } catch (error) {
    console.error("❌ Error scheduling email:", error);
    throw error;
  }
}

/**
 * Send an individual email in the sequence
 */
async function sendSequenceEmail(emailConfig) {
  try {
    const msg = {
      to: emailConfig.email,
      from: {
        email: "sarah@clutter-free-spaces.com",
        name: "Sarah Mitchell - Montana RV Organization",
      },
      templateId: emailConfig.templateId,
      dynamicTemplateData: emailConfig.dynamicData,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    };

    // Send immediately or schedule for later
    if (emailConfig.delayDays === 0) {
      await sgMail.send(msg);
      console.log(`✅ Sent immediate email to ${emailConfig.email}`);
    } else {
      const sendAtTimestamp =
        Math.floor(Date.now() / 1000) + emailConfig.delayDays * 24 * 60 * 60;
      await scheduleEmail(msg, sendAtTimestamp);
    }
  } catch (error) {
    console.error(`❌ Error sending email to ${emailConfig.email}:`, error);
    throw error;
  }
}

/**
 * Start a complete email sequence for a subscriber
 */
async function startEmailSequence(subscriberData) {
  const {
    email,
    firstName,
    segment,
    rvType,
    biggestChallenge,
    montanaResident,
  } = subscriberData;

  console.log(`🚀 Starting ${segment} sequence for ${firstName} (${email})`);

  // Get sequence configuration
  let sequenceKey;
  let sequenceConfig;

  switch (segment.toLowerCase()) {
    case "hot":
      sequenceKey = "hot-leads";
      sequenceConfig = emailSequences.hotLeads;
      break;
    case "warm":
      sequenceKey = "warm-leads";
      sequenceConfig = emailSequences.warmLeads;
      break;
    case "cold":
      sequenceKey = "cold-leads";
      sequenceConfig = emailSequences.coldLeads;
      break;
    default:
      throw new Error(`Unknown segment: ${segment}`);
  }

  const templates = SEQUENCE_TEMPLATES[sequenceKey];
  const { emails, metadata } = sequenceConfig;

  // Prepare dynamic data for personalization
  const dynamicData = {
    first_name: firstName,
    rv_type: rvType || "RV",
    challenge: biggestChallenge || "organization",
    consultation_url:
      "https://calendly.com/clutterfree-montana/rv-consultation",
    quiz_url: "https://clutter-free-spaces.com/organization-quiz",
    newsletter_archive_url: "https://clutter-free-spaces.com/rv-tips",
    book_consultation_url:
      "https://calendly.com/clutterfree-montana/rv-consultation",
  };

  // Send each email in the sequence
  for (let i = 0; i < emails.length; i++) {
    const emailData = emails[i];
    const templateKey = `email_${i + 1}`;
    const templateId = templates[templateKey];

    if (!templateId) {
      console.error(`❌ Template not found for ${sequenceKey} ${templateKey}`);
      continue;
    }

    const emailConfig = {
      email,
      templateId,
      dynamicData,
      delayDays: emailData.day,
    };

    await sendSequenceEmail(emailConfig);
  }

  console.log(
    `✅ ${segment} sequence initiated for ${firstName} (${emails.length} emails scheduled)`,
  );
}

/**
 * Get contact lists for different segments
 */
async function getSegmentContacts(segment) {
  try {
    // This would integrate with your CRM/database to get contacts
    // For now, this is a placeholder function
    console.log(`📋 Getting contacts for ${segment} segment...`);

    // TODO: Implement actual contact retrieval
    // You could integrate with:
    // - SendGrid contact lists
    // - Airtable CRM
    // - Local database
    // - CSV files

    return [];
  } catch (error) {
    console.error(`❌ Error getting ${segment} contacts:`, error);
    return [];
  }
}

/**
 * Process daily email sequences (run as cron job)
 */
async function processDailyEmailSequences() {
  console.log("🕐 Processing daily email sequences...");

  try {
    // Get today's date
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    console.log(`📅 Processing sequences for ${todayString}`);

    // Process each segment
    for (const segment of ["HOT", "WARM", "COLD"]) {
      const contacts = await getSegmentContacts(segment);

      for (const contact of contacts) {
        // Check if any emails are due for this contact
        // This would require storing sequence state somewhere
        // TODO: Implement sequence state tracking
        // - Track which emails have been sent
        // - Calculate which emails are due today
        // - Send due emails
      }
    }

    console.log("✅ Daily email sequence processing complete");
  } catch (error) {
    console.error("❌ Error processing daily sequences:", error);
  }
}

/**
 * Test function to verify email sequences work
 */
async function testEmailSequence(testEmail, segment = "WARM") {
  console.log(`🧪 Testing ${segment} email sequence with ${testEmail}`);

  const testSubscriber = {
    email: testEmail,
    firstName: "Test",
    segment: segment,
    rvType: "Class A",
    biggestChallenge: "Kitchen Organization",
    montanaResident: true,
  };

  try {
    // For testing, we'll only send the first email immediately
    // and log what would be scheduled
    const sequenceKey = segment.toLowerCase() + "-leads";
    const sequenceConfig = emailSequences[segment.toLowerCase() + "Leads"];
    const templates = SEQUENCE_TEMPLATES[sequenceKey];

    console.log(
      `📧 Test sequence: ${sequenceConfig.metadata.totalEmails} emails over ${sequenceConfig.metadata.duration}`,
    );

    // Send only the first email for testing
    const firstEmail = {
      email: testEmail,
      templateId: templates.email_1,
      dynamicData: {
        first_name: "Test",
        rv_type: "Class A",
        challenge: "Kitchen Organization",
        consultation_url:
          "https://calendly.com/clutterfree-montana/rv-consultation",
        quiz_url: "https://clutter-free-spaces.com/organization-quiz",
        newsletter_archive_url: "https://clutter-free-spaces.com/rv-tips",
        book_consultation_url:
          "https://calendly.com/clutterfree-montana/rv-consultation",
      },
      delayDays: 0,
    };

    await sendSequenceEmail(firstEmail);

    // Log what would be scheduled
    for (let i = 1; i < sequenceConfig.emails.length; i++) {
      const email = sequenceConfig.emails[i];
      const sendDate = new Date(Date.now() + email.day * 24 * 60 * 60 * 1000);
      console.log(
        `📅 Would schedule Email ${i + 1} for Day ${email.day}: ${sendDate.toISOString().split("T")[0]}`,
      );
    }

    console.log("✅ Test sequence initiated successfully");
  } catch (error) {
    console.error("❌ Test sequence failed:", error);
  }
}

/**
 * CLI interface for running different functions
 */
async function main() {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  switch (command) {
    case "test":
      if (!arg1) {
        console.error(
          "Usage: node email-sequence-automation.js test <email> [segment]",
        );
        process.exit(1);
      }
      await testEmailSequence(arg1, arg2 || "WARM");
      break;

    case "start":
      if (!arg1) {
        console.error(
          "Usage: node email-sequence-automation.js start <subscriber-json>",
        );
        process.exit(1);
      }
      const subscriberData = JSON.parse(arg1);
      await startEmailSequence(subscriberData);
      break;

    case "daily":
      await processDailyEmailSequences();
      break;

    case "help":
    default:
      console.log(`
📧 Email Sequence Automation Commands:

test <email> [segment]     - Test email sequence (sends first email only)
                            Segments: HOT, WARM, COLD (default: WARM)

start <json>              - Start full sequence for subscriber
                            JSON format: {"email":"test@example.com","firstName":"Test","segment":"WARM","rvType":"Class A","biggestChallenge":"Kitchen","montanaResident":true}

daily                     - Process daily email sequences (for cron jobs)

Examples:
  node email-sequence-automation.js test test@example.com WARM
  node email-sequence-automation.js start '{"email":"test@example.com","firstName":"Test","segment":"HOT","rvType":"Class A","biggestChallenge":"Kitchen","montanaResident":true}'
  node email-sequence-automation.js daily
      `);
      break;
  }
}

// Export functions for use in other modules
module.exports = {
  startEmailSequence,
  testEmailSequence,
  processDailyEmailSequences,
  scheduleEmail,
  sendSequenceEmail,
};

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}
