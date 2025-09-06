require("dotenv").config({ path: "../../.env" });
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

class GoogleAuthService {
  constructor() {
    this.scopes = [
      "https://www.googleapis.com/auth/business.manage",
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/analytics.edit",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
    ];

    // Initialize auth based on available credentials
    if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
      this.auth = new GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
        scopes: this.scopes,
      });
    } else {
      // Fallback to API key for read-only operations
      this.apiKey = process.env.GOOGLECLOUD_API_KEY;
    }
  }

  async getAuthClient() {
    try {
      if (this.auth) {
        return await this.auth.getClient();
      }
      return null;
    } catch (error) {
      console.error("Error getting auth client:", error);
      throw error;
    }
  }

  async getProjectId() {
    try {
      if (this.auth) {
        return await this.auth.getProjectId();
      }
      return process.env.GCP_PROJECT_ID || "automation";
    } catch (error) {
      console.error("Error getting project ID:", error);
      return "automation";
    }
  }

  getAPIKey() {
    return this.apiKey;
  }

  async createAuthenticatedRequest(service, version = "v1") {
    try {
      const authClient = await this.getAuthClient();
      if (authClient) {
        return google[service]({
          version,
          auth: authClient,
        });
      } else if (this.apiKey) {
        return google[service]({
          version,
          auth: this.apiKey,
        });
      } else {
        throw new Error("No authentication method available");
      }
    } catch (error) {
      console.error(`Error creating authenticated ${service} request:`, error);
      throw error;
    }
  }
}

module.exports = new GoogleAuthService();
