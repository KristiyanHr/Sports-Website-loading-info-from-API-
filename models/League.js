const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leagueSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    apiId: {
        type: Number,
        required: true,
        unique: true
    },
    logoUrl: {
        type: String,
        required: false 
    },
}, { timestamps: true });

const League = mongoose.model('League', leagueSchema);
module.exports = League;