const axios = require("axios");
require("dotenv").config();

// Note: ManyChat API is primarily for enterprise accounts
// This script provides the webhook structure for Make.com integration

const MANYCHAT_WEBHOOK_STRUCTURE = {
  // This is the structure that ManyChat will send to Make.com
  webhook_payload: {
    subscriber_id: "{{subscriber_id}}",
    first_name: "{{first_name}}",
    last_name: "{{last_name}}",
    email: "{{email}}",
    phone: "{{phone}}",

    // Custom fields we'll create in ManyChat
    space_type: "{{space_type}}", // RV, Home, Office, Multiple
    challenge_type: "{{challenge_type}}", // Storage, Clutter, Layout, System
    budget_range: "{{budget_range}}", // Under $300, $300-800, $800-1200, Over $1200
    timeline: "{{timeline}}", // ASAP, 2 weeks, 1 month, 2-3 months, Exploring
    lead_score: "{{lead_score}}", // Calculated 25-100
    consultation_interest: "{{consultation_interest}}", // High, Medium, Low

    // System fields
    lead_source: "ManyChat",
    platform: "Facebook/Instagram",
    conversation_history: "{{conversation}}",
    created_at: "{{current_time}}",
    tags: ["manychat", "facebook", "{{space_type}}", "{{timeline}}"],
  },

  // Make.com webhook URL (you'll get this when setting up Make.com)
  webhook_url: "https://hook.make.com/YOUR_WEBHOOK_ID_HERE",

  // When to send webhooks
  triggers: [
    "qualification_complete", // After all questions answered
    "consultation_booked", // When Calendly link clicked
    "email_requested", // When email provided
    "follow_up_needed", // When sequence stalls
  ],
};

// Lead scoring function for ManyChat (as JavaScript custom field)
function calculateLeadScore(responses) {
  let score = 20; // Base score (reduced from 25)

  // Space type scoring
  if (responses.space_type === "RV") {
    score += 25; // RV is our specialty
  } else if (["Home", "Office"].includes(responses.space_type)) {
    score += 10; // Reduced from 15
  } else if (responses.space_type === "Multiple") {
    score += 20;
  }

  // Budget scoring
  switch (responses.budget_range) {
    case "Over $1200":
      score += 30; // Increased for premium clients
      break;
    case "$800-1200":
      score += 25; // Increased from 20
      break;
    case "$300-800":
      score += 15;
      break;
    case "Under $300":
      score += 0; // Reduced from 5 for low-budget leads
      break;
  }

  // Timeline scoring
  switch (responses.timeline) {
    case "ASAP":
      score += 30; // Increased for urgency
      break;
    case "2 weeks":
      score += 20;
      break;
    case "1 month":
      score += 15;
      break;
    case "2-3 months":
      score += 8; // Reduced from 10
      break;
    case "Exploring":
      score += 2; // Reduced from 5 for browsers
      break;
  }

  // Challenge type bonus
  if (["System", "Layout"].includes(responses.challenge_type)) {
    score += 10;
  }

  return Math.min(score, 100);
}

// Function to create Make.com webhook structure
async function createMakeWebhookStructure() {
  console.log("🔗 ManyChat to Make.com Webhook Structure\n");

  console.log("📋 Required ManyChat Custom Fields:");
  console.log("1. space_type (Single Choice: RV, Home, Office, Multiple)");
  console.log(
    "2. challenge_type (Single Choice: Storage, Clutter, Layout, System)",
  );
  console.log(
    "3. budget_range (Single Choice: Under $300, $300-800, $800-1200, Over $1200)",
  );
  console.log(
    "4. timeline (Single Choice: ASAP, 2 weeks, 1 month, 2-3 months, Exploring)",
  );
  console.log("5. lead_score (Number: 25-100)");
  console.log("6. consultation_interest (Single Choice: High, Medium, Low)\n");

  console.log("🎯 Lead Score Calculation:");

  // Example calculations
  const examples = [
    {
      space_type: "RV",
      budget_range: "Over $1200",
      timeline: "ASAP",
      challenge_type: "System",
    },
    {
      space_type: "Home",
      budget_range: "$300-800",
      timeline: "1 month",
      challenge_type: "Clutter",
    },
    {
      space_type: "Office",
      budget_range: "Under $300",
      timeline: "Exploring",
      challenge_type: "Storage",
    },
  ];

  examples.forEach((example, index) => {
    const score = calculateLeadScore(example);
    console.log(
      `Example ${index + 1}: Score ${score} - ${score >= 75 ? "HOT" : score >= 50 ? "WARM" : "COLD"} Lead`,
    );
    console.log(
      `   Space: ${example.space_type}, Budget: ${example.budget_range}, Timeline: ${example.timeline}`,
    );
  });

  console.log("\n🔧 ManyChat Setup Steps:");
  console.log("1. Go to manychat.com and create account");
  console.log("2. Connect Facebook/Instagram business pages");
  console.log("3. Create custom fields listed above");
  console.log("4. Build conversation flows using the guide");
  console.log("5. Set up webhook to Make.com with the structure below\n");

  console.log("📤 Webhook Payload Structure:");
  console.log(
    JSON.stringify(MANYCHAT_WEBHOOK_STRUCTURE.webhook_payload, null, 2),
  );

  return MANYCHAT_WEBHOOK_STRUCTURE;
}

