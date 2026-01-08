/**
 * Google Ads API Service for ClutterFreeSpaces
 *
 * Prerequisites:
 * 1. Google Ads API enabled in Google Cloud Console
 * 2. Developer Token from Google Ads API Center (ads.google.com/aw/apicenter)
 * 3. OAuth2 credentials (client_id, client_secret, refresh_token)
 *
 * Required env vars:
 * - GOOGLE_ADS_DEVELOPER_TOKEN: From Google Ads API Center
 * - GOOGLE_ADS_CUSTOMER_ID: Your Google Ads account ID (without dashes)
 * - GOOGLE_CLIENT_ID: OAuth2 client ID from Google Cloud Console
 * - GOOGLE_CLIENT_SECRET: OAuth2 client secret
 * - GOOGLE_ADS_REFRESH_TOKEN: OAuth2 refresh token (obtained via consent flow)
 */

require("dotenv").config({ path: "../../.env" });
const { GoogleAdsApi, enums } = require("google-ads-api");

class GoogleAdsService {
  constructor() {
    this.customerId = process.env.GOOGLE_ADS_CUSTOMER_ID || "4972463609";
    this.developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

    this.client = null;
    this.customer = null;
  }

  /**
   * Check if all required credentials are configured
   */
  checkCredentials() {
    const missing = [];
    if (!this.developerToken) missing.push("GOOGLE_ADS_DEVELOPER_TOKEN");
    if (!this.clientId) missing.push("GOOGLE_CLIENT_ID");
    if (!this.clientSecret) missing.push("GOOGLE_CLIENT_SECRET");
    if (!this.refreshToken) missing.push("GOOGLE_ADS_REFRESH_TOKEN");

    return {
      configured: missing.length === 0,
      missing,
      customerId: this.customerId,
      hasDevToken: !!this.developerToken,
      hasOAuth: !!(this.clientId && this.clientSecret && this.refreshToken),
    };
  }

  /**
   * Initialize the Google Ads API client
   */
  initialize() {
    const status = this.checkCredentials();
    if (!status.configured) {
      throw new Error(`Missing credentials: ${status.missing.join(", ")}`);
    }

    this.client = new GoogleAdsApi({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      developer_token: this.developerToken,
    });

    this.customer = this.client.Customer({
      customer_id: this.customerId,
      refresh_token: this.refreshToken,
    });

    return this.customer;
  }

  /**
   * Test the API connection by fetching account info
   */
  async testConnection() {
    try {
      this.initialize();

      const response = await this.customer.query(`
        SELECT
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone,
          customer.status
        FROM customer
        LIMIT 1
      `);

      return {
        success: true,
        account: response[0]?.customer || null,
        message: "Successfully connected to Google Ads API",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error.errors || [],
        message: "Failed to connect to Google Ads API",
      };
    }
  }

