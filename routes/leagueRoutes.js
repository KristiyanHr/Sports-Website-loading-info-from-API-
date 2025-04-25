const express = require('express');
const leagueController = require('../controllers/leagueController');

const router = express.Router();

router.get('/', leagueController.league_index);

router.get('/:id', leagueController.league_details);    
module.exports = router;