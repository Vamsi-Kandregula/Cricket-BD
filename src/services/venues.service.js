const { executeQuery } = require('../config/snowflake');

/**
 * Service to fetch venue performance statistics from Snowflake.
 * Queries the MART_VENUE_STATS table/view and maps database columns to the camelCase schema.
 * @returns {Promise<Array>} Mapped venue metrics list
 */
const getVenues = async () => {
  const query = 'SELECT * FROM MART_VENUE_STATS';
  const rows = await executeQuery(query);

  return rows.map(row => ({
    venueName: row.VENUE_NAME,
    city: row.CITY,
    country: row.COUNTRY,
    matchesPlayed: Number(row.MATCHES_PLAYED ?? 0),
    avgInnings1Score: Number(row.AVG_INNINGS_1_SCORE ?? 0),
    avgInnings2Score: Number(row.AVG_INNINGS_2_SCORE ?? 0),
    highestScore: row.HIGHEST_SCORE || 'N/A',
    highestScorerTeam: row.HIGHEST_SCORER_TEAM || 'N/A',
    flagCode: row.FLAG_CODE || 'un',
    latitude: Number(row.LATITUDE ?? 0),
    longitude: Number(row.LONGITUDE ?? 0),
    mapX: Number(row.MAP_X ?? 250),
    mapY: Number(row.MAP_Y ?? 150)
  }));
};

module.exports = {
  getVenues
};
