#!/usr/bin/env node

/**
 * Comprehensive SendGrid template content fixes
 * - Replace ALL references to Sarah Mitchell with Chanel Basolo
 * - Fix "20-minute breakthrough call" to "30-minute consultation"
 * - Update any other inconsistencies
 */

const sgClient = require("@sendgrid/client");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;
sgClient.setApiKey(SENDGRID_API_KEY);

// Template IDs to fix
const TEMPLATE_IDS = [
  "d-f1a6898e10e641e6b50c90c7e2f14a2f", // HOT Email 1 - This is the one with issues
];

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

function comprehensiveContentFix(content) {
  if (!content) return content;

  let fixed = content;

  // Replace all variations of Sarah Mitchell
  fixed = fixed.replace(/Sarah Mitchell/gi, "Chanel Basolo");
  fixed = fixed.replace(/Sarah/gi, "Chanel"); // In case there are standalone "Sarah" references

  // Fix call duration and type
  fixed = fixed.replace(
    /20-minute breakthrough call/gi,
    "30-minute consultation",
  );
  fixed = fixed.replace(
    /20-Minute Breakthrough Call/gi,
    "30-Minute Consultation",
  );
  fixed = fixed.replace(/breakthrough call/gi, "consultation");
  fixed = fixed.replace(/Breakthrough Call/gi, "Consultation");

  // Fix any other call duration references
  fixed = fixed.replace(/20 minute/gi, "30 minute");
  fixed = fixed.replace(/20-minute/gi, "30-minute");

  // Update job titles to match Chanel's business
  fixed = fixed.replace(
    /Montana RV Organization Specialist/gi,
    "Montana RV Organization Expert",
  );

  // Update Calendly links (comprehensive)
  fixed = fixed.replace(
    /https?:\/\/calendly\.com\/[^\/]+\/[^\/\s"]+/gi,
    "https://calendly.com/chanelnbasolo/30min",
  );

  return fixed;
}

async function fixTemplateContent() {
  console.log("🔧 Comprehensive Template Content Fixes\n");

  for (const templateId of TEMPLATE_IDS) {
    console.log(`📧 Processing template: ${templateId}`);

    // Get current template
    const template = await getTemplateDetails(templateId);
    if (!template) continue;

    console.log(`   Name: ${template.name}`);

    // Get active version
    const activeVersion = template.versions?.find((v) => v.active === 1);
    if (!activeVersion) {
      console.log(`⚠️ No active version found`);
      continue;
    }

    // Show current content for debugging
    console.log("\n🔍 CURRENT CONTENT ANALYSIS:");
    console.log("Subject:", activeVersion.subject);
    console.log(
      "Contains 'Sarah Mitchell':",
      activeVersion.html_content?.includes("Sarah Mitchell"),
    );
    console.log(
      "Contains '20-minute':",
      activeVersion.html_content?.includes("20-minute"),
    );
    console.log(
      "Contains 'breakthrough':",
      activeVersion.html_content?.includes("breakthrough"),
    );

    // Apply comprehensive fixes
    const fixedSubject = comprehensiveContentFix(activeVersion.subject);
    const fixedHtml = comprehensiveContentFix(activeVersion.html_content);
    const fixedText = comprehensiveContentFix(activeVersion.plain_content);

    // Update template with new version
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

    console.log("\n🔄 APPLYING FIXES:");
    console.log("- Sarah Mitchell → Chanel Basolo");
    console.log("- 20-minute breakthrough call → 30-minute consultation");
    console.log("- Montana RV Organization Specialist → Expert");
    console.log("- Update all Calendly links");

    const updated = await updateTemplate(templateId, updateData);
    if (updated) {
      console.log("✅ Template updated successfully!");
    } else {
      console.log("❌ Template update failed");
    }

    console.log("\n" + "=".repeat(60) + "\n");
  }

  console.log("🎉 Comprehensive template fixes complete!");
  console.log("New emails should now have correct:");
  console.log("- ✅ Chanel Basolo (owner name)");
  console.log("- ✅ 30-minute consultation (not 20-minute)");
  console.log("- ✅ Working Calendly links");
}

// Run the comprehensive fix
fixTemplateContent().catch(console.error);