  /**
   * Get account performance summary
   */
  async getAccountSummary(dateRange = "LAST_30_DAYS") {
    this.initialize();

    const response = await this.customer.query(`
      SELECT
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM customer
      WHERE segments.date DURING ${dateRange}
    `);

    const metrics = response[0]?.metrics || {};
    return {
      impressions: parseInt(metrics.impressions) || 0,
      clicks: parseInt(metrics.clicks) || 0,
      cost: (parseInt(metrics.cost_micros) || 0) / 1000000,
      conversions: parseFloat(metrics.conversions) || 0,
      conversionValue: parseFloat(metrics.conversions_value) || 0,
      ctr:
        metrics.impressions > 0
          ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2)
          : 0,
      cpc:
        metrics.clicks > 0
          ? (metrics.cost_micros / 1000000 / metrics.clicks).toFixed(2)
          : 0,
    };
  }

  /**
   * List all campaigns
   */
  async listCampaigns(status = null) {
    this.initialize();

    let query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign_budget.amount_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros
      FROM campaign
    `;

    if (status) {
      query += ` WHERE campaign.status = '${status}'`;
    }

    const response = await this.customer.query(query);

    return response.map((row) => ({
      id: row.campaign.id,
      name: row.campaign.name,
      status: row.campaign.status,
      channelType: row.campaign.advertising_channel_type,
      biddingStrategy: row.campaign.bidding_strategy_type,
      dailyBudget:
        (parseInt(row.campaign_budget?.amount_micros) || 0) / 1000000,
      impressions: parseInt(row.metrics?.impressions) || 0,
      clicks: parseInt(row.metrics?.clicks) || 0,
      cost: (parseInt(row.metrics?.cost_micros) || 0) / 1000000,
    }));
  }

  /**
   * Create a new Search campaign
   */
  async createSearchCampaign(config) {
    this.initialize();

    const {
      name,
      dailyBudget,
      locations, // array of geo target IDs
      startDate, // YYYY-MM-DD format
      endDate, // optional
    } = config;

    // Create budget
    const budgetResource = await this.customer.campaignBudgets.create([
      {
        name: `${name} Budget`,
        amount_micros: dailyBudget * 1000000,
        delivery_method: enums.BudgetDeliveryMethod.STANDARD,
      },
    ]);

    // Create campaign
    const campaignResource = await this.customer.campaigns.create([
      {
        name,
        status: enums.CampaignStatus.PAUSED, // Start paused for review
        advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
        bidding_strategy_type: enums.BiddingStrategyType.MAXIMIZE_CONVERSIONS,
        campaign_budget: budgetResource[0].resource_name,
        start_date: startDate,
        end_date: endDate || null,
        network_settings: {
          target_google_search: true,
          target_search_network: true,
          target_content_network: false,
        },
      },
    ]);

    // Add location targeting
    if (locations && locations.length > 0) {
      const geoTargets = locations.map((geoId) => ({
        campaign: campaignResource[0].resource_name,
        geo_target_constant: `geoTargetConstants/${geoId}`,
      }));
      await this.customer.campaignCriteria.create(geoTargets);
    }

    return {
      success: true,
      campaignId: campaignResource[0].resource_name,
      budgetId: budgetResource[0].resource_name,
      message: `Campaign "${name}" created successfully (PAUSED)`,
    };
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId, status) {
    this.initialize();

    await this.customer.campaigns.update([
      {
        resource_name: `customers/${this.customerId}/campaigns/${campaignId}`,
        status: enums.CampaignStatus[status],
      },
    ]);

    return { success: true, campaignId, status };
  }

  /**
   * Get keyword performance
   */
  async getKeywordPerformance(campaignId = null, dateRange = "LAST_30_DAYS") {
    this.initialize();

    let query = `
      SELECT
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group.name,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.average_cpc
      FROM keyword_view
      WHERE segments.date DURING ${dateRange}
    `;

    if (campaignId) {
      query += ` AND campaign.id = ${campaignId}`;
    }

    query += ` ORDER BY metrics.clicks DESC LIMIT 50`;

    const response = await this.customer.query(query);

    return response.map((row) => ({
      keyword: row.ad_group_criterion?.keyword?.text,
      matchType: row.ad_group_criterion?.keyword?.match_type,
      adGroup: row.ad_group?.name,
      campaign: row.campaign?.name,
      impressions: parseInt(row.metrics?.impressions) || 0,
      clicks: parseInt(row.metrics?.clicks) || 0,
      cost: (parseInt(row.metrics?.cost_micros) || 0) / 1000000,
      conversions: parseFloat(row.metrics?.conversions) || 0,
      avgCpc: (parseInt(row.metrics?.average_cpc) || 0) / 1000000,
    }));
  }

  /**
   * Get location-based performance (useful for MT vs TX analysis)
   */
  async getLocationPerformance(dateRange = "LAST_30_DAYS") {
    this.initialize();

    const response = await this.customer.query(`
      SELECT
        geographic_view.country_criterion_id,
        geographic_view.location_type,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM geographic_view
      WHERE segments.date DURING ${dateRange}
      ORDER BY metrics.clicks DESC
      LIMIT 50
    `);

    return response.map((row) => ({
      locationId: row.geographic_view?.country_criterion_id,
      locationType: row.geographic_view?.location_type,
      campaign: row.campaign?.name,
      impressions: parseInt(row.metrics?.impressions) || 0,
      clicks: parseInt(row.metrics?.clicks) || 0,
      cost: (parseInt(row.metrics?.cost_micros) || 0) / 1000000,
      conversions: parseFloat(row.metrics?.conversions) || 0,
    }));
  }
}

// Export singleton instance
module.exports = new GoogleAdsService();

// Also export class for testing
module.exports.GoogleAdsService = GoogleAdsService;
