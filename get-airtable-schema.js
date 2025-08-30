const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

async function getBaseSchema() {
  try {
    console.log("🔍 Fetching base schema...\n");

    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`,
      { headers },
    );

    const tables = response.data.tables;

    tables.forEach((table) => {
      console.log(`📋 Table: ${table.name} (${table.id})`);
      console.log(`   Fields:`);

      table.fields.forEach((field) => {
        console.log(`   - ${field.name} (${field.type})`);

        // Show options for select fields
        if (field.options && field.options.choices) {
          console.log(
            `     Options: ${field.options.choices.map((c) => c.name).join(", ")}`,
          );
        }
      });

      console.log("");
    });

    return tables;
  } catch (error) {
    console.error(
      "❌ Error fetching schema:",
      error.response?.data || error.message,
    );
    return null;
  }
}

async function main() {
  const schema = await getBaseSchema();

  if (schema) {
    console.log("✅ Schema retrieved successfully!");
    console.log(
      "\n📝 Now I can create a test lead with the correct field values...",
    );
  }
}

main().catch(console.error);
