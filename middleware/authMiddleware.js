const User = require('../models/user');

const ensureAuthenticated = async (req, res, next) => {
  console.log('ensureAuthenticated is running');
  console.log('req.session.user:', req.session.user);
  if (req.session.user) {
    try {
      const user = await User.findById(req.session.user.id);
      console.log('User found:', user);
      if (user) {
        req.user = user;
        return next();
      } else {
        console.log('User not found in DB, destroying session.');
        req.session.destroy(err => {
          if (err) {
            console.error('Error destroying session:', err);
          }
          res.redirect('/login');
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.redirect('/login');
    }
  } else {
    console.log('req.session.user is undefined, redirecting to /login');
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