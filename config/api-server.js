require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
const twilio = require("twilio");
const axios = require("axios");

// Import Google services
const gmbService = require("./google-services/gmb-service");
const ga4Service = require("./google-services/ga4-service");
const leadScoringService = require("./google-services/lead-scoring");

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
      "POST /api/google/lead-score",
      "POST /api/workflow/*",
      "POST /api/webhook/*",
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
