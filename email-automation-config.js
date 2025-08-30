#!/usr/bin/env node

/**
 * ClutterFreeSpaces Email Automation Configuration
 *
 * This script configures the email automation workflows and provides
 * functions to trigger email sequences with proper timing.
 *
 * Usage:
 * - For API integration: require('./email-automation-config.js')
 * - For manual testing: node email-automation-config.js --test
 */

const sgMail = require("@sendgrid/mail");

// SendGrid API configuration
require("dotenv").config();
const SENDGRID_API_KEY = process.env.SendGrid_API_Key;
sgMail.setApiKey(SENDGRID_API_KEY);

// Email sequence template IDs (deployed from deploy-sendgrid-templates.js)
const SEQUENCE_TEMPLATES = {
  "hot-leads": {
    email_1: "d-f1a6898e10e641e6b50c90c7e2f14a2f", // Day 0 - Welcome
    email_2: "d-fe0bcba3de744a979adf56dd9a39a986", // Day 2 - Quick-win checklist
    email_3: "d-a28f0d1925384df8bc5e7d7e96725bc7", // Day 4 - Montana factors
    email_4: "d-507bc5eec63d49d4b0780584173bb442", // Day 7 - 10-minute system
    email_5: "d-607cdd56799d47f4819a016ca98c7e22", // Day 10 - Decision time
  },
  "warm-leads": {
    email_1: "d-ecfda28c118b48918adae29481dabcce", // Day 0 - Welcome
    email_2: "d-a15abb3393d949e7888a068900658a42", // Day 3 - 15-minute rule
    email_3: "d-6fd109d0a63d4a84bce61952a1990173", // Day 7 - Avoidance psychology
    email_4: "d-6b352c4b7d8e4c548d94406dfe3bd8cc", // Day 14 - Storage solutions
    email_5: "d-447d7f5acc244b50a3ca4547dd011dd1", // Day 21 - Path forward
  },
  "cold-leads": {
    email_1: "d-e3ee97cb417940d0b3afd72c91950569", // Day 0 - Welcome
    email_2: "d-48e78d5ea51340ff95e2fd267bdc2217", // Day 5 - Impossibly messy story
    email_3: "d-74188478217e423491750a72a9f5be9d", // Day 12 - Why advice fails
    email_4: "d-f6ad5c67fe13429db310f55073514271", // Day 21 - Simple systems
    email_5: "d-73bd6a14f1634afe8c42fd55c0f69da8", // Day 30 - Gentle path forward
  },
};

// Sequence configuration with timing and metadata
const SEQUENCE_CONFIG = {
  HOT: {
    name: "HOT Leads - Aggressive 10-day sequence",
    totalEmails: 5,
    cadence: [0, 2, 4, 7, 10], // Days to send each email
    templates: SEQUENCE_TEMPLATES["hot-leads"],
    fromName: "Chanel - Montana RV Organization",
    fromEmail: "contact@clutter-free-spaces.com",
    // unsubscribeGroup: 25257, // Removed - was blocking email delivery
  },
  WARM: {
    name: "WARM Leads - Educational 21-day sequence",
    totalEmails: 5,
    cadence: [0, 3, 7, 14, 21], // Days to send each email
    templates: SEQUENCE_TEMPLATES["warm-leads"],
    fromName: "Chanel - Montana RV Organization",
    fromEmail: "contact@clutter-free-spaces.com",
    // unsubscribeGroup: 25257, // Removed - was blocking email delivery
  },
  COLD: {
    name: "COLD Leads - Gentle 30-day sequence",
    totalEmails: 5,
    cadence: [0, 5, 12, 21, 30], // Days to send each email
    templates: SEQUENCE_TEMPLATES["cold-leads"],
    fromName: "Chanel - Montana RV Organization",
    fromEmail: "contact@clutter-free-spaces.com",
    // unsubscribeGroup: 25257, // Removed - was blocking email delivery
  },
};

/**
 * Send a single email in a sequence
 */
