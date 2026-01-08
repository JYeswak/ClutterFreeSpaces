const sgMail = require("@sendgrid/mail");
const gmbService = require("./gmb-service");
const ga4Service = require("./ga4-service");
const gmbEnhancementService = require("./gmb-enhancement");

class ReviewAutomationService {
  constructor() {
    sgMail.setApiKey(process.env.SendGrid_API_Key);
    this.fromEmail = "contact@clutter-free-spaces.com";
    this.fromName = "ClutterFree Spaces";

    // Fall 2025 specific messaging
    this.seasonalMessage =
      "As we head into the cozy fall season, we hope you're loving your newly organized space! 🍂";
  }

  /**
   * Generate personalized review request email
   */
  generateReviewEmail(clientData) {
    const templates = gmbEnhancementService.getReviewResponseTemplates();
    const serviceTypeMap = {
      "whole-house": "whole house transformation",
      "single-room": "room organization",
      "rv-organization": "RV organization",
      "garage-organization": "garage organization",
    };

    const serviceName =
      serviceTypeMap[clientData.serviceType] || "organization project";

    const emailTemplate = {
      subject: `🌟 How did we do with your ${serviceName}?`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B4F93; margin-bottom: 10px;">ClutterFree Spaces</h1>
            <p style="color: #666; font-style: italic;">Making Montana Homes More Organized, One Space at a Time</p>
          </div>
          
          <h2 style="color: #333;">Hi ${clientData.name}! 👋</h2>
          
          <p style="color: #555; line-height: 1.6;">
            ${this.seasonalMessage}
          </p>
          
          <p style="color: #555; line-height: 1.6;">
            It's been 24 hours since we completed your <strong>${serviceName}</strong>, and we wanted to check in! 
            We hope you're already feeling the benefits of your newly organized space.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #8B4F93; margin-top: 0;">✨ Quick Reminder of What We Accomplished:</h3>
            <ul style="color: #555; line-height: 1.8;">
              ${clientData.completedTasks ? clientData.completedTasks.map((task) => `<li>${task}</li>`).join("") : "<li>Transformed your space into an organized, functional area</li>"}
            </ul>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            <strong>Would you mind sharing your experience?</strong> Your review helps other Montana families 
            discover how organization can transform their homes too!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${clientData.reviewLink || "https://g.page/r/CQqLHNF9HjM_EAE/review"}" 
               style="background: #8B4F93; color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 5px; font-weight: bold; display: inline-block;">
              ⭐ Leave a Google Review
            </a>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2d5a2d; font-weight: bold;">🎯 Review Tip:</p>
            <p style="margin: 5px 0 0 0; color: #2d5a2d; font-size: 14px;">
              Mention your specific service (${serviceName}) and how it's improved your daily routine!
            </p>
          </div>
          
          ${
            clientData.hasPhotos
              ? `
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">📸 <strong>Bonus:</strong> Feel free to add before/after photos to your review!</p>
          </div>
          `
              : ""
          }
          
          <p style="color: #555; line-height: 1.6;">
            <strong>Questions or need a quick touch-up?</strong> Just reply to this email or call us at 
            <a href="tel:4062851525" style="color: #8B4F93;">(406) 285-1525</a>. 
            We offer 30-day maintenance support!
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background: #f8f0ff; border-radius: 8px;">
            <h4 style="color: #8B4F93; margin-top: 0;">🏡 Keep the Organization Going!</h4>
            <ul style="color: #555; margin: 10px 0 0 0;">
              <li>Spend 10 minutes daily maintaining your new systems</li>
              <li>Do a weekly "reset" of organized areas</li>
              <li>Fall cleaning? Let us help with seasonal organization!</li>
            </ul>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            Thank you for choosing ClutterFree Spaces for your ${serviceName}. It was such a pleasure 
            working with you!
          </p>
          
          <p style="color: #8B4F93; font-weight: bold;">
            Warmly,<br>
            Chanel & The ClutterFree Spaces Team 💜
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #999; font-size: 12px;">
              ClutterFree Spaces | Missoula, Montana<br>
              📧 contact@clutter-free-spaces.com | 📱 (406) 285-1525<br>
              🌐 <a href="https://www.clutter-free-spaces.com" style="color: #8B4F93;">www.clutter-free-spaces.com</a>
            </p>
            <p style="color: #ccc; font-size: 10px; margin-top: 15px;">
              You're receiving this because you recently used our services. 
              <a href="#" style="color: #ccc;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `,
      text: `Hi ${clientData.name}!

${this.seasonalMessage}

It's been 24 hours since we completed your ${serviceName}, and we wanted to check in! We hope you're already feeling the benefits of your newly organized space.

Would you mind sharing your experience? Your review helps other Montana families discover how organization can transform their homes too!

Leave a Google Review: ${clientData.reviewLink || "https://g.page/r/CQqLHNF9HjM_EAE/review"}

Questions or need a quick touch-up? Just reply to this email or call us at (406) 285-1525. We offer 30-day maintenance support!

Thank you for choosing ClutterFree Spaces for your ${serviceName}. It was such a pleasure working with you!

Warmly,
Chanel & The ClutterFree Spaces Team

ClutterFree Spaces | Missoula, Montana
contact@clutter-free-spaces.com | (406) 285-1525
www.clutter-free-spaces.com`,
    };

    return emailTemplate;
  }

