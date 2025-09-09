require("dotenv").config({ path: "../../.env" });
const fs = require("fs");
const path = require("path");

console.log("🚀 ClutterFreeSpaces Automation Setup\n");

// Check required environment variables
const requiredVars = {
  "SendGrid API Key": process.env.SendGrid_API_Key,
  "Calendly API Key": process.env.Calendy_API_Key,
  "Airtable API Key": process.env.AIRTABLE_API_KEY,
  "Airtable Base ID": process.env.AIRTABLE_BASE_ID,
  "Google Cloud API Key": process.env.GOOGLECLOUD_API_KEY,
  "Google Cloud Project ID": process.env.GCP_PROJECT_ID,
};

const optionalVars = {
  "GMB Location ID": process.env.GMB_LOCATION_ID,
  "GA4 Measurement ID": process.env.GA4_MEASUREMENT_ID,
  "GA4 API Secret": process.env.GA4_API_SECRET,
  "Twilio Account SID": process.env.TWILIO_ACCOUNT_SID,
  "Twilio Phone Number": process.env.TWILIO_PHONE_NUMBER,
};

console.log("✅ Required Configuration:");
let allRequired = true;
for (const [name, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`   ✅ ${name}: Configured`);
  } else {
    console.log(`   ❌ ${name}: Missing`);
    allRequired = false;
  }
}

console.log("\n🔧 Optional Configuration:");
let optionalCount = 0;
for (const [name, value] of Object.entries(optionalVars)) {
  if (value) {
    console.log(`   ✅ ${name}: Configured`);
    optionalCount++;
  } else {
    console.log(`   ⚠️  ${name}: Not configured`);
  }
}

console.log("\n📊 Setup Status:");
console.log(
  `   Required: ${Object.keys(requiredVars).filter((k) => requiredVars[k]).length}/${Object.keys(requiredVars).length}`,
);
console.log(
  `   Optional: ${optionalCount}/${Object.keys(optionalVars).length}`,
);

if (!allRequired) {
  console.log(
    "\n❌ Missing required configuration. Please check your .env file.",
  );
  process.exit(1);
}

console.log("\n🛠️  Next Steps:");
if (!process.env.GMB_LOCATION_ID) {
  console.log("1. Get your GMB Location ID:");
  console.log("   node scripts/setup/get-gmb-location.js");
}

if (!process.env.GA4_MEASUREMENT_ID || !process.env.GA4_API_SECRET) {
  console.log("2. Configure GA4 tracking:");
  console.log("   node scripts/setup/get-ga4-config.js");
}

if (!process.env.TWILIO_ACCOUNT_SID) {
  console.log("3. Fix Twilio configuration:");
  console.log("   node scripts/setup/get-twilio-config.js");
}

console.log("\n🧪 Test your setup:");
console.log("   node scripts/test/test-ga4-tracking.js");
console.log("   PORT=3333 node config/api-server.js");

console.log("\n🎉 Your automation system is ready for Railway deployment!");
