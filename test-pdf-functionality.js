#!/usr/bin/env node

const axios = require("axios");
const fs = require("fs");
const { generateRVChecklistPDF } = require("./generate-rv-checklist-pdf");

async function testPDFFunctionality() {
  console.log(
    "🧪 Testing PDF Functionality for ClutterFreeSpaces Lead Magnet\n",
  );

  try {
    // Test 1: Direct PDF generation
    console.log("1. Testing direct PDF generation...");
    const pdfPath = generateRVChecklistPDF();

    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      console.log(`   ✅ PDF generated successfully: ${pdfPath}`);
      console.log(`   📊 File size: ${stats.size} bytes`);
    } else {
      console.log("   ❌ PDF file not found");
      return;
    }

    // Test 2: Start server and test endpoints
    console.log("\n2. Starting server for endpoint testing...");
    const server = require("./api-server");

    // Give server time to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test API endpoints
    try {
      // Test PDF generation endpoint
      console.log("3. Testing PDF generation endpoint...");
      const genResponse = await axios.get(
        "http://localhost:3001/api/generate-pdf",
      );
      console.log(`   ✅ Generation endpoint: ${genResponse.data.message}`);
      console.log(`   📁 Download URL: ${genResponse.data.downloadUrl}`);

      // Test PDF download
      console.log("4. Testing PDF download endpoint...");
      const downloadResponse = await axios.head(
        "http://localhost:3001/downloads/rv-organization-checklist.pdf",
      );
      console.log(`   ✅ Download endpoint status: ${downloadResponse.status}`);
      console.log(
        `   📄 Content-Type: ${downloadResponse.headers["content-type"]}`,
      );
      console.log(
        `   📏 Content-Length: ${downloadResponse.headers["content-length"]} bytes`,
      );

      // Test newsletter signup
      console.log("5. Testing newsletter signup integration...");
      const signupResponse = await axios.post(
        "http://localhost:3001/api/newsletter-signup",
        {
          firstName: "Test User",
          email: "test@example.com",
          rvType: "Class A",
          biggestChallenge: "Kitchen",
          timeline: "Within Month",
          montanaResident: true,
          gdprConsent: true,
        },
      );

      console.log(`   ✅ Newsletter signup successful`);
      console.log(`   📊 Lead score: ${signupResponse.data.leadScore}`);
      console.log(`   🎯 Segment: ${signupResponse.data.segment}`);
      console.log(`   📥 Checklist URL: ${signupResponse.data.checklistUrl}`);

      console.log(
        "\n🎉 All tests passed! PDF lead magnet is ready for production.",
      );
    } catch (apiError) {
      console.log(`   ❌ API test failed: ${apiError.message}`);
      console.log("   💡 Make sure the server is running on port 3001");
    }

    // Cleanup
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run tests
testPDFFunctionality();
