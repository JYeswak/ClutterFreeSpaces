// Try OAuth first, fall back to API key auth
let authService;
try {
  authService = require("./auth-oauth");
} catch (error) {
  authService = require("./auth");
}
const QRCode = require("qrcode");
const axios = require("axios");

class GMBService {
  constructor() {
    // CFS is a Service Area Business (SAB) - no physical location, no standard Place ID
    // CID (Business Profile ID): 9832164361965321192
    // data-pid (Knowledge Panel ID): 5010715
    // Store Code: 00366519096702437750
    this.locationId = process.env.GMB_LOCATION_ID || "9832164361965321192";
    this.cid = "9832164361965321192"; // Customer ID for GBP API
    this.dataPid = "5010715"; // Knowledge Panel ID for review links
    this.businessName = "ClutterFreeSpaces";
    // SABs use CID-based review URLs, not Place ID-based
    this.reviewBaseUrl = "https://search.google.com/local/writereview?placeid=";
  }

  async getLocationInfo() {
    try {
      const mybusiness = await authService.createAuthenticatedRequest(
        "mybusinessbusinessinformation",
        "v1",
      );

      if (!this.locationId) {
        // List all locations to find the right one
        const response = await mybusiness.accounts.locations.list({
          parent: "accounts/-", // Use default account
        });

        console.log("Available locations:", response.data.locations);
        return response.data.locations;
      }

      const response = await mybusiness.locations.get({
        name: `locations/${this.locationId}`,
      });

      return response.data;
    } catch (error) {
      console.error("Error getting location info:", error.message);

      // Handle quota exceeded gracefully
      if (
        error.message?.includes("Quota exceeded") ||
        error.message?.includes("quota")
      ) {
        return {
          error: "quota_exceeded",
          message:
            "Google Business Profile API quota exceeded. Try again later.",
          locationId: this.locationId,
          placeId: this.placeId,
        };
      }

      // Handle auth errors
      if (
        error.message?.includes("invalid_grant") ||
        error.message?.includes("Token")
      ) {
        return {
          error: "auth_required",
          message:
            "OAuth token expired or invalid. Please re-authenticate at /auth/google",
          locationId: this.locationId,
        };
      }

      // Return structured error instead of throwing
      return {
        error: "api_error",
        message: error.message,
        locationId: this.locationId,
        placeId: this.placeId,
      };
    }
  }

