const sgClient = require("@sendgrid/client");
require("dotenv").config();

sgClient.setApiKey(process.env.SendGrid_API_Key);

// Template IDs from previous script
const TEMPLATE_IDS = {
  welcome_1: "d-b73a12be51e0415e8ddb07e302e83f1b",
  welcome_2: "d-e65559aed32b474b9b55303edefe696e",
  hot_lead: "d-c94aab6073ef4ba0a4a06e6789d15f95",
  rv_hack: "d-772b5198e6344d70995480858f9b50a5",
  check_in: "d-eddf123800924afa9e958bf7074cdb89",
};

async function setupContactLists() {
  console.log("Creating contact lists for lead segmentation...\n");

  const lists = [
    {
      name: "Hot Leads (75+ Score)",
      description: "High-priority leads needing immediate attention",
    },
    {
      name: "Warm Leads (50-74 Score)",
      description: "Qualified leads for nurture sequence",
    },
    {
      name: "Cold Leads (<50 Score)",
      description: "Basic welcome series leads",
    },
    {
      name: "RV Owners",
      description: "Leads specifically interested in RV organization",
    },
    {
      name: "Past Clients",
      description: "Previous customers for maintenance and referrals",
    },
    {
      name: "Quiz Takers",
      description: "Leads who completed the organization style quiz",
    },
  ];

  const createdLists = {};

  for (const list of lists) {
    try {
      const request = {
        url: "/v3/marketing/lists",
        method: "POST",
        body: {
          name: list.name,
        },
      };

      const [response] = await sgClient.request(request);
      createdLists[list.name] = response.body.id;
      console.log(`✅ Created list: ${list.name} (ID: ${response.body.id})`);
    } catch (error) {
      console.error(
        `❌ Error creating list ${list.name}:`,
        error.response?.body || error.message,
      );
    }
  }

  return createdLists;
}

async function setupAutomations(listIds) {
  console.log("\nCreating email automations...\n");

  const automations = [
    {
      title: "Welcome Series - New Leads",
      description: "Welcome sequence for new leads (score <50)",
      trigger_settings: {
        trigger_type: "list_add",
        list_ids: [listIds["Cold Leads (<50 Score)"]],
      },
      emails: [
        {
          template_id: TEMPLATE_IDS.welcome_1,
          send_at: 0, // Immediately
          subject: "Welcome to ClutterFreeSpaces!",
        },
        {
          template_id: TEMPLATE_IDS.welcome_2,
          send_at: 259200, // 3 days (in seconds)
          subject: "Sarah's RV Went From Chaos to Calm (photos inside)",
        },
      ],
    },
    {
      title: "Hot Lead Emergency Response",
      description: "Immediate response for urgent leads (score 75+)",
      trigger_settings: {
        trigger_type: "list_add",
        list_ids: [listIds["Hot Leads (75+ Score)"]],
      },
      emails: [
        {
          template_id: TEMPLATE_IDS.hot_lead,
          send_at: 7200, // 2 hours
          subject: "Your Organization Slot is Still Available",
        },
      ],
    },
    {
      title: "RV Owner Nurture",
      description: "Specialized sequence for RV owners",
      trigger_settings: {
        trigger_type: "list_add",
        list_ids: [listIds["RV Owners"]],
      },
      emails: [
        {
          template_id: TEMPLATE_IDS.rv_hack,
          send_at: 86400, // 1 day
          subject: "The RV Storage Hack I Learned From Full-Timers",
        },
      ],
    },
    {
      title: "Post-Service Follow-up",
      description: "30-day check-in for completed clients",
      trigger_settings: {
        trigger_type: "list_add",
        list_ids: [listIds["Past Clients"]],
      },
      emails: [
        {
          template_id: TEMPLATE_IDS.check_in,
          send_at: 2592000, // 30 days
          subject: "How's Your Organized Space Holding Up?",
        },
      ],
    },
  ];

  for (const automation of automations) {
    try {
      // Note: SendGrid's v2 automation API is limited
      // This creates the structure - you'll need to set up automations manually in UI
      // or use Make.com to trigger these emails

      console.log(`📋 Automation Blueprint: ${automation.title}`);
      console.log(
        `   Trigger: Add to list ${automation.trigger_settings.list_ids[0]}`,
      );
      console.log(
        `   Emails: ${automation.emails.length} templates configured`,
      );
      automation.emails.forEach((email, index) => {
        const delay =
          email.send_at === 0
            ? "immediately"
            : `${email.send_at / 3600} hours later`;
        console.log(`   - Email ${index + 1}: ${email.subject} (${delay})`);
      });
      console.log("");
    } catch (error) {
      console.error(
        `❌ Error with automation ${automation.title}:`,
        error.message,
      );
    }
  }
}

