const League = require('../models/League');
// const { getFootballLeagues } = require('../apiCalls');
const Match = require('../models/Match');
const axios = require('axios');

// const fetchAndStoreLeagues = async (req, res) => {
//     try {
//         const leaguesFromApi = await getFootballLeagues();

//         if (leaguesFromApi && leaguesFromApi.length > 0) {
//             for (const leagueData of leaguesFromApi) {
//                 const existingLeague = await League.findOne({ apiId: leagueData.league.id });

//                 if (!existingLeague) {
//                     const newLeague = new League({
//                         name: leagueData.league.name,
//                         apiId: leagueData.league.id,
//                     });
//                     await newLeague.save();
//                 }
//             }
//             res.send('Successfully fetched and stored new leagues!'); 
//         } else {
//             res.send('No new leagues fetched from the API.');
//         }
//     } catch (error) {
//         console.error("Error fetching and storing leagues:", error);
//         res.status(500).send('Error fetching leagues.');
//     }
// };

const homepageLeagues = [
    { name: 'Premier League', identifier: 'premier-league', apiId: 39 ,  logoUrl: 'https://media.api-sports.io/football/leagues/39.png'},
    { name: 'Bundesliga', identifier: 'bundesliga', apiId: 78, logoUrl: 'https://media.api-sports.io/football/leagues/78.png'},     
    { name: 'La Liga', identifier: 'la-liga', apiId: 140, logoUrl: 'https://media.api-sports.io/football/leagues/140.png'},      
    { name: 'Serie A', identifier: 'serie-a', apiId: 135 , logoUrl: 'https://media.api-sports.io/football/leagues/135.png'},
    { name: 'Champions League', identifier: 'champions-league', apiId: 2 , logoUrl: 'https://media.api-sports.io/football/leagues/2.png'},
    { name: 'Europa League', identifier: 'europa-league', apiId: 3, logoUrl: 'https://media.api-sports.io/football/leagues/3.png'},
    { name: 'World Cup', identifier: 'world-cup', apiId: 1 ,logoUrl: 'https://media.api-sports.io/football/leagues/1.png'},
    { name: 'Bulgarian First League', identifier: 'bulgarian-first-league', apiId: 172, logoUrl: 'https://media.api-sports.io/football/leagues/172.png'}
];

const league_index = (req, res) => {
    res.render('leagues/leagueIndex', { title: 'Football Leagues', leagues: homepageLeagues, user: req.session.user});
};

const league_details = async (req, res) => {
    const leagueIdentifier = req.params.id;

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
                selectedDate: queryDate,
                selectedLeague: selectedLeague,
                user: req.session.user
            });
        } else {
            const apiKey = process.env.RAPIDAPI_KEY;
            const fixturesApiUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures';
            const currentSeason = '2024'; 

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
                        console.log( new Date(selectedDate).getMonth() > 6 ? new Date(selectedDate).getFullYear() : new Date(selectedDate).getFullYear() - 1);
                        // console.log(`Мач с ID ${match.fixture.id} беше успешно запазен.`); - DEBUGGING
                    } catch (error) {
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
                    selectedDate: queryDate,
                    selectedLeague: selectedLeague,
                    user: req.session.user 
                });
            } else {
                // If no matches are returned from the API
                res.render(viewName, {
                    title: `Matches in ${selectedLeague.name} on ${queryDate}`,
                    leagueName: selectedLeague.name,
                    matches: [],
                    selectedDate: queryDate,
                    selectedLeague: selectedLeague,
                    user: req.session.user 
                });
            }
        }
    } catch (error) {
        console.error(`Error fetching matches for ${selectedLeague.name}:`, error);
        res.status(500).send(`Error fetching today's matches for ${selectedLeague.name}.`);
    }
};

module.exports = {
    league_index,
    league_details
};