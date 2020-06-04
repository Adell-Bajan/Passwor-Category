const express = require('express');
const path = require('path');
const config = require('./config/database');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');


// Conect to DataBase
mongoose.connect(config.database);
const db = mongoose.connection;
db.on('error', console.error.bind('console', 'connection errpr'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});




// Iniy app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Connect flash
app.use(flash());

// Passport config
require('./config/passport')(passport);

// Global Vars 
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


// Passport middlwere
app.use(passport.initialize());
app.use(passport.session());



//Body parser midllewere
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());



// Route **
app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});


// Set Routes
const indexRouter = require('./routes/index');


// Middlwere
app.use('/', indexRouter);


// Start the server
const port = 4000;
app.listen(port, function() {
    console.log('Server started on port' + port);
})