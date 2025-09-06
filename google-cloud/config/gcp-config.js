require("dotenv").config({ path: "../../.env" });

const GCP_CONFIG = {
  // Project Configuration
  PROJECT_ID: process.env.GCP_PROJECT_ID || "automation",
  REGION: process.env.GCP_REGION || "us-central1",

  // Authentication
  API_KEY: process.env.GOOGLECLOUD_API_KEY,
  SERVICE_ACCOUNT_KEY:
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    "./config/service-account.json",

  // API Scopes
  SCOPES: [
    "https://www.googleapis.com/auth/business.manage",
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/analytics.edit",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly",
  ],

  // Function URLs (will be populated after deployment)
  FUNCTION_URLS: {
    REVIEW_AUTOMATION: process.env.REVIEW_FUNCTION_URL,
    LEAD_SCORING: process.env.LEAD_SCORING_URL,
    GA4_TRACKING: process.env.GA4_TRACKING_URL,
  },

  // External API Keys (from existing .env)
  EXTERNAL_APIS: {
    SENDGRID_API_KEY: process.env.SendGrid_API_Key,
    CALENDLY_API_KEY: process.env.Calendy_API_Key,
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    TWILIO_SID: process.env.TWILIO_SID,
    TWILIO_SECRET: process.env.TWILIO_SECRET,
  },

  // Business Configuration
  BUSINESS: {
    NAME: "ClutterFreeSpaces",
    LOCATION: "Missoula, Montana",
    PHONE: "(406) 285-1525",
    EMAIL: "chanel@clutter-free-spaces.com",
    WEBSITE: "https://www.clutter-free-spaces.com",
    GMB_LOCATION_ID: process.env.GMB_LOCATION_ID,
    GA4_MEASUREMENT_ID: process.env.GA4_MEASUREMENT_ID || "G-XXXXXXXXXX",
  },
};

module.exports = GCP_CONFIG;
