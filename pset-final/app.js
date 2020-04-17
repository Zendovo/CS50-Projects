const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const {createTable} = require('./lib/Users');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const logger = require('./middleware/logger');
const scheduler = require('./lib/scheduler');

const app = express();

// Passport config
require('./config/passport')(passport);

app.use(express.static(path.join(__dirname, '/public')));

// Table creation
createTable();

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
}))

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/users'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/schedule', require('./routes/schedule'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));