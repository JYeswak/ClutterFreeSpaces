const axios = require("axios");
require("dotenv").config();

const AIRTABLE_API_BASE = "https://api.airtable.com/v0/meta";
const API_KEY = process.env.AIRTABLE_API_KEY;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// Define the CRM structure
const CRM_STRUCTURE = {
  name: "ClutterFreeSpaces CRM",
  tables: [
    {
      name: "Leads",
      description: "All potential clients and their information",
      fields: [
        {
          name: "Name",
          type: "singleLineText",
          options: {},
        },
        {
          name: "Email",
          type: "email",
          options: {},
        },
        {
          name: "Phone",
          type: "phoneNumber",
          options: {},
        },
        {
          name: "Lead Score",
          type: "number",
          options: {
            precision: 0,
          },
        },
        {
          name: "Organization Style",
          type: "singleSelect",
          options: {
            choices: [
              { name: "Detailed", color: "blueLight2" },
              { name: "Visual", color: "purpleLight2" },
              { name: "Flexible", color: "greenLight2" },
              { name: "Simple", color: "orangeLight2" },
            ],
          },
        },
        {
          name: "Lead Source",
          type: "singleSelect",
          options: {
            choices: [
              { name: "Quiz", color: "greenLight2" },
              { name: "Facebook", color: "blueLight2" },
              { name: "Website", color: "purpleLight2" },
              { name: "Referral", color: "orangeLight2" },
              { name: "Google", color: "yellowLight2" },
              { name: "ManyChat", color: "pinkLight2" },
            ],
          },
        },
        {
          name: "Status",
          type: "singleSelect",
          options: {
            choices: [
              { name: "New Lead", color: "blueLight2" },
              { name: "Contacted", color: "yellowLight2" },
              { name: "Consultation Scheduled", color: "orangeLight2" },
              { name: "Proposal Sent", color: "purpleLight2" },
              { name: "Client", color: "greenLight2" },
              { name: "Not Interested", color: "redLight2" },
            ],
          },
        },
        {
          name: "Location",
          type: "singleLineText",
          options: {},
        },
        {
          name: "Space Type",
          type: "multipleSelects",
          options: {
            choices: [
              { name: "RV/Motorhome", color: "greenLight2" },
              { name: "Home Office", color: "blueLight2" },
              { name: "Bedroom", color: "purpleLight2" },
              { name: "Kitchen", color: "orangeLight2" },
              { name: "Garage", color: "yellowLight2" },
              { name: "Closet", color: "pinkLight2" },
              { name: "Whole House", color: "grayLight2" },
            ],
          },
        },
        {
          name: "Budget Range",
          type: "singleSelect",
          options: {
            choices: [
              { name: "Under $300", color: "redLight2" },
              { name: "$300-500", color: "yellowLight2" },
              { name: "$500-800", color: "orangeLight2" },
              { name: "$800-1200", color: "greenLight2" },
              { name: "Over $1200", color: "blueLight2" },
              { name: "Not Specified", color: "grayLight2" },
            ],
          },
        },
        {
          name: "Timeline",
          type: "singleSelect",
          options: {
            choices: [
              { name: "ASAP", color: "redLight2" },
              { name: "Within 2 weeks", color: "orangeLight2" },
              { name: "Within a month", color: "yellowLight2" },
              { name: "Next 2-3 months", color: "greenLight2" },
              { name: "Just exploring", color: "grayLight2" },
            ],
          },
        },
        {
          name: "Notes",
          type: "multilineText",
          options: {},
        },
        {
          name: "Quiz Answers",
          type: "longText",
          options: {},
        },
        {
          name: "Date Created",
          type: "createdTime",
          options: {},
        },
        {
          name: "Last Contact",
          type: "dateTime",
          options: {},
        },
        {
          name: "Next Follow-up",
          type: "date",
          options: {},
        },
        {
          name: "Calendly Booking URL",
          type: "url",
          options: {},
        },
        {
          name: "Projects",
          type: "multipleRecordLinks",
          options: {
            linkedTableId: "tblProjects", // Will be set after table creation
          },
        },
      ],
    },
    {
      name: "Projects",
      description: "Active and completed organization projects",
      fields: [
        {
          name: "Project Name",
          type: "singleLineText",
          options: {},
        },
        {
          name: "Client",
          type: "multipleRecordLinks",
          options: {
            linkedTableId: "tblLeads",
          },
        },
        {
          name: "Project Type",
          type: "singleSelect",
          options: {
            choices: [
              { name: "Free Consultation", color: "blueLight2" },
              { name: "Quick Win Session", color: "orangeLight2" },
              { name: "Full Organization Project", color: "greenLight2" },
              { name: "Maintenance Session", color: "yellowLight2" },
              { name: "Virtual Consultation", color: "purpleLight2" },
            ],
          },
        },
        {
          name: "Status",
          type: "singleSelect",
          options: {
            choices: [
              { name: "Scheduled", color: "yellowLight2" },
              { name: "In Progress", color: "orangeLight2" },
              { name: "Completed", color: "greenLight2" },
              { name: "Cancelled", color: "redLight2" },
              { name: "Rescheduled", color: "purpleLight2" },
            ],
          },
        },
        {
          name: "Scheduled Date",
          type: "dateTime",
          options: {},
        },
        {
          name: "Duration (Hours)",
          type: "number",
          options: {
            precision: 1,
          },
        },
        {
          name: "Revenue",
          type: "currency",
          options: {
            precision: 2,
            symbol: "$",
          },
        },
        {
          name: "Space Type",
          type: "multipleSelects",
          options: {
            choices: [
              { name: "RV/Motorhome", color: "greenLight2" },
              { name: "Home Office", color: "blueLight2" },
              { name: "Bedroom", color: "purpleLight2" },
              { name: "Kitchen", color: "orangeLight2" },
              { name: "Garage", color: "yellowLight2" },
              { name: "Closet", color: "pinkLight2" },
              { name: "Whole House", color: "grayLight2" },
            ],
          },
        },
        {
          name: "Before Photos",
          type: "multipleAttachments",
          options: {},
        },
        {
          name: "After Photos",
          type: "multipleAttachments",
          options: {},
        },
        {
          name: "Project Notes",
          type: "multilineText",
          options: {},
        },
        {
          name: "Client Feedback",
          type: "multilineText",
          options: {},
        },
        {
          name: "Follow-up Tasks",
          type: "multipleRecordLinks",
          options: {
            linkedTableId: "tblTasks",
          },
        },
        {
          name: "Date Created",
          type: "createdTime",
          options: {},
        },
      ],
    },
    {
      name: "Tasks",
      description: "Follow-up tasks and reminders",
      fields: [
        {
          name: "Task",
          type: "singleLineText",
          options: {},
        },
        {
          name: "Related Lead",
          type: "multipleRecordLinks",
          options: {
            linkedTableId: "tblLeads",
          },
        },
        {
          name: "Related Project",
          type: "multipleRecordLinks",
          options: {
            linkedTableId: "tblProjects",
          },
        },
        {
          name: "Task Type",
          type: "singleSelect",
          options: {
            choices: [
              { name: "Follow-up Call", color: "blueLight2" },
              { name: "Send Email", color: "greenLight2" },
              { name: "Send Proposal", color: "orangeLight2" },
              { name: "Schedule Session", color: "purpleLight2" },
              { name: "Check-in", color: "yellowLight2" },
              { name: "Request Review", color: "pinkLight2" },
            ],
          },
        },
        {
          name: "Priority",
          type: "singleSelect",
          options: {
            choices: [
              { name: "High", color: "redLight2" },
              { name: "Medium", color: "orangeLight2" },
              { name: "Low", color: "greenLight2" },
            ],
          },
        },
        {
          name: "Due Date",
          type: "date",
          options: {},
        },
        {
          name: "Status",
          type: "singleSelect",
          options: {
            choices: [
              { name: "To Do", color: "yellowLight2" },
              { name: "In Progress", color: "orangeLight2" },
              { name: "Completed", color: "greenLight2" },
              { name: "Cancelled", color: "redLight2" },
            ],
          },
        },
        {
          name: "Notes",
          type: "multilineText",
          options: {},
        },
        {
          name: "Date Created",
          type: "createdTime",
          options: {},
        },
        {
          name: "Completed Date",
          type: "dateTime",
          options: {},
        },
      ],
    },
    {
      name: "Analytics",
      description: "Track key metrics and performance",
      fields: [
        {
          name: "Date",
          type: "date",
          options: {},
        },
        {
          name: "New Leads",
          type: "number",
          options: { precision: 0 },
        },
        {
          name: "Consultations Booked",
          type: "number",
          options: { precision: 0 },
        },
        {
          name: "Projects Completed",
          type: "number",
          options: { precision: 0 },
        },
        {
          name: "Revenue",
          type: "currency",
          options: {
            precision: 2,
            symbol: "$",
          },
        },
        {
          name: "Lead Sources",
          type: "multilineText",
          options: {},
        },
        {
          name: "Notes",
          type: "multilineText",
          options: {},
        },
      ],
    },
  ],
};

