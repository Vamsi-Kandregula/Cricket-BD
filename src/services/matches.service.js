const { executeQuery } = require('../config/snowflake');

/**
 * Service to fetch matches summary from Snowflake.
 * Queries the MART_MATCHES table/view and maps database columns to the API schema.
 * Supports filtering by status, matchType, and search query.
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} List of mapped matches
 */
const getMatches = async (filters = {}) => {
  let query = 'SELECT * FROM MART_MATCHES WHERE 1=1';
  const binds = [];

  if (filters.status) {
    query += ' AND LOWER(STATUS) = LOWER(?)';
    binds.push(filters.status);
  }

  if (filters.matchType) {
    query += ' AND LOWER(MATCHTYPE) = LOWER(?)';
    binds.push(filters.matchType);
  }

  if (filters.search) {
    query += ' AND (LOWER(TEAM_1) LIKE LOWER(?) OR LOWER(TEAM_2) LIKE LOWER(?) OR LOWER(MATCH_NAME) LIKE LOWER(?) OR LOWER(VENUE_NAME) LIKE LOWER(?) OR LOWER(CITY) LIKE LOWER(?))';
    const wildcard = `%${filters.search}%`;
    binds.push(wildcard, wildcard, wildcard, wildcard, wildcard);
  }

  // Sort by date/time descending to show latest matches first
  query += ' ORDER BY MATCH_DATE DESC, MATCH_TIME DESC';

  const rows = await executeQuery(query, binds);

  return rows.map(row => {
    // Map status from database RESULT_TYPE (Live, Completed, Abandoned, No Result)
    // to API status (LIVE, COMPLETED, ABANDONED, NO_RESULT)
    let apiStatus = 'NO_RESULT';
    if (row.RESULT_TYPE) {
      const rt = row.RESULT_TYPE.toUpperCase();
      if (rt === 'LIVE') apiStatus = 'LIVE';
      else if (rt === 'COMPLETED' || rt === 'MATCH TIED') apiStatus = 'COMPLETED';
      else if (rt === 'ABANDONED') apiStatus = 'ABANDONED';
      else if (rt.includes('OUTDATED') || rt.includes('⚠️')) apiStatus = 'OUTDATED';
    }

    return {
      MATCH_ID: row.MATCH_ID,
      MATCH_NAME: row.MATCH_NAME,
      TEAM_1: row.TEAM_1,
      TEAM_2: row.TEAM_2,
      MATCHTYPE: row.MATCHTYPE,
      STATUS: apiStatus,
      // Map API RESULT_TYPE from DB STATUS because DB STATUS has the full description (e.g. "Team won by 6 wkts")
      RESULT_TYPE: (() => {
        if (row.RESULT_TYPE && (row.RESULT_TYPE.includes('⚠️') || row.RESULT_TYPE.toUpperCase().includes('OUTDATED'))) {
          return '⚠️ LIVE STATUS OUTDATED';
        }
        const val = row.STATUS || row.RESULT_TYPE;
        if (val && val.toLowerCase().includes('no result')) {
          return 'No Result';
        }
        return val;
      })(),
      WINNER: row.WINNER,
      WIN_MARGIN: row.WIN_MARGIN,
      MATCH_DATE: row.MATCH_DATE,
      MATCH_TIME: row.MATCH_TIME,
      VENUE_NAME: row.VENUE_NAME,
      CITY: row.CITY,
      MATCHSTARTED: row.MATCHSTARTED === true || row.MATCHSTARTED === 1,
      MATCHENDED: row.MATCHENDED === true || row.MATCHENDED === 1,
      TEAM_1_SCORE: row.TEAM_1_SCORE,
      TEAM_1_OVERS: row.TEAM_1_OVERS,
      TEAM_1_RUN_RATE: row.TEAM_1_RUN_RATE,
      TEAM_2_SCORE: row.TEAM_2_SCORE,
      TEAM_2_OVERS: row.TEAM_2_OVERS,
      TEAM_2_RUN_RATE: row.TEAM_2_RUN_RATE,
      CURRENT_OVERS: row.CURRENT_OVERS
    };
  });
};

module.exports = {
  getMatches
};