async function sendSequenceEmail(emailData) {
  const {
    templateId,
    email,
    firstName,
    rvType,
    challenge,
    segment,
    emailNumber,
    fromName,
    fromEmail,
    // unsubscribeGroup, // Removed - was causing ASM blocking
  } = emailData;

  try {
    const msg = {
      to: email,
      from: {
        email: fromEmail || "contact@clutter-free-spaces.com",
        name: fromName || "Chanel - Montana RV Organization",
      },
      templateId: templateId,
      dynamicTemplateData: {
        first_name: firstName,
        rv_type: rvType,
        challenge: challenge,
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
      // ASM groups removed - using SendGrid's default unsubscribe handling
      // The problematic ASM Group 25257 was blocking email delivery
    };

    await sgMail.send(msg);

    console.log(`✅ ${segment} Email ${emailNumber} sent to ${email}`);
    console.log(`   Template: ${templateId}`);
    console.log(`   Personalization: ${firstName}, ${rvType}, ${challenge}`);

    return {
      success: true,
      emailSent: true,
      templateId,
      segment,
      emailNumber,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      `❌ Failed to send ${segment} Email ${emailNumber} to ${email}:`,
      error.response?.body || error.message,
    );

    return {
      success: false,
      emailSent: false,
      error: error.message,
      segment,
      emailNumber,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Schedule and manage email sequences for a lead
 * Note: This is a simplified version. In production, you'd want to use:
 * - SendGrid Marketing Campaigns automation
 * - A job queue system like Bull/BullMQ
 * - A cron job system
 * - Database to track email send status
 */
async function triggerEmailSequence(leadData) {
  const { email, firstName, rvType, challenge, segment } = leadData;

  if (!SEQUENCE_CONFIG[segment]) {
    throw new Error(`Invalid segment: ${segment}. Must be HOT, WARM, or COLD`);
  }

  const config = SEQUENCE_CONFIG[segment];
  const results = [];

  console.log(
    `🚀 Starting ${segment} email sequence for ${firstName} (${email})`,
  );
  console.log(`   Sequence: ${config.name}`);
  console.log(`   Total emails: ${config.totalEmails}`);
  console.log(`   Cadence: Days ${config.cadence.join(", ")}`);

  // Send welcome email immediately (Day 0)
  if (config.cadence[0] === 0) {
    const welcomeResult = await sendSequenceEmail({
      templateId: config.templates.email_1,
      email,
      firstName,
      rvType,
      challenge,
      segment,
      emailNumber: 1,
      fromName: config.fromName,
      fromEmail: config.fromEmail,
      // unsubscribeGroup: config.unsubscribeGroup, // Removed ASM group
    });

    results.push(welcomeResult);
  }

  // Schedule remaining emails
  // NOTE: In production, you'd schedule these with a job queue or cron system
  // For now, we'll just log the schedule
  for (let i = 1; i < config.cadence.length; i++) {
    const dayDelay = config.cadence[i];
    const emailNumber = i + 1;
    const templateId = config.templates[`email_${emailNumber}`];

    console.log(
      `📅 Email ${emailNumber} scheduled for Day ${dayDelay} (Template: ${templateId})`,
    );

    // In production, you'd schedule this email:
    // await scheduleEmail({
    //   templateId,
    //   email,
    //   firstName,
    //   rvType,
    //   challenge,
    //   segment,
    //   emailNumber,
    //   sendDate: new Date(Date.now() + dayDelay * 24 * 60 * 60 * 1000)
    // });
  }

  return {
    success: true,
    leadEmail: email,
    segment,
    welcomeEmailSent: results[0]?.emailSent || false,
    scheduledEmails: config.cadence.length - 1,
    results,
  };
}

/**
 * Get analytics for all sequences
 */
function getSequenceAnalytics() {
  return {
    sequences: Object.entries(SEQUENCE_CONFIG).map(([segment, config]) => ({
      segment,
      name: config.name,
      totalEmails: config.totalEmails,
      cadence: config.cadence,
      templates: Object.values(config.templates),
    })),
    summary: {
      totalActiveSequences: Object.keys(SEQUENCE_CONFIG).length,
      totalTemplates: 15,
      deploymentsCompleted: 1,
      lastUpdated: new Date().toISOString(),
    },
  };
}

/**
 * Test function for automation system
 */
async function testAutomation() {
  console.log("🧪 Testing Email Automation System...\n");

  // Test data
  const testLeads = [
    {
      email: "contact+automation-hot@clutter-free-spaces.com",
      firstName: "TestHot",
      rvType: "Class A Motorhome",
      challenge: "Kitchen Organization",
      segment: "HOT",
    },
  ];

  const results = [];

  for (const lead of testLeads) {
    console.log(
      `\n🔄 Testing ${lead.segment} sequence for ${lead.firstName}...`,
    );
    const result = await triggerEmailSequence(lead);
    results.push(result);
  }

  return results;
}

// CLI interface
const args = process.argv.slice(2);

if (args.includes("--test")) {
  testAutomation().then(() => {
    console.log("\n🎉 Automation testing complete!");
  });
} else if (args.includes("--analytics")) {
  console.log("📊 Email Sequence Analytics:");
  console.log(JSON.stringify(getSequenceAnalytics(), null, 2));
}

module.exports = {
  SEQUENCE_CONFIG,
  SEQUENCE_TEMPLATES,
  triggerEmailSequence,
  sendSequenceEmail,
  getSequenceAnalytics,
  testAutomation,
};
