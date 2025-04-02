const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teamsSchema = new Schema({
    team: {
        type: String,
        required: true
    },
    league: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    teamId: {
        type: Number,
        required: true
    }
}, {timestamps: true});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;