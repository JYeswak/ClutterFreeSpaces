// Load environment variables
require("dotenv").config({ path: "../.env" });

// Debug environment variables on startup
console.log("🔍 Environment Debug:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("RAILWAY_URL:", process.env.RAILWAY_URL);
const express = require("express");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
const twilio = require("twilio");
const axios = require("axios");

// Import Google services
const gmbService = require("./google-services/gmb-service");
const ga4Service = require("./google-services/ga4-service");
const leadScoringService = require("./google-services/lead-scoring");
const gtmService = require("./google-services/gtm-service");
const gmbEnhancementService = require("./google-services/gmb-enhancement");
const cloudIntegrations = require("./google-services/cloud-integrations");
const reviewAutomation = require("./google-services/review-automation");
const seoService = require("./google-services/seo-service");

// Import OAuth service (fallback if not available)
let oauthService;
try {
  oauthService = require("./google-services/auth-oauth");
} catch (error) {
  console.log("OAuth service not available, using API key auth only");
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize external services
sgMail.setApiKey(process.env.SendGrid_API_Key);

// Airtable Configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

// SendGrid Contact Lists
const CONTACT_LISTS = {
  quiz_takers: "e4cf8d8d-b5bd-4c0a-a5c4-f1222e2a3462",
  cold_leads: "04a543ea-7191-458c-a2dc-460b2a729ebd",
  newsletter_subscribers: "e4cf8d8d-b5bd-4c0a-a5c4-f1222e2a3462", // Use quiz_takers for now
  hot_leads: "e4cf8d8d-b5bd-4c0a-a5c4-f1222e2a3462", // Use quiz_takers for now
  warm_leads: "04a543ea-7191-458c-a2dc-460b2a729ebd", // Use cold_leads for now
};

// Initialize Twilio with proper error handling
let twilioClient = null;
try {
  if (process.env.TWILIO_SID && process.env.TWILIO_SECRET) {
    // Check if it's an API Key (starts with SK) or Account SID (starts with AC)
    if (process.env.TWILIO_SID.startsWith("SK")) {
      // API Key requires account SID
      twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_SECRET, {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
      });
    } else {
      // Regular Account SID
      twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_SECRET);
    }
    console.log("✅ Twilio initialized successfully");
  } else {
    console.log("⚠️ Twilio credentials not found, SMS features disabled");
  }
} catch (error) {
  console.log(
    "⚠️ Twilio initialization failed, SMS features disabled:",
    error.message,
  );
}

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ClutterFreeSpaces API is running",
    services: ["Google Cloud", "SendGrid", "Airtable", "Calendly", "Twilio"],
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// OAUTH AUTHENTICATION ROUTES
// ============================================================================

