const readline = require("readline");
const authService = require("../../google-services/auth-oauth");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function setupOAuth() {
  console.log("🔐 Google OAuth Setup for ClutterFreeSpaces\n");

  try {
    // Check if credentials file exists
    const credentials = await authService.loadCredentials();
    if (!credentials) {
      console.log("❌ OAuth credentials not found!");
      console.log("\n📋 Please complete these steps first:");
      console.log(
        "1. Download oauth-credentials.json from Google Cloud Console",
      );
      console.log("2. Place it in the config/ directory");
      console.log("3. Run this script again");
      process.exit(1);
    }

    console.log("✅ OAuth credentials found!");

    // Check if already authenticated
    if (authService.isAuthenticated()) {
      console.log("✅ Already authenticated! GMB API should work.");
      process.exit(0);
    }

    console.log("\n🌐 Starting OAuth flow...");

    // Get authorization URL
    const authUrl = await authService.getAuthUrl();

    console.log("\n📋 Follow these steps:");
    console.log("1. Open this URL in your browser:");
    console.log(`\n${authUrl}\n`);
    console.log("2. Sign in with your Google account");
    console.log("3. Accept the permissions");
    console.log("4. Copy the authorization code from the browser");

    // Get authorization code from user
    rl.question("\n🔑 Enter the authorization code: ", async (code) => {
      try {
        const tokens = await authService.getAccessToken(code);
        console.log("\n✅ OAuth setup complete!");
        console.log("🎉 You now have full access to Google APIs");
        console.log("\n🧪 Test your setup with:");
        console.log("   node scripts/test/test-gmb-oauth.js");

        rl.close();
      } catch (error) {
        console.error("\n❌ Error during OAuth setup:", error.message);
        rl.close();
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ Error during OAuth setup:", error.message);
    rl.close();
    process.exit(1);
  }
}

setupOAuth();
