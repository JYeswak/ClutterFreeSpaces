const express = require("express");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
const sgClient = require("@sendgrid/client");
const {
  triggerEmailSequence: triggerAutomatedSequence,
} = require("./email-automation-config.js");
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

    email_2: "d-3ebedc6bf63846199639a53b69703265",
    email_3: "d-583b48aaf964403f8d49e3e25caa4ae6",
    email_4: "d-06caefd07b8e4ea2aa8b28b0c5f89a99",
    email_5: "d-e82d75a510fe4d8380d474929f124530",
  },
  "cold-leads": {
    email_1: "d-e5d086a8a79f43ac9e9ef72c266049a3",
    email_2: "d-9aa93484718645bb97ed9824b716d044",
    email_3: "d-55a467691e9c41dcb54e8894248dbbd4",
    email_4: "d-b9ac517abbea4738b7b1b49e045a0982",
    email_5: "d-5c1af52bf0d74075bbfe4a5461e410d4",
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

// Enhanced lead scoring for newsletter signups
function calculateNewsletterLeadScore({
  rvType,
  biggestChallenge,
  timeline,
  montanaResident,
  email,
}) {
  let score = 30; // Base score for newsletter signup

  // RV Type scoring (premium RVs indicate higher budget)
  const rvScores = {
    "Class A": 25, // Highest investment RVs
    "Fifth Wheel": 20, // High-end trailers
    "Class C": 15, // Mid-range motorhomes
    "Travel Trailer": 10, // More budget-conscious
    "Class B": 12, // Compact but premium
    Other: 5, // Unknown category
  };
  score += rvScores[rvType] || 5;

  // Challenge scoring (indicates urgency and investment willingness)
  const challengeScores = {
    "Weight Management": 30, // Critical safety issue
    "Storage Bays": 25, // Major functionality problem
    Kitchen: 20, // Daily use area
    Bedroom: 15, // Personal comfort
    "Seasonal Gear": 10, // Less urgent
  };
  score += challengeScores[biggestChallenge] || 10;

  // Timeline scoring (urgency indicator)
  const timelineScores = {
    ASAP: 40, // Immediate need
    "Within Month": 30, // High urgency
    "2-3 Months": 15, // Planning ahead
    "Just Exploring": 5, // Information gathering
  };
  score += timelineScores[timeline] || 5;

  // Montana resident bonus (local service, Montana discount)
  if (montanaResident) {
    score += 15;
  }

  // Email domain analysis for professional emails
  if (
    email &&
    !email.includes("gmail") &&
    !email.includes("yahoo") &&
    !email.includes("hotmail")
  ) {
    score += 10; // Professional email domains suggest higher investment capacity
  }

  return Math.min(score, 100);
}

// Determine lead segment based on score
function getLeadSegment(score) {
  if (score >= 75) return "HOT";
  if (score >= 50) return "WARM";
  return "COLD";
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
    } = req.body;

    console.log(`📧 Newsletter signup: ${firstName} (${email})`);

    // Validate required fields
    if (!firstName || !email || !gdprConsent) {
      return res.status(400).json({
        error: "Missing required fields or GDPR consent",
      });
    }

    // Calculate server-side lead score for validation
    const serverScore = calculateNewsletterLeadScore({
      rvType,
      biggestChallenge,
      timeline,
      montanaResident,
      email,
    });

    // Use server score as authoritative
    const finalScore = serverScore;
    const segment = getLeadSegment(finalScore);

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

    // Create Airtable CRM record (disabled for testing)
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
        source: "Newsletter Signup",
        abTestVariation,
      });
    } catch (error) {
      console.log("⚠️ Airtable integration failed:");
      console.log("  Error message:", error.message);
      console.log("  Error response:", error.response?.data);
      console.log("  Status code:", error.response?.status);
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

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", templates: GUIDE_TEMPLATES });
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Guide delivery server running on http://localhost:${PORT}`);
console.log(`📧 Using updated template IDs (no more Sarah Mitchell!)`);
  console.log(`📧 SendGrid configured with templates:`);
  Object.entries(GUIDE_TEMPLATES).forEach(([style, id]) => {
    console.log(`   ${style}: ${id}`);
  });
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
      immediately: "ASAP",
      "within-month": "Within a month",
      "2-3-months": "Next 2-3 months",
      "just-exploring": "Just Exploring",
      // Form value mappings (what Squarespace forms actually send)
      asap: "ASAP",
      exploring: "Just Exploring",
      // Legacy mappings for backward compatibility
      ASAP: "ASAP",
      "Within Month": "Within a month",
      "2-3 Months": "Next 2-3 months",
      "Just Exploring": "Just Exploring",
    };

    // Map form values to Airtable options
    const rvTypeMapping = {
      "Class A Motorhome": "Class A",
      "Class B Motorhome": "Class B",
      "Class C Motorhome": "Class C",
      "Travel Trailer": "Travel Trailer",
      "Fifth Wheel": "Fifth Wheel",
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
    };

    const challengeMapping = {
      Storage: "Storage Bays",
      "Organization Systems": "Organization Systems",
      "Weight Management": "Weight Management",
      "Space Utilization": "Space Utilization",
      Downsizing: "Downsizing",
      Other: "Other",
      // Form value mappings (what Squarespace forms actually send)
      "storage-bays": "Storage Bays",
      "organization-systems": "Organization Systems",
      "weight-management": "Weight Management",
      "space-utilization": "Space Utilization",
      downsizing: "Downsizing",
      "seasonal-gear": "Seasonal Gear",
      kitchen: "Kitchen",
      bedroom: "Bedroom",
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
    const mappedChallenge =
      challengeMapping[biggestChallenge] || biggestChallenge || "Other";
    const mappedTimeline =
      timelineMapping[timeline] || timeline || "Just Exploring";
    const mappedAbTest = abTestMapping[abTestVariation] || "A";

    console.log(
      `🔧 Airtable mappings: RV("${rvType}"→"${mappedRvType}") Challenge("${biggestChallenge}"→"${mappedChallenge}") Timeline("${timeline}"→"${mappedTimeline}") ABTest("${abTestVariation}"→"${mappedAbTest}")`,
    );

    // Validate required fields exist in Airtable schema
    const airtableData = {
      fields: {
        Name: firstName, // Use "Name" not "First Name"
        Email: email,
        "RV Type": mappedRvType, // Map to Airtable options
        "Biggest Challenge": mappedChallenge, // Map to Airtable options
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

module.exports = app;
