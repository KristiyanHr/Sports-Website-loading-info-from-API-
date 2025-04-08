exports.dashboard = (req, res) => {
    res.render('main/dashboard', { title: 'Dashboard',  user: req.session.user, query: req.query});
};