async function createBase() {
  try {
    console.log("🚀 Creating ClutterFreeSpaces CRM in Airtable...\n");

    const createBasePayload = {
      name: CRM_STRUCTURE.name,
      workspaceId: null, // Will use personal workspace
      tables: CRM_STRUCTURE.tables.map((table) => ({
        name: table.name,
        description: table.description,
        fields: table.fields.filter(
          (field) => field.type !== "multipleRecordLinks",
        ), // Remove links for initial creation
      })),
    };

    const response = await axios.post(
      `${AIRTABLE_API_BASE}/bases`,
      createBasePayload,
      { headers },
    );

    const baseId = response.data.id;
    console.log(`✅ Base created successfully!`);
    console.log(`   Base ID: ${baseId}`);
    console.log(`   Base URL: https://airtable.com/${baseId}`);

    // Get table IDs for linking
    const tablesResponse = await axios.get(
      `${AIRTABLE_API_BASE}/bases/${baseId}/tables`,
      { headers },
    );
    const tables = tablesResponse.data.tables;

    console.log(`\n📋 Tables created:`);
    tables.forEach((table) => {
      console.log(`   ${table.name}: ${table.id}`);
    });

    // Create sample data
    await createSampleData(baseId, tables);

    return { baseId, tables };
  } catch (error) {
    console.error(
      "❌ Error creating base:",
      error.response?.data || error.message,
    );
    return null;
  }
}