async function createWebhookEndpoints() {
  console.log("Setting up webhook endpoints for Make.com integration...\n");

  const webhooks = [
    {
      friendly_name: "Quiz Completion Webhook",
      url: "https://hook.us1.make.com/YOUR_QUIZ_WEBHOOK_ID",
      enabled: true,
      event_types: ["processed"],
    },
    {
      friendly_name: "Lead Score Update Webhook",
      url: "https://hook.us1.make.com/YOUR_LEAD_WEBHOOK_ID",
      enabled: true,
      event_types: ["processed", "delivered", "open", "click"],
    },
  ];

  for (const webhook of webhooks) {
    console.log(`🔗 Webhook: ${webhook.friendly_name}`);
    console.log(`   URL: ${webhook.url}`);
    console.log(`   Events: ${webhook.event_types.join(", ")}`);
    console.log("   ⚠️  Update URL in Make.com setup\n");
  }
}

async function generateIntegrationCode(listIds) {
  console.log("Generating Make.com integration examples...\n");

  const code = `
// Example: Send welcome email via SendGrid API
const sendWelcomeEmail = async (leadData) => {
  const templateId = '${TEMPLATE_IDS.welcome_1}';
  
  const msg = {
    to: leadData.email,
    from: 'chanel@clutter-free-spaces.com',
    templateId: templateId,
    dynamicTemplateData: {
      name: leadData.first_name,
      quiz_url: 'https://clutter-free-spaces.com/quiz',
      calendar_url: 'https://calendly.com/clutterfreespaces/consultation',
      gallery_url: 'https://clutter-free-spaces.com/gallery'
    }
  };
  
  return await sgMail.send(msg);
};

// Example: Add contact to appropriate list based on score
const addToList = async (email, score) => {
  let listId;
  
  if (score >= 75) {
    listId = '${listIds ? listIds["Hot Leads (75+ Score)"] || "LIST_ID_HERE" : "LIST_ID_HERE"}';
  } else if (score >= 50) {
    listId = '${listIds ? listIds["Warm Leads (50-74 Score)"] || "LIST_ID_HERE" : "LIST_ID_HERE"}';
  } else {
    listId = '${listIds ? listIds["Cold Leads (<50 Score)"] || "LIST_ID_HERE" : "LIST_ID_HERE"}';
  }
  
  const request = {
    url: '/v3/marketing/contacts',
    method: 'PUT',
    body: {
      list_ids: [listId],
      contacts: [{
        email: email,
        first_name: leadData.first_name,
        last_name: leadData.last_name,
        custom_fields: {
          lead_score: score,
          source: leadData.source,
          space_type: leadData.space_type
        }
      }]
    }
  };
  
  return await sgClient.request(request);
};
`;

  console.log("📝 Integration code examples generated");
  console.log("   Use these functions in your Make.com scenarios");
  console.log("   Copy template IDs to Make.com HTTP modules\n");

  return code;
}

async function main() {
  try {
    console.log("🚀 Setting up SendGrid automation infrastructure...\n");

    // Create contact lists for segmentation
    const listIds = await setupContactLists();

    // Set up automation blueprints
    await setupAutomations(listIds);

    // Configure webhooks for Make.com
    await createWebhookEndpoints();

    // Generate integration code
    const integrationCode = await generateIntegrationCode(listIds);

    console.log("✅ SendGrid automation setup complete!");
    console.log("\n📋 Next Steps:");
    console.log("1. Copy list IDs to Make.com scenarios");
    console.log("2. Set up webhook URLs in Make.com");
    console.log("3. Create automation triggers in SendGrid UI");
    console.log("4. Test email delivery with sample data");
    console.log("\n📊 Created Lists:");
    Object.entries(listIds).forEach(([name, id]) => {
      console.log(`   ${name}: ${id}`);
    });
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

// Run setup
main().catch(console.error);
