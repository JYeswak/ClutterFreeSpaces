require("dotenv").config({ path: "../../.env" });
const gmbService = require("../../google-services/gmb-service");

console.log("🔍 Finding your Google My Business location...\n");

gmbService
  .getLocationInfo()
  .then((locations) => {
    if (Array.isArray(locations)) {
      console.log("📍 Available GMB locations:");
      locations.forEach((location, index) => {
        console.log(
          `\n${index + 1}. ${location.title || location.displayName || "Unnamed Location"}`,
        );
        console.log(
          `   Location ID: ${location.name?.split("/").pop() || "Not found"}`,
        );
        console.log(
          `   Address: ${location.storefrontAddress?.addressLines?.[0] || "Not set"}`,
        );
        console.log(`   Phone: ${location.primaryPhone || "Not set"}`);
        console.log(
          `   Categories: ${location.primaryCategory?.displayName || "Not set"}`,
        );
      });

      console.log(
        "\n💡 Copy the Location ID above and add it to your .env file:",
      );
      console.log("   GMB_LOCATION_ID=your_location_id_here");
    } else {
      console.log("📍 Single location found:");
      console.log(JSON.stringify(locations, null, 2));
    }
  })
  .catch((error) => {
    console.error("❌ Error fetching GMB location:", error.message);
    console.log("\n🔧 Troubleshooting steps:");
    console.log(
      "1. Make sure you've claimed your business on Google My Business",
    );
    console.log("2. Verify your Google Cloud API key has GMB permissions");
    console.log(
      "3. Enable the My Business Business Information API in Google Cloud Console",
    );
    console.log(
      "4. Try again in a few minutes - API changes can take time to propagate",
    );
  });
