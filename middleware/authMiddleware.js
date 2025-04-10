const ensureAuthenticated = (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    res.redirect('/login');
  };
  
  const forwardAuthenticated = (req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    res.redirect('/dashboard');
  };
  
  module.exports = { ensureAuthenticated, forwardAuthenticated };