// OAuth login endpoint
app.get("/auth/google", async (req, res) => {
  try {
    if (!oauthService) {
      return res.status(500).json({
        success: false,
        error: "OAuth not configured",
      });
    }

    const authUrl = await oauthService.getAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error("OAuth login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// OAuth callback endpoint
app.get("/auth/google/callback", async (req, res) => {
  try {
    if (!oauthService) {
      return res.status(500).json({
        success: false,
        error: "OAuth not configured",
      });
    }

    const { code, error } = req.query;

    if (error) {
      return res.status(400).json({
        success: false,
        error: `OAuth error: ${error}`,
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "No authorization code provided",
      });
    }

    const tokens = await oauthService.getAccessToken(code);

    res.json({
      success: true,
      message:
        "OAuth authentication successful! Google APIs are now available.",
      scopes: tokens.scope?.split(" ") || [],
      expiry: new Date(tokens.expiry_date).toISOString(),
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// OAuth status endpoint
app.get("/auth/status", async (req, res) => {
  try {
    if (!oauthService) {
      return res.json({
        authenticated: false,
        method: "API Key only",
        message: "OAuth not configured",
      });
    }

    const isAuthenticated = oauthService.isAuthenticated();
    res.json({
      authenticated: isAuthenticated,
      method: isAuthenticated ? "OAuth" : "API Key",
      message: isAuthenticated
        ? "Full Google API access available"
        : "Limited API access",
    });
  } catch (error) {
    console.error("OAuth status error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug endpoint to check environment variables
app.get("/auth/debug", (req, res) => {
  res.json({
    oauth_service_loaded: !!oauthService,
    environment_variables: {
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      RAILWAY_URL: process.env.RAILWAY_URL || "not set",
    },
    node_env: process.env.NODE_ENV,
  });
});

// ============================================================================
// GOOGLE CLOUD INTEGRATION ROUTES
// ============================================================================

// GMB Routes
app.get("/api/google/gmb/location", async (req, res) => {
  try {
    const locationInfo = await gmbService.getLocationInfo();
    res.json({ success: true, data: locationInfo });
  } catch (error) {
    console.error("GMB location error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/google/gmb/reviews", async (req, res) => {
  try {
    const reviews = await gmbService.getReviews(req.query.limit || 10);
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("GMB reviews error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/google/gmb/generate-review-qr", async (req, res) => {
  try {
    const { name, email, jobId, serviceType } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Name and email are required",
      });
    }

    const qrData = await gmbService.generateReviewQR({
      name,
      email,
      jobId,
      serviceType,
    });

    // Track the review request in GA4
    await ga4Service.trackReviewGenerated({
      client_id: req.body.client_id || ga4Service.generateClientId(),
      job_id: jobId,
      client_name: name,
      service_type: serviceType,
      email_sent: false,
    });

    res.json({ success: true, data: qrData });
  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/google/gmb/respond-to-review", async (req, res) => {
  try {
    const { reviewId, rating, reviewText, clientName } = req.body;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        error: "Review ID is required",
      });
    }

    const responseText = gmbService.generateResponseText(
      rating,
      reviewText,
      clientName,
    );
    const result = await gmbService.respondToReview(reviewId, responseText);

    res.json({ success: true, data: result, response: responseText });
  } catch (error) {
    console.error("Review response error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GA4 Tracking Routes
app.post("/api/google/analytics/track", async (req, res) => {
  try {
    const result = await ga4Service.trackEvent(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("GA4 tracking error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/google/analytics/track-lead", async (req, res) => {
  try {
    const result = await ga4Service.trackLeadGeneration(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("GA4 lead tracking error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/google/analytics/track-booking", async (req, res) => {
  try {
    const result = await ga4Service.trackBookingConversion(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("GA4 booking tracking error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/google/analytics/report", async (req, res) => {
  try {
    const dateRange = req.query.dateRange
      ? JSON.parse(req.query.dateRange)
      : undefined;
    const report = await ga4Service.getAnalyticsData(dateRange);
    res.json({ success: true, data: report });
  } catch (error) {
    console.error("GA4 report error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GOOGLE TAG MANAGER ROUTES
// ============================================================================

// Get GTM container snippets for Squarespace
app.get("/api/google/gtm/snippets", (req, res) => {
  try {
    const snippets = gtmService.getContainerSnippets();
    res.json({ success: true, data: snippets });
  } catch (error) {
    console.error("GTM snippets error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dataLayer event templates
app.get("/api/google/gtm/datalayer", (req, res) => {
  try {
    const events = gtmService.generateDataLayerEvents();
    res.json({ success: true, data: events });
  } catch (error) {
    console.error("GTM dataLayer error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get GTM tag configurations
app.get("/api/google/gtm/tags", (req, res) => {
  try {
    const tags = gtmService.getTagConfigurations();
    res.json({ success: true, data: tags });
  } catch (error) {
    console.error("GTM tags error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get GTM trigger configurations
app.get("/api/google/gtm/triggers", (req, res) => {
  try {
    const triggers = gtmService.getTriggerConfigurations();
    res.json({ success: true, data: triggers });
  } catch (error) {
    console.error("GTM triggers error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/google/gtm/variables", (req, res) => {
  try {
    const variables = gtmService.getVariableConfigurations();
    res.json({ success: true, data: variables });
  } catch (error) {
    console.error("GTM variables error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Complete GTM setup configuration
app.get("/api/google/gtm/setup", (req, res) => {
  try {
    const setup = {
      containerId: "GTM-WKXSWZH7",
      steps: {
        1: "Install container snippets on Squarespace",
        2: "Create variables in GTM interface",
        3: "Create triggers in GTM interface",
        4: "Create tags in GTM interface",
        5: "Test and publish container",
      },
      snippets: gtmService.getContainerSnippets(),
      variables: gtmService.getVariableConfigurations(),
      triggers: gtmService.getTriggerConfigurations(),
      tags: gtmService.getTagConfigurations(),
      dataLayerEvents: gtmService.generateDataLayerEvents(),
      instructions: {
        squarespace:
          "Add head snippet to Settings > Advanced > Code Injection > Header, body snippet to Footer",
        testing: "Use GTM Preview mode to test events before publishing",
      },
    };
    res.json({ success: true, data: setup });
  } catch (error) {
    console.error("GTM setup error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GMB ENHANCEMENT ROUTES
// ============================================================================

// Generate seasonal GMB post content
app.get("/api/google/gmb/content/seasonal", async (req, res) => {
  try {
    const post = await gmbEnhancementService.generateSeasonalPost();
    res.json({ success: true, data: post });
  } catch (error) {
    console.error("GMB seasonal content error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate service-focused post content
app.post("/api/google/gmb/content/service", async (req, res) => {
  try {
    const { serviceType } = req.body;
    const post = await gmbEnhancementService.generateServicePost(serviceType);
    res.json({ success: true, data: post });
  } catch (error) {
    console.error("GMB service content error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Q&A content for GMB
app.get("/api/google/gmb/content/qas", (req, res) => {
  try {
    const qas = gmbEnhancementService.getCommonQAs();
    res.json({ success: true, data: qas });
  } catch (error) {
    console.error("GMB Q&A error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get review response templates
app.get("/api/google/gmb/content/review-templates", (req, res) => {
  try {
    const templates = gmbEnhancementService.getReviewResponseTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error("GMB review templates error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get photo upload strategies
app.get("/api/google/gmb/content/photo-strategies", (req, res) => {
  try {
    const strategies = gmbEnhancementService.getPhotoStrategies();
    res.json({ success: true, data: strategies });
  } catch (error) {
    console.error("GMB photo strategies error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get success stories for content
app.get("/api/google/gmb/content/success-stories", (req, res) => {
  try {
    const stories = gmbEnhancementService.generateSuccessStories();
    res.json({ success: true, data: stories });
  } catch (error) {
    console.error("GMB success stories error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate testimonial post
app.get("/api/google/gmb/content/testimonial", async (req, res) => {
  try {
    const result = await gmbEnhancementService.generateTestimonialPost();
    res.json(result);
  } catch (error) {
    console.error("GMB testimonial post error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate problem-solution post
app.get("/api/google/gmb/content/problem-solution", async (req, res) => {
  try {
    const result = await gmbEnhancementService.generateProblemSolutionPost();
    res.json(result);
  } catch (error) {
    console.error("GMB problem-solution post error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate FAQ educational post
app.get("/api/google/gmb/content/faq", async (req, res) => {
  try {
    const result = await gmbEnhancementService.generateFAQPost();
    res.json(result);
  } catch (error) {
    console.error("GMB FAQ post error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate transformation post
app.get("/api/google/gmb/content/transformation", async (req, res) => {
  try {
    const result = await gmbEnhancementService.generateTransformationPost();
    res.json(result);
  } catch (error) {
    console.error("GMB transformation post error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate daily themed post
app.get("/api/google/gmb/content/daily", async (req, res) => {
  try {
    const dayOfWeek = req.query.day ? parseInt(req.query.day) : null;
    const result = await gmbEnhancementService.generateDailyPost(dayOfWeek);
    res.json(result);
  } catch (error) {
    console.error("GMB daily post error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get weekly posting schedule
app.get("/api/google/gmb/schedule/weekly", (req, res) => {
  try {
    const schedule = gmbEnhancementService.weeklySchedule;
    res.json({ success: true, data: { schedule } });
  } catch (error) {
    console.error("GMB schedule error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate week's worth of posts
app.get("/api/google/gmb/content/weekly", async (req, res) => {
  try {
    const weeklyPosts = {};
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (let day = 0; day < 7; day++) {
      const result = await gmbEnhancementService.generateDailyPost(day);
      if (result.success) {
        weeklyPosts[dayNames[day]] = {
          dayOfWeek: day,
          theme: result.post.scheduledTheme,
          focus: result.post.themeFocus,
          post: result.post,
        };
      }
    }

    res.json({ success: true, data: { weeklyPosts } });
  } catch (error) {
    console.error("GMB weekly posts error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Post to GMB (create actual post)
app.post("/api/google/gmb/post", async (req, res) => {
  try {
    const { content, autoGenerate } = req.body;

    let postData;
    if (autoGenerate) {
      // Generate today's content automatically
      const todayPost = await gmbEnhancementService.generateDailyPost();
      postData = todayPost.post || todayPost;
    } else {
      postData = content;
    }

    // Try to create the actual GMB post
    const result = await gmbService.createPost(postData);

    // If API not available, simulate the post
    if (!result.success && result.needsApproval) {
      const simulation = await gmbService.simulatePost(postData);
      res.json(simulation);
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error("GMB post creation error:", error);

    // Fallback to simulation
    const postData =
      req.body.content || (await gmbEnhancementService.generateDailyPost());
    const simulation = await gmbService.simulatePost(postData.post || postData);
    res.json(simulation);
  }
});

// ============================================================================
// GOOGLE CLOUD INTEGRATIONS ROUTES
// ============================================================================

// Get Search Console data
app.get("/api/google/cloud/search-console", async (req, res) => {
  try {
    const data = await cloudIntegrations.getSearchConsoleData();
    res.json(data);
  } catch (error) {
    console.error("Search Console error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Setup complete project (Drive + Sheets + Email + Calendar)
app.post("/api/google/cloud/setup-project", async (req, res) => {
  try {
    const result = await cloudIntegrations.setupCompleteProject(req.body);

    // Track project setup in GA4
    await ga4Service.trackEvent({
      event_name: "project_setup",
      client_id: ga4Service.generateClientId(),
      parameters: {
        client_name: req.body.name,
        service_type: req.body.serviceType,
        project_value: req.body.projectValue || 0,
        setup_success: result.success,
      },
    });

    res.json(result);
  } catch (error) {
    console.error("Project setup error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send project update emails
app.post("/api/google/cloud/send-update", async (req, res) => {
  try {
    const { clientData, updateType } = req.body;
    const result = await cloudIntegrations.sendProjectUpdateEmail(
      clientData,
      updateType,
    );

    // Track email sent in GA4
    await ga4Service.trackEvent({
      event_name: "email_sent",
      client_id: ga4Service.generateClientId(),
      parameters: {
        email_type: updateType,
        client_name: clientData.name,
        success: result.success,
      },
    });

    res.json(result);
  } catch (error) {
    console.error("Email update error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create client folder in Drive
app.post("/api/google/cloud/create-folder", async (req, res) => {
  try {
    const { clientName, clientEmail } = req.body;
    const result = await cloudIntegrations.setupClientFolder(
      clientName,
      clientEmail,
    );
    res.json(result);
  } catch (error) {
    console.error("Drive folder error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedule follow-up reminders
app.post("/api/google/cloud/schedule-followup", async (req, res) => {
  try {
    const { clientData, followUpType } = req.body;
    const result = await cloudIntegrations.scheduleFollowUp(
      clientData,
      followUpType,
    );
    res.json(result);
  } catch (error) {
    console.error("Calendar scheduling error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// REVIEW AUTOMATION ROUTES
// ============================================================================

// Send review request email
app.post("/api/reviews/send-request", async (req, res) => {
  try {
    const result = await reviewAutomation.sendReviewRequest(req.body);
    res.json(result);
  } catch (error) {
    console.error("Review request error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send follow-up review request
app.post("/api/reviews/send-followup", async (req, res) => {
  try {
    const result = await reviewAutomation.sendFollowUpReviewRequest(req.body);
    res.json(result);
  } catch (error) {
    console.error("Review follow-up error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate review QR code
app.post("/api/reviews/generate-qr", async (req, res) => {
  try {
    const result = await reviewAutomation.generateReviewQR(req.body);
    res.json(result);
  } catch (error) {
    console.error("Review QR generation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Complete review workflow (email + QR + schedule follow-up)
app.post("/api/reviews/initiate-workflow", async (req, res) => {
  try {
    const result = await reviewAutomation.initiateReviewWorkflow(req.body);
    res.json(result);
  } catch (error) {
    console.error("Review workflow error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lead Scoring Routes
app.post("/api/google/lead-score", async (req, res) => {
  try {
    const scoreResult = await leadScoringService.calculateScore(req.body);

    // Track the lead scoring in GA4
    await ga4Service.trackLeadGeneration({
      ...req.body,
      lead_score: scoreResult.totalScore,
    });

    res.json({ success: true, data: scoreResult });
  } catch (error) {
    console.error("Lead scoring error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// WORKFLOW AUTOMATION ROUTES
// ============================================================================

// Review Request Workflow (triggered by Airtable webhook)
app.post("/api/workflow/review-request", async (req, res) => {
  try {
    const { clientName, clientEmail, jobId, serviceType, clientPhone } =
      req.body;

    // 1. Generate QR code
    const qrData = await gmbService.generateReviewQR({
      name: clientName,
      email: clientEmail,
      jobId: jobId,
      serviceType: serviceType,
    });

    // 2. Send email via SendGrid
    const emailData = {
      to: clientEmail,
      from: "chanel@clutter-free-spaces.com",
      subject: `Thank you ${clientName}! Please share your ClutterFreeSpaces experience`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2D5A87;">Thank You ${clientName}! 🌟</h2>
          <p>I hope you're loving your newly organized space! Your satisfaction means the world to me.</p>
          
          <p>Would you mind taking a moment to share your experience? Your review helps other families discover how organization can transform their lives.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="cid:reviewQR" alt="Review QR Code" style="max-width: 200px;"/>
            <p><strong>Simply scan this QR code with your phone to leave a review!</strong></p>
          </div>
          
          <p>Or click here: <a href="${qrData.reviewUrl}" style="color: #2D5A87;">Leave a Review</a></p>
          
          <p>Thank you for trusting ClutterFreeSpaces with your home organization needs!</p>
          
          <p>Best regards,<br>
          Chanel<br>
          ClutterFreeSpaces<br>
          (406) 285-1525</p>
        </div>
      `,
      attachments: [
        {
          content: qrData.qrCode.split(",")[1], // Remove data:image/png;base64, prefix
          filename: "review-qr.png",
          type: "image/png",
          disposition: "inline",
          content_id: "reviewQR",
        },
      ],
    };

    await sgMail.send(emailData);

    // 3. Track in GA4
    await ga4Service.trackReviewGenerated({
      client_id: ga4Service.generateClientId(),
      job_id: jobId,
      client_name: clientName,
      service_type: serviceType,
      email_sent: true,
    });

    // 4. Optional: Send SMS notification
    if (clientPhone) {
      await twilioClient.messages.create({
        body: `Hi ${clientName}! Your organized space looks amazing! 🏠✨ Please check your email for a quick way to share your experience. Thank you! - Chanel`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: clientPhone,
      });
    }

    res.json({
      success: true,
      message: "Review request workflow completed",
      qrCode: qrData.qrCode,
      reviewUrl: qrData.reviewUrl,
    });
  } catch (error) {
    console.error("Review workflow error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lead Qualification Workflow
app.post("/api/workflow/qualify-lead", async (req, res) => {
  try {
    const leadData = req.body;

    // 1. Calculate lead score
    const scoreResult = await leadScoringService.calculateScore(leadData);

    // 2. Route based on score
    if (scoreResult.routing === "hot") {
      // High priority - immediate SMS and call scheduling
      if (leadData.phone) {
        await twilioClient.messages.create({
          body: `Thank you for your interest in ClutterFreeSpaces! 🏠 This is Chanel - I'll be calling you within 2 hours to discuss your organizing needs. Looking forward to helping you create your dream space!`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: leadData.phone,
        });
      }

      // Send priority email
      await sgMail.send({
        to: leadData.email,
        from: "chanel@clutter-free-spaces.com",
        subject: "Let's Create Your Dream Space! - ClutterFreeSpaces",
        html: `
          <h2>Hi ${leadData.name || "there"}! 🌟</h2>
          <p>I'm so excited to help you transform your space! Based on your interest, I'd love to chat with you personally about your organizing goals.</p>
          <p><strong>I'll be calling you within the next 2 hours</strong> to discuss how we can create the organized, peaceful home you deserve.</p>
          <p>In the meantime, feel free to check out some of our recent transformations on our website!</p>
          <p>Talk soon!<br>Chanel<br>ClutterFreeSpaces</p>
        `,
      });
    } else if (scoreResult.routing === "warm") {
      // Send detailed information email
      await sgMail.send({
        to: leadData.email,
        from: "chanel@clutter-free-spaces.com",
        subject: "Your Organized Space Awaits! - ClutterFreeSpaces",
        html: `
          <h2>Hi ${leadData.name || "there"}!</h2>
          <p>Thank you for your interest in professional organizing services. I'd love to help you create a space that brings you peace and joy!</p>
          <p>Here's what makes ClutterFreeSpaces special:</p>
          <ul>
            <li>✨ Personalized organizing solutions</li>
            <li>🏠 Complete service including donation removal</li>
            <li>💪 Non-judgmental, supportive approach</li>
            <li>📅 Flexible scheduling around your life</li>
          </ul>
          <p>I'll follow up with you in the next 24 hours to discuss your specific needs and see how I can help!</p>
        `,
      });
    } else {
      // Add to nurture sequence
      console.log(
        `Adding ${leadData.email} to nurture sequence (${scoreResult.routing} lead)`,
      );
    }

    // 3. Track in GA4
    await ga4Service.trackLeadGeneration({
      ...leadData,
      lead_score: scoreResult.totalScore,
    });

    res.json({
      success: true,
      message: "Lead qualification workflow completed",
      score: scoreResult,
    });
  } catch (error) {
    console.error("Lead qualification workflow error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// WEBHOOK ENDPOINTS (External integrations)
// ============================================================================

// Calendly webhook
app.post("/api/webhook/calendly", async (req, res) => {
  try {
    const { event, payload } = req.body;

    if (event === "invitee.created") {
      // Track booking conversion in GA4
      await ga4Service.trackBookingConversion({
        client_id: ga4Service.generateClientId(),
        booking_id: payload.uuid,
        email: payload.email,
        service_value: 500, // Average consultation value
      });

      // Trigger lead qualification workflow
      await axios.post(
        `${req.protocol}://${req.get("host")}/api/workflow/qualify-lead`,
        {
          name: payload.name,
          email: payload.email,
          phone: payload.phone_number,
          source: "calendly",
          serviceType: "consultation",
          timeline: "scheduled",
        },
      );
    }

    res.json({ success: true, message: "Calendly webhook processed" });
  } catch (error) {
    console.error("Calendly webhook error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Airtable webhook
app.post("/api/webhook/airtable", async (req, res) => {
  try {
    const { base, table, webhook } = req.body;

    // Handle different Airtable events
    for (const change of webhook.changedTablesById[table]?.changedRecordsById ||
      {}) {
      const record = change.current;

      if (
        record.fields["Status"] === "Completed" &&
        change.changedFieldsById["Status"]
      ) {
        // Job completed - trigger review request
        await axios.post(
          `${req.protocol}://${req.get("host")}/api/workflow/review-request`,
          {
            clientName: record.fields["Client Name"],
            clientEmail: record.fields["Email"],
            clientPhone: record.fields["Phone"],
            jobId: record.id,
            serviceType: record.fields["Service Type"],
          },
        );
      }
    }

    res.json({ success: true, message: "Airtable webhook processed" });
  } catch (error) {
    console.error("Airtable webhook error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// SEO & SCHEMA MARKUP ROUTES
// ============================================================================

// Generate LocalBusiness schema markup for homepage
app.get("/api/seo/schema/local-business", (req, res) => {
  try {
    const schema = seoService.generateLocalBusinessSchema();
    res.json(schema);
  } catch (error) {
    console.error("LocalBusiness schema error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Service schema markup for specific service
app.get("/api/seo/schema/service/:serviceKey", (req, res) => {
  try {
    const { serviceKey } = req.params;
    const schema = seoService.generateServiceSchema(serviceKey);
    res.json(schema);
  } catch (error) {
    console.error("Service schema error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate FAQ schema markup
app.get("/api/seo/schema/faq", (req, res) => {
  try {
    const schema = seoService.generateFAQSchema();
    res.json(schema);
  } catch (error) {
    console.error("FAQ schema error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate optimized page titles
app.get("/api/seo/titles", (req, res) => {
  try {
    const titles = seoService.generatePageTitles();
    res.json(titles);
  } catch (error) {
    console.error("Page titles error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate optimized meta descriptions
app.get("/api/seo/meta-descriptions", (req, res) => {
  try {
    const descriptions = seoService.generateMetaDescriptions();
    res.json(descriptions);
  } catch (error) {
    console.error("Meta descriptions error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate service page content
app.get("/api/seo/content/service/:serviceKey", (req, res) => {
  try {
    const { serviceKey } = req.params;
    const content = seoService.generateServicePageContent(serviceKey);
    res.json(content);
  } catch (error) {
    console.error("Service content error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate complete SEO package for all pages
app.get("/api/seo/complete-package", (req, res) => {
  try {
    const package = seoService.generateCompleteSEOPackage();
    res.json(package);
  } catch (error) {
    console.error("Complete SEO package error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// RESOURCE REQUEST ENDPOINT - EMAIL-GATED LEAD MAGNET SYSTEM
// ============================================================================

// Resource download endpoint - email-gated lead magnet system
app.post("/api/request-resources", async (req, res) => {
  try {
    const { email, firstName, requestedResource } = req.body;

    console.log(
      `📥 Resource request: ${requestedResource} for ${firstName} (${email})`,
    );

    // Validate required fields
    if (!email || !firstName) {
      return res.status(400).json({
        error: "Email and first name are required",
      });
    }

    try {
      // Check if email already exists in Airtable
      const existingEmailCheck = await checkExistingEmail(email);

      let recordId = null;

      if (existingEmailCheck.exists) {
        console.log(`📧 Existing contact found: ${email}`);
        // Update existing record to track resource download
        recordId = existingEmailCheck.recordId;
        await updateAirtableResourceDownload(recordId, requestedResource);
      } else {
        console.log(`📧 New contact: ${email}`);
        // Create new Airtable record
        recordId = await createAirtableResourceLead({
          email,
          firstName,
          requestedResource,
          leadSource: "Resource Download",
        });
      }
    } catch (airtableError) {
      console.error("❌ Airtable step failed:", airtableError);
      throw new Error(`Airtable integration failed: ${airtableError.message}`);
    }

    try {
      // Send email with download links
      await sendResourceEmail(email, firstName, requestedResource);
    } catch (emailError) {
      console.error("❌ Email step failed:", emailError);
      throw new Error(`Email sending failed: ${emailError.message}`);
    }

    try {
      // Add to SendGrid list for resource downloaders
      await addResourceDownloaderToSendGrid(
        email,
        firstName,
        requestedResource,
      );
    } catch (sendgridError) {
      console.error("❌ SendGrid step failed:", sendgridError);
      throw new Error(`SendGrid integration failed: ${sendgridError.message}`);
    }

    // Calculate lead score for resource download
    const leadScore = calculateResourceLeadScore(requestedResource);

    console.log(`✅ Resource request processed: Score ${leadScore}`);

    res.json({
      success: true,
      message: "Resources sent successfully! Check your email.",
      leadScore: leadScore,
    });
  } catch (error) {
    console.error("❌ Error processing resource request:", error);
    res.status(500).json({
      error: "Failed to process resource request. Please try again.",
      details: error.message,
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS - RESOURCE REQUEST SYSTEM
// ============================================================================

// Check if email already exists in Airtable
async function checkExistingEmail(email) {
  try {
    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Leads`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
        params: {
          filterByFormula: `{Email} = "${email}"`,
          maxRecords: 1,
        },
      },
    );

    if (response.data.records && response.data.records.length > 0) {
      const record = response.data.records[0];
      console.log(`📧 Found existing email: ${email}`);
      console.log(`   Record ID: ${record.id}`);
      console.log(`   Lead Score: ${record.fields["Lead Score"]}`);
      console.log(`   Source: ${record.fields["Source"]}`);
      return {
        exists: true,
        record: record.fields,
        recordId: record.id,
      };
    }

    return { exists: false };
  } catch (error) {
    console.error("❌ Error checking existing email:", error.message);
    return { exists: false }; // Fail gracefully
  }
}

// Send email with complete resource bundle
async function sendResourceEmail(email, firstName, requestedResource) {
  try {
    // Enhanced template that delivers complete bundle with personalized messaging
    const templateId = "d-af8832644a1f4517a9f6c9cd344b5eed"; // Complete Resource Bundle 2024

    // Map resource selections to friendly names for email personalization
    const resourceDisplayNames = {
      "Kitchen Guide": "Kitchen Organization Essentials guide",
      "Seasonal Guide": "Montana Seasonal Gear Organization guide",
      "Daily Routine": "Daily Maintenance Routine guide",
      "Closet Guide": "Closet & Bedroom Organization guide",
      "Office Guide": "Home Office Setup guide",
      "Mudroom Guide": "Mudroom & Entryway Solutions guide",
      "Labels & Templates": "Printable Labels & Templates",
      "Organization Checklists": "Organization Checklists",
      "Planning Worksheets": "Planning Worksheets",
      "All Guides": "Complete Organization Bundle",
    };

    const friendlyResourceName =
      resourceDisplayNames[requestedResource] || requestedResource;

    const msg = {
      to: email,
      from: {
        email: "chanel@clutter-free-spaces.com",
        name: "Chanel @ Clutter Free Spaces",
      },
      templateId: templateId,
      dynamicTemplateData: {
        first_name: firstName,
        requested_guide: friendlyResourceName,
      },
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    };

    await sgMail.send(msg);
    console.log(
      `📧 Complete resource bundle sent to ${email} (requested: ${requestedResource})`,
    );
  } catch (error) {
    console.error("❌ Error sending resource email:", error);
    throw error;
  }
}

// Add contact to SendGrid resource downloaders list
async function addResourceDownloaderToSendGrid(
  email,
  firstName,
  requestedResource,
) {
  try {
    const contactData = {
      list_ids: [CONTACT_LISTS.newsletter_subscribers],
      contacts: [
        {
          email: email,
          first_name: firstName,
          custom_fields: {
            downloaded_resource: requestedResource,
            download_date: new Date().toISOString(),
            source: "Resource Download",
          },
        },
      ],
    };

    await axios.put(
      "https://api.sendgrid.com/v3/marketing/contacts",
      contactData,
      {
        headers: {
          Authorization: `Bearer ${process.env.SendGrid_API_Key}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log(`📝 Added ${email} to SendGrid resource downloaders list`);
  } catch (error) {
    console.error("❌ Error adding contact to SendGrid:", error);
    throw error;
  }
}

// Create Airtable record for resource download lead
async function createAirtableResourceLead({
  email,
  firstName,
  requestedResource,
  leadSource,
}) {
  try {
    const airtableData = {
      fields: {
        Name: firstName,
        Email: email,
        "Lead Source": "Website",
        "Downloaded Resource": requestedResource,
        "Download Date": new Date().toISOString(),
        Status: "New Lead",
        "Lead Score": calculateResourceLeadScore(requestedResource),
        Segment: "WARM", // Resource downloaders are warm leads
        "Follow Up Required": true,
      },
    };

    const response = await axios.post(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Leads`,
      airtableData,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(
      `📊 Created Airtable resource lead record: ${response.data.id}`,
    );
    return response.data.id;
  } catch (error) {
    console.error(
      "❌ Error creating Airtable resource lead:",
      error.response?.data || error,
    );
    throw error;
  }
}

// Update existing Airtable record with resource download
async function updateAirtableResourceDownload(recordId, requestedResource) {
  try {
    const airtableData = {
      fields: {
        "Downloaded Resource": requestedResource,
        "Download Date": new Date().toISOString(),
        Status: "Resource Downloaded",
        "Lead Score": calculateResourceLeadScore(requestedResource),
        "Follow Up Required": true,
      },
    };

    const response = await axios.patch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Leads/${recordId}`,
      airtableData,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(
      `📝 Updated Airtable record ${recordId} with resource download`,
    );
    return response.data.id;
  } catch (error) {
    console.error("❌ Error updating Airtable resource record:", error);
    throw error;
  }
}

// Calculate lead score for resource downloads
function calculateResourceLeadScore(requestedResource) {
  let score = 40; // Base score for resource download (showing interest)

  // Resource-specific scoring
  const resourceScores = {
    "Kitchen Guide": 10, // Basic organization interest
    "Seasonal Guide": 15, // Montana-specific, outdoor lifestyle
    "Daily Routine": 20, // Ready for implementation
    "Closet Guide": 12, // Personal space organization
    "Office Guide": 18, // Home business/productivity focus
    "Mudroom Guide": 16, // Entry-level organizational need
    "Labels & Templates": 8, // DIY approach, lower engagement
    "Organization Checklists": 12, // Self-guided approach
    "Planning Worksheets": 15, // Planning-focused, higher intent
    "All Guides": 25, // Highest engagement - wants everything
  };

  score += resourceScores[requestedResource] || 10;

  console.log(`📊 Resource lead score: ${score} for ${requestedResource}`);
  return score;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    available_endpoints: [
      "GET /",
      "GET /health",
      "GET /api/google/gmb/*",
      "POST /api/google/analytics/*",
      "GET /api/google/gtm/*",
      "GET /api/google/gmb/content/*",
      "POST /api/google/gmb/content/*",
      "GET /api/google/cloud/*",
      "POST /api/google/cloud/*",
      "POST /api/reviews/*",
      "POST /api/google/lead-score",
      "POST /api/workflow/*",
      "POST /api/webhook/*",
      "GET /api/seo/*",
    ],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ClutterFreeSpaces API Server running on port ${PORT}`);
  console.log(`📊 Google Cloud integrations loaded`);
  console.log(`🔗 Available at: http://localhost:${PORT}`);
});

module.exports = app;
