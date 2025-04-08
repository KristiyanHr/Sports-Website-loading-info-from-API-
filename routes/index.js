const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');
const matchController = require('../controllers/matchController');
const mainController = require('../controllers/mainController');

const ensureAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

router.get('/', leagueController.league_index);

router.get('/leagues/:id', leagueController.league_details);

router.get('/match-details/:fixtureId', matchController.match_details);

router.get('/dashboard', ensureAuthenticated, mainController.dashboard);

module.exports = router;