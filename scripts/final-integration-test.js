const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const SENDGRID_API_KEY = process.env.SendGrid_API_Key;
const CALENDLY_API_KEY = process.env.Calendy_API_Key;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

async function testFullIntegration() {
  console.log("🚀 ClutterFreeSpaces - Full System Integration Test\n");

  let allPassed = true;
  const results = {
    airtable: false,
    sendgrid: false,
    calendly: false,
    quiz_system: false,
    lead_scoring: false,
  };

  // Test 1: Airtable CRM Connection
  console.log("📊 Testing Airtable CRM...");
  try {
    const response = await axios.get(
      `https://api.airtable.com/v0/${BASE_ID}/Leads?maxRecords=1`,
      { headers },
    );
    console.log("✅ Airtable connection successful");
    console.log(
      `   Found ${response.data.records.length} records in Leads table`,
    );
    results.airtable = true;
  } catch (error) {
    console.log(
      "❌ Airtable connection failed:",
      error.response?.data || error.message,
    );
    allPassed = false;
  }

  // Test 2: SendGrid Email System
  console.log("\n📧 Testing SendGrid email system...");
  try {
    const sgResponse = await axios.get(
      "https://api.sendgrid.com/v3/templates",
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("✅ SendGrid connection successful");
    console.log(
      `   Found ${sgResponse.data.result?.length || 0} email templates`,
    );
    results.sendgrid = true;
  } catch (error) {
    console.log(
      "❌ SendGrid connection failed:",
      error.response?.data || error.message,
    );
    allPassed = false;
  }

  // Test 3: Calendly API
  console.log("\n📅 Testing Calendly integration...");
  try {
    const calResponse = await axios.get("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${CALENDLY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    console.log("✅ Calendly connection successful");
    console.log(`   User: ${calResponse.data.resource.name}`);
    results.calendly = true;
  } catch (error) {
    console.log(
      "❌ Calendly connection failed:",
      error.response?.data || error.message,
    );
    allPassed = false;
  }

  // Test 4: Quiz System
  console.log("\n🧠 Testing quiz system components...");
  const fs = require("fs");
  const requiredFiles = [
    "organization-style-quiz.html",
    "api-server.js",
    "create-organization-guides.js",
  ];

  let quizFilesExist = true;
  requiredFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      quizFilesExist = false;
    }
  });

  if (quizFilesExist) {
    console.log("✅ Quiz system files complete");
    results.quiz_system = true;
  } else {
    console.log("❌ Quiz system incomplete");
    allPassed = false;
  }

  // Test 5: Lead Scoring Algorithm
  console.log("\n🎯 Testing lead scoring algorithm...");

  const { calculateLeadScore } = require("./setup-manychat-webhook.js");

  const testCases = [
    {
      name: "Hot RV Lead",
      data: {
        space_type: "RV",
        budget_range: "Over $1200",
        timeline: "ASAP",
        challenge_type: "System",
      },
      expectedRange: [75, 100],
    },
    {
      name: "Warm Home Lead",
      data: {
        space_type: "Home",
        budget_range: "$300-800",
        timeline: "1 month",
        challenge_type: "Clutter",
      },
      expectedRange: [50, 74],
    },
    {
      name: "Cold Lead",
      data: {
        space_type: "Office",
        budget_range: "Under $300",
        timeline: "Exploring",
        challenge_type: "Storage",
      },
      expectedRange: [25, 49],
    },
  ];

  let scoringPassed = true;
  testCases.forEach((test) => {
    const score = calculateLeadScore(test.data);
    const inRange =
      score >= test.expectedRange[0] && score <= test.expectedRange[1];

    console.log(
      `${inRange ? "✅" : "❌"} ${test.name}: Score ${score} (expected ${test.expectedRange[0]}-${test.expectedRange[1]})`,
    );

    if (!inRange) scoringPassed = false;
  });

  if (scoringPassed) {
    console.log("✅ Lead scoring algorithm working correctly");
    results.lead_scoring = true;
  } else {
    console.log("❌ Lead scoring algorithm issues detected");
    allPassed = false;
  }

  // Final Results
  console.log("\n" + "=".repeat(50));
  console.log("🏁 INTEGRATION TEST RESULTS");
  console.log("=".repeat(50));

  Object.entries(results).forEach(([system, passed]) => {
    console.log(
      `${passed ? "✅" : "❌"} ${system.toUpperCase().replace("_", " ")}: ${passed ? "PASS" : "FAIL"}`,
    );
  });

  console.log(
    "\n" + (allPassed ? "🎉 ALL SYSTEMS READY!" : "⚠️  ISSUES DETECTED"),
  );

  if (allPassed) {
    console.log("\n📋 FINAL SETUP CHECKLIST:");
    console.log("□ Create ManyChat account and build conversation flows");
    console.log("□ Set up Make.com scenarios using the automation guide");
    console.log("□ Configure webhooks between all systems");
    console.log("□ Test complete lead journey from ManyChat to CRM");
    console.log("□ Launch quiz on website and test guide delivery");
    console.log("□ Monitor first few leads and optimize as needed");

    console.log("\n🚀 Your ClutterFreeSpaces automation system is ready!");
    console.log("📧 Email templates: Ready");
    console.log("🧠 Organization quiz: Ready");
    console.log("📅 Calendly booking: Ready");
    console.log("📊 Airtable CRM: Ready");
    console.log("🤖 ManyChat flows: Ready for setup");
    console.log("⚡ Make.com scenarios: Ready for configuration");
  } else {
    console.log(
      "\n🔧 Fix the failed tests above before proceeding with Make.com setup.",
    );
  }

  return allPassed;
}

