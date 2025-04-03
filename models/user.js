const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 35
    },
    favoriteLeagues: [{
        type: String 
    }]
}, { timestamps: true }); 

const User = mongoose.model('User', userSchema);

module.exports = User;