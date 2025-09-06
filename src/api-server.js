const express = require("express");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
const sgClient = require("@sendgrid/client");
const {
  triggerEmailSequence: triggerAutomatedSequence,
} = require("./email-automation-config.js");
const { leadNotifications } = require("./sms-notification-system");
const {
  runAutomation: runReviewAutomation,
  checkForNewClients,
  processNewClient,
  sendReviewEmail,
} = require("./review-automation-system");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Set up SendGrid
sgMail.setApiKey(process.env.SendGrid_API_Key);
sgClient.setApiKey(process.env.SendGrid_API_Key);

// Guide template IDs (from our previous setup)
const GUIDE_TEMPLATES = {
  detailed: "d-2d957aa426f64118bbfce58f3f9e2e57",
  visual: "d-50f3b3d2eca545e38b44130ff4994c47",
  flexible: "d-413496b175244ad3865feec8ae8a0143",
  simple: "d-2b90e7128e364c5c838cbab38231fce1",
};

// Email sequence template IDs (deployed via deploy-sendgrid-templates.js)
const SEQUENCE_TEMPLATES = {
  "hot-leads": {
    email_1: "d-afb751285d0e4516954a1998a84de36e",
    email_2: "d-ce3f54f9f29047c8aec80307de6dd040",
    email_3: "d-d85a69f8f07d4d818d1b38a4f517aca9",
    email_4: "d-0ccb27b3ac1243b79ac24281bcbc153e",
    email_5: "d-070f1a08d745496492ea47402d8a620b",
  },
  "warm-leads": {
    email_1: "d-e2dda8fe19224b07b07d7c7ccad4b2f3",
    email_2: "d-f4dce7876cab4da797d81db9911e9da1",
    email_3: "d-52e08e42be3b40c3a38e3251714e082d",
    email_4: "d-a1e03ad306f540ffbd0ca377c3ce0594",
    email_5: "d-4d0624d84ef24ab29f61db839e18ae86",
  },
  "cold-leads": {
    email_1: "d-646ae76fc0b045b7b219c396cbbc847e",
    email_2: "d-4a119321dab3409db55a6d30f638e317",
    email_3: "d-3627f16998ed4874ac7570fe9ed23428",
    email_4: "d-c02b5f745e2e4b339dd0cd2f13ec912a",
    email_5: "d-b17eec78420740f586b589971ca62ca2",
  },
};

// SendGrid contact lists (from previous setup)
const CONTACT_LISTS = {
  quiz_takers: "e4cf8d8d-b5bd-4c0a-a5c4-f1222e2a3462",
  cold_leads: "04a543ea-7191-458c-a2dc-460b2a729ebd",
  newsletter_subscribers: "e4cf8d8d-b5bd-4c0a-a5c4-f1222e2a3462", // Use quiz_takers for now
  hot_leads: "e4cf8d8d-b5bd-4c0a-a5c4-f1222e2a3462", // Use quiz_takers for now
  warm_leads: "04a543ea-7191-458c-a2dc-460b2a729ebd", // Use cold_leads for now
};

// Airtable configuration
const axios = require("axios");
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

// Airtable integration ready

// CORS configuration for production
const corsOptions = {
  origin: [
    "https://www.clutter-free-spaces.com",
    "https://clutter-free-spaces.com",
    "https://clutter-free-spaces.squarespace.com",
    "https://clutter-free-spaces.squarespace-staging.com",
    "https://hen-dog-7cdm.squarespace.com",
    // Allow localhost for development
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("."));

// Serve downloads directory with proper MIME types
app.use(
  "/downloads",
  express.static("downloads", {
    setHeaders: (res, path) => {
      if (path.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'inline; filename="rv-organization-checklist.pdf"',
        );
      }
    },
  }),
);

// Serve website pages
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/organization-style-quiz.html");
});

app.get("/quiz", (req, res) => {
  res.sendFile(__dirname + "/website-pages/quiz.html");
});

app.get("/organization-quiz", (req, res) => {
  res.sendFile(__dirname + "/website-pages/quiz.html");
});

app.get("/archive", (req, res) => {
  res.sendFile(__dirname + "/website-pages/archive.html");
});

