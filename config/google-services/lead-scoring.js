const ga4Service = require("./ga4-service");
const gmbService = require("./gmb-service");
const axios = require("axios");

class LeadScoringService {
  constructor() {
    this.weights = {
      location: 0.25, // Distance from service area
      budget: 0.2, // Budget indication
      intent: 0.2, // Website behavior, GMB interactions
      timeline: 0.15, // Urgency/timeline
      source: 0.1, // Lead source quality
      engagement: 0.1, // Email/SMS engagement
    };

    this.serviceArea = {
      primary: ["Missoula", "MT", "59801", "59802", "59803", "59804", "59808"],
      secondary: ["Montana", "Kalispell", "Bozeman", "Great Falls", "Billings"],
    };
  }

  async calculateScore(leadData) {
    try {
      // Gather data from all sources
      const gmbData = await this.getGMBInteractions(leadData);
      const ga4Data = await this.getGA4Behavior(leadData);
      const airtableData = await this.getAirtableHistory(leadData);
      const calendlyData = await this.getCalendlyActivity(leadData);

      // Calculate individual scores
      const locationScore = this.scoreLocation(
        leadData.location,
        leadData.address,
      );
      const budgetScore = this.scoreBudget(
        leadData.budget,
        leadData.serviceType,
      );
      const intentScore = this.scoreIntent(ga4Data, gmbData, leadData);
      const timelineScore = this.scoreTimeline(
        leadData.timeline,
        leadData.urgency,
      );
      const sourceScore = this.scoreSource(leadData.source, leadData.medium);
      const engagementScore = this.scoreEngagement(airtableData, calendlyData);

      // Calculate weighted total
      const totalScore = Math.min(
        100,
        Math.round(
          locationScore * this.weights.location +
            budgetScore * this.weights.budget +
            intentScore * this.weights.intent +
            timelineScore * this.weights.timeline +
            sourceScore * this.weights.source +
            engagementScore * this.weights.engagement,
        ),
      );

      const routing = this.determineRouting(totalScore);
      const priority = this.calculatePriority(totalScore, leadData);

      return {
        totalScore,
        routing,
        priority,
        breakdown: {
          location: { score: locationScore, weight: this.weights.location },
          budget: { score: budgetScore, weight: this.weights.budget },
          intent: { score: intentScore, weight: this.weights.intent },
          timeline: { score: timelineScore, weight: this.weights.timeline },
          source: { score: sourceScore, weight: this.weights.source },
          engagement: {
            score: engagementScore,
            weight: this.weights.engagement,
          },
        },
        recommendations: this.generateRecommendations(totalScore, leadData),
        nextActions: this.getNextActions(routing, priority, leadData),
      };
    } catch (error) {
      console.error("Error calculating lead score:", error);
      return this.getFallbackScore(leadData);
    }
  }

  scoreLocation(location, address = "") {
    const locationText = `${location || ""} ${address || ""}`.toLowerCase();

    // Primary service area (Missoula) - highest score
    for (const area of this.serviceArea.primary) {
      if (locationText.includes(area.toLowerCase())) {
        return 100;
      }
    }

    // Secondary service area (Montana) - good score
    for (const area of this.serviceArea.secondary) {
      if (locationText.includes(area.toLowerCase())) {
        return 75;
      }
    }

    // Out of state but virtual possible - medium score
    return 40;
  }

  scoreBudget(budget, serviceType) {
    if (!budget) return 50; // Unknown budget gets middle score

    const budgetNum = parseInt(budget.toString().replace(/[^\d]/g, ""));

    // Score based on service type and budget ranges
    const budgetRanges = {
      "single-room": { min: 300, ideal: 500, max: 1000 },
      "multi-room": { min: 800, ideal: 1500, max: 3000 },
      "whole-house": { min: 2000, ideal: 4000, max: 8000 },
      "rv-organization": { min: 400, ideal: 800, max: 1500 },
      office: { min: 500, ideal: 1200, max: 2500 },
      default: { min: 300, ideal: 800, max: 2000 },
    };

    const range = budgetRanges[serviceType] || budgetRanges.default;

    if (budgetNum >= range.ideal) return 100;
    if (budgetNum >= range.min) return 75;
    if (budgetNum >= range.min * 0.7) return 50;
    return 25;
  }

