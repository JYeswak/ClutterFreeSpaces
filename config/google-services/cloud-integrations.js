// Google Cloud Integrations for Search Console API
const { google } = require('googleapis');

async function getSearchConsoleData(options = {}) {
  try {
    console.log('🔍 Fetching Google Search Console data...');

    // Initialize Google Auth with Application Default Credentials
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    const client = google.searchconsole({ version: 'v1', auth });

    // List available sites
    const listResponse = await client.sites.list();
    const sites = listResponse.data.siteEntry || [];

    if (sites.length === 0) {
      return {
        success: false,
        message: 'No Search Console sites found',
        data: { sites: [] }
      };
    }

    // Use the first available site or try to find our primary domain
    let targetSiteUrl = sites[0].siteUrl;
    const primarySite = sites.find(site =>
      site.siteUrl.includes('clutterfreespaces.com') ||
      site.siteUrl.includes('clutter-free-spaces.com')
    );

    if (primarySite) {
      targetSiteUrl = primarySite.siteUrl;
    }

    console.log(`📊 Using Search Console site: ${targetSiteUrl}`);

    // Get search analytics data - past 7 days by default
    const daysToFetch = options.days || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);
    const endDate = new Date();

    const analyticsRequest = {
      siteUrl: targetSiteUrl,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['date', 'query', 'page', 'country'],
        rowLimit: 100,
        sort: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }]
      }
    };

    const analyticsResponse = await client.searchanalytics.query(analyticsRequest);

    // Get sitemap data
    let sitemaps = [];
    try {
      const sitemapResponse = await client.sites.get({
        name: `${targetSiteUrl.split('://')[1]}/sitemaps` // Extract domain part
      });
      sitemaps = sitemapResponse.data || [];
    } catch (sitemapError) {
      console.log('⚠️ Could not fetch sitemaps:', sitemapError.message);
    }

    // Get indexing status (site-wide)
    let indexingStatus = null;
    try {
      const crawlErrorsResponse = await client.urlCrawlErrorsCounts.query({
        parent: `sites/${targetSiteUrl}`
      });
      indexingStatus = crawlErrorsResponse.data;
    } catch (indexingError) {
      console.log('⚠️ Could not fetch indexing status:', indexingError.message);
    }

    const result = {
      success: true,
      site: {
        url: targetSiteUrl,
        permissionLevel: targetSite?.permissionLevel || 'unknown'
      },
      analytics: {
        period: `${daysToFetch} days`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        rows: analyticsResponse.data.rows || [],
        rowCount: analyticsResponse.data.rows?.length || 0
      },
      sitemaps: sitemaps,
      indexingStatus: indexingStatus,
      allSites: sites.map(site => ({
        url: site.siteUrl,
        permissionLevel: site.permissionLevel
      }))
    };

    console.log(`✅ Search Console data retrieved: ${result.analytics.rowCount} rows`);
    return result;

  } catch (error) {
    console.error('❌ Search Console API error:', error);
    return {
      success: false,
      error: error.message,
      details: error.response?.data,
      timestamp: new Date().toISOString()
    };
  }
}

// Get detailed search analytics for specific date range
async function getSearchAnalytics(dateRange = {}) {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    const client = google.searchconsole({ version: 'v1', auth });

    // List sites to get the first available one
    const listResponse = await client.sites.list();
    const sites = listResponse.data.siteEntry || [];

    if (sites.length === 0) {
      throw new Error('No Search Console sites found');
    }

    const targetSiteUrl = sites[0].siteUrl;

    const analyticsRequest = {
      siteUrl: targetSiteUrl,
      requestBody: {
        startDate: dateRange.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: dateRange.end || new Date().toISOString().split('T')[0],
        dimensions: dateRange.dimensions || ['date', 'query', 'page'],
        dataState: dateRange.dataState || 'all',
        rowLimit: dateRange.rowLimit || 500,
        sort: dateRange.sort || [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }]
      }
    };

    const response = await client.searchanalytics.query(analyticsRequest);

    return {
      success: true,
      data: response.data,
      site: targetSiteUrl
    };
  } catch (error) {
    console.error('Search Analytics error:', error);
    throw error;
  }
}

// Get Search Console sitemaps
async function getSitemaps() {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    const client = google.searchconsole({ version: 'v1', auth });

    const listResponse = await client.sites.list();
    const sites = listResponse.data.siteEntry || [];

    if (sites.length === 0) {
      throw new Error('No Search Console sites found');
    }

    const sitemaps = [];

    for (const site of sites) {
      try {
        const sitemapResponse = await client.sites.get({
          name: `${site.siteUrl}/sitemaps`
        });
        sitemaps.push({
          site: site.siteUrl,
          data: sitemapResponse.data
        });
      } catch (siteError) {
        console.log(`No sitemaps for ${site.siteUrl}:`, siteError.message);
      }
    }

    return {
      success: true,
      sitemaps: sitemaps
    };
  } catch (error) {
    console.error('Sitemaps error:', error);
    throw error;
  }
}

// Get Search Console indexing information
async function getIndexingStatus() {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    const client = google.searchconsole({ version: 'v1', auth });

    const listResponse = await client.sites.list();
    const sites = listResponse.data.siteEntry || [];

    if (sites.length === 0) {
      return { success: false, message: 'No sites found' };
    }

    const indexingData = [];

    for (const site of sites) {
      try {
        // Get crawl errors summary
        const errorsResponse = await client.urlCrawlErrorsCounts.query({
          parent: site.siteUrl
        });

        indexingData.push({
          site: site.siteUrl,
          errors: errorsResponse.data,
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        indexingData.push({
          site: site.siteUrl,
          error: error.message,
          lastUpdated: new Date().toISOString()
        });
      }
    }

    return {
      success: true,
      data: indexingData
    };
  } catch (error) {
    console.error('Indexing status error:', error);
    throw error;
  }
}

module.exports = {
  getSearchConsoleData,
  getSearchAnalytics,
  getSitemaps,
  getIndexingStatus
};
