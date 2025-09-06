#!/usr/bin/env node

/**
 * SendGrid Sender Authentication Setup
 * This script helps verify and set up proper sender authentication
 */

const axios = require("axios");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;

if (!SENDGRID_API_KEY) {
  console.error("❌ SendGrid_API_Key environment variable is required");
  process.exit(1);
}

async function checkSenderAuthentication() {
  try {
    console.log("🔍 Checking SendGrid sender authentication...");

    // Check verified senders
    console.log("\n📧 Checking verified senders...");
    const sendersResponse = await axios.get(
      "https://api.sendgrid.com/v3/verified_senders",
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Verified Senders:");
    sendersResponse.data.results.forEach((sender) => {
      console.log(
        `  - ${sender.from_email} (${sender.from_name}) - Status: ${sender.verified ? "✅ Verified" : "❌ Not Verified"}`,
      );
    });

    // Check domain authentication
    console.log("\n🌐 Checking domain authentication...");
    const domainsResponse = await axios.get(
      "https://api.sendgrid.com/v3/whitelabel/domains",
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Authenticated Domains:");
    domainsResponse.data.forEach((domain) => {
      console.log(
        `  - ${domain.domain} - Valid: ${domain.valid ? "✅" : "❌"}`,
      );
    });
  } catch (error) {
    console.error(
      "❌ Error checking sender authentication:",
      error.response?.data || error.message,
    );

    if (error.response?.status === 403) {
      console.log("\n💡 Suggestions:");
      console.log(
        "1. Verify your SendGrid API key has the correct permissions",
      );
      console.log(
        "2. Check if sender authentication is set up in SendGrid dashboard",
      );
    }
  }
}

async function createSenderIdentity() {
  try {
    console.log(
      "\n➕ Creating sender identity for contact@clutter-free-spaces.com...",
    );

    const senderData = {
      nickname: "Clutter Free Spaces Contact",
      from: {
        email: "contact@clutter-free-spaces.com",
        name: "Chanel @ Clutter Free Spaces",
      },
      reply_to: {
        email: "contact@clutter-free-spaces.com",
        name: "Chanel @ Clutter Free Spaces",
      },
      address: "123 Main St",
      city: "Missoula",
      state: "Montana",
      zip: "59801",
      country: "United States",
    };

    const response = await axios.post(
      "https://api.sendgrid.com/v3/verified_senders",
      senderData,
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Sender identity created!");
    console.log(
      `📧 Verification email sent to: contact@clutter-free-spaces.com`,
    );
    console.log("📋 Next steps:");
    console.log(
      "1. Check contact@clutter-free-spaces.com for verification email",
    );
    console.log("2. Click the verification link in the email");
    console.log(
      "3. Run this script again to verify the sender is authenticated",
    );
  } catch (error) {
    console.error(
      "❌ Error creating sender identity:",
      error.response?.data || error.message,
    );

    if (error.response?.data?.errors) {
      error.response.data.errors.forEach((err) => {
        console.error(`  - ${err.message}`);
      });
    }
  }
}

async function main() {
  console.log("🚀 SendGrid Sender Authentication Setup\n");

  await checkSenderAuthentication();

  console.log("\n" + "=".repeat(60));
  console.log(
    "Would you like to create a sender identity? (This requires manual verification)",
  );
  console.log("Run: node scripts/setup/setup-sendgrid-sender.js --create");

  if (process.argv.includes("--create")) {
    await createSenderIdentity();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkSenderAuthentication, createSenderIdentity };
