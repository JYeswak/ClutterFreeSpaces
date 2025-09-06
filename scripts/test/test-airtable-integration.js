const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// Import the updated createAirtableLead function logic
async function createAirtableLeadTest({
  firstName,
  email,
  rvType,
  biggestChallenge,
  timeline,
  montanaResident,
  leadScore,
  segment,
  source,
  abTestVariation,
}) {
  try {
    // Map source to valid Lead Source options
    const sourceMapping = {
      "Newsletter Signup": "Website",
      Quiz: "Quiz",
      Facebook: "Facebook",
      Referral: "Referral",
      Google: "Google",
      ManyChat: "ManyChat",
    };

    // Map timeline to valid Timeline options
    const timelineMapping = {
      ASAP: "ASAP",
      "Within Month": "Within a month",
      "2-3 Months": "Next 2-3 months",
      "Just Exploring": "Just Exploring",
    };

    // Validate required fields exist in Airtable schema
    const airtableData = {
      fields: {
        Name: firstName, // Use "Name" not "First Name"
        Email: email,
        "RV Type": rvType || "Other", // New field - must exist in Airtable
        "Biggest Challenge": biggestChallenge || "Other", // New field - must exist in Airtable
        Timeline: timelineMapping[timeline] || timeline || "Just Exploring",
        "Montana Resident": montanaResident === true, // Checkbox field
        "Lead Score": leadScore || 0,
        Segment: segment, // New field - must exist in Airtable (HOT/WARM/COLD)
        "Lead Source": sourceMapping[source] || "Website", // Map to existing field
        "AB Test Variation": abTestVariation || "A", // New field - must exist in Airtable
        Status: "New Lead", // Use existing Status field
        "Follow Up Required": segment === "HOT", // Checkbox field
        // Don't set "Date Created" as it's auto-generated (createdTime field)
      },
    };

    const response = await axios.post(
      `https://api.airtable.com/v0/${BASE_ID}/Leads`,
      airtableData,
      {
        headers,
      },
    );

    console.log(`✅ Created Airtable record for ${email}: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error(
      "❌ Error creating Airtable record:",
      error.response?.data || error,
    );

    // Provide more specific error information for debugging
    if (error.response?.status === 422) {
      console.error("💡 422 Error - Field validation failed:");
      console.error("   Check that all required fields exist in Airtable");
      console.error(
        "   Check that single-select values match available options",
      );
      console.error(
        "   Data sent:",
        JSON.stringify(airtableData.fields, null, 2),
      );
    }

    throw error;
  }
}

async function checkRequiredFields() {
  console.log("🔍 Checking if all required fields exist in Airtable...\n");

  try {
    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`,
      { headers },
    );

    const leadsTable = response.data.tables.find((t) => t.name === "Leads");
    if (!leadsTable) {
      console.log("❌ Leads table not found!");
      return false;
    }

    const currentFields = leadsTable.fields.map((f) => f.name);
    const requiredFields = [
      "Name",
      "Email",
      "RV Type",
      "Biggest Challenge",
      "Timeline",
      "Montana Resident",
      "Lead Score",
      "Segment",
      "Lead Source",
      "AB Test Variation",
      "Status",
      "Follow Up Required",
    ];

    console.log("📋 Required fields check:");
    const missingFields = [];

    requiredFields.forEach((field) => {
      if (currentFields.includes(field)) {
        console.log(`   ✅ ${field}`);
      } else {
        console.log(`   ❌ ${field}`);
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      console.log(
        `\n⚠️  Missing ${missingFields.length} required fields: ${missingFields.join(", ")}`,
      );
      console.log("\nPlease add these fields to your Airtable before testing.");
      return false;
    }

    console.log("\n✅ All required fields present!");
    return true;
  } catch (error) {
    console.error(
      "❌ Error checking fields:",
      error.response?.data || error.message,
    );
    return false;
  }
}

async function runIntegrationTests() {
  console.log("🧪 Running Airtable CRM Integration Tests\n");
  console.log(`📊 Base ID: ${BASE_ID}\n`);

  // Check if required fields exist
  const fieldsExist = await checkRequiredFields();
  if (!fieldsExist) {
    console.log("\n🔧 Please run the manual field setup first:");
    console.log("   node update-airtable-schema.js");
    return false;
  }

  // Test cases
  const testCases = [
    {
      name: "Hot Lead - Class A RV",
      data: {
        firstName: "Sarah",
        email: "sarah.test@example.com",
        rvType: "Class A",
        biggestChallenge: "Weight Management",
        timeline: "ASAP",
        montanaResident: true,
        leadScore: 85,
        segment: "HOT",
        source: "Newsletter Signup",
        abTestVariation: "A",
      },
    },
    {
      name: "Warm Lead - Fifth Wheel",
      data: {
        firstName: "Mike",
        email: "mike.test@example.com",
        rvType: "Fifth Wheel",
        biggestChallenge: "Kitchen",
        timeline: "Within Month",
        montanaResident: false,
        leadScore: 62,
        segment: "WARM",
        source: "Facebook",
        abTestVariation: "B",
      },
    },
    {
      name: "Cold Lead - Travel Trailer",
      data: {
        firstName: "Lisa",
        email: "lisa.test@example.com",
        rvType: "Travel Trailer",
        biggestChallenge: "Storage Bays",
        timeline: "Just Exploring",
        montanaResident: false,
        leadScore: 35,
        segment: "COLD",
        source: "Google",
        abTestVariation: "Control",
      },
    },
  ];

  console.log("🧪 Running test cases...\n");

  const results = [];
  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);

    try {
      const recordId = await createAirtableLeadTest(testCase.data);
      console.log(`   ✅ Success! Record ID: ${recordId}`);
      results.push({
        name: testCase.name,
        success: true,
        recordId,
        data: testCase.data,
      });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      results.push({
        name: testCase.name,
        success: false,
        error: error.message,
        data: testCase.data,
      });
    }

    console.log(""); // Empty line for readability
  }

  // Summary
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("=".repeat(50));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}\n`);

  if (successful.length > 0) {
    console.log("🎉 SUCCESSFUL TESTS:");
    successful.forEach((result) => {
      console.log(`   ✅ ${result.name} (${result.recordId})`);
    });
    console.log("");
  }

  if (failed.length > 0) {
    console.log("❌ FAILED TESTS:");
    failed.forEach((result) => {
      console.log(`   ❌ ${result.name}: ${result.error}`);
    });
    console.log("");
  }

  if (failed.length === 0) {
    console.log("🎉 ALL TESTS PASSED!");
    console.log("✅ Your Airtable CRM integration is working correctly!");
    console.log("✅ No more 422 errors should occur!");

    console.log("\n📋 Next Steps:");
    console.log("1. Test the newsletter signup form on your website");
    console.log("2. Verify records appear correctly in Airtable");
    console.log("3. Set up Make.com automation workflows");

    return true;
  } else {
    console.log("⚠️  Some tests failed. Please fix the issues above.");
    return false;
  }
}

async function cleanupTestRecords() {
  console.log("\n🧹 Cleaning up test records...");

  try {
    // Find and delete test records
    const response = await axios.get(
      `https://api.airtable.com/v0/${BASE_ID}/Leads?filterByFormula=OR({Email}='sarah.test@example.com',{Email}='mike.test@example.com',{Email}='lisa.test@example.com')`,
      { headers },
    );

    if (response.data.records.length > 0) {
      console.log(
        `🗑️  Found ${response.data.records.length} test records to delete`,
      );

      for (const record of response.data.records) {
        await axios.delete(
          `https://api.airtable.com/v0/${BASE_ID}/Leads/${record.id}`,
          { headers },
        );
        console.log(
          `   ✅ Deleted: ${record.fields.Name} (${record.fields.Email})`,
        );
      }
    } else {
      console.log("   ℹ️  No test records found to clean up");
    }
  } catch (error) {
    console.log("⚠️  Cleanup failed:", error.message);
  }
}

async function main() {
  const success = await runIntegrationTests();

  if (success) {
    // Ask if user wants to clean up test records
    console.log(
      "\n❓ Clean up test records? (They'll remain for manual verification otherwise)",
    );
    // For automation, we'll skip cleanup to let user verify manually
    // await cleanupTestRecords();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createAirtableLeadTest, checkRequiredFields };
