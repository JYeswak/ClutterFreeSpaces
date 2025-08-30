#!/usr/bin/env node

/**
 * Debug the actual SendGrid template content to see what's causing the issues
 */

const sgClient = require("@sendgrid/client");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;
sgClient.setApiKey(SENDGRID_API_KEY);

async function debugTemplate(templateId) {
  try {
    const request = {
      url: `/v3/templates/${templateId}`,
      method: "GET",
    };

    const [response] = await sgClient.request(request);
    const template = response.body;

    console.log(`\n📧 TEMPLATE: ${template.name}`);
    console.log(`ID: ${templateId}`);

    const activeVersion = template.versions?.find((v) => v.active === 1);
    if (!activeVersion) {
      console.log("❌ No active version found");
      return;
    }

    console.log("\n📄 SUBJECT:");
    console.log(activeVersion.subject);

    console.log("\n📄 HTML CONTENT:");
    console.log(
      "Length:",
      activeVersion.html_content?.length || 0,
      "characters",
    );

    // Look for problem content
    const htmlContent = activeVersion.html_content || "";
    console.log("\n🔍 CONTENT ANALYSIS:");
    console.log(
      "Contains 'Sarah Mitchell':",
      htmlContent.includes("Sarah Mitchell"),
    );
    console.log(
      "Contains 'Chanel Basolo':",
      htmlContent.includes("Chanel Basolo"),
    );
    console.log("Contains '20-minute':", htmlContent.includes("20-minute"));
    console.log("Contains '30-minute':", htmlContent.includes("30-minute"));
    console.log(
      "Contains 'breakthrough':",
      htmlContent.includes("breakthrough"),
    );
    console.log(
      "Contains 'consultation':",
      htmlContent.includes("consultation"),
    );

    // Show relevant excerpts
    if (
      htmlContent.includes("Sarah Mitchell") ||
      htmlContent.includes("20-minute") ||
      htmlContent.includes("breakthrough")
    ) {
      console.log("\n⚠️ PROBLEMATIC CONTENT FOUND:");

      // Find and show snippets with issues
      const lines = htmlContent.split("\n");
      lines.forEach((line, i) => {
        if (
          line.includes("Sarah Mitchell") ||
          line.includes("20-minute") ||
          line.includes("breakthrough")
        ) {
          console.log(`Line ${i + 1}: ${line.trim()}`);
        }
      });
    }

    console.log("\n" + "=".repeat(80));
  } catch (error) {
    console.error(
      `❌ Failed to debug template ${templateId}:`,
      error.response?.body || error.message,
    );
  }
}

async function debugAllTemplates() {
  console.log("🔍 DEBUGGING SENDGRID TEMPLATE CONTENT\n");

  const templateIds = [
    "d-f1a6898e10e641e6b50c90c7e2f14a2f", // HOT Email 1 - The problematic one
  ];

  for (const templateId of templateIds) {
    await debugTemplate(templateId);
  }

  console.log(
    "\n🎯 If issues are found above, we need to update the templates directly",
  );
  console.log("   or regenerate them from corrected source files.");
}

// Run the debug
debugAllTemplates().catch(console.error);
