#!/usr/bin/env node

/**
 * Test the automation email system without ASM groups
 */

const { triggerEmailSequence } = require("./email-automation-config.js");
require("dotenv").config();

async function testAutomationNoASM() {
  console.log("🧪 Testing Newsletter Automation WITHOUT ASM Groups\n");

  try {
    console.log("📧 Triggering HOT email sequence...");

    const result = await triggerEmailSequence({
      email: "joshua@zirkel.us",
      firstName: "Josh",
      rvType: "fifth-wheel",
      challenge: "kitchen",
      segment: "HOT",
    });

    console.log("✅ Automation triggered successfully!");
    console.log("📊 Results:", JSON.stringify(result, null, 2));

    console.log("\n🔍 Check your email for the HOT sequence email!");
    console.log("This should now arrive since ASM Group 25257 is removed.");
  } catch (error) {
    console.error("❌ Automation test failed:");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Run the test
testAutomationNoASM().catch(console.error);
