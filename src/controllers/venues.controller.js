const venuesService = require('../services/venues.service');

/**
 * Controller to handle venues list endpoint.
 * Calls service and outputs JSON representation.
 */
const getVenues = async (req, res, next) => {
  try {
    const venuesData = await venuesService.getVenues();
    return res.status(200).json(venuesData);
  } catch (error) {
    console.error('Controller Error [getVenues]:', error);
    // Explicitly return 500 if snowflake database query fails
    return res.status(500).json({
      status: 'ERROR',
      message: 'Snowflake database query failed to execute.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getVenues
};