  /**
   * Send review request email
   */
  async sendReviewRequest(clientData) {
    try {
      const emailContent = this.generateReviewEmail(clientData);

      const message = {
        to: clientData.email,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: false,
          },
          openTracking: {
            enable: true,
          },
        },
        customArgs: {
          client_name: clientData.name,
          service_type: clientData.serviceType,
          campaign: "review_request_24hr",
        },
      };

      const result = await sgMail.send(message);

      // Track email sent in GA4
      await ga4Service.trackEvent({
        event_name: "review_request_sent",
        client_id: ga4Service.generateClientId(),
        parameters: {
          client_name: clientData.name,
          service_type: clientData.serviceType,
          email_type: "24hr_review_request",
          estimated_value: clientData.projectValue || 0,
        },
      });

      return {
        success: true,
        messageId: result[0].headers["x-message-id"],
        emailSent: true,
        scheduledFollowUp: true,
      };
    } catch (error) {
      console.error("Review request email error:", error);
      return {
        success: false,
        error: error.message,
        emailSent: false,
      };
    }
  }

  /**
   * Send follow-up review request (3 days later)
   */
  async sendFollowUpReviewRequest(clientData) {
    try {
      const followUpTemplate = {
        subject: `🤗 Quick follow-up about your ${clientData.serviceType} experience`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #8B4F93; margin-bottom: 10px;">ClutterFree Spaces</h1>
              <p style="color: #666; font-style: italic;">Following up on your organized space! 🍂</p>
            </div>
            
            <h2 style="color: #333;">Hi ${clientData.name}! 👋</h2>
            
            <p style="color: #555; line-height: 1.6;">
              How are you enjoying your organized space? It's been a few days since we completed your 
              ${clientData.serviceType}, and we're hoping the new systems are making life easier!
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #333; font-weight: bold;">💭 If you haven't had a chance yet...</p>
              <p style="margin: 10px 0 0 0; color: #555;">
                We'd still love to hear about your experience! Your review helps other Montana families 
                discover the peace of mind that comes with an organized home.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${clientData.reviewLink || "https://g.page/r/CQqLHNF9HjM_EAE/review"}" 
                 style="background: #8B4F93; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; font-weight: bold; display: inline-block;">
                ⭐ Share Your Experience
              </a>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              <strong>Any questions or concerns?</strong> We're here for you! Reply to this email or 
              call <a href="tel:4062851525" style="color: #8B4F93;">(406) 285-1525</a>.
            </p>
            
            <p style="color: #8B4F93; font-weight: bold;">
              Thanks again,<br>
              Chanel & The ClutterFree Spaces Team 💜
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px;">
                ClutterFree Spaces | Missoula, Montana<br>
                📧 contact@clutter-free-spaces.com | 📱 (406) 285-1525
              </p>
              <p style="color: #ccc; font-size: 10px; margin-top: 15px;">
                <a href="#" style="color: #ccc;">No more review reminders</a>
              </p>
            </div>
          </div>
        `,
      };

      const message = {
        to: clientData.email,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: followUpTemplate.subject,
        html: followUpTemplate.html,
        customArgs: {
          client_name: clientData.name,
          service_type: clientData.serviceType,
          campaign: "review_request_followup_3day",
        },
      };

      const result = await sgMail.send(message);

      // Track follow-up email in GA4
      await ga4Service.trackEvent({
        event_name: "review_followup_sent",
        client_id: ga4Service.generateClientId(),
        parameters: {
          client_name: clientData.name,
          service_type: clientData.serviceType,
          email_type: "3day_followup",
          days_since_completion: 3,
        },
      });

      return {
        success: true,
        messageId: result[0].headers["x-message-id"],
        emailType: "followup",
      };
    } catch (error) {
      console.error("Follow-up review request error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate QR code for in-person review requests
   */
  async generateReviewQR(clientData) {
    try {
      const reviewUrl =
        clientData.reviewLink || "https://g.page/r/CQqLHNF9HjM_EAE/review";

      // Use the existing GMB service QR generation
      const qrResult = await gmbService.generateReviewQR({
        name: clientData.name,
        email: clientData.email,
        reviewUrl: reviewUrl,
        serviceType: clientData.serviceType,
      });

      if (qrResult.success) {
        // Track QR generation in GA4
        await ga4Service.trackEvent({
          event_name: "review_qr_generated",
          client_id: ga4Service.generateClientId(),
          parameters: {
            client_name: clientData.name,
            service_type: clientData.serviceType,
            generation_method: "in_person",
          },
        });
      }

      return qrResult;
    } catch (error) {
      console.error("QR code generation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Complete review automation workflow
   */
  async initiateReviewWorkflow(clientData) {
    try {
      const results = {
        client: clientData.name,
        workflow: "review_automation",
        steps: {},
      };

      // Step 1: Send immediate review request (24hr)
      const emailResult = await this.sendReviewRequest(clientData);
      results.steps.initial_email = emailResult;

      // Step 2: Generate QR code for in-person use
      const qrResult = await this.generateReviewQR(clientData);
      results.steps.qr_code = qrResult;

      // Step 3: Schedule follow-up email (will be sent by separate cron job)
      results.steps.followup_scheduled = {
        success: true,
        scheduled_date: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        message: "3-day follow-up email scheduled",
      };

      return {
        success: true,
        message: "Review workflow initiated successfully",
        results: results,
      };
    } catch (error) {
      console.error("Review workflow error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new ReviewAutomationService();
