#!/usr/bin/env node

/**
 * Final template fix to replace the remaining "Sarah Mitchell"
 */

const sgClient = require("@sendgrid/client");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;
sgClient.setApiKey(SENDGRID_API_KEY);

async function finalTemplateFix() {
  const templateId = "d-f1a6898e10e641e6b50c90c7e2f14a2f";

  try {
    // Get template
    const getRequest = {
      url: `/v3/templates/${templateId}`,
      method: "GET",
    };

    const [response] = await sgClient.request(getRequest);
    const template = response.body;
    const activeVersion = template.versions?.find((v) => v.active === 1);

    if (!activeVersion) {
      console.log("❌ No active version found");
      return;
    }

    console.log("🔧 Final Template Fix");
    console.log("Template:", template.name);
    console.log(
      "Current signature line:",
      activeVersion.html_content.includes("Sarah Mitchell")
        ? "Has Sarah Mitchell ❌"
        : "Looks good ✅",
    );

    // Fix the content
    let fixedHtml = activeVersion.html_content;
    fixedHtml = fixedHtml.replace(/Sarah Mitchell/g, "Chanel Basolo");
    fixedHtml = fixedHtml.replace(
      /Montana RV Organization Specialist/g,
      "Montana RV Organization Expert",
    );

    // Also fix plain text
    let fixedText = activeVersion.plain_content || "";
    fixedText = fixedText.replace(/Sarah Mitchell/g, "Chanel Basolo");
    fixedText = fixedText.replace(
      /Montana RV Organization Specialist/g,
      "Montana RV Organization Expert",
    );

    // Update template
    const updateData = {
      versions: [
        {
          subject: activeVersion.subject,
          html_content: fixedHtml,
          plain_content: fixedText,
          active: 1,
        },
      ],
    };

    const updateRequest = {
      url: `/v3/templates/${templateId}`,
      method: "PATCH",
      body: updateData,
    };

    console.log("🔄 Applying final fixes...");
    const [updateResponse] = await sgClient.request(updateRequest);
    console.log("✅ Template updated successfully!");

    // Verify the fix
    const [verifyResponse] = await sgClient.request(getRequest);
    const verifyTemplate = verifyResponse.body;
    const verifyVersion = verifyTemplate.versions?.find((v) => v.active === 1);

    console.log("\n✅ VERIFICATION:");
    console.log(
      "Sarah Mitchell found:",
      verifyVersion.html_content.includes("Sarah Mitchell")
        ? "❌ STILL THERE"
        : "✅ FIXED",
    );
    console.log(
      "Chanel Basolo found:",
      verifyVersion.html_content.includes("Chanel Basolo")
        ? "✅ PRESENT"
        : "❌ MISSING",
    );
  } catch (error) {
    console.error("❌ Error:", error.response?.body || error.message);
  }
}

finalTemplateFix().catch(console.error);
