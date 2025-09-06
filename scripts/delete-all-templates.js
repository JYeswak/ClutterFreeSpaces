#!/usr/bin/env node

/**
 * Delete ALL SendGrid Templates - Clean Slate Script
 * This will remove all existing templates to allow fresh deployment
 */

const sgClient = require("@sendgrid/client");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;
sgClient.setApiKey(SENDGRID_API_KEY);

async function getAllTemplates() {
  try {
    const request = {
      url: "/v3/templates",
      method: "GET",
      qs: {
        generations: "legacy,dynamic",
      },
    };

    const [response] = await sgClient.request(request);
    return response.body.templates || [];
  } catch (error) {
    console.error(
      "❌ Failed to get templates:",
      error.response?.body || error.message,
    );
    return [];
  }
}

async function deleteTemplate(templateId, templateName) {
  try {
    const request = {
      url: `/v3/templates/${templateId}`,
      method: "DELETE",
    };

    await sgClient.request(request);
    console.log(`✅ Deleted: ${templateName} (${templateId})`);
    return true;
  } catch (error) {
    console.error(
      `❌ Failed to delete ${templateName}:`,
      error.response?.body || error.message,
    );
    return false;
  }
}

async function deleteAllTemplates() {
  console.log("🗑️  SENDGRID TEMPLATE CLEANUP");
  console.log("=============================");
  console.log("This will DELETE ALL SendGrid templates!");
  console.log("");

  // Get all templates
  console.log("📋 Fetching all templates...");
  const templates = await getAllTemplates();

  if (templates.length === 0) {
    console.log("✨ No templates found - already clean!");
    return;
  }

  console.log(`Found ${templates.length} templates to delete:`);
  templates.forEach((template) => {
    console.log(`  - ${template.name} (${template.id})`);
  });

  console.log("\n🚨 DANGER ZONE: Starting deletion in 3 seconds...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Delete each template
  let deleted = 0;
  let failed = 0;

  for (const template of templates) {
    console.log(`🗑️  Deleting: ${template.name}...`);
    const success = await deleteTemplate(template.id, template.name);

    if (success) {
      deleted++;
    } else {
      failed++;
    }

    // Small delay between deletions
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Summary
  console.log("\n📊 CLEANUP SUMMARY:");
  console.log("==================");
  console.log(`✅ Deleted: ${deleted}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(
    `📈 Success Rate: ${((deleted / templates.length) * 100).toFixed(1)}%`,
  );

  if (deleted > 0) {
    console.log("\n🎉 SendGrid templates cleaned!");
    console.log("Ready for fresh deployment with corrected content.");
  }

  return { deleted, failed, total: templates.length };
}

// Safety check and execution
if (require.main === module) {
  console.log("⚠️  WARNING: This will delete ALL SendGrid templates!");
  console.log("🎯 Purpose: Clean slate for corrected template deployment");
  console.log("⏰ Starting cleanup in 5 seconds... (Ctrl+C to cancel)");
  console.log("");

  setTimeout(() => {
    deleteAllTemplates().catch(console.error);
  }, 5000);
}

module.exports = { deleteAllTemplates };
