#!/usr/bin/env node

/**
 * Google Review Request Automation System
 * Monitors Airtable for Status changes to "Client" and triggers review email sequence
 */

const axios = require("axios");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// Configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const SENDGRID_API_KEY = process.env.SendGrid_API_Key;

// Review email template IDs from SendGrid deployment
const REVIEW_TEMPLATES = {
  day3_thank_you: "d-4a99a1de148849c48321aecd4d3af1e9",
  day10_reminder: "d-9ee0efa320594e5b899480e0c97984ef",
  day30_checkin: "d-ec7b0b799ea3489396a34674e6a52bc5",
};

sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Check for new clients who need review requests
 */
async function checkForNewClients() {
  try {
    console.log("🔍 Checking for new clients needing review requests...");

    // Get all leads with Status = "Client" and no review request sent
    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Leads`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
        params: {
          filterByFormula: `AND({Status} = "Client", {Review Requested} != TRUE())`,
          maxRecords: 50,
        },
      },
    );

    const newClients = response.data.records;
    console.log(
      `📊 Found ${newClients.length} clients needing review requests`,
    );

    for (const client of newClients) {
      await processNewClient(client);
    }
  } catch (error) {
    console.error("❌ Error checking for new clients:", error.message);
  }
}

/**
 * Process a new client for review request scheduling
 */
async function processNewClient(client) {
  const fields = client.fields;
  const firstName = fields["First Name"];
  const email = fields["Email"];
  const serviceDate =
    fields["Service Completion Date"] || new Date().toISOString();

  console.log(`👤 Processing client: ${firstName} (${email})`);

  try {
    // Calculate email send dates
    const serviceDateTime = new Date(serviceDate);
    const day3Date = new Date(
      serviceDateTime.getTime() + 3 * 24 * 60 * 60 * 1000,
    );
    const day10Date = new Date(
      serviceDateTime.getTime() + 10 * 24 * 60 * 60 * 1000,
    );
    const day30Date = new Date(
      serviceDateTime.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    // Schedule review email sequence
    await scheduleReviewEmails(client.id, {
      firstName,
      email,
      serviceDate: serviceDateTime,
      day3Date,
      day10Date,
      day30Date,
    });

    // Mark as review requested in Airtable
    await updateAirtableRecord(client.id, {
      "Review Requested": true,
      "Review Request Date": new Date().toISOString(),
      "Day 3 Email Scheduled": day3Date.toISOString(),
      "Day 10 Email Scheduled": day10Date.toISOString(),
      "Day 30 Email Scheduled": day30Date.toISOString(),
    });

    console.log(`✅ Scheduled review sequence for ${firstName}`);
  } catch (error) {
    console.error(`❌ Failed to process client ${firstName}:`, error.message);
  }
}

/**
 * Schedule the 3-email review request sequence
 */
async function scheduleReviewEmails(clientId, clientData) {
  const { firstName, email, day3Date, day10Date, day30Date } = clientData;

  // For now, we'll send immediately if the date has passed, otherwise log the schedule
  // In production, you'd integrate with a scheduling system like node-cron or external scheduler

  const now = new Date();

  // Day 3 email
  if (day3Date <= now) {
    await sendReviewEmail("day3_thank_you", { firstName, email, clientId });
  } else {
    console.log(`📅 Day 3 email scheduled for ${day3Date.toISOString()}`);
    // TODO: Integrate with scheduler (cron job, AWS Lambda, etc.)
  }

  // Day 10 email
  if (day10Date <= now && day3Date <= now) {
    // Only send if Day 3 already passed
    await sendReviewEmail("day10_reminder", { firstName, email, clientId });
  } else {
    console.log(`📅 Day 10 email scheduled for ${day10Date.toISOString()}`);
  }

  // Day 30 email
  if (day30Date <= now && day10Date <= now) {
    // Only send if Day 10 already passed
    await sendReviewEmail("day30_checkin", { firstName, email, clientId });
  } else {
    console.log(`📅 Day 30 email scheduled for ${day30Date.toISOString()}`);
  }
}

/**
 * Send a review request email using SendGrid template
 */
async function sendReviewEmail(templateKey, clientData) {
  const { firstName, email, clientId } = clientData;
  const templateId = REVIEW_TEMPLATES[templateKey];

  if (!templateId) {
    console.log(
      `⚠️ Template ID not found for ${templateKey} - deploy templates first`,
    );
    return;
  }

  try {
    console.log(`📧 Sending ${templateKey} email to ${firstName} (${email})`);

    const msg = {
      to: email,
      from: {
        email: "contact@clutter-free-spaces.com",
        name: "Chanel - ClutterFreeSpaces",
      },
      templateId: templateId,
      dynamicTemplateData: {
        firstName: firstName,
        email: email,
      },
    };

    await sgMail.send(msg);

    // Update Airtable to track email sent
    const updateField = {
      day3_thank_you: "Day 3 Email Sent",
      day10_reminder: "Day 10 Email Sent",
      day30_checkin: "Day 30 Email Sent",
    }[templateKey];

    if (updateField) {
      await updateAirtableRecord(clientId, {
        [updateField]: new Date().toISOString(),
      });
    }

    console.log(`✅ Sent ${templateKey} email to ${firstName}`);
  } catch (error) {
    console.error(
      `❌ Failed to send ${templateKey} email to ${firstName}:`,
      error.message,
    );
  }
}

/**
 * Update Airtable record
 */
async function updateAirtableRecord(recordId, fields) {
  try {
    await axios.patch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Leads/${recordId}`,
      { fields },
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      `❌ Failed to update Airtable record ${recordId}:`,
      error.message,
    );
    throw error;
  }
}

