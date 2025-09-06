#!/usr/bin/env node

/**
 * Test script to validate resource name mappings
 * Ensures no "undefined" values appear in email subjects or content
 */

// Extract the mapping function logic from api-server.js
function getResourceDisplayName(requestedResource) {
  const resourceDisplayNames = {
    // Frontend values (sent from forms)
    "Kitchen Guide": "Kitchen Organization Essentials Guide",
    "Seasonal Guide": "Montana Seasonal Gear Organization Guide",
    "Daily Routine": "Daily Maintenance Routine Guide",
    "Closet Guide": "Closet & Bedroom Organization Guide",
    "Office Guide": "Home Office Setup Guide",
    "Mudroom Guide": "Mudroom & Entryway Solutions Guide",
    "All Guides": "Complete Organization Bundle",

    // File-based identifiers (backend/download URLs)
    "kitchen-organization-essentials": "Kitchen Organization Essentials Guide",
    "montana-seasonal-gear-guide": "Montana Seasonal Gear Organization Guide",
    "daily-maintenance-routine": "Daily Maintenance Routine Guide",
    "closet-bedroom-organization": "Closet & Bedroom Organization Guide",
    "home-office-setup": "Home Office Setup Guide",
    "mudroom-entryway-solutions": "Mudroom & Entryway Solutions Guide",
    "printable-labels-templates": "Printable Labels & Templates",
    "organization-checklists": "Organization Checklists",
    "planning-worksheets": "Planning Worksheets",

    // Legacy/alternative mappings for robustness
    "Labels & Templates": "Printable Labels & Templates",
    "Organization Checklists": "Organization Checklists",
    "Planning Worksheets": "Planning Worksheets",
    kitchen: "Kitchen Organization Essentials Guide",
    seasonal: "Montana Seasonal Gear Organization Guide",
    daily: "Daily Maintenance Routine Guide",
    closet: "Closet & Bedroom Organization Guide",
    office: "Home Office Setup Guide",
    mudroom: "Mudroom & Entryway Solutions Guide",
  };

  // Handle null/undefined/empty cases gracefully
  if (
    !requestedResource ||
    requestedResource === "null" ||
    requestedResource === "undefined"
  ) {
    return "Organization Resources";
  }
  return resourceDisplayNames[requestedResource] || requestedResource;
}

function calculateResourceLeadScore(requestedResource) {
  let score = 40;

  const resourceScores = {
    // Frontend form values
    "Kitchen Guide": 10,
    "Seasonal Guide": 15,
    "Daily Routine": 20,
    "Closet Guide": 12,
    "Office Guide": 18,
    "Mudroom Guide": 16,
    "Labels & Templates": 8,
    "Organization Checklists": 12,
    "Planning Worksheets": 15,
    "All Guides": 25,

    // File-based identifiers
    "kitchen-organization-essentials": 10,
    "montana-seasonal-gear-guide": 15,
    "daily-maintenance-routine": 20,
    "closet-bedroom-organization": 12,
    "home-office-setup": 18,
    "mudroom-entryway-solutions": 16,
    "printable-labels-templates": 8,
    "organization-checklists": 12,
    "planning-worksheets": 15,

    // Short identifiers for robustness
    kitchen: 10,
    seasonal: 15,
    daily: 20,
    closet: 12,
    office: 18,
    mudroom: 16,
  };

  score += resourceScores[requestedResource] || 10;
  return score;
}

// Test cases - all known frontend values that could be sent
const testCases = [
  // Primary frontend form values
  "Kitchen Guide",
  "Seasonal Guide",
  "Daily Routine",
  "Closet Guide",
  "Office Guide",
  "Mudroom Guide",
  "All Guides",

  // Additional resource types that may be added
  "Labels & Templates",
  "Organization Checklists",
  "Planning Worksheets",

  // File-based identifiers (if they somehow get used)
  "kitchen-organization-essentials",
  "montana-seasonal-gear-guide",
  "daily-maintenance-routine",
  "closet-bedroom-organization",
  "home-office-setup",
  "mudroom-entryway-solutions",
  "printable-labels-templates",
  "organization-checklists",
  "planning-worksheets",

  // Short forms
  "kitchen",
  "seasonal",
  "daily",
  "closet",
  "office",
  "mudroom",

  // Test unknown/unmapped values
  "Unknown Resource",
  "Test Value",
  null,
  undefined,
  "",
];

console.log("🧪 Testing Resource Name Mapping");
console.log("=".repeat(50));

let passCount = 0;
let failCount = 0;

testCases.forEach((testCase) => {
  const displayName = getResourceDisplayName(testCase);
  const leadScore = calculateResourceLeadScore(testCase);

  // Check for undefined or problematic values
  const hasUndefined =
    displayName === undefined ||
    displayName === null ||
    displayName.includes("undefined");
  const isEmpty = displayName === "";
  const isProblematic = hasUndefined || isEmpty;

  const status = isProblematic ? "❌ FAIL" : "✅ PASS";

  if (isProblematic) {
    failCount++;
  } else {
    passCount++;
  }

  console.log(
    `${status} | Input: "${testCase}" -> Display: "${displayName}" | Score: ${leadScore}`,
  );
});

console.log("=".repeat(50));
console.log(`📊 Test Results: ${passCount} passed, ${failCount} failed`);

// Test email subject generation
console.log("\n📧 Email Subject Testing");
console.log("=".repeat(50));

[
  "Kitchen Guide",
  "Seasonal Guide",
  "Daily Routine",
  "All Guides",
  "Unknown Value",
].forEach((resource) => {
  const displayName = getResourceDisplayName(resource);
  const emailSubject = `Your ${displayName} + Bonus Resources`;

  const hasUndefined = emailSubject.includes("undefined");
  const status = hasUndefined ? "❌ FAIL" : "✅ PASS";

  console.log(`${status} | Subject: "${emailSubject}"`);
});

console.log("\n🎉 Resource mapping test complete!");

if (failCount === 0) {
  console.log(
    "✅ All tests passed - no 'undefined' values will appear in emails",
  );
  process.exit(0);
} else {
  console.log(`❌ ${failCount} tests failed - fix these mappings`);
  process.exit(1);
}
