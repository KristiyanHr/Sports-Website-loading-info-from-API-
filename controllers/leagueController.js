const League = require('../models/League');
const { getFootballLeagues } = require('../apiCalls');
const Match = require('../models/Match');
const axios = require('axios');

const fetchAndStoreLeagues = async (req, res) => {
    try {
        const leaguesFromApi = await getFootballLeagues();

        if (leaguesFromApi && leaguesFromApi.length > 0) {
            for (const leagueData of leaguesFromApi) {
                const existingLeague = await League.findOne({ apiId: leagueData.league.id });

                if (!existingLeague) {
                    const newLeague = new League({
                        name: leagueData.league.name,
                        apiId: leagueData.league.id,
                    });
                    await newLeague.save();
                }
            }
            res.send('Successfully fetched and stored new leagues!'); 
        } else {
            res.send('No new leagues fetched from the API.');
        }
    } catch (error) {
        console.error("Error fetching and storing leagues:", error);
        res.status(500).send('Error fetching leagues.');
    }
};

const homepageLeagues = [
    { name: 'Premier League', identifier: 'premier-league', apiId: 39 },
    { name: 'Bundesliga', identifier: 'bundesliga', apiId: 78 },     
    { name: 'La Liga', identifier: 'la-liga', apiId: 140 },      
    { name: 'Serie A', identifier: 'serie-a', apiId: 135 },
    { name: 'Champions League', identifier: 'champions-league', apiId: 2 },
    { name: 'Europa League', identifier: 'europa-league', apiId: 3 },
    { name: 'World Cup', identifier: 'world-cup', apiId: 1 },
    { name: 'Bulgarian First League', identifier: 'bulgarian-first-league', apiId: 172 }
];

const league_index = (req, res) => {
    res.render('index', { title: 'Football Leagues', leagues: homepageLeagues });
};

const league_details = async (req, res) => {
    const leagueIdentifier = req.params.id;
    console.log("League Identifier:", leagueIdentifier);

    let viewName;

    if (leagueIdentifier === 'premier-league') {
        viewName = 'leagues/premierLeague';
    } else if (leagueIdentifier === 'bundesliga') {
        viewName = 'leagues/bundesliga';
    } else if (leagueIdentifier === 'la-liga') {
        viewName = 'leagues/la-liga';
    } else if (leagueIdentifier === 'serie-a') {
        viewName = 'leagues/serie-a';
    }else if (leagueIdentifier === 'champions-league') {
        viewName = 'leagues/championsLeague';
    } else if (leagueIdentifier === 'europa-league') {
        viewName = 'leagues/europaLeague';
    } else if (leagueIdentifier === 'world-cup') {
        viewName = 'leagues/worldCup';
    } else if (leagueIdentifier === 'bulgarian-first-league') {
        viewName = 'leagues/bgFirstLeague';
    } else {
        return res.status(404).render('404', { title: 'League not found' });
    }

    const selectedLeague = homepageLeagues.find(league => league.identifier === leagueIdentifier);


    try {
         const selectedDate = req.query.date;
         const today = new Date().toISOString().split('T')[0]; 
         const queryDate = selectedDate || today;

        const cachedMatches = await Match.find({ leagueApiId: selectedLeague.apiId, date: queryDate});

        if (cachedMatches.length > 0) {
            res.render(viewName, {
                title: `Matches in ${selectedLeague.name} on ${queryDate}`,
                leagueName: selectedLeague.name,
                matches: cachedMatches.map(match => match.matchData),
                selectedDate: queryDate
            });
        } else {
            // If not found in the database, make an API call
            const apiKey = process.env.RAPIDAPI_KEY;
            const fixturesApiUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures';
            const currentSeason = '2024'; // Ensure this is the correct season

            const options = {
                method: 'GET',
                url: fixturesApiUrl,
                params: {
                    date: queryDate,
                    league: selectedLeague.apiId,
                    season: currentSeason
                },
                headers: {
                    'x-rapidapi-key': apiKey,
                    'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
                }
            };

            const fixturesResponse = await axios.request(options);
            const matchesFromApi = fixturesResponse.data.response;

            if (matchesFromApi && matchesFromApi.length > 0) {
                // Store the fetched matches in the database
                const savedMatches = [];
                for (const match of matchesFromApi) {
                    const newMatch = new Match({
                        fixtureId: match.fixture.id,
                        leagueApiId: match.league.id,
                        date: queryDate,
                        matchData: match
                    });
                    try {
                        const savedMatch = await newMatch.save();
                        savedMatches.push(savedMatch);
                    } catch (error) {
                        // Handle potential duplicate key error (fixtureId already exists)
                        if (error.code !== 11000) {
                            console.error("Error saving match to database:", error);
                        }
                    }
                }
                // Render the view with the newly fetched data
                res.render(viewName, {
                    title: `Matches in ${selectedLeague.name} on ${queryDate}`,
                    leagueName: selectedLeague.name,
                    matches: matchesFromApi,
                    selectedDate: queryDate
                });
            } else {
                // If no matches are returned from the API
                res.render(viewName, {
                    title: `Matches in ${selectedLeague.name} on ${queryDate}`,
                    leagueName: selectedLeague.name,
                    matches: [],
                    selectedDate: queryDate
                });
            }
        }
    } catch (error) {
        console.error(`Error fetching matches for ${selectedLeague.name}:`, error);
        res.status(500).send(`Error fetching today's matches for ${selectedLeague.name}.`);
    }
};

module.exports = {
    fetchAndStoreLeagues,
    league_index,
    league_details
};