#!/usr/bin/env node

/**
 * Create a simple test template to verify delivery
 */

const axios = require("axios");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SendGrid_API_Key;

const simpleTemplate = {
  name: "Simple Test Template",
  generation: "dynamic",
  subject: "Test Email - {{name}}",
  html_content: `
    <h1>Test Email</h1>
    <p>Hi {{name}},</p>
    <p>This is a simple test email to verify delivery.</p>
    <p>Timestamp: {{timestamp}}</p>
  `,
  plain_content: `
    Hi {{name}},
    
    This is a simple test email to verify delivery.
    
    Timestamp: {{timestamp}}
  `,
};

async function createSimpleTemplate() {
  try {
    const response = await axios.post(
      "https://api.sendgrid.com/v3/templates",
      simpleTemplate,
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Simple test template created!");
    console.log("Template ID:", response.data.id);
    return response.data.id;
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

createSimpleTemplate();