  scoreIntent(ga4Data, gmbData, leadData) {
    let intentScore = 50; // Base score

    // GA4 behavior scoring
    if (ga4Data.sessions > 1) intentScore += 10;
    if (ga4Data.pageViews > 5) intentScore += 15;
    if (ga4Data.timeOnSite > 120) intentScore += 10; // 2+ minutes
    if (ga4Data.pagesVisited?.includes("/services")) intentScore += 10;
    if (ga4Data.pagesVisited?.includes("/contact")) intentScore += 15;

    // GMB interaction scoring
    if (gmbData.profileViews > 0) intentScore += 5;
    if (gmbData.websiteClicks > 0) intentScore += 10;
    if (gmbData.directionClicks > 0) intentScore += 15;
    if (gmbData.callClicks > 0) intentScore += 20;

    // Service-specific interest
    if (leadData.serviceType === "rv-organization") intentScore += 15; // High-value niche
    if (leadData.source === "referral") intentScore += 20;
    if (leadData.contactMethod === "phone") intentScore += 15;

    return Math.min(100, intentScore);
  }

  scoreTimeline(timeline, urgency) {
    const timelineScores = {
      immediately: 100,
      "within-week": 90,
      "within-month": 75,
      "within-3-months": 60,
      "sometime-this-year": 40,
      "just-exploring": 25,
    };

    const urgencyScores = {
      "very-urgent": 100,
      urgent: 80,
      moderate: 60,
      low: 40,
      "no-rush": 20,
    };

    const timelineScore = timelineScores[timeline] || 50;
    const urgencyScore = urgencyScores[urgency] || 50;

    return Math.round((timelineScore + urgencyScore) / 2);
  }

  scoreSource(source, medium) {
    const sourceScores = {
      referral: 100,
      "google-organic": 85,
      "google-my-business": 80,
      facebook: 65,
      instagram: 60,
      direct: 70,
      email: 75,
      yelp: 70,
      nextdoor: 75,
      other: 50,
    };

    const mediumBonus = {
      "word-of-mouth": 20,
      social: 10,
      search: 15,
      email: 10,
    };

    const baseScore = sourceScores[source] || 50;
    const bonus = mediumBonus[medium] || 0;

    return Math.min(100, baseScore + bonus);
  }

  scoreEngagement(airtableData, calendlyData) {
    let engagementScore = 50; // Base score

    // Previous interactions
    if (airtableData.previousContacts > 0) engagementScore += 20;
    if (airtableData.emailOpens > 0) engagementScore += 10;
    if (airtableData.emailClicks > 0) engagementScore += 15;

    // Calendly activity
    if (calendlyData.eventViews > 0) engagementScore += 15;
    if (calendlyData.partialBookings > 0) engagementScore += 25;
    if (calendlyData.completedBookings > 0) engagementScore += 40;

    return Math.min(100, engagementScore);
  }

  determineRouting(score) {
    if (score >= 80) return "hot";
    if (score >= 60) return "warm";
    if (score >= 40) return "cool";
    return "cold";
  }

  calculatePriority(score, leadData) {
    let priority = "medium";

    if (score >= 85) priority = "urgent";
    else if (score >= 70) priority = "high";
    else if (score >= 50) priority = "medium";
    else priority = "low";

    // Boost priority for certain conditions
    if (leadData.serviceType === "rv-organization") {
      priority = this.boostPriority(priority);
    }

    if (leadData.source === "referral") {
      priority = this.boostPriority(priority);
    }

    return priority;
  }

  boostPriority(currentPriority) {
    const priorities = ["low", "medium", "high", "urgent"];
    const currentIndex = priorities.indexOf(currentPriority);
    const newIndex = Math.min(priorities.length - 1, currentIndex + 1);
    return priorities[newIndex];
  }

  generateRecommendations(score, leadData) {
    const recommendations = [];

    if (score >= 80) {
      recommendations.push("Call within 2 hours");
      recommendations.push("Send priority booking link");
      recommendations.push("Offer flexible scheduling");
    } else if (score >= 60) {
      recommendations.push("Call within 24 hours");
      recommendations.push("Send detailed service information");
      recommendations.push("Follow up in 3 days if no response");
    } else if (score >= 40) {
      recommendations.push("Add to email nurture sequence");
      recommendations.push("Send educational content");
      recommendations.push("Follow up weekly");
    } else {
      recommendations.push("Add to monthly newsletter");
      recommendations.push("Send seasonal organizing tips");
      recommendations.push("Re-engage quarterly");
    }

    // Service-specific recommendations
    if (leadData.serviceType === "rv-organization") {
      recommendations.push("Highlight RV specialization");
      recommendations.push("Share RV before/after photos");
    }

    return recommendations;
  }

