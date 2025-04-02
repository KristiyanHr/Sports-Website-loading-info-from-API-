const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchSchema = new Schema({
    fixtureId: {
        type: Number, // Or String, depending on the API response
        required: true,
        unique: true
    },
    leagueApiId: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    matchData: {
        type: Object,
        required: true
    },
    fetchedAt: {
        type: Date,
        default: Date.now
    }
});

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;