const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

async function inspectTables() {
  console.log("🔍 Inspecting Airtable structure...\n");

  const tables = ["Leads", "Projects", "Tasks", "Analytics"];

  for (const tableName of tables) {
    try {
      console.log(`📋 ${tableName} Table:`);

      const response = await axios.get(
        `https://api.airtable.com/v0/${BASE_ID}/${tableName}?maxRecords=1`,
        { headers },
      );

      if (response.data.records.length > 0) {
        const fields = Object.keys(response.data.records[0].fields);
        console.log(`   Fields: ${fields.join(", ")}`);
      } else {
        console.log("   No records found - table exists but empty");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`   ❌ Table "${tableName}" not found`);
      } else {
        console.log(
          `   ❌ Error: ${error.response?.data?.error?.message || error.message}`,
        );
      }
    }

    console.log("");
  }
}

async function listAllTables() {
  console.log("📊 All tables in base:");

  // Try common table names to see what exists
  const possibleTables = [
    "Table 1",
    "Table 2",
    "Table 3",
    "Table 4",
    "Leads",
    "Projects",
    "Tasks",
    "Analytics",
    "Lead",
    "Project",
    "Task",
    "Analytic",
  ];

  for (const tableName of possibleTables) {
    try {
      const response = await axios.get(
        `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}?maxRecords=1`,
        { headers },
      );

      console.log(`✅ Found table: "${tableName}"`);

      if (response.data.records.length > 0) {
        const fields = Object.keys(response.data.records[0].fields);
        console.log(`   Fields: ${fields.join(", ")}`);
      }
    } catch (error) {
      // Ignore 404s - just means table doesn't exist
      if (error.response?.status !== 404) {
        console.log(`❌ Error checking "${tableName}": ${error.message}`);
      }
    }
  }
}

async function main() {
  await inspectTables();
  await listAllTables();
}

main().catch(console.error);
