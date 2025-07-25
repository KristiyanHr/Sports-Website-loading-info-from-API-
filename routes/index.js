const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');
const matchController = require('../controllers/matchController');
const liveMatchesController = require('../controllers/liveMatchesController');
const dashboardController = require('../controllers/dashboardController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.get('/', liveMatchesController.fetchLiveMatches);

router.get('/leagues/:id', leagueController.league_details);

router.get('/match-details/:fixtureId', matchController.match_details);

router.get('/dashboard', ensureAuthenticated, dashboardController.dashboard);

module.exports = router;