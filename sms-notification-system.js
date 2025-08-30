#!/usr/bin/env node

/**
 * SMS Notification System for Chanel - Montana RV Organization
 * Integrates with Twilio for SMS notifications
 */

const twilio = require("twilio");
require("dotenv").config();

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const chanelPhone = process.env.CHANEL_PHONE_NUMBER || "+14062851525"; // Chanel's mobile number

const client = twilio(accountSid, authToken);

/**
 * Make phone call to Chanel for urgent situations
 */
async function callChanel(message, priority = "urgent") {
  console.log(`📞 CALL (DISABLED): ${message}`);
  console.log(`   Would call: ${chanelPhone}`);

  // Return mock success for now
  return { sid: "mock-call-" + Date.now() };
}

/**
 * Send SMS notification to Chanel (DISABLED - no Twilio phone number)
 */
async function sendSMSToChanel(message, priority = "normal") {
  const priorityEmojis = {
    high: "🚨",
    normal: "📱",
    low: "ℹ️",
  };

  console.log(`📱 SMS (DISABLED): ${priorityEmojis[priority]} ${message}`);
  console.log(`   Would send to: ${chanelPhone}`);

  // Return mock success for now
  return { sid: "mock-sms-" + Date.now() };
}

/**
 * Calendar appointment notifications
 */
const calendarNotifications = {
  // New appointment booked
  newAppointment: async (appointmentData) => {
    const { clientName, clientEmail, appointmentTime, appointmentType } =
      appointmentData;
    const message = `New ${appointmentType} booked!
📅 ${appointmentTime}
👤 ${clientName} (${clientEmail})
🔗 Check Calendly for details`;

    await sendSMSToChanel(message, "high");
  },

  // Appointment reminder (for Chanel)
  appointmentReminder: async (appointmentData) => {
    const { clientName, appointmentTime, timeUntil } = appointmentData;
    const message = `Reminder: ${appointmentType} with ${clientName} in ${timeUntil}
📅 ${appointmentTime}`;

    await sendSMSToChanel(message, "normal");
  },

  // No-show alert
  noShow: async (appointmentData) => {
    const { clientName, clientEmail } = appointmentData;
    const message = `No-show alert: ${clientName} (${clientEmail})
Follow-up sequence will be triggered automatically.`;

    await sendSMSToChanel(message, "normal");
  },
};

/**
 * Lead management notifications
 */
const leadNotifications = {
  // High-value lead (80+ score) - SMS + CALL
  highValueLead: async (leadData) => {
    const { firstName, email, leadScore, rvType, challenge } = leadData;
    const message = `🔥 HIGH-VALUE LEAD (Score: ${leadScore})
👤 ${firstName} - ${email}
🚐 ${rvType} | Challenge: ${challenge}
Consider immediate follow-up!`;

    // Send SMS first
    await sendSMSToChanel(message, "high");

    // For leads 90+ or consultation-ready, also call
    if (leadScore >= 90 || challenge?.toLowerCase().includes("ready")) {
      const callMessage = `High value lead alert: ${firstName} scored ${leadScore} points and needs immediate attention for ${challenge} in their ${rvType}`;
      await callChanel(callMessage);
    }
  },

  // Daily lead summary
  dailySummary: async (summaryData) => {
    const { newLeads, totalLeads, avgScore, appointments } = summaryData;
    const message = `📊 Daily Summary:
🆕 ${newLeads} new leads (${totalLeads} total)
📈 Avg score: ${avgScore}
📅 ${appointments} appointments booked`;

    await sendSMSToChanel(message, "low");
  },

  // Contact form submission
  contactForm: async (contactData) => {
    const { name, email, message } = contactData;
    const msg = `📝 New contact form:
👤 ${name} (${email})
💬 "${message.substring(0, 100)}${message.length > 100 ? "..." : ""}"`;

    await sendSMSToChanel(msg, "normal");
  },
};

/**
 * Business operation notifications
 */
const businessNotifications = {
  // Payment received
  paymentReceived: async (paymentData) => {
    const { clientName, amount, service } = paymentData;
    const message = `💰 Payment received: $${amount}
👤 ${clientName}
🛍️ ${service}`;

    await sendSMSToChanel(message, "normal");
  },

  // System error/issue
  systemAlert: async (errorData) => {
    const { error, system } = errorData;
    const message = `⚠️ System Alert: ${system}
❌ ${error}
Check logs immediately.`;

    await sendSMSToChanel(message, "high");
  },
};

module.exports = {
  sendSMSToChanel,
  callChanel,
  calendarNotifications,
  leadNotifications,
  businessNotifications,
};

// Example usage:
if (require.main === module) {
  // Test SMS
  sendSMSToChanel(
    "Test message from ClutterFreeSpaces automation system",
    "normal",
  )
    .then(() => console.log("Test SMS sent"))
    .catch(console.error);
}
