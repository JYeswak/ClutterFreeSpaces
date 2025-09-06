#!/usr/bin/env node

/**
 * Deploy Newsletter Email Templates to SendGrid
 * Creates dynamic templates for the generic newsletter sequence
 *
 * Run: node deploy-newsletter-templates.js
 */

const sgMail = require("@sendgrid/mail");
const emailSequences = require("./newsletter-email-sequences.js");

// SendGrid configuration
require("dotenv").config();
const SENDGRID_API_KEY = process.env.SendGrid_API_Key;

if (!SENDGRID_API_KEY) {
  console.error("❌ SendGrid API key not found in environment variables");
  process.exit(1);
}

sgMail.setApiKey(SENDGRID_API_KEY);

// Newsletter sequence emails
const newsletterEmails = emailSequences.newsletter.emails;

/**
 * Create a dynamic template in SendGrid
 */
async function createTemplate(templateName, subject, preheader, htmlContent) {
  try {
    const response = await sgMail.client.request({
      method: "POST",
      url: "/v3/templates",
      body: {
        name: templateName,
        generation: "dynamic",
      },
    });

    const templateId = response[1].id;
    console.log(`✅ Created template: ${templateName} (${templateId})`);

    // Add version to template
    const versionResponse = await sgMail.client.request({
      method: "POST",
      url: `/v3/templates/${templateId}/versions`,
      body: {
        template_id: templateId,
        active: 1,
        name: `${templateName} v1`,
        subject: subject,
        html_content: htmlContent,
        plain_content: convertHtmlToPlainText(htmlContent),
        generate_plain_content: true,
      },
    });

    console.log(`✅ Added version to template: ${templateName}`);
    return templateId;
  } catch (error) {
    console.error(
      `❌ Failed to create template ${templateName}:`,
      error.response?.body || error,
    );
    throw error;
  }
}

/**
 * Simple HTML to plain text conversion
 */
function convertHtmlToPlainText(html) {
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Deploy all newsletter templates
 */
async function deployNewsletterTemplates() {
  console.log("🚀 Deploying Newsletter Email Templates to SendGrid...\n");

  const deployedTemplates = {
    newsletter: {},
  };

  try {
    // Deploy newsletter sequence templates
    for (let i = 0; i < newsletterEmails.length; i++) {
      const email = newsletterEmails[i];
      const templateName = `Newsletter ${i + 1} - ${email.subject.split(",")[1]?.trim() || "Welcome"}`;

      console.log(`📧 Deploying: ${templateName}`);

      const templateId = await createTemplate(
        templateName,
        email.subject,
        email.preheader,
        email.template.html,
      );

      deployedTemplates.newsletter[`email_${i + 1}`] = templateId;

      // Rate limiting - wait between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n🎉 All newsletter templates deployed successfully!");
    console.log("\n📋 Template IDs for email-automation-config.js:");
    console.log(JSON.stringify(deployedTemplates, null, 2));

    // Show the config to add
    console.log(
      "\n📝 Add this to SEQUENCE_TEMPLATES in email-automation-config.js:",
    );
    console.log(`"newsletter": {`);
    Object.entries(deployedTemplates.newsletter).forEach(([key, value]) => {
      console.log(`  ${key}: "${value}",`);
    });
    console.log(`},`);

    return deployedTemplates;
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployNewsletterTemplates();
}

module.exports = {
  deployNewsletterTemplates,
  createTemplate,
};
