const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

const logger = require('./middleware/logger');
const scheduler = require('./lib/scheduler');

const app = express();

// Logger
// app.use(logger);

app.use(express.static(path.join(__dirname, '/public')));

// Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/', require('./routes/index'));
app.use('/', require('./routes/users'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));