const express = require('express');
const leagueController = require('../controllers/leagueController');

const router = express.Router();

// Route to fetch and store leagues (you might run this only once or periodically)
router.get('/fetch-leagues', leagueController.fetchAndStoreLeagues);

// Route to display the list of leagues on the homepage
router.get('/', leagueController.league_index);

// Route to display details for a specific league (using the identifier)
router.get('/:id', leagueController.league_details);

module.exports = router;