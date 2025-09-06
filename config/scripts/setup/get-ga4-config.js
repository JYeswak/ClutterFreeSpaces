console.log("📊 Google Analytics 4 Setup Guide\n");

console.log("🔧 To get your GA4 Measurement ID and API Secret:");
console.log("1. Go to https://analytics.google.com/");
console.log("2. Select your ClutterFreeSpaces property");
console.log("3. Click Admin (gear icon in bottom left)");
console.log("4. Under Property, click 'Data Streams'");
console.log("5. Click on your web stream");
console.log(
  "6. Your MEASUREMENT ID is shown at the top (format: G-XXXXXXXXXX)",
);
console.log("\n🔑 To create an API Secret:");
console.log("7. Scroll down to 'Measurement Protocol API secrets'");
console.log("8. Click 'Create' to generate a new secret");
console.log("9. Give it a nickname like 'ClutterFreeSpaces API'");
console.log("10. Copy the secret value");

console.log("\n📝 Add these to your .env file:");
console.log("GA4_MEASUREMENT_ID=G-XXXXXXXXXX");
console.log("GA4_API_SECRET=your_api_secret_here");

console.log("\n✅ Once configured, you can track:");
console.log("• Lead generation events");
console.log("• Booking conversions");
console.log("• Review request campaigns");
console.log("• Email engagement");
console.log("• Website interactions");

console.log("\n🚀 Test with: node scripts/test/test-ga4-tracking.js");
