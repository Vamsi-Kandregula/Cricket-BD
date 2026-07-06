const dashboardService = require('../services/dashboard.service');

/**
 * Controller to handle dashboard summary endpoint.
 * Calls service and outputs JSON representation.
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const summaryData = await dashboardService.getDashboardSummary();
    return res.status(200).json(summaryData);
  } catch (error) {
    console.error('Controller Error [getDashboardSummary]:', error);
    // Explicitly return 500 if snowflake fails as per requirement
    return res.status(500).json({
      status: 'ERROR',
      message: 'Snowflake database query failed to execute.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDashboardSummary
};