/**
 * Check for clients who may have left reviews (manual process for now)
 */
async function checkForNewReviews() {
  // This would integrate with Google My Business API in the future
  // For now, it's a manual process to check and update Airtable
  console.log(
    '📝 Manual process: Check Google Reviews and update Airtable "Review Received" field',
  );
}

/**
 * Run the automation check
 */
async function runAutomation() {
  console.log("🤖 Starting review automation check...");

  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY || !SENDGRID_API_KEY) {
    console.log("❌ Missing required environment variables");
    console.log(
      "Required: AIRTABLE_BASE_ID, AIRTABLE_API_KEY, SendGrid_API_Key",
    );
    return;
  }

  if (!REVIEW_TEMPLATES.day3_thank_you) {
    console.log(
      "⚠️ Review templates not deployed yet. Run: node review-request-email-templates.js",
    );
    return;
  }

  await checkForNewClients();
  await checkForNewReviews();

  console.log("✅ Review automation check complete");
}

// Enhanced Airtable fields setup
async function setupAirtableFields() {
  console.log('📋 Fields needed in Airtable "Leads" table:');
  console.log(`
Required Fields:
- Review Requested (Checkbox)
- Review Received (Checkbox)  
- Review Request Date (Date)
- Service Completion Date (Date)
- Day 3 Email Scheduled (Date)
- Day 10 Email Scheduled (Date)
- Day 30 Email Scheduled (Date)
- Day 3 Email Sent (Date)
- Day 10 Email Sent (Date)
- Day 30 Email Sent (Date)
- Google Review URL (URL) - optional
- Review Rating (Number) - optional
- Review Text (Long text) - optional
  `);
}

// Cron job setup example
function setupCronJob() {
  console.log("⏰ To run automatically, add this to your cron jobs:");
  console.log("# Check for review requests every day at 9 AM");
  console.log(
    "0 9 * * * cd /path/to/project && node review-automation-system.js",
  );
  console.log("");
  console.log(
    'Or set up a webhook in Airtable to trigger when Status changes to "Client"',
  );
}

// Export functions
module.exports = {
  runAutomation,
  checkForNewClients,
  processNewClient,
  sendReviewEmail,
  setupAirtableFields,
  setupCronJob,
  REVIEW_TEMPLATES, // Can be updated after template deployment
};

// Run if called directly
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case "setup":
      setupAirtableFields();
      setupCronJob();
      break;
    case "test":
      runAutomation();
      break;
    default:
      runAutomation();
  }
}
