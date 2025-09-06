const authService = require("./auth-oauth");
const { google } = require("googleapis");

class GoogleCloudIntegrations {
  constructor() {
    this.projectId = process.env.GCP_PROJECT_ID || "automation-471304";
  }

  /**
   * Google Search Console Integration
   * Track organic search performance and GMB visibility
   */
  async getSearchConsoleData() {
    try {
      const auth = await authService.initialize();
      const searchconsole = google.searchconsole({ version: "v1", auth });

      const site = "https://www.clutterfreespaces.com";
      const endDate = new Date();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

      // Get search analytics data
      const response = await searchconsole.searchanalytics.query({
        siteUrl: site,
        requestBody: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          dimensions: ["query", "page"],
          rowLimit: 25,
          dataState: "final",
        },
      });

      return {
        success: true,
        data: {
          queries: response.data.rows || [],
          summary: {
            totalClicks:
              response.data.rows?.reduce((sum, row) => sum + row.clicks, 0) ||
              0,
            totalImpressions:
              response.data.rows?.reduce(
                (sum, row) => sum + row.impressions,
                0,
              ) || 0,
            avgCTR:
              response.data.rows?.reduce((sum, row) => sum + row.ctr, 0) /
                (response.data.rows?.length || 1) || 0,
          },
        },
      };
    } catch (error) {
      console.error("Search Console API error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Google Drive Integration for Client Documents
   */
  async setupClientFolder(clientName, clientEmail) {
    try {
      const auth = await authService.initialize();
      const drive = google.drive({ version: "v3", auth });

      // Create client folder
      const folderName = `${clientName.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;

      const folderMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [process.env.CLIENT_DOCS_FOLDER_ID || "root"],
      };

      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: "id,webViewLink",
      });

      // Create subfolders
      const subfolders = [
        "Before Photos",
        "After Photos",
        "Contracts & Agreements",
        "Project Notes",
        "Invoice & Payment",
      ];

      for (const subfolder of subfolders) {
        await drive.files.create({
          resource: {
            name: subfolder,
            mimeType: "application/vnd.google-apps.folder",
            parents: [folder.data.id],
          },
        });
      }

      return {
        success: true,
        folderId: folder.data.id,
        folderLink: folder.data.webViewLink,
        folderName: folderName,
      };
    } catch (error) {
      console.error("Drive folder creation error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Google Sheets Integration for Project Tracking
   */
  async createProjectTracker(clientData) {
    try {
      const auth = await authService.initialize();
      const sheets = google.sheets({ version: "v4", auth });

      // Create new spreadsheet
      const resource = {
        properties: {
          title: `ClutterFree Project - ${clientData.name}`,
        },
        sheets: [
          {
            properties: { title: "Project Overview" },
          },
          {
            properties: { title: "Room Checklist" },
          },
          {
            properties: { title: "Timeline" },
          },
          {
            properties: { title: "Budget & Expenses" },
          },
        ],
      };

      const spreadsheet = await sheets.spreadsheets.create({ resource });

      // Add project data to Overview sheet
      const overviewData = [
        ["ClutterFree Spaces Project Tracker", "", "", ""],
        ["", "", "", ""],
        ["Client Information", "", "", ""],
        ["Name:", clientData.name, "", ""],
        ["Email:", clientData.email, "", ""],
        ["Phone:", clientData.phone || "", "", ""],
        ["Address:", clientData.address || "", "", ""],
        ["", "", "", ""],
        ["Project Details", "", "", ""],
        ["Service Type:", clientData.serviceType, "", ""],
        ["Start Date:", clientData.startDate, "", ""],
        ["Estimated Completion:", clientData.estimatedCompletion, "", ""],
        ["Project Value:", clientData.projectValue, "", ""],
        ["Lead Score:", clientData.leadScore, "", ""],
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheet.data.spreadsheetId,
        range: "Project Overview!A1",
        valueInputOption: "RAW",
        resource: { values: overviewData },
      });

      return {
        success: true,
        spreadsheetId: spreadsheet.data.spreadsheetId,
        spreadsheetUrl: spreadsheet.data.spreadsheetUrl,
      };
    } catch (error) {
      console.error("Sheets creation error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gmail Integration for Client Communication
   */
  async sendProjectUpdateEmail(clientData, updateType) {
    try {
      const auth = await authService.initialize();
      const gmail = google.gmail({ version: "v1", auth });

      const emailTemplates = {
        welcome: {
          subject: "Welcome to ClutterFree Spaces! Your Project is Starting",
          body: `Dear ${clientData.name},

We're excited to begin your ${clientData.serviceType} project! Here's what to expect:

📋 Project Details:
• Service: ${clientData.serviceType}
• Start Date: ${clientData.startDate}
• Estimated Duration: ${clientData.duration}

📁 Your Project Folder:
We've created a dedicated Google Drive folder for your project: ${clientData.folderLink}

📊 Project Tracker:
Track progress with your custom spreadsheet: ${clientData.trackerUrl}

💡 Before We Start:
• Clear pathways to work areas
• Secure valuable items
• Have any special instructions ready

Questions? Reply to this email or call us at (406) 551-3364.

Best regards,
Chanel & The ClutterFree Spaces Team

---
ClutterFree Spaces
Making Montana Homes More Organized, One Space at a Time
www.clutterfreespaces.com`,
        },

        progress: {
          subject: `Project Update: ${clientData.serviceType} Progress`,
          body: `Hi ${clientData.name},

Great progress on your ${clientData.serviceType} project today!

✅ Completed Today:
${clientData.completedTasks?.map((task) => `• ${task}`).join("\n") || "• Work in progress"}

🔄 Next Steps:
${clientData.nextSteps?.map((step) => `• ${step}`).join("\n") || "• Continuing organization work"}

📸 Progress Photos:
Check your project folder for before/after photos: ${clientData.folderLink}

📊 Updated Timeline:
Current completion: ${clientData.percentComplete || 0}%
Next session: ${clientData.nextSession}

Thanks for being such a great client to work with!

Best,
ClutterFree Spaces Team`,
        },

        completion: {
          subject: "🎉 Your ClutterFree Project is Complete!",
          body: `Congratulations ${clientData.name}!

Your ${clientData.serviceType} transformation is complete! 🌟

📁 Final Photos & Documents:
All before/after photos and project documentation are in your Drive folder: ${clientData.folderLink}

💡 Maintenance Tips:
• Spend 10 minutes daily maintaining systems
• Do a weekly "reset" of organized areas  
• Schedule seasonal reviews (we can help!)
• Use the organizing products as designed

⭐ Love Your New Space?
We'd be grateful for a Google review: ${clientData.reviewLink}

🔄 Ongoing Support:
• 30-day maintenance check-in (we'll call you!)
• Seasonal organization services available
• Additional room organization discounts

Thank you for trusting ClutterFree Spaces with your home!

Best,
Chanel & The ClutterFree Spaces Team

P.S. Don't forget to share your success with friends who need organization help! 😊`,
        },
      };

      const template = emailTemplates[updateType];
      if (!template) {
        throw new Error(`Unknown email template: ${updateType}`);
      }

      const message = [
        `To: ${clientData.email}`,
        `Subject: ${template.subject}`,
        "",
        template.body,
      ].join("\n");

      const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      await gmail.users.messages.send({
        userId: "me",
        resource: { raw: encodedMessage },
      });

      return { success: true, messageType: updateType };
    } catch (error) {
      console.error("Gmail send error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Google Calendar Integration for Scheduling
   */
  async scheduleFollowUp(clientData, followUpType) {
    try {
      const auth = await authService.initialize();
      const calendar = google.calendar({ version: "v3", auth });

      const followUpSchedule = {
        "24hr_review": {
          days: 1,
          title: "24hr Review Request - {clientName}",
          description:
            "Send review request email and check project satisfaction",
        },
        "30day_checkin": {
          days: 30,
          title: "30-Day Check-in - {clientName}",
          description:
            "Call client to ensure organization systems are working well",
        },
        seasonal_reminder: {
          days: 90,
          title: "Seasonal Organization - {clientName}",
          description: "Reach out about seasonal organization services",
        },
      };

      const schedule = followUpSchedule[followUpType];
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + schedule.days);

      const event = {
        summary: schedule.title.replace("{clientName}", clientData.name),
        description: `${schedule.description}\n\nClient: ${clientData.name}\nEmail: ${clientData.email}\nPhone: ${clientData.phone}\nProject: ${clientData.serviceType}`,
        start: {
          dateTime: followUpDate.toISOString(),
          timeZone: "America/Denver",
        },
        end: {
          dateTime: new Date(
            followUpDate.getTime() + 30 * 60 * 1000,
          ).toISOString(), // 30 min
          timeZone: "America/Denver",
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 }, // 1 day before
            { method: "popup", minutes: 60 }, // 1 hour before
          ],
        },
      };

      const calendarEvent = await calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });

      return {
        success: true,
        eventId: calendarEvent.data.id,
        eventLink: calendarEvent.data.htmlLink,
        followUpDate: followUpDate.toISOString(),
      };
    } catch (error) {
      console.error("Calendar scheduling error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Automated Workflow: Complete Project Setup
   */
  async setupCompleteProject(clientData) {
    try {
      const results = {
        client: clientData.name,
        services: {},
      };

      // 1. Create Drive folder
      const driveResult = await this.setupClientFolder(
        clientData.name,
        clientData.email,
      );
      results.services.drive = driveResult;

      // 2. Create project tracker spreadsheet
      if (driveResult.success) {
        clientData.folderLink = driveResult.folderLink;
      }

      const sheetsResult = await this.createProjectTracker(clientData);
      results.services.sheets = sheetsResult;

      // 3. Send welcome email
      if (sheetsResult.success) {
        clientData.trackerUrl = sheetsResult.spreadsheetUrl;
      }

      const emailResult = await this.sendProjectUpdateEmail(
        clientData,
        "welcome",
      );
      results.services.email = emailResult;

      // 4. Schedule follow-ups
      const followUps = ["24hr_review", "30day_checkin", "seasonal_reminder"];
      results.services.calendar = {};

      for (const followUp of followUps) {
        const calendarResult = await this.scheduleFollowUp(
          clientData,
          followUp,
        );
        results.services.calendar[followUp] = calendarResult;
      }

      return {
        success: true,
        message: "Complete project setup finished",
        results: results,
      };
    } catch (error) {
      console.error("Complete project setup error:", error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new GoogleCloudIntegrations();
