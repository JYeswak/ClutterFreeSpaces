console.log("🚂 ClutterFreeSpaces Railway OAuth Setup\n");

console.log(
  "🎯 Your Railway URL: https://clutterfreespaces-production.up.railway.app",
);

console.log("\n📋 STEP 1: OAuth Consent Screen");
console.log(
  "✅ Go to: https://console.cloud.google.com/apis/credentials/consent",
);
console.log("✅ Project: automation-471304");
console.log("✅ App name: ClutterFreeSpaces Automation");
console.log("✅ User support email: joshua@clutter-free-spaces.com");

console.log("\n📋 STEP 2: Create OAuth Credentials");
console.log("✅ Go to: https://console.cloud.google.com/apis/credentials");
console.log("✅ Create Credentials → OAuth client ID");
console.log("✅ Application type: Web application");
console.log("✅ Name: ClutterFreeSpaces Web Client");

console.log("\n🔗 Authorized redirect URIs (copy these exactly):");
console.log("http://localhost:3000/auth/google/callback");
console.log("http://localhost:3333/auth/google/callback");
console.log(
  "https://clutterfreespaces-production.up.railway.app/auth/google/callback",
);

console.log("\n📋 STEP 3: Deploy to Railway");
console.log("1. Save oauth-credentials.json in config/ directory");
console.log("2. Commit and push to git:");
console.log("   git add config/oauth-credentials.json");
console.log("   git commit -m 'Add OAuth credentials for Google API access'");
console.log("   git push");
console.log("3. Railway will auto-deploy");

console.log("\n📋 STEP 4: Authenticate in Production");
console.log(
  "1. Visit: https://clutterfreespaces-production.up.railway.app/auth/google",
);
console.log("2. Sign in with your Google account");
console.log("3. Accept the permissions");
console.log("4. You should see: 'OAuth authentication successful!'");

console.log("\n🧪 STEP 5: Verify OAuth Status");
console.log(
  "Visit: https://clutterfreespaces-production.up.railway.app/auth/status",
);
console.log("Expected response:");
console.log(
  '{\n  "authenticated": true,\n  "method": "OAuth",\n  "message": "Full Google API access available"\n}',
);

console.log("\n🎉 After OAuth Setup:");
console.log("• Full GMB API access for review automation");
console.log("• Automated review responses");
console.log("• Business information updates");
console.log("• Enhanced analytics tracking");

console.log("\n🔧 If Something Goes Wrong:");
console.log("• Check Railway logs for errors");
console.log("• Verify redirect URIs match exactly");
console.log("• Ensure oauth-credentials.json is deployed");
console.log("• System falls back to API key if OAuth fails");

console.log("\n✅ Ready? Start with the Google Cloud Console steps above!");