async function createSampleLeadJourney() {
  console.log("\n" + "=".repeat(50));
  console.log("📝 CREATING SAMPLE LEAD JOURNEY");
  console.log("=".repeat(50));

  try {
    // Sample lead from ManyChat
    const manyChatLead = {
      fields: {
        Name: "Jessica Thompson",
        Email: "jessica.t@example.com",
        Phone: "+15551234567",
        "Lead Score": 85,
        "Organization Style": "Visual",
        "Lead Source": "ManyChat",
        Status: "New Lead",
        "Space Type": ["RV/Motorhome"],
        "Budget Range": "$800-1200",
        Timeline: "Within 2 weeks",
        Notes:
          "ManyChat qualification: Storage challenge, High interest. Wants to organize RV before summer travel season.",
        "Quiz Answers": JSON.stringify({
          space_type: "RV",
          challenge_type: "Storage",
          budget_range: "$800-1200",
          timeline: "Within 2 weeks",
          source: "ManyChat Facebook Ad",
        }),
      },
    };

    // Create lead in Airtable
    const leadResponse = await axios.post(
      `https://api.airtable.com/v0/${BASE_ID}/Leads`,
      { records: [manyChatLead] },
      { headers },
    );

    console.log("✅ Sample ManyChat lead created successfully!");
    console.log(`   Record ID: ${leadResponse.data.records[0].id}`);

    // Create follow-up task
    const task = {
      fields: {
        Task: "Follow up with Jessica Thompson (Hot RV lead)",
        "Related Lead": [leadResponse.data.records[0].id],
        "Task Type": "Follow-up Call",
        Priority: "High",
        "Due Date": new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        Status: "To Do",
        Notes:
          "Lead Score: 85, ManyChat source, wants RV organized before summer travel",
      },
    };

    const taskResponse = await axios.post(
      `https://api.airtable.com/v0/${BASE_ID}/Tasks`,
      { records: [task] },
      { headers },
    );

    console.log("✅ Follow-up task created successfully!");
    console.log(`   Task ID: ${taskResponse.data.records[0].id}`);

    console.log("\n🎯 Sample lead journey demonstrates:");
    console.log("• ManyChat lead qualification (Score: 85 - HOT lead)");
    console.log("• Automatic CRM record creation");
    console.log("• Priority task assignment");
    console.log("• Timeline-based follow-up scheduling");

    return true;
  } catch (error) {
    console.log(
      "❌ Failed to create sample lead journey:",
      error.response?.data || error.message,
    );
    return false;
  }
}

async function main() {
  const integrationPassed = await testFullIntegration();

  if (integrationPassed) {
    await createSampleLeadJourney();

    console.log("\n" + "🌟".repeat(20));
    console.log("🎉 CLUTTERFREESPACES AUTOMATION SYSTEM COMPLETE! 🎉");
    console.log("🌟".repeat(20));
    console.log("\nNext Steps:");
    console.log("1. Set up ManyChat using the conversation flows");
    console.log("2. Configure Make.com scenarios for automation");
    console.log("3. Test complete lead journey");
    console.log("4. Launch and monitor performance");
    console.log("\n💪 Ready to scale your professional organizing business!");
  }
}

main().catch(console.error);
