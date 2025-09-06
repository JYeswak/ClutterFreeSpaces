const axios = require("axios");
require("dotenv").config();

// You'll need to add your Calendly Personal Access Token to .env
// CALENDLY_API_TOKEN=your_token_here

const CALENDLY_API_BASE = "https://api.calendly.com";

async function getUserInfo() {
  try {
    const response = await axios.get(`${CALENDLY_API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${process.env.Calendy_API_Key}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Calendly User Info:");
    console.log(`   Name: ${response.data.resource.name}`);
    console.log(`   Email: ${response.data.resource.email}`);
    console.log(
      `   Organization: ${response.data.resource.current_organization}`,
    );
    console.log(`   User URI: ${response.data.resource.uri}\n`);

    return response.data.resource;
  } catch (error) {
    console.error(
      "❌ Error getting user info:",
      error.response?.data || error.message,
    );
    return null;
  }
}

async function listEventTypes(userUri) {
  try {
    const response = await axios.get(`${CALENDLY_API_BASE}/event_types`, {
      headers: {
        Authorization: `Bearer ${process.env.Calendy_API_Key}`,
        "Content-Type": "application/json",
      },
      params: {
        user: userUri,
        active: true,
      },
    });

    console.log("📅 Your Event Types:");
    response.data.collection.forEach((eventType, index) => {
      console.log(`   ${index + 1}. ${eventType.name}`);
      console.log(`      URL: ${eventType.scheduling_url}`);
      console.log(`      URI: ${eventType.uri}`);
      console.log(`      Duration: ${eventType.duration} minutes\n`);
    });

    return response.data.collection;
  } catch (error) {
    console.error(
      "❌ Error listing event types:",
      error.response?.data || error.message,
    );
    return [];
  }
}

async function createWebhookSubscription(organizationUri, makeWebhookUrl) {
  const webhookData = {
    url: makeWebhookUrl,
    events: ["invitee.created", "invitee.canceled"],
    organization: organizationUri,
    scope: "organization",
  };

  try {
    const response = await axios.post(
      `${CALENDLY_API_BASE}/webhook_subscriptions`,
      webhookData,
      {
        headers: {
          Authorization: `Bearer ${process.env.Calendy_API_Key}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Webhook Subscription Created:");
    console.log(`   ID: ${response.data.resource.uri}`);
    console.log(`   URL: ${response.data.resource.url}`);
    console.log(`   Events: ${response.data.resource.events.join(", ")}`);
    console.log(`   Status: ${response.data.resource.state}\n`);

    return response.data.resource;
  } catch (error) {
    console.error(
      "❌ Error creating webhook:",
      error.response?.data || error.message,
    );
    return null;
  }
}

async function listWebhooks(organizationUri) {
  try {
    const response = await axios.get(
      `${CALENDLY_API_BASE}/webhook_subscriptions`,
      {
        headers: {
          Authorization: `Bearer ${process.env.Calendy_API_Key}`,
          "Content-Type": "application/json",
        },
        params: {
          organization: organizationUri,
          scope: "organization",
        },
      },
    );

    console.log("🔗 Existing Webhooks:");
    if (response.data.collection.length === 0) {
      console.log("   No webhooks found\n");
    } else {
      response.data.collection.forEach((webhook, index) => {
        console.log(`   ${index + 1}. ${webhook.url}`);
        console.log(`      Events: ${webhook.events.join(", ")}`);
        console.log(`      Status: ${webhook.state}\n`);
      });
    }

    return response.data.collection;
  } catch (error) {
    console.error(
      "❌ Error listing webhooks:",
      error.response?.data || error.message,
    );
    return [];
  }
}

async function generateMakeScenario(eventTypes, webhookUrl) {
  console.log("🔧 Make.com Scenario Configuration:");
  console.log("\n1. Create new scenario in Make.com");
  console.log("2. Add webhook trigger module:");
  console.log(`   Webhook URL: ${webhookUrl}`);
  console.log("\n3. Add filter after webhook:");
  console.log('   Condition: event = "invitee.created"');
  console.log("\n4. Add lead scoring logic:");

  const scoringLogic = `
// Lead Scoring JavaScript (Make.com)
let score = 0;

// Event type scoring
switch(webhook.payload.event_type.name) {
  case "30min":
    score += 30; // Free consultation
    break;
  case "Quick Win Session":
    score += 60; // Paid quick session
    break;
  case "Full Organization Project":
    score += 90; // High-value project
    break;
}

// Booking speed (how quickly they booked)
const bookingDelay = new Date(webhook.created_at) - new Date(webhook.payload.created_at);
if (bookingDelay < 3600000) { // Less than 1 hour
  score += 20;
} else if (bookingDelay < 86400000) { // Less than 1 day
  score += 10;
}

// Add quiz style if available in questions
const quizStyle = webhook.payload.questions_and_answers.find(qa => 
  qa.question.includes('style')
)?.answer;

if (quizStyle) {
  score += 10; // Completed quiz
}

// Return final score
return {
  email: webhook.payload.email,
  name: webhook.payload.name,
  phone: webhook.payload.text_reminder_number,
  event_type: webhook.payload.event_type.name,
  scheduled_time: webhook.payload.start_time,
  lead_score: Math.min(score, 100), // Cap at 100
  quiz_style: quizStyle || 'unknown',
  booking_url: webhook.payload.event_type.scheduling_url
};`;

  console.log(scoringLogic);
  console.log("\n5. Route to appropriate SendGrid list based on score");
  console.log("6. Add to Airtable CRM");
  console.log("7. Trigger appropriate email sequence\n");
}

async function main() {
  console.log("🚀 Setting up Calendly integration...\n");

  if (!process.env.Calendy_API_Key) {
    console.log("⚠️  Missing CALENDLY_API_TOKEN in .env file");
    console.log("📋 Steps to get your token:");
    console.log("1. Go to https://calendly.com/integrations/api_webhooks");
    console.log("2. Create a Personal Access Token");
    console.log("3. Add CALENDLY_API_TOKEN=your_token to .env file\n");
    return;
  }

  // Get user information
  const user = await getUserInfo();
  if (!user) return;

  // List event types
  const eventTypes = await listEventTypes(user.uri);

  // List existing webhooks
  await listWebhooks(user.current_organization);

  // Placeholder webhook URL (user needs to create this in Make.com)
  const makeWebhookUrl = "https://hook.us1.make.com/YOUR_CALENDLY_WEBHOOK_ID";

  console.log("🔗 Next Steps:");
  console.log("1. Create webhook endpoint in Make.com");
  console.log("2. Update makeWebhookUrl in this script");
  console.log("3. Run: createWebhookSubscription()");
  console.log("4. Test booking flow\n");

  // Generate Make.com scenario guide
  await generateMakeScenario(eventTypes, makeWebhookUrl);

  // Uncomment when you have Make.com webhook URL:
  // await createWebhookSubscription(user.current_organization, makeWebhookUrl);
}

main().catch(console.error);
