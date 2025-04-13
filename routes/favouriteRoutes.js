const express = require('express');
const favouriteLeaguesController = require('../controllers/favouriteLeaguesController');
const { ensureAuthenticated } = require('../middleware/authMiddleware'); 
const router = express.Router();

router.post('/add-favourite', ensureAuthenticated, favouriteLeaguesController.add_favourite);
router.post('/remove-favourite', ensureAuthenticated, favouriteLeaguesController.remove_favourite);
router.get('/', ensureAuthenticated, favouriteLeaguesController.show_favourites);

module.exports = router;