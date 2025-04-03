// Import the User model
const User = require('../models/user');
const bcrypt = require('bcrypt'); // We'll need this for password hashing

// Function to display the registration form
exports.registerForm = (req, res) => {
    res.render('auth/register', { title: 'Register' }); // We'll create this view later
};

// Function to handle user registration
exports.registerUser = async (req, res) => {
    try {
        // We'll add the registration logic here in the next step
        console.log(req.body); // For now, let's just log the submitted data
        res.send('Registration in progress!');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Error during registration.');
    }
};

// We'll add login and logout functions later