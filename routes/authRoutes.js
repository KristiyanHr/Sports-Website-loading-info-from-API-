const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/register', authController.registerForm);
router.post('/register', authController.registerUser);


// router.get('/login', authController.login);
// router.post('/login', authController.login);

module.exports = router;