async function createSampleData(baseId, tables) {
  console.log("\n📝 Creating sample data...");

  const leadsTable = tables.find((t) => t.name === "Leads");
  const projectsTable = tables.find((t) => t.name === "Projects");

  // Sample leads
  const sampleLeads = [
    {
      fields: {
        Name: "Sarah Johnson",
        Email: "sarah.j@email.com",
        Phone: "(406) 555-0101",
        "Lead Score": 85,
        "Organization Style": "Visual",
        "Lead Source": "Quiz",
        Status: "Client",
        Location: "Billings, MT",
        "Space Type": ["RV/Motorhome"],
        "Budget Range": "$500-800",
        Timeline: "Completed",
        Notes: "Full-time RVer, loves the space now!",
        "Last Contact": new Date().toISOString(),
      },
    },
    {
      fields: {
        Name: "Mike Thompson",
        Email: "mike.t@email.com",
        Phone: "(406) 555-0102",
        "Lead Score": 65,
        "Organization Style": "Simple",
        "Lead Source": "Facebook",
        Status: "Consultation Scheduled",
        Location: "Missoula, MT",
        "Space Type": ["Garage", "Home Office"],
        "Budget Range": "$300-500",
        Timeline: "Within 2 weeks",
        Notes: "Interested in garage organization",
        "Next Follow-up": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
    },
  ];

  try {
    // Create sample leads
    const createLeadsResponse = await axios.post(
      `https://api.airtable.com/v0/${baseId}/${leadsTable.id}`,
      { records: sampleLeads },
      { headers },
    );

    console.log(
      `✅ Created ${createLeadsResponse.data.records.length} sample leads`,
    );

    // Create sample project for Sarah
    const sampleProject = {
      fields: {
        "Project Name": "Sarah J - RV Organization",
        "Project Type": "Full Organization Project",
        Status: "Completed",
        "Duration (Hours)": 6,
        Revenue: 640,
        "Space Type": ["RV/Motorhome"],
        "Project Notes":
          "32-foot travel trailer, complete organization system installed",
        "Client Feedback": "Amazing transformation! Highly recommend Chanel!",
      },
    };

    const createProjectResponse = await axios.post(
      `https://api.airtable.com/v0/${baseId}/${projectsTable.id}`,
      { records: [sampleProject] },
      { headers },
    );

    console.log(
      `✅ Created ${createProjectResponse.data.records.length} sample project`,
    );
  } catch (error) {
    console.error(
      "❌ Error creating sample data:",
      error.response?.data || error.message,
    );
  }
}

async function generateIntegrationGuide(baseId, tables) {
  console.log("\n🔗 Integration Information:");
  console.log(`\n📋 Add these to your .env file:`);
  console.log(`AIRTABLE_BASE_ID=${baseId}`);

  console.log(`\n📊 Table IDs for Make.com/API integration:`);
  tables.forEach((table) => {
    const envName = `AIRTABLE_${table.name.toUpperCase().replace(/\s+/g, "_")}_TABLE_ID`;
    console.log(`${envName}=${table.id}`);
  });

  console.log(`\n🔧 Make.com Integration:`);
  console.log(`1. Base ID: ${baseId}`);
  console.log(`2. API Key: ${API_KEY.substring(0, 15)}...`);
  console.log(`3. Use "Create Record" modules for each table`);
  console.log(
    `4. Lead scoring flow: Quiz → Calculate Score → Add to Leads table`,
  );
  console.log(`5. Booking flow: Calendly → Create Project record`);
}

// Main execution
async function main() {
  if (!API_KEY) {
    console.log("❌ Missing AIRTABLE_API_KEY in .env file");
    console.log("Get your API key from: https://airtable.com/create/tokens");
    return;
  }

  const result = await createBase();

  if (result) {
    await generateIntegrationGuide(result.baseId, result.tables);

    console.log("\n🎉 ClutterFreeSpaces CRM is ready!");
    console.log(`📱 Access your CRM: https://airtable.com/${result.baseId}`);
    console.log("\n📋 Next Steps:");
    console.log("1. Add Base ID to .env file");
    console.log("2. Set up Make.com integrations");
    console.log("3. Test lead flow from quiz to CRM");
  }
}

main().catch(console.error);
