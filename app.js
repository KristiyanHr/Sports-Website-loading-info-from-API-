const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const leagueRoutes = require('./routes/leagueRoutes');

require('dotenv').config(); // Make sure this is at the top

const dbURI = 'mongodb+srv://netninja:test1234@nodeandmongo.ciemb.mongodb.net/Sport_Website?retryWrites=true&w=majority&appName=NodeAndMongo';

const app = express();

//connect to DB
mongoose.connect(dbURI)
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));


//register view engine
app.set('view engine', 'ejs');

//middleware and static files(css, etc)
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));

//routes
app.get('/',(req,res)=>{
    res.redirect('/leagues'); // Redirect to the leagues list
});

app.get('/about',(req,res)=>{
    res.render('about', {title: 'About'});
});

app.use('/leagues', leagueRoutes); // Use the league routes

//404 page // FUNCTION use() going trough all the options after all the code above it
app.use((req,res)=>{
    res.status(404).render('404', {title: '404'})
});