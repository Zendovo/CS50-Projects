const express = require('express');
const path = require('path');

const logger = require('./middleware/logger');
const scheduler = require('./lib/scheduler');

const app = express();

// Logger
// app.use(logger);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', require('./routes/index'));


const PORT = 5000 || process.env.PORT;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));