// Function to test webhook payload
async function testWebhookPayload() {
  console.log("\n🧪 Testing sample webhook payload...\n");

  const samplePayload = {
    subscriber_id: "test123",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.j@email.com",
    phone: "+1234567890",
    space_type: "RV",
    challenge_type: "Storage",
    budget_range: "$800-1200",
    timeline: "ASAP",
    lead_score: calculateLeadScore({
      space_type: "RV",
      challenge_type: "Storage",
      budget_range: "$800-1200",
      timeline: "ASAP",
    }),
    consultation_interest: "High",
    lead_source: "ManyChat",
    platform: "Facebook",
    created_at: new Date().toISOString(),
    tags: ["manychat", "facebook", "RV", "ASAP"],
  };

  console.log("Sample Payload:");
  console.log(JSON.stringify(samplePayload, null, 2));
  console.log(
    `\nLead Score: ${samplePayload.lead_score} (${samplePayload.lead_score >= 75 ? "HOT" : samplePayload.lead_score >= 50 ? "WARM" : "COLD"} Lead)`,
  );

  return samplePayload;
}

// Function to create Airtable integration payload
async function createAirtablePayload(webhookData) {
  console.log("\n📊 Converting to Airtable format...\n");

  // Map ManyChat data to Airtable fields
  const airtablePayload = {
    fields: {
      Name: `${webhookData.first_name} ${webhookData.last_name}`.trim(),
      Email: webhookData.email,
      Phone: webhookData.phone,
      "Lead Score": parseInt(webhookData.lead_score),
      "Organization Style": "Flexible", // Will be determined by quiz later
      "Lead Source": "ManyChat",
      Status: "New Lead",
      "Space Type": [webhookData.space_type], // Array for multiple select
      "Budget Range": webhookData.budget_range,
      Timeline: webhookData.timeline.replace(/(\d+)\s+/, "$1 "), // Clean timeline format
      Notes: `Initial qualification via ManyChat. Challenge: ${webhookData.challenge_type}. Interest level: ${webhookData.consultation_interest}.`,
      "Quiz Answers": JSON.stringify({
        space_type: webhookData.space_type,
        challenge_type: webhookData.challenge_type,
        budget_range: webhookData.budget_range,
        timeline: webhookData.timeline,
        source: "ManyChat Facebook/Instagram",
      }),
    },
  };

  console.log("Airtable Payload:");
  console.log(JSON.stringify(airtablePayload, null, 2));

  return airtablePayload;
}

async function main() {
  console.log("🤖 ManyChat Integration Setup for ClutterFreeSpaces\n");

  // Create webhook structure
  const webhookStructure = await createMakeWebhookStructure();

  // Test with sample data
  const samplePayload = await testWebhookPayload();

  // Show Airtable conversion
  await createAirtablePayload(samplePayload);

  console.log("\n🚀 Next Steps:");
  console.log("1. Create ManyChat account and connect Facebook/Instagram");
  console.log("2. Set up custom fields as specified above");
  console.log(
    "3. Build conversation flows using manychat-lead-qualification-flows.md",
  );
  console.log("4. Create Make.com scenario to receive webhooks");
  console.log("5. Connect Make.com to Airtable for lead creation");
  console.log("6. Test the complete flow from ManyChat to Airtable");

  console.log(
    "\n✅ ManyChat webhook structure ready for Make.com integration!",
  );
}

// Export functions for use in other scripts
module.exports = {
  calculateLeadScore,
  createMakeWebhookStructure,
  createAirtablePayload,
  MANYCHAT_WEBHOOK_STRUCTURE,
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
