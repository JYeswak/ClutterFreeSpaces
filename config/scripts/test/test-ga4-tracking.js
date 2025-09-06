require("dotenv").config({ path: "../../.env" });
const ga4Service = require("../../config/google-services/ga4-service");

async function testGA4Tracking() {
  console.log("🧪 Testing GA4 Measurement Protocol...\n");

  if (!process.env.GA4_MEASUREMENT_ID || !process.env.GA4_API_SECRET) {
    console.log("❌ GA4 configuration missing!");
    console.log("Please run: node scripts/setup/get-ga4-config.js");
    console.log(
      "Then update your .env file with GA4_MEASUREMENT_ID and GA4_API_SECRET",
    );
    return;
  }

  try {
    // Test lead generation tracking
    console.log("📊 Testing lead generation tracking...");
    const leadResult = await ga4Service.trackLeadGeneration({
      client_id: ga4Service.generateClientId(),
      email: "test@example.com",
      name: "Test User",
      source: "website",
      medium: "organic",
      service_type: "organization",
      location: "Missoula, MT",
      estimated_value: 800,
      lead_score: 75,
    });

    if (leadResult.success) {
      console.log("✅ Lead generation tracking successful!");
    } else {
      console.log("❌ Lead generation tracking failed:", leadResult.error);
    }

    // Test booking conversion tracking
    console.log("\n💰 Testing booking conversion tracking...");
    const bookingResult = await ga4Service.trackBookingConversion({
      client_id: ga4Service.generateClientId(),
      email: "test@example.com",
      booking_id: "test_booking_123",
      service_value: 500,
    });

    if (bookingResult.success) {
      console.log("✅ Booking conversion tracking successful!");
    } else {
      console.log(
        "❌ Booking conversion tracking failed:",
        bookingResult.error,
      );
    }

    // Test review request tracking
    console.log("\n⭐ Testing review request tracking...");
    const reviewResult = await ga4Service.trackReviewGenerated({
      client_id: ga4Service.generateClientId(),
      job_id: "job_123",
      client_name: "Test Client",
      service_type: "whole-house",
      email_sent: true,
    });

    if (reviewResult.success) {
      console.log("✅ Review request tracking successful!");
    } else {
      console.log("❌ Review request tracking failed:", reviewResult.error);
    }

    console.log("\n🎉 GA4 tracking tests completed!");
    console.log("Check your GA4 Real-time reports to see the events.");
  } catch (error) {
    console.error("❌ Error during GA4 testing:", error.message);
  }
}

testGA4Tracking();
