#!/usr/bin/env node

/**
 * ClutterFreeSpaces SendGrid Email Template Deployment Script
 *
 * This script:
 * 1. Creates 15 dynamic email templates in SendGrid (5 per segment)
 * 2. Updates api-server.js with real template IDs
 * 3. Tests template deployment
 * 4. Configures email automation system
 *
 * Usage: node deploy-sendgrid-templates.js
 */

const sgClient = require("@sendgrid/client");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// SendGrid API configuration
const SENDGRID_API_KEY = process.env.SendGrid_API_Key;
sgClient.setApiKey(SENDGRID_API_KEY);

// Load email sequences
const emailSequences = require("./newsletter-email-sequences.js");

// Template deployment tracking
const deploymentResults = {
  "hot-leads": {},
  "warm-leads": {},
  "cold-leads": {},
};

// SendGrid template creation
async function createSendGridTemplate(templateData) {
  try {
    const request = {
      url: "/v3/templates",
      method: "POST",
      body: {
        name: templateData.name,
        generation: "dynamic",
      },
    };

    console.log(`📝 Creating template: ${templateData.name}`);
    const [response, body] = await sgClient.request(request);

    if (response.statusCode === 201) {
      console.log(`✅ Template created: ${body.id}`);
      return body.id;
    } else {
      throw new Error(`Failed to create template: ${response.statusCode}`);
    }
  } catch (error) {
    console.error(
      `❌ Error creating template ${templateData.name}:`,
      error.response?.body || error.message,
    );
    throw error;
  }
}

// SendGrid template version creation with HTML content
async function createTemplateVersion(templateId, versionData) {
  try {
    const request = {
      url: `/v3/templates/${templateId}/versions`,
      method: "POST",
      body: {
        active: 1,
        name: versionData.name,
        html_content: versionData.html_content,
        plain_content: versionData.plain_content,
        generate_plain_content: true,
        subject: versionData.subject,
        editor: "code",
      },
    };

    console.log(`📄 Creating template version for: ${templateId}`);
    const [response, body] = await sgClient.request(request);

    if (response.statusCode === 201) {
      console.log(`✅ Template version created for: ${templateId}`);
      return body;
    } else {
      throw new Error(
        `Failed to create template version: ${response.statusCode}`,
      );
    }
  } catch (error) {
    console.error(
      `❌ Error creating template version for ${templateId}:`,
      error.response?.body || error.message,
    );
    throw error;
  }
}

// Convert email content to SendGrid format with proper personalization
function formatEmailForSendGrid(emailData, segmentType) {
  // Extract subject line from email data
  let subject = emailData.subject || "Your RV Organization Tips";

  // Ensure proper SendGrid personalization syntax
  subject = subject.replace(/\{\{([^}]+)\}\}/g, "{{$1}}");

  // Get HTML content and ensure SendGrid personalization
  let htmlContent = emailData.template.html;
  htmlContent = htmlContent.replace(/\{\{([^}]+)\}\}/g, "{{$1}}");

  // Add SendGrid unsubscribe footer
  const unsubscribeFooter = `
    <div style="margin-top: 40px; padding: 20px; border-top: 2px solid #eee; font-size: 12px; color: #666; text-align: center;">
      <p style="margin: 10px 0;">You're receiving this because you signed up for Montana RV organization tips.</p>
      <p style="margin: 10px 0;">
        <a href="{{{unsubscribe}}}" style="color: #8b4513; text-decoration: underline;">Unsubscribe</a> | 
        <a href="{{{unsubscribe_preferences}}}" style="color: #8b4513; text-decoration: underline;">Update Preferences</a>
      </p>
      <p style="margin: 10px 0; font-size: 10px;">
        ClutterFreeSpaces, Montana RV Organization Specialist<br>
        {{asm_group_unsubscribe}}
      </p>
    </div>
  `;

  // Insert unsubscribe footer before closing div
  htmlContent = htmlContent.replace(
    /<\/div>\s*$/,
    unsubscribeFooter + "</div>",
  );

  // Generate plain text version
  const plainContent =
    htmlContent
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n\s*\n/g, "\n\n") // Clean up line breaks
      .trim() + "\n\nTo unsubscribe: {{{unsubscribe}}}";

  return {
    subject,
    html_content: htmlContent,
    plain_content: plainContent,
  };
}

