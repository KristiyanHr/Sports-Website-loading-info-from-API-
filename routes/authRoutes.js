const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/authMiddleware');

router.get('/register', forwardAuthenticated, authController.registerForm);
router.post('/register', authController.registerUser);

router.get('/login', forwardAuthenticated, authController.loginForm);
router.post('/login', authController.loginUser);

router.get('/logout', ensureAuthenticated, authController.logout);

router.get('/forgot-password', authController.forgotPasswordForm);
router.post('/forgot-password', authController.forgotPassword);

router.get('/reset-password/:token', authController.resetPasswordForm);
router.post('/reset-password/:token', authController.updatePassword);

router.get('/profile', ensureAuthenticated, authController.profilePage );

module.exports = router;