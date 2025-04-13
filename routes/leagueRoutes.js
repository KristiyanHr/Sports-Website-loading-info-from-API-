const express = require('express');
const leagueController = require('../controllers/leagueController');

const router = express.Router();

// Route to fetch and store leagues (you might run this only once or periodically)
router.get('/', leagueController.league_index);

router.get('/:id', leagueController.league_details);    
module.exports = router;