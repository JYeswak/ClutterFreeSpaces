#!/usr/bin/env node

/**
 * Calendly Webhook Handler for Chanel's Appointment Notifications
 * Handles calendar events and triggers email/SMS notifications
 */

const express = require("express");
const {
  calendarNotifications,
  leadNotifications,
} = require("./sms-notification-system");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// Configure SendGrid
sgMail.setApiKey(process.env.SendGrid_API_Key);

/**
 * Send email notification to Chanel about new appointment
 */
async function sendEmailNotificationToChanel(appointmentData) {
  const {
    clientName,
    clientEmail,
    appointmentTime,
    appointmentType,
    location,
    questions,
  } = appointmentData;

  const msg = {
    to: "chanel@clutter-free-spaces.com", // Chanel's email
    from: {
      email: "notifications@clutter-free-spaces.com",
      name: "ClutterFreeSpaces Notifications",
    },
    subject: `🗓️ New ${appointmentType} Appointment Booked`,
    html: `
      <h2>New Appointment Notification</h2>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📅 Appointment Details</h3>
        <p><strong>Client:</strong> ${clientName}</p>
        <p><strong>Email:</strong> ${clientEmail}</p>
        <p><strong>Type:</strong> ${appointmentType}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Location:</strong> ${location}</p>
        
        ${
          questions
            ? `
        <h3>💭 Client Questions/Notes</h3>
        <p style="background: white; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
          ${questions}
        </p>
        `
            : ""
        }
        
        <h3>🚀 Recommended Pre-Call Actions</h3>
        <ul>
          <li>Review client's quiz results (if available)</li>
          <li>Check RV type: Look for specific ${appointmentData.rvType || "RV"} challenges</li>
          <li>Prepare Montana-specific solutions</li>
          <li>Have consultation checklist ready</li>
        </ul>
        
        <div style="margin-top: 25px;">
          <a href="https://calendly.com/chanelnbasolo" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View in Calendly
          </a>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email notification sent to Chanel");
  } catch (error) {
    console.error("❌ Failed to send email notification:", error);
  }
}

/**
 * Process Calendly webhook events
 */
function processCalendlyWebhook(eventType, payload) {
  const event = payload.payload;

  switch (eventType) {
    case "invitee.created":
      handleNewAppointment(event);
      break;
    case "invitee.canceled":
      handleAppointmentCancellation(event);
      break;
    default:
      console.log(`ℹ️ Unhandled event type: ${eventType}`);
  }
}

/**
 * Handle new appointment booking
 */
async function handleNewAppointment(event) {
  const invitee = event.invitee;
  const eventDetails = event.event;

  const appointmentData = {
    clientName: invitee.name,
    clientEmail: invitee.email,
    appointmentTime: new Date(eventDetails.start_time).toLocaleString("en-US", {
      timeZone: "America/Denver", // Mountain Time for Montana
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    appointmentType: eventDetails.event_type.name,
    location: eventDetails.location?.location || "Phone/Video Call",
    questions:
      invitee.questions_and_responses
        ?.map((q) => `${q.question}: ${q.response}`)
        .join("\\n") || null,
  };

  console.log("📅 New appointment booked:", appointmentData);

  // Send both email and SMS notifications
  await Promise.all([
    sendEmailNotificationToChanel(appointmentData),
    calendarNotifications.newAppointment(appointmentData),
  ]);

  // If this is a high-value client (from our system), send additional alert
  // This would require checking against our Airtable/database
  // For now, we'll trigger for consultation calls
  if (appointmentData.appointmentType.toLowerCase().includes("consultation")) {
    await calendarNotifications.newAppointment({
      ...appointmentData,
      priority: "high",
    });
  }
}

/**
 * Handle appointment cancellation
 */
async function handleAppointmentCancellation(event) {
  const invitee = event.invitee;
  const eventDetails = event.event;

  const cancellationData = {
    clientName: invitee.name,
    clientEmail: invitee.email,
    appointmentTime: new Date(eventDetails.start_time).toLocaleString(),
    appointmentType: eventDetails.event_type.name,
    reason: event.cancellation?.reason || "No reason provided",
  };

  console.log("❌ Appointment canceled:", cancellationData);

  // Send notification to Chanel
  const message = `📅 Appointment Canceled
👤 ${cancellationData.clientName} (${cancellationData.clientEmail})
🕒 Was scheduled for: ${cancellationData.appointmentTime}
📝 Reason: ${cancellationData.reason}`;

  await calendarNotifications.sendSMSToChanel(message, "normal");
}

/**
 * Set up appointment reminders (would be called by a scheduler like cron)
 */
async function sendAppointmentReminders() {
  // This would integrate with Calendly API to get upcoming appointments
  // For now, this is a placeholder for the reminder system
  console.log("🔔 Checking for appointment reminders...");

  // Would query upcoming appointments and send reminders:
  // - 24 hours before
  // - 2 hours before
  // - Post-appointment follow-up
}

/**
 * Daily summary report for Chanel
 */
async function sendDailySummary() {
  // This would be called by a daily cron job
  try {
    // In production, this would query your databases/APIs
    const summaryData = {
      newLeads: 0, // Query from Airtable/database
      totalLeads: 0,
      avgScore: 0,
      appointments: 0, // Query from Calendly API
    };

    await leadNotifications.dailySummary(summaryData);
  } catch (error) {
    console.error("❌ Failed to send daily summary:", error);
  }
}

/**
 * Integration with existing lead system
 * Call this when a high-value lead signs up
 */
async function notifyHighValueLead(leadData) {
  if (leadData.leadScore >= 80) {
    await leadNotifications.highValueLead(leadData);
  }
}

module.exports = {
  processCalendlyWebhook,
  handleNewAppointment,
  handleAppointmentCancellation,
  sendAppointmentReminders,
  sendDailySummary,
  notifyHighValueLead,
  sendEmailNotificationToChanel,
};

// For testing
if (require.main === module) {
  console.log("Calendly webhook handler loaded successfully");

  // Test notification
  const testAppointment = {
    clientName: "Sarah Johnson",
    clientEmail: "sarah@example.com",
    appointmentTime: new Date().toLocaleString(),
    appointmentType: "30-Minute RV Organization Consultation",
    location: "Phone Call",
    questions:
      "I have a Class A motorhome and struggle with kitchen organization.",
  };

  // Uncomment to test:
  // handleNewAppointment({ invitee: testAppointment, event: { event_type: { name: testAppointment.appointmentType }}});
}