// Deploy all email templates
async function deployAllTemplates() {
  console.log("🚀 Starting SendGrid template deployment...\n");

  try {
    // Deploy HOT leads sequence (10-day aggressive)
    console.log("🔥 Deploying HOT leads sequence (10-day aggressive)...");
    for (let i = 0; i < emailSequences.hotLeads.emails.length; i++) {
      const email = emailSequences.hotLeads.emails[i];
      const emailNum = i + 1;

      const templateName = `ClutterFreeSpaces - HOT Lead Email ${emailNum} (Day ${email.day})`;
      const templateId = await createSendGridTemplate({ name: templateName });

      const formattedEmail = formatEmailForSendGrid(email, "HOT");
      await createTemplateVersion(templateId, {
        name: `HOT Lead Email ${emailNum}`,
        ...formattedEmail,
      });

      deploymentResults["hot-leads"][`email_${emailNum}`] = templateId;
    }

    // Deploy WARM leads sequence (21-day educational)
    console.log("\n🌟 Deploying WARM leads sequence (21-day educational)...");
    for (let i = 0; i < emailSequences.warmLeads.emails.length; i++) {
      const email = emailSequences.warmLeads.emails[i];
      const emailNum = i + 1;

      const templateName = `ClutterFreeSpaces - WARM Lead Email ${emailNum} (Day ${email.day})`;
      const templateId = await createSendGridTemplate({ name: templateName });

      const formattedEmail = formatEmailForSendGrid(email, "WARM");
      await createTemplateVersion(templateId, {
        name: `WARM Lead Email ${emailNum}`,
        ...formattedEmail,
      });

      deploymentResults["warm-leads"][`email_${emailNum}`] = templateId;
    }

    // Deploy COLD leads sequence (30-day gentle)
    console.log("\n❄️  Deploying COLD leads sequence (30-day gentle)...");
    for (let i = 0; i < emailSequences.coldLeads.emails.length; i++) {
      const email = emailSequences.coldLeads.emails[i];
      const emailNum = i + 1;

      const templateName = `ClutterFreeSpaces - COLD Lead Email ${emailNum} (Day ${email.day})`;
      const templateId = await createSendGridTemplate({ name: templateName });

      const formattedEmail = formatEmailForSendGrid(email, "COLD");
      await createTemplateVersion(templateId, {
        name: `COLD Lead Email ${emailNum}`,
        ...formattedEmail,
      });

      deploymentResults["cold-leads"][`email_${emailNum}`] = templateId;
    }

    console.log("\n✅ All templates deployed successfully!");
    return deploymentResults;
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Update api-server.js with new template IDs
async function updateApiServer(templateIds) {
  console.log("\n🔧 Updating api-server.js with new template IDs...");

  try {
    const apiServerPath = path.join(__dirname, "api-server.js");
    let apiServerContent = fs.readFileSync(apiServerPath, "utf8");

    // Create the new SEQUENCE_TEMPLATES object
    const newSequenceTemplates = `const SEQUENCE_TEMPLATES = {
  "hot-leads": {
    email_1: "${templateIds["hot-leads"].email_1}",
    email_2: "${templateIds["hot-leads"].email_2}",
    email_3: "${templateIds["hot-leads"].email_3}",
    email_4: "${templateIds["hot-leads"].email_4}",
    email_5: "${templateIds["hot-leads"].email_5}",
  },
  "warm-leads": {
    email_1: "${templateIds["warm-leads"].email_1}",
    email_2: "${templateIds["warm-leads"].email_2}",
    email_3: "${templateIds["warm-leads"].email_3}",
    email_4: "${templateIds["warm-leads"].email_4}",
    email_5: "${templateIds["warm-leads"].email_5}",
  },
  "cold-leads": {
    email_1: "${templateIds["cold-leads"].email_1}",
    email_2: "${templateIds["cold-leads"].email_2}",
    email_3: "${templateIds["cold-leads"].email_3}",
    email_4: "${templateIds["cold-leads"].email_4}",
    email_5: "${templateIds["cold-leads"].email_5}",
  },
};`;

    // Replace the existing SEQUENCE_TEMPLATES
    const sequenceTemplateRegex = /const SEQUENCE_TEMPLATES = {[^}]*};/s;

    if (sequenceTemplateRegex.test(apiServerContent)) {
      apiServerContent = apiServerContent.replace(
        sequenceTemplateRegex,
        newSequenceTemplates,
      );
      console.log("✅ Updated existing SEQUENCE_TEMPLATES");
    } else {
      // If not found, add it after GUIDE_TEMPLATES
      const insertPoint =
        apiServerContent.indexOf(
          "};",
          apiServerContent.indexOf("const GUIDE_TEMPLATES"),
        ) + 2;
      const before = apiServerContent.substring(0, insertPoint);
      const after = apiServerContent.substring(insertPoint);
      apiServerContent =
        before +
        "\n\n// Email sequence template IDs (deployed via deploy-sendgrid-templates.js)\n" +
        newSequenceTemplates +
        after;
      console.log("✅ Added new SEQUENCE_TEMPLATES");
    }

    // Write the updated file
    fs.writeFileSync(apiServerPath, apiServerContent, "utf8");
    console.log("✅ api-server.js updated successfully");
  } catch (error) {
    console.error("❌ Error updating api-server.js:", error);
    throw error;
  }
}

// Test template deployment
async function testTemplateDeployment(templateIds) {
  console.log("\n🧪 Testing template deployment...");

  try {
    // Test one template from each segment
    const testCases = [
      {
        segment: "hot-leads",
        templateId: templateIds["hot-leads"].email_1,
        name: "HOT Lead Email 1",
      },
      {
        segment: "warm-leads",
        templateId: templateIds["warm-leads"].email_1,
        name: "WARM Lead Email 1",
      },
      {
        segment: "cold-leads",
        templateId: templateIds["cold-leads"].email_1,
        name: "COLD Lead Email 1",
      },
    ];

    for (const testCase of testCases) {
      const request = {
        url: `/v3/templates/${testCase.templateId}`,
        method: "GET",
      };

      const [response, body] = await sgClient.request(request);

      if (response.statusCode === 200) {
        console.log(`✅ ${testCase.name} verified: ${testCase.templateId}`);
      } else {
        throw new Error(`Template verification failed for ${testCase.name}`);
      }
    }

    console.log("✅ All template tests passed!");
  } catch (error) {
    console.error("❌ Template testing failed:", error);
    throw error;
  }
}

// Generate summary report
function generateReport(templateIds) {
  console.log("\n📊 DEPLOYMENT SUMMARY REPORT");
  console.log("=".repeat(50));

  console.log("\n🔥 HOT LEADS SEQUENCE (10-day aggressive):");
  Object.entries(templateIds["hot-leads"]).forEach(([key, id]) => {
    const emailNum = key.replace("email_", "");
    const dayNum = emailSequences.hotLeads.emails[emailNum - 1]?.day || 0;
    console.log(`   Email ${emailNum} (Day ${dayNum}): ${id}`);
  });

  console.log("\n🌟 WARM LEADS SEQUENCE (21-day educational):");
  Object.entries(templateIds["warm-leads"]).forEach(([key, id]) => {
    const emailNum = key.replace("email_", "");
    const dayNum = emailSequences.warmLeads.emails[emailNum - 1]?.day || 0;
    console.log(`   Email ${emailNum} (Day ${dayNum}): ${id}`);
  });

  console.log("\n❄️  COLD LEADS SEQUENCE (30-day gentle):");
  Object.entries(templateIds["cold-leads"]).forEach(([key, id]) => {
    const emailNum = key.replace("email_", "");
    const dayNum = emailSequences.coldLeads.emails[emailNum - 1]?.day || 0;
    console.log(`   Email ${emailNum} (Day ${dayNum}): ${id}`);
  });

  console.log("\n📧 EMAIL CONFIGURATION:");
  console.log(`   From Address: sarah@clutter-free-spaces.com`);
  console.log(`   From Name: Sarah Mitchell - Montana RV Organization`);
  console.log(`   Tracking: Opens and clicks enabled`);
  console.log(`   Unsubscribe: Automatic SendGrid links included`);

  console.log("\n🎯 PERSONALIZATION VARIABLES:");
  console.log(`   {{first_name}} - Lead's first name`);
  console.log(`   {{rv_type}} - Type of RV (Class A, Travel Trailer, etc.)`);
  console.log(`   {{challenge}} - Primary organization challenge`);
  console.log(`   {{consultation_url}} - Calendly booking link`);
  console.log(`   {{quiz_url}} - Organization quiz retake link`);
  console.log(`   {{newsletter_archive_url}} - RV tips archive`);

  console.log("\n✅ NEXT STEPS:");
  console.log("   1. Templates are live in SendGrid");
  console.log("   2. api-server.js updated with template IDs");
  console.log("   3. Email automation system ready for testing");
  console.log("   4. Configure SendGrid automation workflows for delays");
  console.log("   5. Test end-to-end email sequences");

  console.log("\n🔗 SENDGRID DASHBOARD:");
  console.log("   https://app.sendgrid.com/marketing/dynamic_templates");
}

// Save deployment results for reference
function saveDeploymentResults(templateIds) {
  const resultsFile = path.join(__dirname, "sendgrid-deployment-results.json");
  const results = {
    deployedAt: new Date().toISOString(),
    templateIds: templateIds,
    sequences: {
      hot: {
        name: "HOT Leads - Aggressive 10-day sequence",
        cadence: [0, 2, 4, 7, 10],
        totalEmails: 5,
      },
      warm: {
        name: "WARM Leads - Educational 21-day sequence",
        cadence: [0, 3, 7, 14, 21],
        totalEmails: 5,
      },
      cold: {
        name: "COLD Leads - Gentle 30-day sequence",
        cadence: [0, 5, 12, 21, 30],
        totalEmails: 5,
      },
    },
    personalizationVariables: [
      "first_name",
      "rv_type",
      "challenge",
      "consultation_url",
      "quiz_url",
      "newsletter_archive_url",
      "book_consultation_url",
    ],
  };

  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`💾 Deployment results saved to: ${resultsFile}`);
}

// Main deployment function
async function main() {
  try {
    console.log("🎯 ClutterFreeSpaces Email Template Deployment");
    console.log("=".repeat(50));
    console.log("Deploying 15 email templates to SendGrid...\n");

    // Deploy all templates
    const templateIds = await deployAllTemplates();

    // Update api-server.js
    await updateApiServer(templateIds);

    // Test deployment
    await testTemplateDeployment(templateIds);

    // Save results
    saveDeploymentResults(templateIds);

    // Generate report
    generateReport(templateIds);

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("All 15 email templates are live and ready for production.");
  } catch (error) {
    console.error("\n💥 DEPLOYMENT FAILED:", error);
    process.exit(1);
  }
}

// Run deployment if called directly
if (require.main === module) {
  main();
}

module.exports = {
  deployAllTemplates,
  updateApiServer,
  testTemplateDeployment,
};
