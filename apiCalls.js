const axios = require('axios');
require('dotenv').config();

async function getFootballLeagues() {
    try {
        const options = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/leagues',
            params: { country: 'Bulgaria' },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY, // Use the API key from .env
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        return response.data.response; // Returns the list of leagues
    } catch (error) {
        console.error("Error fetching leagues:", error);
        return [];
    }
}

module.exports = { getFootballLeagues };