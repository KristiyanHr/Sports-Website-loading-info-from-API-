const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leagueSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    apiId: { // The ID from the external sports API
        type: Number,
        required: true,
        unique: true
    },
    // You might want to add other relevant fields like country, logo URL, etc.
}, { timestamps: true });

const League = mongoose.model('League', leagueSchema);
module.exports = League;