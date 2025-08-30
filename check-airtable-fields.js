#!/usr/bin/env node

/**
 * Check Airtable field configuration
 * This script queries your Airtable base to show all available field options
 */

const axios = require("axios");
require("dotenv").config();

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

async function checkAirtableFields() {
  console.log("🔍 Checking Airtable Fields Configuration\n");
  console.log("Base ID:", AIRTABLE_BASE_ID);
  console.log("API Key:", AIRTABLE_API_KEY ? "✓ Configured" : "✗ Missing");
  console.log("\n" + "=".repeat(50) + "\n");

  try {
    // Get the schema for the Leads table
    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      },
    );

    // Find the Leads table
    const leadsTable = response.data.tables.find(
      (table) => table.name === "Leads",
    );

    if (!leadsTable) {
      console.error('❌ "Leads" table not found in Airtable base');
      console.log(
        "Available tables:",
        response.data.tables.map((t) => t.name).join(", "),
      );
      return;
    }

    console.log('✅ Found "Leads" table\n');
    console.log("📋 FIELD CONFIGURATION:\n");

    // Show all fields and their options
    leadsTable.fields.forEach((field) => {
      console.log(`📌 ${field.name} (${field.type})`);

      if (field.type === "singleSelect" && field.options) {
        console.log("   Options:");
        field.options.choices.forEach((choice) => {
          console.log(`   • ${choice.name}`);
        });
      } else if (field.type === "multipleSelects" && field.options) {
        console.log("   Options:");
        field.options.choices.forEach((choice) => {
          console.log(`   • ${choice.name}`);
        });
      }

      console.log("");
    });

    // Show what our form sends vs what Airtable expects
    console.log("=".repeat(50));
    console.log("\n🔄 MAPPING REQUIREMENTS:\n");

    const mappingGuide = {
      "RV Type": {
        formValues: [
          "Class A Motorhome",
          "Class B Motorhome",
          "Class C Motorhome",
          "Travel Trailer",
          "Fifth Wheel",
        ],
        airtableOptions:
          leadsTable.fields
            .find((f) => f.name === "RV Type")
            ?.options?.choices.map((c) => c.name) || [],
      },
      "Biggest Challenge": {
        formValues: [
          "Storage",
          "Organization Systems",
          "Weight Management",
          "Space Utilization",
          "Downsizing",
        ],
        airtableOptions:
          leadsTable.fields
            .find((f) => f.name === "Biggest Challenge")
            ?.options?.choices.map((c) => c.name) || [],
      },
      Timeline: {
        formValues: [
          "immediately",
          "within-month",
          "2-3 months",
          "just-exploring",
        ],
        airtableOptions:
          leadsTable.fields
            .find((f) => f.name === "Timeline")
            ?.options?.choices.map((c) => c.name) || [],
      },
    };

    Object.entries(mappingGuide).forEach(([fieldName, data]) => {
      console.log(`${fieldName}:`);
      console.log("  Form sends:", data.formValues.join(", "));
      console.log("  Airtable has:", data.airtableOptions.join(", "));
      console.log(
        "  Missing in Airtable:",
        data.formValues
          .filter((v) => !data.airtableOptions.includes(v))
          .join(", ") || "None",
      );
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error checking Airtable fields:");
    console.error(error.response?.data || error.message);
  }
}

// Run the check
checkAirtableFields();
