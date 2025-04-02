const axios = require('axios');

async function getFootballLeagues() {
    try {
        const options = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/leagues',
            params: { country: 'Bulgaria' },
            headers: {
                'x-rapidapi-key': '5caf7251e3msh1bda1efb6ce0519p123d34jsnb32d826f9d79',
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        return response.data.response; // Връща само списъка с лиги
    } catch (error) {
        console.error("Error fetching leagues:", error);
        return [];
    }
}

module.exports = {getFootballLeagues};