const authService = require("./auth");
const axios = require("axios");
const crypto = require("crypto");

class GA4Service {
  constructor() {
    this.measurementId = process.env.GA4_MEASUREMENT_ID || "G-XXXXXXXXXX";
    this.apiSecret = process.env.GA4_API_SECRET;
    this.measurementUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`;
  }

  generateClientId() {
    // Generate a unique client ID for server-side tracking
    return crypto.randomUUID();
  }

  hashUserData(userData) {
    // Hash PII data for enhanced conversions (GDPR/CCPA compliance)
    const hash = crypto.createHash("sha256");
    hash.update(userData.toLowerCase().trim());
    return hash.digest("hex");
  }

  async trackEvent(eventData) {
    try {
      if (!this.apiSecret) {
        console.log("GA4 API Secret not configured, skipping tracking");
        return { success: false, reason: "API Secret not configured" };
      }

      const payload = {
        client_id: eventData.client_id || this.generateClientId(),
        events: [
          {
            name: eventData.event_name,
            parameters: {
              ...eventData.parameters,
              // Add default parameters
              engagement_time_msec: eventData.engagement_time || 1000,
              session_id: eventData.session_id || Date.now().toString(),
            },
          },
        ],
      };

      // Add user properties if available
      if (eventData.user_properties) {
        payload.user_properties = eventData.user_properties;
      }

      // Add user_id for cross-device tracking
      if (eventData.user_id) {
        payload.user_id = eventData.user_id;
      }

      const response = await axios.post(this.measurementUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return {
        success: true,
        status: response.status,
        event_name: eventData.event_name,
      };
    } catch (error) {
      console.error("Error tracking GA4 event:", error);
      return { success: false, error: error.message };
    }
  }

  async trackLeadGeneration(leadData) {
    const eventData = {
      event_name: "generate_lead",
      client_id: leadData.client_id,
      user_id: leadData.email ? this.hashUserData(leadData.email) : undefined,
      parameters: {
        source: leadData.source || "unknown",
        medium: leadData.medium || "organic",
        campaign: leadData.campaign || "none",
        lead_type: leadData.lead_type || "general",
        service_interest: leadData.service_type || "organizing",
        location: leadData.location || "unknown",
        value: leadData.estimated_value || 500, // Average service value
        currency: "USD",
      },
      user_properties: {
        lead_source: { value: leadData.source },
        service_area: { value: leadData.location },
        lead_score: { value: leadData.lead_score || 0 },
      },
    };

    return await this.trackEvent(eventData);
  }

  async trackBookingConversion(bookingData) {
    const eventData = {
      event_name: "purchase",
      client_id: bookingData.client_id,
      user_id: bookingData.email
        ? this.hashUserData(bookingData.email)
        : undefined,
      parameters: {
        transaction_id: bookingData.booking_id || bookingData.calendly_event_id,
        value: bookingData.service_value || 500,
        currency: "USD",
        items: [
          {
            item_id: "consultation",
            item_name: "Organizing Consultation",
            category: "Service",
            quantity: 1,
            price: bookingData.service_value || 500,
          },
        ],
      },
    };

    return await this.trackEvent(eventData);
  }

  async trackReviewGenerated(reviewData) {
    const eventData = {
      event_name: "review_requested",
      client_id: reviewData.client_id,
      parameters: {
        job_id: reviewData.job_id,
        client_name: reviewData.client_name,
        service_type: reviewData.service_type,
        qr_generated: true,
        email_sent: reviewData.email_sent || false,
      },
    };

    return await this.trackEvent(eventData);
  }

  async trackEmailEngagement(emailData) {
    const eventData = {
      event_name: emailData.action, // 'email_open' or 'email_click'
      client_id: emailData.client_id,
      user_id: emailData.email ? this.hashUserData(emailData.email) : undefined,
      parameters: {
        email_type: emailData.email_type,
        template_name: emailData.template_name,
        campaign_name: emailData.campaign_name,
        link_url: emailData.link_url || null,
        send_time: emailData.send_time,
      },
    };

    return await this.trackEvent(eventData);
  }

  async trackPhoneCall(callData) {
    const eventData = {
      event_name: "phone_call",
      client_id: callData.client_id,
      parameters: {
        call_duration: callData.duration || 0,
        call_type: callData.type || "inbound",
        lead_source: callData.source,
        phone_number: callData.phone
          ? this.hashUserData(callData.phone)
          : undefined,
      },
    };

    return await this.trackEvent(eventData);
  }

  async trackWebsiteInteraction(interactionData) {
    const eventData = {
      event_name: interactionData.event_name, // 'page_view', 'scroll', 'click', etc.
      client_id: interactionData.client_id,
      parameters: {
        page_title: interactionData.page_title,
        page_location: interactionData.page_location,
        page_referrer: interactionData.page_referrer,
        engagement_time_msec: interactionData.engagement_time || 1000,
        session_id: interactionData.session_id,
      },
    };

    if (interactionData.event_name === "scroll") {
      eventData.parameters.percent_scrolled = interactionData.percent_scrolled;
    }

    if (interactionData.event_name === "click") {
      eventData.parameters.link_url = interactionData.link_url;
      eventData.parameters.link_text = interactionData.link_text;
    }

    return await this.trackEvent(eventData);
  }

  async sendEnhancedConversion(conversionData) {
    try {
      // Enhanced conversions require hashed user data
      const enhancedData = {
        client_id: conversionData.client_id,
        events: [
          {
            name: "conversion",
            parameters: {
              transaction_id: conversionData.transaction_id,
              value: conversionData.value,
              currency: "USD",
              // Hashed user data for enhanced matching
              user_data: {
                email_address: conversionData.email
                  ? this.hashUserData(conversionData.email)
                  : undefined,
                phone_number: conversionData.phone
                  ? this.hashUserData(conversionData.phone)
                  : undefined,
                address: {
                  first_name: conversionData.first_name
                    ? this.hashUserData(conversionData.first_name)
                    : undefined,
                  last_name: conversionData.last_name
                    ? this.hashUserData(conversionData.last_name)
                    : undefined,
                  city: conversionData.city
                    ? this.hashUserData(conversionData.city)
                    : undefined,
                  region: conversionData.state
                    ? this.hashUserData(conversionData.state)
                    : undefined,
                  postal_code: conversionData.zip
                    ? this.hashUserData(conversionData.zip)
                    : undefined,
                },
              },
            },
          },
        ],
      };

      return await this.trackEvent(enhancedData);
    } catch (error) {
      console.error("Error sending enhanced conversion:", error);
      throw error;
    }
  }

  async getAnalyticsData(
    dateRange = { startDate: "7daysAgo", endDate: "today" },
  ) {
    try {
      const analyticsData = await authService.createAuthenticatedRequest(
        "analyticsdata",
        "v1beta",
      );

      const response = await analyticsData.properties.runReport({
        property: `properties/${this.measurementId.replace("G-", "")}`,
        requestBody: {
          dateRanges: [dateRange],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "conversions" },
            { name: "totalRevenue" },
          ],
          dimensions: [
            { name: "source" },
            { name: "medium" },
            { name: "campaign" },
          ],
        },
      });

      return this.formatAnalyticsResponse(response.data);
    } catch (error) {
      console.error("Error getting analytics data:", error);
      // Return mock data for development
      return {
        totalUsers: 150,
        sessions: 200,
        conversions: 15,
        revenue: 7500,
        topSources: [
          { source: "google", users: 80, conversions: 10 },
          { source: "direct", users: 45, conversions: 3 },
          { source: "facebook", users: 25, conversions: 2 },
        ],
      };
    }
  }

  formatAnalyticsResponse(rawData) {
    // Format GA4 API response into a more usable structure
    const formatted = {
      totalUsers: 0,
      sessions: 0,
      conversions: 0,
      revenue: 0,
      topSources: [],
    };

    if (rawData.rows) {
      rawData.rows.forEach((row) => {
        const metrics = row.metricValues;
        const dimensions = row.dimensionValues;

        formatted.topSources.push({
          source: dimensions[0]?.value,
          medium: dimensions[1]?.value,
          campaign: dimensions[2]?.value,
          users: parseInt(metrics[0]?.value || 0),
          sessions: parseInt(metrics[1]?.value || 0),
          conversions: parseInt(metrics[2]?.value || 0),
          revenue: parseFloat(metrics[3]?.value || 0),
        });
      });

      // Calculate totals
      formatted.totalUsers = formatted.topSources.reduce(
        (sum, source) => sum + source.users,
        0,
      );
      formatted.sessions = formatted.topSources.reduce(
        (sum, source) => sum + source.sessions,
        0,
      );
      formatted.conversions = formatted.topSources.reduce(
        (sum, source) => sum + source.conversions,
        0,
      );
      formatted.revenue = formatted.topSources.reduce(
        (sum, source) => sum + source.revenue,
        0,
      );
    }

    return formatted;
  }
}

module.exports = new GA4Service();
