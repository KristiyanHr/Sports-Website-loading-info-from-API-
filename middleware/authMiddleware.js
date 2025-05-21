const User = require('../models/user');

const ensureAuthenticated = async (req, res, next) => {
  
  if (req.session.user) {
    try {
      const user = await User.findById(req.session.user.id);

      if (user) {
        req.user = user;
        return next();
      } else {
        console.log('Потребителят не е намерен в БД, унищожаване на сесията.');
        req.session.destroy(err => {
          if (err) {
            console.error('Грешка при унищожаване на сесията:', err);
          }
          res.redirect('/login');
        });
      }
    } catch (error) {
      console.error('Грешка при зареждането на потребител:', error);
      res.redirect('/login');
    }
  } else {
    console.log('req.session.user не е дефинирано, пренасочване към /login');
    res.redirect('/login');
  }
};

const forwardAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  res.redirect('/dashboard');
};

module.exports = { ensureAuthenticated, forwardAuthenticated };