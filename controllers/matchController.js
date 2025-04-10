const match_details = async (req, res) => {
    const fixtureId = req.params.fixtureId;
    res.render('matches/matchDetails', { title: 'Match Details', fixtureId: fixtureId, user: req.session.user });
};

module.exports = {
    match_details
};