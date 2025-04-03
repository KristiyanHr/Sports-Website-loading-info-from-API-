const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');

router.get('/', leagueController.league_index);

router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

module.exports = router;