const User = require('../models/user');

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

const show_favourites = async (req, res) => {
    const userId = req.user._id;
  
    try {
      const user = await User.findById(userId);
      if (user) {
        const favouriteLeagueIdentifiers = req.user.favouriteLeagues.filter(identifier => identifier !== null);
        const favouriteLeaguesData = homepageLeagues.filter(league =>
          favouriteLeagueIdentifiers.includes(league.identifier)
        );
  
        res.render('favourites', {
            title: 'Любими Лиги',
            leaguesData: favouriteLeaguesData,
            user: req.user
        });
      } else {
        res.redirect('/login');
      }
    } catch (err) {
      console.error(err);
      res.render('favourites', { 
        title: 'Любими Лиги', 
        leaguesData: [], 
        error: 'Грешка при зареждане на любими лиги.',
        user: req.user
    });
    }
};

const add_favourite = async (req, res) => {
  
    const leagueIdentifier = req.body.leagueId;
    const userId = req.user._id;
    console.log('leagueIdentifier received:', leagueIdentifier);
  
    try {
      const user = await User.findById(userId);
      if (user) {
        if (!user.favouriteLeagues.includes(leagueIdentifier)) {
          user.favouriteLeagues.push(leagueIdentifier);
          await user.save();
          console.log('Потребителят беше запазен успешно.'); 
          res.status(200).json({ message: 'Лигата е добавена към любими!' });
        } else {
          res.status(200).json({ message: 'Лигата вече е добавена към любими.' });
        }
      } else {
        res.status(404).json({ message: 'Потребителят не беше намерен.' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Грешка при добавяне на лигата към любими.' });
    }
};
  
const remove_favourite = async (req, res) => {
      const leagueIdentifier = req.body.leagueId;
      const userId = req.user._id;
  
      try {
          const user = await User.findById(userId);
          if (user) {
              user.favouriteLeagues = user.favouriteLeagues.filter(id => id !== leagueIdentifier);
              await user.save();
              res.status(200).json({ message: 'Лигата беше премахната от списъка с любими.' });
          } else {
              res.status(404).json({ message: 'Потребителят не беше намерен.' });
          }
      } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Грешка при премахването на лигата от любими.' });
      }
};
  

module.exports = {
    show_favourites,
    add_favourite,
    remove_favourite
};