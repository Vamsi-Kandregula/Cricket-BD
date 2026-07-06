const matchesService = require('../services/matches.service');

/**
 * Controller to handle matches list endpoint.
 * Calls service and outputs JSON representation.
 */
const getMatches = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      matchType: req.query.matchType,
      search: req.query.search
    };

    const matchesData = await matchesService.getMatches(filters);
    return res.status(200).json(matchesData);
  } catch (error) {
    console.error('Controller Error [getMatches]:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Snowflake database query failed to execute.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getMatches
};
