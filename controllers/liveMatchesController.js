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
    res.render('index', { title:"Мачове на живо", liveMatches: response.data.response, user: req.session.user });
  } catch (error) {
    console.error('Грешка при зареждането на мачове на живо:', error);
    res.render('index', { title:"Мачове на живо", liveMatches: [] ,user: req.session.user});
  }
};

module.exports = {
  fetchLiveMatches
};