app.get("/rv-tips", (req, res) => {
  res.sendFile(__dirname + "/website-pages/archive.html");
});

// Organization guides
app.get("/guide/detailed", (req, res) => {
  res.sendFile(__dirname + "/website-pages/detailed-guide.html");
});

app.get("/guide/visual", (req, res) => {
  res.sendFile(__dirname + "/website-pages/visual-guide.html");
});

app.get("/guide/flexible", (req, res) => {
  res.sendFile(__dirname + "/website-pages/flexible-guide.html");
});

app.get("/guide/simple", (req, res) => {
  res.sendFile(__dirname + "/website-pages/simple-guide.html");
});

// API endpoint to send personalized guides
app.post("/api/send-guide", async (req, res) => {
  try {
    const { email, style, source, quiz_results } = req.body;

    console.log(`📧 Sending ${style} guide to ${email}`);

    // Get the appropriate template
    const templateId = GUIDE_TEMPLATES[style];
    if (!templateId) {
      return res.status(400).json({ error: "Invalid style" });
    }

    // Extract name from email (basic fallback)
    const name = email.split("@")[0].replace(/[._]/g, " ");
    const firstName = name.split(" ")[0];
    const capitalizedName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1);

    // Send the personalized guide
    const msg = {
      to: email,
      from: {
        email: "chanel@clutter-free-spaces.com",
        name: "Chanel @ ClutterFreeSpaces",
      },
      templateId: templateId,
      dynamicTemplateData: {
        name: capitalizedName,
        style: style,
        quiz_source: source || "website",
      },
      trackingSettings: {
        clickTracking: {
          enable: true,
        },
        openTracking: {
          enable: true,
        },
      },
    };

    await sgMail.send(msg);
    console.log(`✅ Guide sent successfully to ${email}`);

    // Add contact to SendGrid lists
    await addContactToLists(email, capitalizedName, style, quiz_results);

    // Calculate lead score based on quiz results
    const leadScore = calculateLeadScore(quiz_results, style);
    console.log(`📊 Lead score calculated: ${leadScore}`);

    // Notify Chanel of high-value leads (80+)
    if (leadScore >= 80) {
      try {
        await leadNotifications.highValueLead({
          firstName: capitalizedName,
          email: email,
          leadScore: leadScore,
          rvType: quiz_results?.rv_type || "RV",
          challenge: quiz_results?.biggest_challenge || style,
        });
        console.log(
          `🚨 High-value lead notification sent for ${capitalizedName} (Score: ${leadScore})`,
        );
      } catch (error) {
        console.error("❌ Failed to send high-value lead notification:", error);
      }
    }

    res.json({
      success: true,
      message: "Guide sent successfully",
      leadScore: leadScore,
    });
  } catch (error) {
    console.error("❌ Error sending guide:", error);
    res.status(500).json({ error: "Failed to send guide" });
  }
});

async function addContactToLists(email, name, style, quizResults) {
  try {
    const contactData = {
      list_ids: [CONTACT_LISTS.quiz_takers, CONTACT_LISTS.cold_leads],
      contacts: [
        {
          email: email,
          first_name: name,
          custom_fields: {
            organization_style: style,
            quiz_completed: new Date().toISOString(),
            source: "organization_quiz",
            quiz_answers: JSON.stringify(quizResults),
          },
        },
      ],
    };

    const request = {
      url: "/v3/marketing/contacts",
      method: "PUT",
      body: contactData,
    };

    await sgClient.request(request);
    console.log(`📝 Added ${email} to contact lists`);
  } catch (error) {
    console.error("❌ Error adding contact to lists:", error);
  }
}

function calculateLeadScore(quizResults, style) {
  let score = 0;

  // Base score for completing quiz
  score += 25;

  // Style-based scoring
  const styleScores = {
    detailed: 20, // Detailed organizers are willing to invest
    flexible: 15, // Flexible organizers are adaptable
    visual: 18, // Visual organizers value aesthetics
    simple: 12, // Simple organizers may want quick solutions
  };

  score += styleScores[style] || 10;

  // Answer consistency (if they answered consistently, they're more serious)
  if (quizResults) {
    const answers = Object.values(quizResults);
    const mostCommonAnswer = answers.reduce((acc, answer) => {
      acc[answer] = (acc[answer] || 0) + 1;
      return acc;
    }, {});

    const consistency =
      Math.max(...Object.values(mostCommonAnswer)) / answers.length;
    score += Math.round(consistency * 15);
  }

  return Math.min(score, 100); // Cap at 100
}

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

