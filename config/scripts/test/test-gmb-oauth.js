require("dotenv").config({ path: "../../.env" });
const authService = require("../../google-services/auth-oauth");

async function testGMBOAuth() {
  console.log("🧪 Testing GMB API with OAuth...\n");

  try {
    // Test authentication
    const auth = await authService.initialize();

    if (!authService.isAuthenticated()) {
      console.log("❌ Not authenticated! Please run:");
      console.log("   node scripts/setup/oauth-setup.js");
      return;
    }

    console.log("✅ OAuth authentication successful!");

    // Test GMB API access
    console.log("📍 Testing GMB location access...");

    const mybusiness = await authService.createAuthenticatedRequest(
      "mybusinessbusinessinformation",
      "v1",
    );

    const response = await mybusiness.accounts.locations.list({
      parent: "accounts/-",
    });

    if (response.data.locations && response.data.locations.length > 0) {
      console.log(
        `✅ Found ${response.data.locations.length} GMB location(s):`,
      );

      response.data.locations.forEach((location, index) => {
        const locationId = location.name.split("/").pop();
        console.log(
          `\n${index + 1}. ${location.title || location.displayName}`,
        );
        console.log(`   Location ID: ${locationId}`);
        console.log(
          `   Address: ${location.storefrontAddress?.addressLines?.[0] || "Not set"}`,
        );
        console.log(`   Phone: ${location.primaryPhone || "Not set"}`);
        console.log(
          `   Categories: ${location.primaryCategory?.displayName || "Not set"}`,
        );

        if (index === 0) {
          console.log(`\n💡 Add this to your .env file:`);
          console.log(`   GMB_LOCATION_ID=${locationId}`);
        }
      });

      console.log("\n🎉 GMB API is working correctly!");
      console.log("🚀 Your automation system now has full GMB access!");
    } else {
      console.log(
        "⚠️  No GMB locations found. Make sure you have claimed your business.",
      );
    }
  } catch (error) {
    console.error("❌ Error testing GMB OAuth:", error.message);

    if (error.message.includes("Login Required") || error.status === 401) {
      console.log("\n🔧 Authentication issue. Try:");
      console.log("1. Run: node scripts/setup/oauth-setup.js");
      console.log("2. Make sure you accepted all permissions");
      console.log("3. Your Google account must own/manage the GMB listing");
    }
  }
}

testGMBOAuth();
