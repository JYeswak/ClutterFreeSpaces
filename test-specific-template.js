#!/usr/bin/env node

const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SendGrid_API_Key);

async function testWarmTemplate() {
  const msg = {
    to: "willywamdad@gmail.com",
    from: {
      email: "contact@clutter-free-spaces.com",
      name: "Chanel - Montana RV Organization",
    },
    templateId: "d-ecfda28c118b48918adae29481dabcce", // WARM Email 1 template
    dynamicTemplateData: {
      first_name: "Test",
      rv_type: "Class A Motorhome",
      challenge: "Kitchen Organization",
      consultation_url: "https://calendly.com/chanelnbasolo/30min",
      quiz_url: "https://clutterfreespaces-production.up.railway.app/quiz",
      newsletter_archive_url:
        "https://clutterfreespaces-production.up.railway.app/archive",
      book_consultation_url: "https://calendly.com/chanelnbasolo/30min",
    },
  };

  try {
    console.log("🚀 Testing WARM Email 1 template directly...");
    console.log("Template ID:", msg.templateId);
    console.log("Data:", msg.dynamicTemplateData);

    const response = await sgMail.send(msg);
    console.log("✅ Template test sent successfully");
    console.log("Status:", response[0].statusCode);
  } catch (error) {
    console.error("❌ Template error:", error.response?.body || error.message);
    if (error.response?.body?.errors) {
      console.error("Detailed errors:", error.response.body.errors);
    }
  }
}

testWarmTemplate();
