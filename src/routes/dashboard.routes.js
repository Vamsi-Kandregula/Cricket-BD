const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const matchesController = require('../controllers/matches.controller');
const venuesController = require('../controllers/venues.controller');

// GET /api/dashboard
router.get('/dashboard', dashboardController.getDashboardSummary);

// GET /api/matches
router.get('/matches', matchesController.getMatches);

// GET /api/venues
router.get('/venues', venuesController.getVenues);

module.exports = router;