  async getReviews(limit = 10) {
    try {
      // CFS is a Service Area Business (SAB) - Places API does NOT work for SABs!
      // SABs don't have Place IDs (ChIJ...) and return empty from Places API.
      // Must use Google Business Profile API instead (requires approved access).
      // GBP API access applied for 2025-12-24 - pending Google approval (1-2 weeks).

      // For now, return placeholder indicating pending API access
      return {
        reviews: [],
        rating: 5.0, // CFS has 4 five-star reviews
        user_ratings_total: 4,
        source: "manual", // Until GBP API approved
        note: "GBP API access pending - real data available after approval",
        reviewLink: this.getDirectReviewUrl(),
      };
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  }

  async getGBPReviews(limit = 10) {
    // This method will work after GBP API access is approved
    try {
      const mybusiness = await authService.createAuthenticatedRequest(
        "mybusinessaccountmanagement",
        "v1",
      );

      // First, list accounts to get the account name
      const accountsResponse = await mybusiness.accounts.list();
      const account = accountsResponse.data.accounts?.[0];

      if (!account) {
        return {
          error: "no_accounts",
          message: "No Google Business Profile accounts found for this user",
        };
      }

      // Then list locations
      const locationsResponse = await mybusiness.accounts.locations.list({
        parent: account.name,
      });

      return {
        account: account.name,
        locations: locationsResponse.data.locations || [],
        note: "Use location name to fetch reviews via Reviews API",
      };
    } catch (error) {
      console.error("Error fetching GBP reviews:", error.message);

      if (
        error.message?.includes("quota") ||
        error.message?.includes("Quota")
      ) {
        return {
          error: "quota_exceeded",
          message:
            "GBP API access not yet approved - apply at console.cloud.google.com",
          appliedDate: "2025-12-24",
        };
      }

      return {
        error: "api_error",
        message: error.message,
      };
    }
  }

  async generateReviewQR(clientData) {
    try {
      const { name, email, jobId, serviceType } = clientData;

      // Create personalized review URL
      const reviewUrl = this.buildReviewUrl(clientData);

      // Generate QR code
      const qrDataURL = await QRCode.toDataURL(reviewUrl, {
        errorCorrectionLevel: "M",
        type: "image/png",
        quality: 0.92,
        margin: 1,
        width: 300,
        color: {
          dark: "#2D5A87", // ClutterFreeSpaces brand blue
          light: "#FFFFFF",
        },
      });

      return {
        qrCode: qrDataURL,
        reviewUrl: reviewUrl,
        clientName: name,
        serviceType: serviceType,
        jobId: jobId,
      };
    } catch (error) {
      console.error("Error generating review QR:", error);
      throw error;
    }
  }

  buildReviewUrl(clientData) {
    // SABs don't have standard Place IDs - use CID-based Maps URL
    // This redirects to the correct review form for the business profile
    let reviewUrl = `https://www.google.com/maps?cid=${this.cid}`;

    // Add UTM parameters for tracking
    const utmParams = new URLSearchParams({
      utm_source: "email",
      utm_medium: "qr_code",
      utm_campaign: "review_request",
      utm_content: clientData.serviceType || "general",
      job_id: clientData.jobId,
    });

    // Note: UTMs may not persist through Maps redirect, but included for logging
    reviewUrl += `&${utmParams.toString()}`;
    return reviewUrl;
  }

  // Direct review link using data-pid (Knowledge Panel ID)
  getDirectReviewUrl() {
    return `https://search.google.com/local/writereview?placeid=${this.dataPid}`;
  }

  async respondToReview(reviewId, responseText) {
    try {
      const mybusiness = await authService.createAuthenticatedRequest(
        "mybusinessbusinessinformation",
        "v1",
      );

      const response = await mybusiness.locations.reviews.reply({
        name: `locations/${this.locationId}/reviews/${reviewId}`,
        requestBody: {
          comment: responseText,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error responding to review:", error);
      throw error;
    }
  }

  generateResponseText(reviewRating, reviewText, clientName = null) {
    const responses = {
      5: [
        `Thank you so much for the amazing review! 🌟 We're thrilled that you love your newly organized space. It was our pleasure helping you create a clutter-free environment!`,
        `Wow, thank you for the 5-star review! 🙌 Your kind words mean the world to us. We're so happy you're enjoying your organized home!`,
        `Thank you for choosing ClutterFreeSpaces! ✨ It's reviews like yours that make our work so rewarding. Enjoy your beautiful, organized space!`,
      ],
      4: [
        `Thank you for the wonderful review! 😊 We're so glad we could help you get organized. Your feedback helps us continue to improve our services!`,
        `Thanks for taking the time to review our work! 🏠 We appreciate your feedback and are happy you're pleased with your organized space.`,
      ],
      3: [
        `Thank you for your honest feedback. We appreciate you taking the time to share your experience and will use this to improve our services.`,
        `We appreciate your review and feedback. If there's anything specific we can improve, please don't hesitate to reach out to us directly.`,
      ],
      2: [
        `Thank you for your feedback. We take all reviews seriously and would love to discuss your experience further. Please contact us directly so we can make things right.`,
      ],
      1: [
        `We sincerely apologize that your experience didn't meet expectations. Your feedback is important to us, and we'd appreciate the opportunity to discuss this with you personally. Please contact us at (406) 285-1525.`,
      ],
    };

    const ratingResponses = responses[reviewRating] || responses[3];
    const randomResponse =
      ratingResponses[Math.floor(Math.random() * ratingResponses.length)];

    return clientName
      ? randomResponse.replace("Thank you", `Thank you, ${clientName},`)
      : randomResponse;
  }

  async updateBusinessHours(hoursData) {
    try {
      const mybusiness = await authService.createAuthenticatedRequest(
        "mybusinessbusinessinformation",
        "v1",
      );

      const response = await mybusiness.locations.patch({
        name: `locations/${this.locationId}`,
        updateMask: "regularHours",
        requestBody: {
          regularHours: {
            periods: hoursData,
          },
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error updating business hours:", error);
      throw error;
    }
  }

  async updateBusinessInfo(updateData) {
    try {
      const mybusiness = await authService.createAuthenticatedRequest(
        "mybusinessbusinessinformation",
        "v1",
      );

      const response = await mybusiness.locations.patch({
        name: `locations/${this.locationId}`,
        updateMask: Object.keys(updateData).join(","),
        requestBody: updateData,
      });

      return response.data;
    } catch (error) {
      console.error("Error updating business info:", error);
      throw error;
    }
  }

  /**
   * Create a Google My Business post
   */
  async createPost(postData) {
    try {
      if (!this.locationId) {
        throw new Error("GMB_LOCATION_ID not configured");
      }

      // Check if we have GMB API access
      const mybusiness = await authService.createAuthenticatedRequest(
        "mybusinessbusinessinformation",
        "v1",
      );

      // Prepare post data for GMB API
      const postBody = {
        languageCode: "en-US",
        summary: postData.text || postData.content,
        callToAction: {
          actionType: "LEARN_MORE",
          url: "https://www.clutterfreespaces.com",
        },
        media: postData.media || [],
      };

      // Create the post
      const response = await mybusiness.locations.localPosts.create({
        parent: `locations/${this.locationId}`,
        requestBody: postBody,
      });

      return {
        success: true,
        postId: response.data.name,
        postData: response.data,
        message: "Post created successfully",
      };
    } catch (error) {
      console.error("GMB post creation error:", error);

      // Handle specific API errors
      if (
        error.message?.includes("quota") ||
        error.message?.includes("Quota")
      ) {
        return {
          success: false,
          error: "GMB API quota exceeded - request pending approval",
          needsApproval: true,
          simulatedPost: postData,
        };
      }

      return {
        success: false,
        error: error.message,
        simulatedPost: postData,
      };
    }
  }

  /**
   * Test post creation (simulation when API not available)
   */
  async simulatePost(postData) {
    return {
      success: true,
      simulated: true,
      message: "Post simulated - GMB API access pending",
      postPreview: {
        text: postData.text || postData.content,
        callToAction: postData.callToAction || "Visit our website",
        hashtags: postData.hashtags || [],
        timestamp: new Date().toISOString(),
        wouldPostTo: "ClutterFree Spaces GMB Profile",
      },
    };
  }

  async getBusinessInsights(dateRange) {
    try {
      // Get business performance metrics
      const insights = {
        searchViews: 0,
        mapViews: 0,
        profileViews: 0,
        callClicks: 0,
        websiteClicks: 0,
        directionClicks: 0,
        totalReviews: 0,
        averageRating: 0,
      };

      // Note: GMB Insights API has been deprecated
      // You would typically integrate with Google Analytics or use Google My Business API v4
      // For now, returning a structure that can be populated from other sources

      return insights;
    } catch (error) {
      console.error("Error getting business insights:", error);
      throw error;
    }
  }
}

module.exports = new GMBService();