  getNextActions(routing, priority, leadData) {
    const actions = [];

    switch (routing) {
      case "hot":
        actions.push({
          action: "immediate_call",
          timeframe: "2 hours",
          assignee: "Chanel",
        });
        actions.push({
          action: "send_sms",
          timeframe: "immediate",
          message:
            "Thank you for your interest! Chanel will call you within 2 hours.",
        });
        break;

      case "warm":
        actions.push({
          action: "schedule_call",
          timeframe: "24 hours",
          assignee: "Chanel",
        });
        actions.push({
          action: "send_email",
          timeframe: "1 hour",
          template: "warm_lead_followup",
        });
        break;

      case "cool":
        actions.push({
          action: "add_to_nurture",
          timeframe: "immediate",
          sequence: "education_series",
        });
        actions.push({
          action: "schedule_followup",
          timeframe: "7 days",
          type: "email",
        });
        break;

      case "cold":
        actions.push({
          action: "add_to_newsletter",
          timeframe: "immediate",
          frequency: "monthly",
        });
        break;
    }

    return actions;
  }

  async getGMBInteractions(leadData) {
    try {
      // This would fetch actual GMB data for the user
      return {
        profileViews: 0,
        websiteClicks: 0,
        directionClicks: 0,
        callClicks: 0,
      };
    } catch (error) {
      return {
        profileViews: 0,
        websiteClicks: 0,
        directionClicks: 0,
        callClicks: 0,
      };
    }
  }

  async getGA4Behavior(leadData) {
    try {
      if (!leadData.client_id && !leadData.email) {
        return { sessions: 0, pageViews: 0, timeOnSite: 0, pagesVisited: [] };
      }

      // This would use GA4 API to get user behavior data
      return {
        sessions: 1,
        pageViews: 3,
        timeOnSite: 90,
        pagesVisited: ["/services", "/contact"],
      };
    } catch (error) {
      return { sessions: 0, pageViews: 0, timeOnSite: 0, pagesVisited: [] };
    }
  }

  async getAirtableHistory(leadData) {
    try {
      if (!leadData.email)
        return { previousContacts: 0, emailOpens: 0, emailClicks: 0 };

      // Query Airtable for previous interactions
      const response = await axios.get(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Contacts`,
        {
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          },
          params: {
            filterByFormula: `{Email} = '${leadData.email}'`,
          },
        },
      );

      if (response.data.records.length > 0) {
        const record = response.data.records[0].fields;
        return {
          previousContacts: record["Contact Count"] || 0,
          emailOpens: record["Email Opens"] || 0,
          emailClicks: record["Email Clicks"] || 0,
          lastContact: record["Last Contact Date"],
        };
      }

      return { previousContacts: 0, emailOpens: 0, emailClicks: 0 };
    } catch (error) {
      console.error("Error fetching Airtable history:", error);
      return { previousContacts: 0, emailOpens: 0, emailClicks: 0 };
    }
  }

  async getCalendlyActivity(leadData) {
    try {
      if (!leadData.email)
        return { eventViews: 0, partialBookings: 0, completedBookings: 0 };

      // This would query Calendly API for user activity
      return {
        eventViews: 0,
        partialBookings: 0,
        completedBookings: 0,
      };
    } catch (error) {
      return { eventViews: 0, partialBookings: 0, completedBookings: 0 };
    }
  }

  getFallbackScore(leadData) {
    // Provide a reasonable score when full calculation fails
    let score = 50;

    if (
      this.serviceArea.primary.some((area) =>
        (leadData.location || "").toLowerCase().includes(area.toLowerCase()),
      )
    ) {
      score += 20;
    }

    if (leadData.source === "referral") score += 15;
    if (leadData.serviceType === "rv-organization") score += 10;
    if (leadData.timeline === "immediately") score += 15;

    return {
      totalScore: Math.min(100, score),
      routing: this.determineRouting(score),
      priority: "medium",
      breakdown: null,
      recommendations: ["Contact within 24 hours", "Send service information"],
      nextActions: [{ action: "manual_review", timeframe: "24 hours" }],
    };
  }
}

module.exports = new LeadScoringService();
