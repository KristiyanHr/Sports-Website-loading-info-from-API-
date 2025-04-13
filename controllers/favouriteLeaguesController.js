const User = require('../models/user');
const homepageLeagues = [
    { identifier: 'premier-league', name: 'Висша лига', apiId: 39 },
    { identifier: 'bundesliga', name: 'Бундеслига', apiId: 78 },
    { identifier: 'la-liga', name: 'Ла Лига', apiId: 140 },
    { identifier: 'serie-a', name: 'Серия А', apiId: 135 },
    { identifier: 'champions-league', name: 'Шампионска лига', apiId: 2 },
    { identifier: 'europa-league', name: 'Лига Европа', apiId: 3 },
    { identifier: 'world-cup', name: 'Световно първенство', apiId: 1 },
    { identifier: 'bulgarian-first-league', name: 'Първа лига', apiId: 208 }
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
            title: 'Favourite Legues',
            favouriteLeagues: favouriteLeaguesData,
            user: req.user
        });
      } else {
        res.redirect('/login');
      }
    } catch (err) {
      console.error(err);
      res.render('favourites', { 
        title: 'Favourite Leagues', 
        favouriteLeagues: [], 
        error: 'Error while loading favourite leagues.',
        user: req.user
    });
    }
  };

const add_favourite = async (req, res) => {
    console.log('add_favourite function called');
    console.log('req.body:', req.body);
    console.log('req.user:', req.user);
    
    const leagueIdentifier = req.body.leagueId;
    const userId = req.user._id;
    console.log('leagueIdentifier received:', leagueIdentifier);
  
    try {
      const user = await User.findById(userId);
      if (user) {
        if (!user.favouriteLeagues.includes(leagueIdentifier)) {
          console.log('favouriteLeagues before push:', user.favouriteLeagues);
          user.favouriteLeagues.push(leagueIdentifier);
          console.log('favouriteLeagues after push:', user.favouriteLeagues);
          console.log('Attempting to save user:', user); 
          await user.save();
          console.log('User saved successfully.'); 
          res.status(200).json({ message: 'League added to favourites!' });
        } else {
          res.status(200).json({ message: 'League has already been added to favourites.' });
        }
      } else {
        res.status(404).json({ message: 'User was not found.' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error while adding the league to favourites.' });
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
              res.status(200).json({ message: 'League removed from favourites.' });
          } else {
              res.status(404).json({ message: 'User was not found.' });
          }
      } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Error while adding the league to favourites.' });
      }
};
  

module.exports = {
    show_favourites,
    add_favourite,
    remove_favourite
};