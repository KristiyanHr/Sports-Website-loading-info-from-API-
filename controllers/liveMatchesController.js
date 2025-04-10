const axios = require('axios');

const fetchLiveMatches = async (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
    params: { live: 'all' },
    headers: {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPIDAPI_KEY
    }
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
    res.render('index', { title:"Live matches", liveMatches: response.data.response, user: req.session.user });
  } catch (error) {
    console.error('Error while fetching live matches:', error);
    res.render('index', { title:"Live matches", liveMatches: [] ,user: req.session.user});
  }
};

module.exports = {
  fetchLiveMatches
};