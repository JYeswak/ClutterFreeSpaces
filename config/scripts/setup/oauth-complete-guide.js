console.log("🔐 Complete Google OAuth Setup Guide\n");

console.log("📋 STEP 1: Configure OAuth Consent Screen");
console.log(
  "1. Go to: https://console.cloud.google.com/apis/credentials/consent",
);
console.log("2. Make sure project 'automation-471304' is selected");
console.log("3. Choose 'External' user type");
console.log("4. Fill out the consent screen:");
console.log(`
   App Information:
   ├── App name: ClutterFreeSpaces Automation
   ├── User support email: joshua@clutter-free-spaces.com  
   ├── App domain: clutter-free-spaces.com
   └── Developer contact: joshua@clutter-free-spaces.com
`);

console.log("5. Add these OAuth scopes:");
console.log("   ✅ https://www.googleapis.com/auth/business.manage");
console.log("   ✅ https://www.googleapis.com/auth/analytics.readonly");
console.log("   ✅ https://www.googleapis.com/auth/analytics.edit");
console.log("   ✅ https://www.googleapis.com/auth/spreadsheets");
console.log("   ✅ https://www.googleapis.com/auth/drive.readonly");

console.log("\n6. Add test user: joshua@clutter-free-spaces.com");

console.log("\n🔑 STEP 2: Create OAuth Credentials");
console.log("1. Go to: https://console.cloud.google.com/apis/credentials");
console.log("2. Click 'Create Credentials' → 'OAuth client ID'");
console.log("3. Choose 'Web application'");
console.log("4. Name: 'ClutterFreeSpaces Web Client'");
console.log("5. Add Authorized redirect URIs:");
console.log("   For Local Testing:");
console.log("   • http://localhost:3000/auth/google/callback");
console.log("   • http://localhost:3333/auth/google/callback");
console.log("   ");
console.log("   For Production (Railway):");
console.log(
  "   • https://clutterfreespaces-production.up.railway.app/auth/google/callback",
);
console.log("6. Click 'Create'");
console.log("7. Download the JSON file");
console.log("8. Save it as 'oauth-credentials.json' in your config/ directory");

console.log("\n🚀 STEP 3: Run OAuth Setup");
console.log("1. After saving oauth-credentials.json, run:");
console.log("   node scripts/setup/oauth-setup.js");
console.log("2. Follow the browser authentication flow");
console.log("3. Copy the authorization code back to the terminal");

console.log("\n🧪 STEP 4: Test OAuth");
console.log("Run: node scripts/test/test-gmb-oauth.js");
console.log("This will verify GMB API access and show your location ID");

console.log("\n✅ After OAuth Setup:");
console.log("• Full GMB API access (reviews, responses, business info)");
console.log("• Google Analytics API access");
console.log("• Google Sheets and Drive access");
console.log("• Automatic token refresh");

console.log("\n🔒 Security Notes:");
console.log("• oauth-credentials.json contains your app credentials");
console.log("• oauth-token.json contains your access tokens");
console.log("• Both files should be in .gitignore (already configured)");
console.log("• Tokens automatically refresh every hour");

console.log("\n📞 Need Help?");
console.log(
  "If you get stuck, the system will still work with API key authentication.",
);
console.log("OAuth just unlocks the full GMB review management features.");

console.log("\n🎉 Ready to go? Start with Step 1 above!");
