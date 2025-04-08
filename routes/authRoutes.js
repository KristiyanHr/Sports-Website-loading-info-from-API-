const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/register', authController.registerForm);
router.post('/register', authController.registerUser);

router.get('/login', authController.loginForm);
router.post('/login', authController.loginUser);

router.get('/logout', authController.logout);

module.exports = router;