// Enhanced lead scoring for newsletter signups
function calculateNewsletterLeadScore({
  rvType,
  biggestChallenge,
  timeline,
  montanaResident,
  email,
}) {
  let score = 30; // Base score for newsletter signup

  console.log("🧮 SCORING DEBUG:");
  console.log(
    `   Input: RV="${rvType}" Challenge="${biggestChallenge}" Timeline="${timeline}" Montana=${montanaResident}`,
  );
  console.log(`   Base: ${score}`);

  // RV Type scoring (premium RVs indicate higher budget)
  const rvScores = {
    "class-a": 25, // Highest investment RVs
    "fifth-wheel": 20, // High-end trailers
    "class-c": 15, // Mid-range motorhomes
    "travel-trailer": 10, // More budget-conscious
    "class-b": 12, // Compact but premium
    other: 5, // Unknown category
  };
  const rvPoints = rvScores[rvType] || 5;
  score += rvPoints;
  console.log(`   RV Type (${rvType}): +${rvPoints} = ${score}`);

  // Challenge scoring (indicates urgency and investment willingness)
  const challengeScores = {
    "weight-management": 30, // Critical safety issue
    "storage-bays": 25, // Major functionality problem
    kitchen: 20, // Daily use area
    bedroom: 15, // Personal comfort
    "seasonal-gear": 10, // Less urgent
    "external-bay-storage": 25, // Same as storage-bays
    "kitchen-pantry-organization": 20, // Same as kitchen
    "bedroom-closet-space": 15, // Same as bedroom
    "weight-space-management": 30, // Same as weight-management
    "seasonal-gear-storage": 10, // Same as seasonal-gear
  };

  // Handle multi-select challenges (can be array or string)
  let challengePoints = 0;
  if (Array.isArray(biggestChallenge)) {
    // For multiple challenges, take the highest scoring one
    const scores = biggestChallenge.map(
      (challenge) => challengeScores[challenge] || 10,
    );
    challengePoints = Math.max(...scores);
    console.log(
      `   Challenges (${biggestChallenge.join(", ")}): +${challengePoints} = ${score + challengePoints}`,
    );
  } else {
    challengePoints = challengeScores[biggestChallenge] || 10;
    console.log(
      `   Challenge (${biggestChallenge}): +${challengePoints} = ${score + challengePoints}`,
    );
  }
  score += challengePoints;

  // Timeline scoring (urgency indicator)
  const timelineScores = {
    asap: 40, // Immediate need
    "within-month": 30, // High urgency
    "2-3-months": 15, // Planning ahead
    exploring: 5, // Information gathering
  };
  const timelinePoints = timelineScores[timeline] || 5;
  score += timelinePoints;
  console.log(`   Timeline (${timeline}): +${timelinePoints} = ${score}`);

  // Montana resident bonus (local service, Montana discount)
  if (montanaResident) {
    score += 15;
    console.log(`   Montana bonus: +15 = ${score}`);
  } else {
    console.log(`   Montana bonus: +0 = ${score}`);
  }

  // Email domain analysis for professional emails
  const emailBonus =
    email &&
    !email.includes("gmail") &&
    !email.includes("yahoo") &&
    !email.includes("hotmail")
      ? 10
      : 0;
  if (emailBonus > 0) {
    score += emailBonus;
    console.log(`   Email domain bonus: +${emailBonus} = ${score}`);
  } else {
    console.log(`   Email domain bonus: +0 = ${score}`);
  }

  // Remove arbitrary 100-point cap - let high-value leads score properly
  const finalScore = score;
  console.log(`   Final (no cap): ${finalScore}`);

  return finalScore;
}

// Determine lead segment based on score (updated for uncapped scoring)
function getLeadSegment(score) {
  if (score >= 90) return "HOT"; // 90+ = immediate action needed
  if (score >= 60) return "WARM"; // 60+ = high potential
  return "COLD"; // <60 = nurture needed
}

