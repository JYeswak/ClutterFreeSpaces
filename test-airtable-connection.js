const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

async function testConnection() {
  console.log("🔗 Testing Airtable connection...\n");

  if (!API_KEY) {
    console.log("❌ Missing AIRTABLE_API_KEY in .env file");
    return;
  }

  if (!BASE_ID) {
    console.log("❌ Missing AIRTABLE_BASE_ID in .env file");
    console.log("📋 Please create your CRM base manually and add the Base ID");
    return;
  }

  try {
    // Test API connection
    const response = await axios.get(
      `https://api.airtable.com/v0/${BASE_ID}/Leads?maxRecords=1`,
      {
        headers,
      },
    );

    console.log("✅ Connection successful!");
    console.log(`📊 Base ID: ${BASE_ID}`);
    console.log(
      `📋 Found ${response.data.records.length} records in Leads table`,
    );

    if (response.data.records.length > 0) {
      console.log("📝 Sample record:");
      const record = response.data.records[0];
      console.log(`   ID: ${record.id}`);
      console.log(`   Fields: ${Object.keys(record.fields).join(", ")}`);
    }

    return true;
  } catch (error) {
    console.error(
      "❌ Connection failed:",
      error.response?.data || error.message,
    );

    if (error.response?.status === 404) {
      console.log("\n💡 This usually means:");
      console.log("1. Base ID is incorrect");
      console.log("2. Leads table doesn't exist");
      console.log("3. API key doesn't have access to this base");
    }

    return false;
  }
}

async function createTestLead() {
  if (!BASE_ID) return;

  console.log("\n📝 Creating test lead from quiz...");

  const testLead = {
    fields: {
      Name: "Test User from Quiz",
      Email: "test@quiz.com",
      "Lead Score": 52,
      "Organization Style": "Flexible",
      "Lead Source": "Quiz",
      Status: "New Lead",
      "Space Type": ["RV/Motorhome"],
      "Budget Range": "$500-$800",
      Timeline: "Within a month",
      Notes: "Completed organization style quiz, requested guide",
    },
  };

  try {
    const response = await axios.post(
      `https://api.airtable.com/v0/${BASE_ID}/Leads`,
      { records: [testLead] },
      { headers },
    );

    console.log("✅ Test lead created successfully!");
    console.log(`   Record ID: ${response.data.records[0].id}`);

    return response.data.records[0];
  } catch (error) {
    console.error(
      "❌ Failed to create test lead:",
      error.response?.data || error.message,
    );
    return null;
  }
}

async function main() {
  const connected = await testConnection();

  if (connected) {
    await createTestLead();

    console.log("\n🎉 Airtable CRM is ready for integration!");
    console.log("\n📋 Next steps:");
    console.log("1. Connect quiz results to Airtable");
    console.log("2. Connect Calendly bookings to Projects table");
    console.log("3. Set up Make.com automation scenarios");
  } else {
    console.log("\n📋 Setup required:");
    console.log("1. Follow the manual setup guide");
    console.log("2. Add AIRTABLE_BASE_ID to .env");
    console.log("3. Run this test again");
  }
}

main().catch(console.error);
