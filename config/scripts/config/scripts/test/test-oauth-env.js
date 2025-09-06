require("dotenv").config({ path: "../../../.env" });

// Debug: Let's see what environment variables are loaded
console.log("🔍 Debug: Environment check");
console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("Current working directory:", process.cwd());

console.log("🧪 Testing OAuth Environment Variables\n");

// Check environment variables
const requiredVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  RAILWAY_URL: process.env.RAILWAY_URL,
};

console.log("✅ Environment Variables Check:");
let allGood = true;
for (const [name, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`   ✅ ${name}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`   ❌ ${name}: Missing`);
    allGood = false;
  }
}

if (!allGood) {
  console.log("\n❌ Missing required OAuth environment variables");
  process.exit(1);
}

// Test OAuth service initialization
console.log("\n🔧 Testing OAuth Service:");
try {
  const authService = require("../../google-services/auth-oauth");

  console.log("✅ OAuth service loaded successfully");
  console.log(
    `✅ Redirect URI: ${process.env.RAILWAY_URL}/auth/google/callback`,
  );

  // Test initialization (this will set up the OAuth client)
  authService
    .initialize()
    .then(() => {
      console.log("✅ OAuth client initialized");

      // Generate auth URL to verify it works
      return authService.getAuthUrl();
    })
    .then((authUrl) => {
      console.log("✅ OAuth URL generated successfully");
      console.log("\n🌐 OAuth Flow Ready!");
      console.log("To authenticate, visit:");
      console.log(
        `https://clutterfreespaces-production.up.railway.app/auth/google`,
      );

      console.log("\n🎉 OAuth setup is working correctly!");
      console.log(
        "Deploy to Railway and visit the auth URL to complete setup.",
      );
    })
    .catch((error) => {
      console.error("❌ OAuth initialization error:", error.message);
    });
} catch (error) {
  console.error("❌ Error loading OAuth service:", error.message);
}