// Newsletter signup endpoint
app.post("/api/newsletter-signup", async (req, res) => {
  try {
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
      forceUpdate,
    } = req.body;

    console.log(`📧 Newsletter signup: ${firstName} (${email})`);

    // Validate required fields
    if (!firstName || !email || !gdprConsent) {
      return res.status(400).json({
        error: "Missing required fields or GDPR consent",
      });
    }

    // Check if email already exists in Airtable
    const existingEmailCheck = await checkExistingEmail(email);

    if (existingEmailCheck.exists && !forceUpdate) {
      console.log(`📧 Email already exists: ${email}`);
      return res.status(409).json({
        success: false,
        emailExists: true,
        existingRecord: existingEmailCheck.record,
        message:
          "I see you're already in our system! Would you like to update your information, or would you prefer to cancel this request and reach out to us directly?",
        options: {
          update: "Submit again to update your information",
          contact: "Email us at contact@clutter-free-spaces.com",
        },
      });
    }

    // For newsletter signups, use NEWSLETTER segment instead of score-based segments
    const segment = "NEWSLETTER";

    // Calculate score for analytics but don't use for segmentation
    const analyticsScore = calculateNewsletterLeadScore({
      rvType,
      biggestChallenge,
      timeline,
      montanaResident,
      email,
    });

    const finalScore = analyticsScore;

    console.log(`📊 Lead score: ${finalScore} (${segment})`);

    // Add to SendGrid with segmentation
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

    // Create or update Airtable CRM record
    let airtableRecordId = null;
    try {
      if (existingEmailCheck.exists && forceUpdate) {
        // Update existing record
        console.log(
          `📝 Updating existing Airtable record: ${existingEmailCheck.recordId}`,
        );
        airtableRecordId = await updateAirtableLead(
          existingEmailCheck.recordId,
          {
            firstName,
            rvType,
            biggestChallenge,
            timeline,
            montanaResident,
            leadScore: finalScore,
            segment,
            source: "Newsletter Signup (Updated)",
            abTestVariation,
            updatedAt: new Date().toISOString(),
          },
        );
      } else {
        // Create new record
        airtableRecordId = await createAirtableLead({
          firstName,
          email,
          rvType,
          biggestChallenge,
          timeline,
          montanaResident,
          leadScore: finalScore,
          segment,
          source: "Newsletter Signup",
          abTestVariation,
        });
      }
    } catch (error) {
      console.log("⚠️ Airtable integration failed:");
      console.log("  Error message:", error.message);
      console.log("  Error response:", error.response?.data);
      console.log("  Status code:", error.response?.status);
    }

    // Notify Chanel of high-value newsletter leads (80+)
    if (finalScore >= 80) {
      try {
        await leadNotifications.highValueLead({
          firstName,
          email,
          leadScore: finalScore,
          rvType: rvType,
          challenge: biggestChallenge,
        });
        console.log(
          `🚨 High-value newsletter lead notification sent for ${firstName} (Score: ${finalScore})`,
        );
      } catch (error) {
        console.error(
          "❌ Failed to send high-value newsletter lead notification:",
          error,
        );
      }
    }

    // Trigger appropriate email sequence with new automation system
    try {
      await triggerAutomatedSequence({
        email,
        firstName,
        rvType: rvType || "RV",
        challenge: biggestChallenge || "organization",
        segment,
      });
    } catch (error) {
      console.log("⚠️ Email sequence error:", error.message);
    }

    console.log(`✅ Newsletter signup complete for ${email}`);

    res.json({
      success: true,
      leadScore: finalScore,
      segment: segment,
      checklistUrl: "/downloads/rv-organization-checklist.pdf",
      message: "Welcome! Check your email for your RV organization checklist.",
      airtableId: airtableRecordId,
    });
  } catch (error) {
    console.error("❌ Newsletter signup error:", error);
    res.status(500).json({
      error: "Failed to process newsletter signup",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Manual appointment notification endpoint
app.post("/api/appointment-notification", async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      appointmentTime,
      appointmentType = "Consultation",
      notes = "",
    } = req.body;

    if (!clientName || !clientEmail || !appointmentTime) {
      return res.status(400).json({
        error:
          "Missing required fields: clientName, clientEmail, appointmentTime",
      });
    }

    // Import here to avoid circular dependency
    const { sendSMSToChanel } = require("./sms-notification-system");

    const message = `📅 New ${appointmentType} scheduled!
👤 ${clientName} (${clientEmail})
🕒 ${appointmentTime}
${notes ? `📝 Notes: ${notes}` : ""}`;

    await sendSMSToChanel(message, "normal");

    console.log(`📅 Appointment notification sent for ${clientName}`);

    res.json({
      success: true,
      message: "Appointment notification sent to Chanel",
      data: { clientName, appointmentTime, appointmentType },
    });
  } catch (error) {
    console.error("❌ Appointment notification error:", error);
    res.status(500).json({
      error: "Failed to send appointment notification",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Test endpoint with scoring verification
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    build: "2025-08-30-v4-SCORING-FIXED",
    templates: GUIDE_TEMPLATES,
    scoringFixed: true,
    timestamp: new Date().toISOString(),
  });
});

// Test scoring endpoint to verify deployment
app.post("/api/test-scoring", (req, res) => {
  const { rvType, biggestChallenge, timeline, montanaResident, email } =
    req.body;

  const testScore = calculateNewsletterLeadScore({
    rvType: rvType || "Class A",
    biggestChallenge: biggestChallenge || "Weight Management",
    timeline: timeline || "ASAP",
    montanaResident: montanaResident || true,
    email: email || "test@example.com",
  });

  res.json({
    build: "2025-08-30-v4-SCORING-FIXED",
    input: { rvType, biggestChallenge, timeline, montanaResident, email },
    calculatedScore: testScore,
    expectedScore: 30 + 25 + 30 + 40 + 15, // Should be 140
    scoringWorking: testScore >= 100,
    timestamp: new Date().toISOString(),
  });
});

// ==================== REVIEW AUTOMATION ENDPOINTS ====================

// Manual trigger for review automation (for testing)
app.post("/api/review-automation/run", async (req, res) => {
  try {
    console.log("🤖 Manual review automation triggered via API");
    await runReviewAutomation();
    res.json({
      success: true,
      message: "Review automation completed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Review automation failed:", error);
    res.status(500).json({
      error: "Review automation failed",
      details: error.message,
    });
  }
});

// Webhook endpoint for Airtable automation (when Status changes to "Client")
app.post("/api/review-automation/webhook", async (req, res) => {
  try {
    const { recordId, fields } = req.body;

    console.log("📞 Webhook received for record:", recordId);

    if (fields?.Status === "Client" && !fields?.["Review Requested"]) {
      console.log(
        "🎯 Processing new client for review automation:",
        fields["First Name"],
      );

      // Create a mock client record for processing
      const clientRecord = {
        id: recordId,
        fields: fields,
      };

      await processNewClient(clientRecord);

      res.json({
        success: true,
        message: `Review sequence started for ${fields["First Name"]}`,
        recordId: recordId,
      });
    } else {
      res.json({
        success: true,
        message: "No review automation needed for this record",
        reason:
          fields?.Status !== "Client"
            ? "Not a client"
            : "Review already requested",
      });
    }
  } catch (error) {
    console.error("❌ Webhook processing failed:", error);
    res.status(500).json({
      error: "Webhook processing failed",
      details: error.message,
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Generate/regenerate PDF endpoint
app.get("/api/generate-pdf", (req, res) => {
  try {
    const { generateRVChecklistPDF } = require("./generate-rv-checklist-pdf");
    const pdfPath = generateRVChecklistPDF();
    res.json({
      success: true,
      message: "PDF generated successfully",
      downloadUrl: "/downloads/rv-organization-checklist.pdf",
      path: pdfPath,
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// ==================== SCHEDULED REVIEW AUTOMATION ====================

// Set up scheduled review automation (every 4 hours)
let reviewInterval;

function startReviewAutomation() {
  // Run immediately on startup
  setTimeout(async () => {
    try {
      console.log("🤖 Running initial review automation check...");
      await runReviewAutomation();
    } catch (error) {
      console.error("❌ Initial review automation failed:", error);
    }
  }, 30000); // Wait 30 seconds after server start

  // Then run every 4 hours
  reviewInterval = setInterval(
    async () => {
      try {
        console.log("🤖 Running scheduled review automation check...");
        await runReviewAutomation();
      } catch (error) {
        console.error("❌ Scheduled review automation failed:", error);
      }
    },
    4 * 60 * 60 * 1000,
  ); // 4 hours in milliseconds

  console.log("⏰ Review automation scheduled every 4 hours");
}

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

    // Send email with download links
    await sendResourceEmail(email, firstName, requestedResource);

    // Add to SendGrid list for resource downloaders
    await addResourceDownloaderToSendGrid(email, firstName, requestedResource);

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
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Guide delivery server running on http://localhost:${PORT}`);
  console.log(
    "📧 Using FRESH template IDs - Build: 2025-08-30-v4-SCORING-FIXED",
  );
  console.log("📱 SMS & Phone notifications ACTIVE for high-value leads");
  console.log(
    "🧮 SCORING BUG FIXED: Removed 100-point cap, debug logging active",
  );
  console.log(`📧 Using updated template IDs (no more Sarah Mitchell!)`);
  console.log("⭐ Review automation system ACTIVE");
  console.log(`📧 SendGrid configured with templates:`);
  Object.entries(GUIDE_TEMPLATES).forEach(([style, id]) => {
    console.log(`   ${style}: ${id}`);
  });

  // Start the review automation
  startReviewAutomation();
});

// SendGrid contact creation for newsletter signups
async function addNewsletterContactToSendGrid({
  firstName,
  email,
  rvType,
  biggestChallenge,
  timeline,
  montanaResident,
  leadScore,
  segment,
  abTestVariation,
}) {
  try {
    // Determine which lists to add contact to based on segment
    const listIds = [CONTACT_LISTS.newsletter_subscribers];

    if (segment === "HOT") {
      listIds.push(CONTACT_LISTS.hot_leads);
    } else if (segment === "WARM") {
      listIds.push(CONTACT_LISTS.warm_leads);
    } else {
      listIds.push(CONTACT_LISTS.cold_leads);
    }

    const contactData = {
      list_ids: listIds,
      contacts: [
        {
          email: email,
          first_name: firstName,
        },
      ],
    };

    const request = {
      url: "/v3/marketing/contacts",
      method: "PUT",
      body: contactData,
    };

    const response = await sgClient.request(request);
    console.log(`📧 Added ${email} to SendGrid lists: ${listIds.join(", ")}`);
    return response;
  } catch (error) {
    console.error("❌ Error adding contact to SendGrid:", error);
    throw error;
  }
}

// Airtable CRM record creation
async function createAirtableLead({
  firstName,
  email,
  rvType,
  biggestChallenge,
  timeline,
  montanaResident,
  leadScore,
  segment,
  source,
  abTestVariation,
}) {
  try {
    // Map source to valid Lead Source options
    const sourceMapping = {
      "Newsletter Signup": "Website",
      Quiz: "Quiz",
      Facebook: "Facebook",
      Referral: "Referral",
      Google: "Google",
      ManyChat: "ManyChat",
    };

    // Map timeline to valid Timeline options
    const timelineMapping = {
      // New form options (exact matches)
      "ASAP - I'm overwhelmed!": "ASAP",
      "Within the next month": "Within a month",
      "2-3 months from now": "Next 2-3 months",
      "Just exploring options": "Just Exploring",
      // Form value mappings (what Squarespace forms actually send)
      asap: "ASAP",
      "within-month": "Within a month",
      "2-3-months": "Next 2-3 months",
      exploring: "Just Exploring",
      // Legacy mappings for backward compatibility
      immediately: "ASAP",
      "just-exploring": "Just Exploring",
      ASAP: "ASAP",
      "Within Month": "Within a month",
      "2-3 Months": "Next 2-3 months",
      "Just Exploring": "Just Exploring",
    };

    // Map form values to Airtable options
    const rvTypeMapping = {
      // New form options (exact matches)
      "Class A Motorhome": "Class A",
      "Class B Van/Camper": "Class B",
      "Class C Motorhome": "Class C",
      "Travel Trailer": "Travel Trailer",
      "Fifth Wheel": "Fifth Wheel",
      Other: "Other",
      // Legacy mappings
      "Truck Camper": "Other",
      "Toy Hauler": "Other",
      // Form value mappings (what Squarespace forms actually send)
      "class-a": "Class A",
      "class-b": "Class B",
      "class-c": "Class C",
      "travel-trailer": "Travel Trailer",
      "fifth-wheel": "Fifth Wheel",
      "truck-camper": "Other",
      "toy-hauler": "Other",
      other: "Other",
    };

    const challengeMapping = {
      // New form options (exact matches)
      "Kitchen & Pantry Organization": "Kitchen",
      "Bedroom & Closet Space": "Bedroom",
      "External Bay Storage": "Storage Bays",
      "Weight & Space Management": "Weight Management",
      "Seasonal Gear Storage": "Seasonal Gear",
      // Form value mappings (what Squarespace forms actually send)
      "storage-bays": "Storage Bays",
      "organization-systems": "Organization Systems",
      "weight-management": "Weight Management",
      "space-utilization": "Space Utilization",
      "seasonal-gear": "Seasonal Gear",
      kitchen: "Kitchen",
      bedroom: "Bedroom",
      // Legacy mappings
      Storage: "Storage Bays",
      "Organization Systems": "Organization Systems",
      Downsizing: "Downsizing",
      Other: "Other",
    };

    // Map AB Test Variation to Airtable options
    const abTestMapping = {
      "inline-form": "A",
      "exit-intent": "B",
      "footer-form": "A",
      popup: "B",
      // Direct mappings
      A: "A",
      B: "B",
      Control: "Control",
    };

    // Apply mappings
    const mappedRvType = rvTypeMapping[rvType] || rvType || "Other";

    // Handle multi-select challenges (biggestChallenge can be array or string)
    let mappedChallenges;
    if (Array.isArray(biggestChallenge)) {
      mappedChallenges = biggestChallenge.map(
        (challenge) => challengeMapping[challenge] || challenge || "Other",
      );
    } else {
      mappedChallenges = [
        challengeMapping[biggestChallenge] || biggestChallenge || "Other",
      ];
    }

    const mappedTimeline =
      timelineMapping[timeline] || timeline || "Just Exploring";
    const mappedAbTest = abTestMapping[abTestVariation] || "A";

    console.log(
      `🔧 Airtable mappings: RV("${rvType}"→"${mappedRvType}") Challenges(${Array.isArray(biggestChallenge) ? biggestChallenge.join(", ") : biggestChallenge}→${mappedChallenges.join(", ")}) Timeline("${timeline}"→"${mappedTimeline}") ABTest("${abTestVariation}"→"${mappedAbTest}")`,
    );

    // Validate required fields exist in Airtable schema
    const airtableData = {
      fields: {
        Name: firstName, // Use "Name" not "First Name"
        Email: email,
        "RV Type": mappedRvType, // Map to Airtable options
        "Biggest Challenge": mappedChallenges, // Multi-select array for Airtable
        Timeline: mappedTimeline,
        "Montana Resident": montanaResident === true, // Checkbox field
        "Lead Score": leadScore || 0,
        Segment: segment, // New field - must exist in Airtable (HOT/WARM/COLD)
        "Lead Source": sourceMapping[source] || "Website", // Map to existing field
        "AB Test Variation": mappedAbTest, // Map form variations to A/B/Control
        Status: "New Lead", // Use existing Status field
        "Follow Up Required": segment === "HOT", // Checkbox field
        // Don't set "Date Created" as it's auto-generated (createdTime field)
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

    console.log(`📊 Created Airtable record for ${email}: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error(
      "❌ Error creating Airtable record:",
      error.response?.data || error,
    );

    // Provide more specific error information for debugging
    if (error.response?.status === 422) {
      console.error("💡 422 Error - Field validation failed:");
      console.error("   Check that all required fields exist in Airtable");
      console.error(
        "   Check that single-select values match available options",
      );
      console.error(
        "   Data sent:",
        JSON.stringify(airtableData.fields, null, 2),
      );
    }

    throw error;
  }
}

// Update existing Airtable lead record
async function updateAirtableLead(
  recordId,
  {
    firstName,
    rvType,
    biggestChallenge,
    timeline,
    montanaResident,
    leadScore,
    segment,
    source,
    abTestVariation,
    updatedAt,
  },
) {
  try {
    // Map source to valid Lead Source options
    const sourceMapping = {
      "Newsletter Signup": "Website",
      "Newsletter Signup (Updated)": "Website",
      Quiz: "Quiz",
      Facebook: "Facebook",
      Referral: "Referral",
      Google: "Google",
      ManyChat: "ManyChat",
    };

    // Map timeline to valid Timeline options
    const timelineMapping = {
      "ASAP - I'm overwhelmed!": "ASAP",
      "Within the next month": "Within a month",
      "2-3 months from now": "Next 2-3 months",
      "Just exploring options": "Just Exploring",
      asap: "ASAP",
      "within-month": "Within a month",
      "2-3-months": "Next 2-3 months",
      exploring: "Just Exploring",
      immediately: "ASAP",
      "just-exploring": "Just Exploring",
      ASAP: "ASAP",
      "Within Month": "Within a month",
      "2-3 Months": "Next 2-3 months",
      "Just Exploring": "Just Exploring",
    };

    // Map RV types
    const rvTypeMapping = {
      "Class A Motorhome": "Class A",
      "Class B Van/Camper": "Class B",
      "Class C Motorhome": "Class C",
      "Travel Trailer": "Travel Trailer",
      "Fifth Wheel": "Fifth Wheel",
      Other: "Other",
      "Truck Camper": "Other",
      "Toy Hauler": "Other",
      "class-a": "Class A",
      "class-b": "Class B",
      "class-c": "Class C",
      "travel-trailer": "Travel Trailer",
      "fifth-wheel": "Fifth Wheel",
      other: "Other",
    };

    // Map challenges to multi-select array format
    const challengesMapping = {
      "Kitchen Organization": ["Kitchen"],
      "Bathroom Organization": ["Bathroom"],
      "Storage Solutions": ["Storage"],
      "Closet Organization": ["Closet"],
      "General Decluttering": ["General Decluttering"],
      "Time Management": ["Time Management"],
      Downsizing: ["Downsizing"],
      // Legacy mappings
      kitchen: ["Kitchen"],
      bathroom: ["Bathroom"],
      storage: ["Storage"],
      closet: ["Closet"],
      general: ["General Decluttering"],
    };

    const airtableData = {
      fields: {
        "First Name": firstName,
        "RV Type": rvTypeMapping[rvType] || "Other",
        "Biggest Challenge": challengesMapping[biggestChallenge] || [
          "General Decluttering",
        ],
        Timeline: timelineMapping[timeline] || "Just Exploring",
        "Montana Resident":
          montanaResident === true || montanaResident === "true",
        "Lead Score": leadScore || 0,
        Segment: segment || "COLD",
        "Lead Source": sourceMapping[source] || "Website",
        "AB Test Variation": abTestVariation || "Control",
        Status: "Updated Lead",
        "Follow Up Required": segment === "HOT",
        "Last Updated": updatedAt || new Date().toISOString(),
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

    console.log(`📝 Updated Airtable record ${recordId} for lead`);
    return response.data.id;
  } catch (error) {
    console.error(
      "❌ Error updating Airtable record:",
      error.response?.data || error,
    );

    if (error.response?.status === 422) {
      console.error("💡 422 Error - Field validation failed during update:");
      console.error("   Check that all field values match available options");
      console.error(
        "   Data sent:",
        JSON.stringify(airtableData.fields, null, 2),
      );
    }
    throw error;
  }
}

// Resource download helper functions

// Send email with complete resource bundle
async function sendResourceEmail(email, firstName, requestedResource) {
  try {
    // Use the new enhanced template (you'll need to update this ID after creating the template)
    const templateId = "d-e57a6dd9503b40aa93bef76fd1c2c5bf"; // Will be updated to new template

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
        // The new template has all download links built-in, so we don't need to pass them
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

    const request = {
      url: "/v3/marketing/contacts",
      method: "PUT",
      body: contactData,
    };

    await sgClient.request(request);
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
        "Lead Source": leadSource,
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

module.exports = app;
