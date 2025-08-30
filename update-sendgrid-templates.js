#!/usr/bin/env node

/**
 * Update existing SendGrid templates to fix personalization issues
 * - Replace Sarah Mitchell with Chanel Basolo in all templates
 * - Update Calendly links to working URL
 * - Fix any other personalization issues
 */

const sgClient = require("@sendgrid/client");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;

// Template IDs from our current system
const TEMPLATE_IDS = [
  "d-f1a6898e10e641e6b50c90c7e2f14a2f", // HOT Email 1
  "d-fe0bcba3de744a979adf56dd9a39a986", // HOT Email 2
  "d-a28f0d1925384df8bc5e7d7e96725bc7", // HOT Email 3
  "d-507bc5eec63d49d4b0780584173bb442", // HOT Email 4
  "d-607cdd56799d47f4819a016ca98c7e22", // HOT Email 5
];

sgClient.setApiKey(SENDGRID_API_KEY);

async function getTemplateDetails(templateId) {
  try {
    const request = {
      url: `/v3/templates/${templateId}`,
      method: "GET",
    };

    const [response] = await sgClient.request(request);
    return response.body;
  } catch (error) {
    console.error(
      `❌ Failed to get template ${templateId}:`,
      error.response?.body || error.message,
    );
    return null;
  }
}

async function updateTemplate(templateId, updatedTemplate) {
  try {
    const request = {
      url: `/v3/templates/${templateId}`,
      method: "PATCH",
      body: updatedTemplate,
    };

    const [response] = await sgClient.request(request);
    return response.body;
  } catch (error) {
    console.error(
      `❌ Failed to update template ${templateId}:`,
      error.response?.body || error.message,
    );
    return null;
  }
}

function fixTemplateContent(content) {
  if (!content) return content;

  // Replace Sarah Mitchell with Chanel Basolo
  let fixed = content.replace(/Sarah Mitchell/g, "Chanel Basolo");

  // Update broken Calendly links
  fixed = fixed.replace(
    /https:\/\/calendly\.com\/clutterfree-montana\/rv-consultation/g,
    "https://calendly.com/chanelnbasolo/30min",
  );

  // Update any other broken Calendly variations
  fixed = fixed.replace(
    /calendly\.com\/clutterfreespaces\/consultation/g,
    "calendly.com/chanelnbasolo/30min",
  );

  return fixed;
}

async function updateAllTemplates() {
  console.log("🔧 Updating SendGrid Templates - Personalization Fixes\n");
  console.log("API Key:", SENDGRID_API_KEY ? "✓ Configured" : "✗ Missing");
  console.log("Templates to update:", TEMPLATE_IDS.length);
  console.log("");

  const results = [];

  for (const templateId of TEMPLATE_IDS) {
    console.log(`📧 Processing template: ${templateId}`);

    // Get current template
    const template = await getTemplateDetails(templateId);
    if (!template) {
      console.log(`⚠️ Skipping ${templateId} - couldn't retrieve`);
      continue;
    }

    console.log(`   Name: ${template.name}`);

    // Check if template has versions (active version)
    const activeVersion = template.versions?.find((v) => v.active === 1);
    if (!activeVersion) {
      console.log(`⚠️ No active version found for ${templateId}`);
      continue;
    }

    // Fix the content
    const originalSubject = activeVersion.subject;
    const originalHtml = activeVersion.html_content;
    const originalText = activeVersion.plain_content;

    const fixedSubject = fixTemplateContent(originalSubject);
    const fixedHtml = fixTemplateContent(originalHtml);
    const fixedText = fixTemplateContent(originalText);

    // Check if any changes needed
    const hasChanges =
      originalSubject !== fixedSubject ||
      originalHtml !== fixedHtml ||
      originalText !== fixedText;

    if (!hasChanges) {
      console.log(`✅ Template ${templateId} - No changes needed`);
      results.push({ templateId, status: "no-changes" });
      continue;
    }

    // Update the template
    const updateData = {
      versions: [
        {
          subject: fixedSubject,
          html_content: fixedHtml,
          plain_content: fixedText,
          active: 1,
        },
      ],
    };

    console.log(`🔄 Updating template with fixes...`);
    console.log(
      `   - Sarah Mitchell → Chanel Basolo: ${originalHtml?.includes("Sarah Mitchell") ? "YES" : "NO"}`,
    );
    console.log(
      `   - Fix Calendly links: ${originalHtml?.includes("clutterfree-montana") ? "YES" : "NO"}`,
    );

    const updated = await updateTemplate(templateId, updateData);
    if (updated) {
      console.log(`✅ Template ${templateId} updated successfully`);
      results.push({ templateId, status: "updated" });
    } else {
      console.log(`❌ Template ${templateId} update failed`);
      results.push({ templateId, status: "failed" });
    }

    console.log("");
  }

  // Summary
  console.log("📊 UPDATE SUMMARY:");
  console.log("================");
  const updated = results.filter((r) => r.status === "updated").length;
  const noChanges = results.filter((r) => r.status === "no-changes").length;
  const failed = results.filter((r) => r.status === "failed").length;

  console.log(`✅ Updated: ${updated}`);
  console.log(`➖ No changes needed: ${noChanges}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("");

  if (updated > 0) {
    console.log("🎉 Template personalization fixes deployed!");
    console.log("New emails will now have:");
    console.log("- ✅ Chanel Basolo signature");
    console.log("- ✅ Working Calendly links (30min)");
  }

  return results;
}

// Run the update
if (require.main === module) {
  updateAllTemplates().catch(console.error);
}

module.exports = { updateAllTemplates };
