const authService = require("./auth-oauth");

class GTMService {
  constructor() {
    this.containerId = process.env.GTM_CONTAINER_ID || "GTM-WKXSWZH7";
  }

  /**
   * Generate GTM container snippets for Squarespace
   */
  getContainerSnippets() {
    const headSnippet = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${this.containerId}');</script>
<!-- End Google Tag Manager -->`;

    const bodySnippet = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${this.containerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

    return {
      head: headSnippet,
      body: bodySnippet,
      containerId: this.containerId,
    };
  }

  /**
   * Generate dataLayer events for client-side tracking
   */
  generateDataLayerEvents() {
    return {
      // Lead form submission
      leadFormSubmit: (formData) => ({
        event: "form_submit",
        form_type: "lead_generation",
        service_type: formData.serviceType,
        lead_value: formData.estimatedValue || 800,
        location: formData.location,
      }),

      // Quiz completion
      quizComplete: (quizData) => ({
        event: "quiz_complete",
        quiz_type: "organization_style",
        result_type: quizData.resultType,
        email_captured: !!quizData.email,
        lead_score: quizData.leadScore || 0,
      }),

      // Phone/Email clicks
      contactClick: (type) => ({
        event: "contact_click",
        contact_method: type, // 'phone' or 'email'
        element_text:
          type === "phone" ? "(406) 285-1525" : "info@clutterfreespaces.com",
      }),

      // Calendly booking
      calendlyBooking: (eventData) => ({
        event: "booking_scheduled",
        booking_type: eventData.eventType,
        booking_value: eventData.estimatedValue || 1200,
        scheduled_date: eventData.scheduledDate,
      }),

      // Page engagement milestones
      engagementMilestone: (milestone) => ({
        event: "engagement_milestone",
        milestone_type: milestone, // 'scroll_50', 'time_30s', etc.
        page_path: window.location.pathname,
      }),
    };
  }

  /**
   * Create custom conversion tracking tags configuration
   */
  getTagConfigurations() {
    return {
      ga4Config: {
        tagType: "Google Analytics: GA4 Configuration",
        measurementId: "G-Y71YECTN4F",
        parameters: {
          send_page_view: true,
          enhanced_conversions: true,
          cookie_flags: "SameSite=None;Secure",
        },
      },

      leadGenerationTag: {
        tagType: "Google Analytics: GA4 Event",
        eventName: "generate_lead",
        parameters: {
          currency: "USD",
          value: "{{Lead Value}}",
          lead_source: "{{Lead Source}}",
          service_type: "{{Service Type}}",
        },
        trigger: "Lead Form Submit",
      },

      bookingTag: {
        tagType: "Google Analytics: GA4 Event",
        eventName: "purchase",
        parameters: {
          currency: "USD",
          value: "{{Booking Value}}",
          transaction_id: "{{Booking ID}}",
          item_category: "{{Service Type}}",
        },
        trigger: "Calendly Booking Complete",
      },

      quizTag: {
        tagType: "Google Analytics: GA4 Event",
        eventName: "quiz_complete",
        parameters: {
          quiz_type: "organization_style",
          quiz_result: "{{Quiz Result}}",
          email_captured: "{{Email Captured}}",
        },
        trigger: "Quiz Completion",
      },

      contactTag: {
        tagType: "Google Analytics: GA4 Event",
        eventName: "contact_click",
        parameters: {
          contact_method: "{{Contact Method}}",
          element_text: "{{Click Element}}",
        },
        trigger: "Contact Click",
      },
    };
  }

  /**
   * Generate custom variables for GTM
   */
  getVariableConfigurations() {
    return {
      leadValueVariable: {
        type: "Data Layer Variable",
        name: "Lead Value",
        dataLayerVariableName: "lead_value",
        defaultValue: "800",
      },

      serviceTypeVariable: {
        type: "Data Layer Variable",
        name: "Service Type",
        dataLayerVariableName: "service_type",
        defaultValue: "unknown",
      },

      leadSourceVariable: {
        type: "Data Layer Variable",
        name: "Lead Source",
        dataLayerVariableName: "lead_source",
        defaultValue: "website",
      },

      bookingValueVariable: {
        type: "Data Layer Variable",
        name: "Booking Value",
        dataLayerVariableName: "booking_value",
        defaultValue: "1200",
      },

      bookingIdVariable: {
        type: "Data Layer Variable",
        name: "Booking ID",
        dataLayerVariableName: "transaction_id",
      },

      quizResultVariable: {
        type: "Data Layer Variable",
        name: "Quiz Result",
        dataLayerVariableName: "quiz_result",
      },

      emailCapturedVariable: {
        type: "Data Layer Variable",
        name: "Email Captured",
        dataLayerVariableName: "email_captured",
        defaultValue: "false",
      },

      contactMethodVariable: {
        type: "Data Layer Variable",
        name: "Contact Method",
        dataLayerVariableName: "contact_method",
      },

      clickElementVariable: {
        type: "Auto-Event Variable",
        name: "Click Element",
        variableType: "element",
      },

      formTypeVariable: {
        type: "Data Layer Variable",
        name: "Form Type",
        dataLayerVariableName: "form_type",
      },

      pagePathVariable: {
        type: "Built-In Variable",
        name: "Page Path",
        variableType: "pagePath",
      },

      clickTextVariable: {
        type: "Auto-Event Variable",
        name: "Click Text",
        variableType: "elementText",
      },
    };
  }

  /**
   * Generate triggers for GTM
   */
  getTriggerConfigurations() {
    return {
      leadFormTrigger: {
        type: "Custom Event",
        eventName: "form_submit",
        conditions: [
          {
            variable: "Event",
            operator: "equals",
            value: "form_submit",
          },
          {
            variable: "Form Type",
            operator: "equals",
            value: "lead_generation",
          },
        ],
      },

      calendlyTrigger: {
        type: "Custom Event",
        eventName: "booking_scheduled",
        conditions: [
          {
            variable: "Event",
            operator: "equals",
            value: "booking_scheduled",
          },
        ],
      },

      quizTrigger: {
        type: "Custom Event",
        eventName: "quiz_complete",
        conditions: [
          {
            variable: "Event",
            operator: "equals",
            value: "quiz_complete",
          },
        ],
      },

      contactClickTrigger: {
        type: "Click - All Elements",
        conditions: [
          {
            variable: "Click Element",
            operator: "matches CSS selector",
            value:
              'a[href^="tel:"], a[href^="mailto:"], .phone-number, .email-address',
          },
        ],
      },

      scrollTrigger: {
        type: "Scroll Depth",
        percentages: [25, 50, 75, 90],
      },

      timerTrigger: {
        type: "Timer",
        intervals: [30000, 60000, 120000], // 30s, 1min, 2min
        limit: 1,
      },
    };
  }
}

module.exports = new GTMService();
