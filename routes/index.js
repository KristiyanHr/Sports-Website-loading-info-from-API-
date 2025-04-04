const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');
const matchController = require('../controllers/matchController');

router.get('/', leagueController.league_index);

router.get('/leagues/:id', leagueController.league_details);

router.get('/match-details/:fixtureId', matchController.match_details);

module.exports = router;