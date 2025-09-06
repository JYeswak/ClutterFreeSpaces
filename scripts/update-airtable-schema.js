const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "Leads";

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// Note: Airtable doesn't allow programmatic field creation via API
// This is a reference for manual field creation in the Airtable UI

const requiredFields = [
  {
    name: "RV Type",
    type: "singleSelect",
    options: {
      choices: [
        { name: "Class A", color: "blueLight2" },
        { name: "Class B", color: "cyanLight2" },
        { name: "Class C", color: "tealLight2" },
        { name: "Fifth Wheel", color: "greenLight2" },
        { name: "Travel Trailer", color: "yellowLight2" },
        { name: "Other", color: "grayLight2" },
      ],
    },
  },
  {
    name: "Biggest Challenge",
    type: "singleSelect",
    options: {
      choices: [
        { name: "Weight Management", color: "redLight2" },
        { name: "Storage Bays", color: "orangeLight2" },
        { name: "Kitchen", color: "yellowLight2" },
        { name: "Bedroom", color: "greenLight2" },
        { name: "Seasonal Gear", color: "blueLight2" },
        { name: "Other", color: "grayLight2" },
      ],
    },
  },
  {
    name: "Montana Resident",
    type: "checkbox",
  },
  {
    name: "Segment",
    type: "singleSelect",
    options: {
      choices: [
        { name: "HOT", color: "redBright" },
        { name: "WARM", color: "orangeBright" },
        { name: "COLD", color: "blueBright" },
      ],
    },
  },
  {
    name: "AB Test Variation",
    type: "singleSelect",
    options: {
      choices: [
        { name: "A", color: "greenLight2" },
        { name: "B", color: "blueLight2" },
        { name: "Control", color: "grayLight2" },
      ],
    },
  },
  {
    name: "Follow Up Required",
    type: "checkbox",
  },
];

async function checkCurrentFields() {
  try {
    console.log("🔍 Checking current fields in Leads table...\n");

    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`,
      { headers },
    );

    const leadsTable = response.data.tables.find((t) => t.name === "Leads");
    if (!leadsTable) {
      console.log("❌ Leads table not found!");
      return;
    }

    console.log("📋 Current fields:");
    const currentFields = leadsTable.fields.map((f) => f.name);
    currentFields.forEach((field) => {
      console.log(`   ✓ ${field}`);
    });

    console.log("\n🔧 Missing fields needed for newsletter integration:");
    const missingFields = requiredFields.filter(
      (rf) => !currentFields.includes(rf.name),
    );

    if (missingFields.length === 0) {
      console.log("   ✅ All required fields already exist!");
      return true;
    }

    missingFields.forEach((field) => {
      console.log(`   ❌ ${field.name} (${field.type})`);
      if (field.options?.choices) {
        console.log(
          `      Options: ${field.options.choices.map((c) => c.name).join(", ")}`,
        );
      }
    });

    console.log("\n📝 MANUAL SETUP REQUIRED:");
    console.log("Since Airtable doesn't allow programmatic field creation,");
    console.log("you need to add these fields manually in the Airtable UI:");
    console.log("\n1. Go to: https://airtable.com/");
    console.log(`2. Open base: ${BASE_ID}`);
    console.log("3. Open the 'Leads' table");
    console.log("4. Add the following fields:\n");

    missingFields.forEach((field) => {
      console.log(`   Field Name: "${field.name}"`);
      console.log(`   Field Type: ${field.type}`);
      if (field.options?.choices) {
        console.log(`   Options:`);
        field.options.choices.forEach((choice) => {
          console.log(`     - ${choice.name}`);
        });
      }
      console.log("");
    });

    return false;
  } catch (error) {
    console.error(
      "❌ Error checking fields:",
      error.response?.data || error.message,
    );
    return false;
  }
}

async function main() {
  console.log("🚀 Airtable Schema Update Tool\n");
  console.log(`📊 Base ID: ${BASE_ID}`);
  console.log(`📋 Table: ${TABLE_NAME}\n`);

  const allFieldsExist = await checkCurrentFields();

  if (!allFieldsExist) {
    console.log(
      "\n⏳ After adding the fields manually, run this script again to verify.",
    );
    console.log("Then run the updated integration test.");
  } else {
    console.log("\n🎉 Schema is ready for integration!");
    console.log("You can now test the createAirtableLead function.");
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { requiredFields, checkCurrentFields };
