console.log("🚂 Finding Your Railway URL\n");

console.log("📋 Step 1: Find Your Railway URL");
console.log("1. Go to: https://railway.app/dashboard");
console.log("2. Click on your ClutterFreeSpaces project");
console.log("3. Look for the 'Deployments' or 'Domains' section");
console.log("4. Your URL will look like:");
console.log("   https://clutterfreespaces-production-XXXX.up.railway.app");
console.log("   OR");
console.log(
  "   https://your-custom-domain.com (if you set up a custom domain)",
);

console.log("\n🔗 OAuth Redirect URLs to Add:");
console.log("Replace YOUR-RAILWAY-URL with your actual Railway URL:");
console.log("");
console.log("Local Testing:");
console.log("• http://localhost:3000/auth/google/callback");
console.log("• http://localhost:3333/auth/google/callback");
console.log("");
console.log("Production:");
console.log("• https://YOUR-RAILWAY-URL/auth/google/callback");

console.log("\n📝 Example:");
console.log(
  "If your Railway URL is: https://clutterfreespaces-prod-a1b2.up.railway.app",
);
console.log(
  "Then add: https://clutterfreespaces-prod-a1b2.up.railway.app/auth/google/callback",
);

console.log("\n✅ After adding redirect URLs:");
console.log("1. Download the OAuth credentials JSON");
console.log("2. Save as oauth-credentials.json in config/");
console.log("3. Deploy to Railway");
console.log("4. Visit: https://YOUR-RAILWAY-URL/auth/google");
console.log("5. Complete OAuth flow");

console.log("\n🧪 Test OAuth Status:");
console.log("Visit: https://YOUR-RAILWAY-URL/auth/status");
console.log('Should show: { "authenticated": true, "method": "OAuth" }');
