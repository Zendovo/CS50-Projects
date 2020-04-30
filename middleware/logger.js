const moment = require('moment');

module.exports = (req, res, next) => {

    console.log(
        `${moment().format()}: ${req.method} ${req.originalUrl}`
    )
    next();
    
};