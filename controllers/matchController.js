const match_details = async (req, res) => {
    const fixtureId = req.params.fixtureId;
    res.render('matches/matchDetails', { title: 'Детайли на мача', fixtureId: fixtureId });
};

module.exports = {
    match_details
};