#!/usr/bin/env node

/**
 * Setup Guide for Airtable Fields - Review & Referral System
 * Instructions for adding required fields to the "Leads" table
 */

console.log("📋 AIRTABLE SETUP GUIDE - ClutterFreeSpaces");
console.log("=".repeat(60));

console.log("\n🎯 REVIEW SYSTEM FIELDS");
console.log("Add these fields to your 'Leads' table in Airtable:\n");

const reviewFields = [
  {
    name: "Review Requested",
    type: "Checkbox",
    description: "Tracks if review emails started",
  },
  {
    name: "Review Received",
    type: "Checkbox",
    description: "Manual: Mark when customer leaves review",
  },
  {
    name: "Review Request Date",
    type: "Date",
    description: "When review sequence started",
  },
  {
    name: "Service Completion Date",
    type: "Date",
    description: "When service was finished",
  },
  {
    name: "Day 3 Email Scheduled",
    type: "Date",
    description: "Scheduled send date",
  },
  {
    name: "Day 10 Email Scheduled",
    type: "Date",
    description: "Scheduled send date",
  },
  {
    name: "Day 30 Email Scheduled",
    type: "Date",
    description: "Scheduled send date",
  },
  { name: "Day 3 Email Sent", type: "Date", description: "Actual send date" },
  { name: "Day 10 Email Sent", type: "Date", description: "Actual send date" },
  { name: "Day 30 Email Sent", type: "Date", description: "Actual send date" },
  {
    name: "Google Review URL",
    type: "URL",
    description: "Link to their specific review (optional)",
  },
  {
    name: "Review Rating",
    type: "Number",
    description: "1-5 star rating (optional)",
  },
  {
    name: "Review Text",
    type: "Long text",
    description: "Copy of review content (optional)",
  },
];

reviewFields.forEach((field, index) => {
  console.log(`${index + 1}. ${field.name} (${field.type})`);
  console.log(`   Purpose: ${field.description}\n`);
});

console.log("\n🎯 REFERRAL SYSTEM FIELDS");
console.log("Add these additional fields:\n");

const referralFields = [
  {
    name: "Referred By",
    type: "Text",
    description: "Name of person who made referral",
  },
  { name: "Referral Code", type: "Text", description: "e.g., 'Sarah30'" },
  {
    name: "Referral Status",
    type: "Single select",
    description: "Options: Pending, Credited, Used",
  },
  {
    name: "Referral Credit Amount",
    type: "Number",
    description: "Dollar amount of credit earned",
  },
  {
    name: "Referral Date",
    type: "Date",
    description: "When referral was made",
  },
  {
    name: "Credit Used Date",
    type: "Date",
    description: "When credit was applied to service",
  },
  {
    name: "Referrer Email",
    type: "Email",
    description: "To send thank you emails",
  },
];

referralFields.forEach((field, index) => {
  console.log(`${index + 1}. ${field.name} (${field.type})`);
  console.log(`   Purpose: ${field.description}`);
  if (field.name === "Referral Status") {
    console.log(`   Options: Pending, Credited, Used, Expired`);
  }
  console.log("");
});

console.log("\n⚙️  SINGLE SELECT FIELD OPTIONS");
console.log("For 'Referral Status' field, create these options:");
console.log("• Pending (when referral is made but not yet credited)");
console.log("• Credited (when referrer gets $30 credit)");
console.log("• Used (when referrer uses their credit)");
console.log("• Expired (if credits expire after 1 year)");

console.log("\n🔧 AUTOMATION SETUP");
console.log("After adding fields, you can:");
console.log("1. Run review automation: node review-automation-system.js");
console.log("2. Set up cron job for daily checks");
console.log("3. Create Airtable webhook for instant triggering");

console.log("\n📊 TRACKING DASHBOARD");
console.log("Consider creating views in Airtable:");
console.log("• 'New Clients' - Status = 'Client' AND Review Requested ≠ TRUE");
console.log(
  "• 'Review Pending' - Review Requested = TRUE AND Review Received ≠ TRUE",
);
console.log("• 'Reviews Received' - Review Received = TRUE");
console.log("• 'Referral Credits' - Referral Status = 'Credited'");

console.log("\n🎉 NEXT STEPS");
console.log("1. Add all fields to Airtable 'Leads' table");
console.log("2. Test with a sample client record");
console.log("3. Run: node review-automation-system.js test");
console.log("4. Set up daily automation (cron job or webhook)");
console.log("5. Monitor and adjust email timing as needed");

console.log("\n✅ Setup complete! Your review & referral system is ready.");
