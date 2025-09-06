require("dotenv").config({ path: "../../.env" });
const { google } = require("googleapis");
const fs = require("fs").promises;
const path = require("path");

class GoogleOAuthService {
  constructor() {
    this.scopes = [
      "https://www.googleapis.com/auth/business.manage",
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/analytics.edit",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
    ];

    this.credentialsPath = path.join(__dirname, "..", "oauth-credentials.json");
    this.tokenPath = path.join(__dirname, "..", "oauth-token.json");
    this.oAuth2Client = null;
  }

  async initialize() {
    try {
      // Load client credentials
      const credentials = await this.loadCredentials();
      if (!credentials) {
        throw new Error("OAuth credentials not found. Please run setup.");
      }

      const { client_secret, client_id, redirect_uris } =
        credentials.web || credentials.installed;
      this.oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0],
      );

      // Try to load existing token
      const token = await this.loadToken();
      if (token) {
        this.oAuth2Client.setCredentials(token);

        // Check if token is expired and refresh if needed
        if (this.isTokenExpired(token)) {
          await this.refreshToken();
        }
      }

      return this.oAuth2Client;
    } catch (error) {
      console.error("Error initializing OAuth:", error.message);
      throw error;
    }
  }

  async loadCredentials() {
    try {
      const content = await fs.readFile(this.credentialsPath);
      return JSON.parse(content);
    } catch (error) {
      console.log("OAuth credentials file not found:", this.credentialsPath);
      return null;
    }
  }

  async loadToken() {
    try {
      const token = await fs.readFile(this.tokenPath);
      return JSON.parse(token);
    } catch (error) {
      return null;
    }
  }

  async saveToken(token) {
    try {
      await fs.writeFile(this.tokenPath, JSON.stringify(token, null, 2));
      console.log("✅ OAuth token saved");
    } catch (error) {
      console.error("Error saving token:", error);
    }
  }

  isTokenExpired(token) {
    if (!token.expiry_date) return false;
    return Date.now() >= token.expiry_date;
  }

  async refreshToken() {
    try {
      const { credentials } = await this.oAuth2Client.refreshAccessToken();
      this.oAuth2Client.setCredentials(credentials);
      await this.saveToken(credentials);
      console.log("✅ OAuth token refreshed");
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }

  async getAuthUrl() {
    if (!this.oAuth2Client) {
      await this.initialize();
    }

    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: this.scopes,
      prompt: "consent", // Force consent screen to get refresh token
    });

    return authUrl;
  }

  async getAccessToken(code) {
    try {
      const { tokens } = await this.oAuth2Client.getToken(code);
      this.oAuth2Client.setCredentials(tokens);
      await this.saveToken(tokens);
      return tokens;
    } catch (error) {
      console.error("Error getting access token:", error);
      throw error;
    }
  }

  async createAuthenticatedRequest(service, version = "v1") {
    try {
      const auth = await this.initialize();
      return google[service]({
        version,
        auth,
      });
    } catch (error) {
      console.error(`Error creating authenticated ${service} request:`, error);
      throw error;
    }
  }

  isAuthenticated() {
    return (
      this.oAuth2Client &&
      this.oAuth2Client.credentials &&
      this.oAuth2Client.credentials.access_token
    );
  }
}

module.exports = new GoogleOAuthService();
