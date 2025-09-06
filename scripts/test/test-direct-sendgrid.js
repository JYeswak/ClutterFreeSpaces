#!/usr/bin/env node

const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SendGrid_API_Key);

async function sendTestEmail() {
  const msg = {
    to: "willywamdad@gmail.com",
    from: "contact@clutter-free-spaces.com",
    subject: "Direct SendGrid Test - ClutterFreeSpaces",
    text: "This is a direct test email from SendGrid to verify email delivery is working.",
    html: "<p>This is a <strong>direct test email</strong> from SendGrid to verify email delivery is working.</p>",
  };

  try {
    console.log("🚀 Sending direct test email...");
    const response = await sgMail.send(msg);
    console.log("✅ Direct test email sent successfully");
    console.log("Response:", response[0].statusCode);
  } catch (error) {
    console.error(
      "❌ Error sending test email:",
      error.response?.body || error.message,
    );
  }
}

sendTestEmail();
