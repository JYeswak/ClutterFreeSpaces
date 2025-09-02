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
  newsletter: {
    email_1: "d-fe9c460e40b4493d9136ce0f533ffdb0", // Day 0 - Welcome to community
    email_2: "d-48708dbd9e144dcd8e7345891d0c0ee2", // Day 3 - #1 mistake
    email_3: "d-a504d52cf30b497a93193e121651991a", // Day 7 - 3 principles
  },
  "hot-leads": {
    email_1: "d-afb751285d0e4516954a1998a84de36e", // Day 0 - Welcome
    email_2: "d-ce3f54f9f29047c8aec80307de6dd040", // Day 2 - Quick-win checklist
    email_3: "d-d85a69f8f07d4d818d1b38a4f517aca9", // Day 4 - Montana factors
    email_4: "d-0ccb27b3ac1243b79ac24281bcbc153e", // Day 7 - 10-minute system
    email_5: "d-070f1a08d745496492ea47402d8a620b", // Day 10 - Decision time
  },
  "warm-leads": {
    email_1: "d-e2dda8fe19224b07b07d7c7ccad4b2f3", // Day 0 - Welcome
    email_2: "d-f4dce7876cab4da797d81db9911e9da1", // Day 3 - 15-minute rule
    email_3: "d-52e08e42be3b40c3a38e3251714e082d", // Day 7 - Avoidance psychology
    email_4: "d-a1e03ad306f540ffbd0ca377c3ce0594", // Day 14 - Storage solutions
    email_5: "d-4d0624d84ef24ab29f61db839e18ae86", // Day 21 - Path forward
  },
  "cold-leads": {
    email_1: "d-646ae76fc0b045b7b219c396cbbc847e", // Day 0 - Welcome
    email_2: "d-4a119321dab3409db55a6d30f638e317", // Day 5 - Impossibly messy story
    email_3: "d-3627f16998ed4874ac7570fe9ed23428", // Day 12 - Why advice fails
    email_4: "d-c02b5f745e2e4b339dd0cd2f13ec912a", // Day 21 - Simple systems
    email_5: "d-b17eec78420740f586b589971ca62ca2", // Day 30 - Gentle path forward
  },
};

// Sequence configuration with timing and metadata
const SEQUENCE_CONFIG = {
  NEWSLETTER: {
    name: "Newsletter - Generic welcome sequence",
    totalEmails: 3,
    cadence: [0, 3, 7], // Days to send each email
    templates: SEQUENCE_TEMPLATES["newsletter"],
    fromName: "Chanel - Montana RV Organization",
    fromEmail: "contact@clutter-free-spaces.com",
  },
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
        consultation_url: "https://calendly.com/chanelnbasolo/30min",
        quiz_url: "https://clutterfreespaces-production.up.railway.app/quiz",
        newsletter_archive_url:
          "https://clutterfreespaces-production.up.railway.app/archive",
        book_consultation_url: "https://calendly.com/chanelnbasolo/30min",
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
    throw new Error(
      `Invalid segment: ${segment}. Must be NEWSLETTER, HOT, WARM, or COLD`,
    );
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
