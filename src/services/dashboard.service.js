const { executeQuery } = require('../config/snowflake');

/**
 * Service to fetch dashboard aggregates from Snowflake.
 * Queries the MART_DASHBOARD_SUMMARY table/view and maps database columns to the API schema.
 * @returns {Promise<Object>} Mapped dashboard summary metrics
 */
const getDashboardSummary = async () => {
  const query = 'SELECT * FROM MART_DASHBOARD_SUMMARY LIMIT 1';
  const rows = await executeQuery(query);

  if (!rows || rows.length === 0) {
    // Graceful fallback with empty metrics instead of throwing if table exists but has no data
    return {
      totalMatches: 0,
      liveMatches: 0,
      completedMatches: 0,
      abandonedMatches: 0,
      citiesIngested: 0,
      venuesRegistered: 0,
      matchFormats: 0,
      noResultMatches: 0,
      pipelineStatus: 'synced',
      lastUpdated: new Date().toISOString()
    };
  }

  const row = rows[0];

  return {
    totalMatches: Number(row.TOTAL_MATCHES ?? 0),
    liveMatches: Number(row.LIVE_MATCHES ?? 0),
    completedMatches: Number(row.COMPLETED_MATCHES ?? 0),
    abandonedMatches: Number(row.ABANDONED_MATCHES ?? 0),
    citiesIngested: Number(row.CITIES_INGESTED ?? 0),
    venuesRegistered: Number(row.VENUES_REGISTERED ?? 0),
    matchFormats: Number(row.MATCH_FORMATS ?? 0),
    noResultMatches: Number(row.NO_RESULT_MATCHES ?? 0),
    // Fall back to defaults if these columns are not returned by the dbt model
    pipelineStatus: row.PIPELINE_STATUS || 'synced',
    lastUpdated: row.LAST_UPDATED || new Date().toISOString()
  };
};

module.exports = {
  getDashboardSummary
};
