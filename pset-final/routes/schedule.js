const express = require('express');
const { ensureAuthenticated } = require('../config/auth');

const router = express.Router();

router.get('/create', ensureAuthenticated, (req, res) => {

    res.render('create', {
        name: req.user.name
    });

});

module.exports = router;