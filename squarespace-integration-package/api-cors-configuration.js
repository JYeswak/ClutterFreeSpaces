// ClutterFreeSpaces API - CORS Configuration for Squarespace Integration
// Add this to your existing api-server.js file

const express = require("express");
const cors = require("cors");

// CORS Configuration for Squarespace Integration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Allowed origins for ClutterFreeSpaces
    const allowedOrigins = [
      // Production Squarespace domains
      "https://clutterfree-spaces.squarespace.com",
      "https://www.clutterfree-spaces.squarespace.com",
      "https://clutter-free-spaces.squarespace.com",
      "https://www.clutter-free-spaces.squarespace.com",

      // Custom domain (update with your actual domain)
      "https://clutterfreespaces.com",
      "https://www.clutterfreespaces.com",

      // Development/testing domains
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8000",
      "https://localhost:3000",
      "https://localhost:3001",

      // Squarespace preview domains (these change, so use regex pattern)
      /^https:\/\/.*\.squarespace\.com$/,
      /^https:\/\/.*\.squarespaceprev\.com$/,

      // Staging domains if you have them
      "https://staging.clutterfreespaces.com",
      "https://dev.clutterfreespaces.com",
    ];

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (typeof allowedOrigin === "string") {
        return origin === allowedOrigin;
      }
      // Handle regex patterns
      return allowedOrigin.test(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "X-API-Key",
  ],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Preflight handler for complex requests
app.options("*", cors(corsOptions));

// Health check endpoint with CORS headers
app.get("/api/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is configured correctly",
    origin: req.get("Origin"),
    timestamp: new Date().toISOString(),
    headers: {
      "access-control-allow-origin": req.get("Origin"),
      "access-control-allow-credentials": "true",
    },
  });
});

// Enhanced newsletter signup endpoint with better error handling
app.post("/api/newsletter-signup", async (req, res) => {
  try {
    // Log request details for debugging
    console.log("📧 Newsletter signup request:", {
      origin: req.get("Origin"),
      userAgent: req.get("User-Agent"),
      body: { ...req.body, email: req.body.email ? "[REDACTED]" : undefined },
    });

    const {
      firstName,
      email,
      rvType,
      biggestChallenge,
      timeline,
      montanaResident,
      gdprConsent,
      leadScore: clientScore,
      abTestVariation,
      source,
    } = req.body;

    // Enhanced validation
    if (!firstName || !email || !gdprConsent) {
      return res.status(400).json({
        error: "Missing required fields or GDPR consent",
        details: {
          firstName: !firstName ? "Required" : "OK",
          email: !email ? "Required" : "OK",
          gdprConsent: !gdprConsent ? "Required" : "OK",
        },
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        details: { email: "Must be a valid email address" },
      });
    }

    // Calculate server-side lead score
    const serverScore = calculateNewsletterLeadScore({
      rvType,
      biggestChallenge,
      timeline,
      montanaResident,
      email,
    });

    const finalScore = serverScore;
    const segment = getLeadSegment(finalScore);

    console.log(
      `📊 Lead processing: ${firstName} (${email}) - Score: ${finalScore} (${segment})`,
    );

    // Process the signup (existing logic)
    await addNewsletterContactToSendGrid({
      firstName,
      email,
      rvType,
      biggestChallenge,
      timeline,
      montanaResident,
      leadScore: finalScore,
      segment,
      abTestVariation,
    });

    // Create Airtable record with error handling
    let airtableRecordId = null;
    try {
      airtableRecordId = await createAirtableLead({
        firstName,
        email,
        rvType,
        biggestChallenge,
        timeline,
        montanaResident,
        leadScore: finalScore,
        segment,
        source: source || "Newsletter Signup",
        abTestVariation,
      });
    } catch (airtableError) {
      console.log("⚠️ Airtable integration skipped:", airtableError.message);
      // Don't fail the entire request for Airtable errors
    }

    // Trigger email sequence
    try {
      await triggerAutomatedSequence({
        email,
        firstName,
        rvType: rvType || "RV",
        challenge: biggestChallenge || "organization",
        segment,
      });
    } catch (emailError) {
      console.log("⚠️ Email sequence error:", emailError.message);
      // Don't fail the entire request for email sequence errors
    }

    console.log(`✅ Newsletter signup complete for ${email}`);

    // Success response with CORS headers
    res.set({
      "Access-Control-Allow-Origin": req.get("Origin"),
      "Access-Control-Allow-Credentials": "true",
    });

    res.json({
      success: true,
      leadScore: finalScore,
      segment: segment,
      checklistUrl: "/downloads/rv-organization-checklist.pdf",
      message: "Welcome! Check your email for your RV organization checklist.",
      airtableId: airtableRecordId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Newsletter signup error:", error);

    // Enhanced error response
    res.status(500).json({
      error: "Failed to process newsletter signup",
      message: "Please try again or contact us directly.",
      timestamp: new Date().toISOString(),
      details:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
    });
  }
});

// Error handler for CORS issues
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({
      error: "CORS Error",
      message: "Origin not allowed",
      origin: req.get("Origin"),
      timestamp: new Date().toISOString(),
    });
  } else {
    next(err);
  }
});

// Production environment checks
if (process.env.NODE_ENV === "production") {
  console.log("🔒 Production CORS configuration active");
  console.log("📍 Allowed origins:", corsOptions.origin.toString());

  // Additional security headers for production
  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
    next();
  });
}

module.exports = { corsOptions };
