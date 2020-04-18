const express = require('express');
const { ensureAuthenticated } = require('../config/auth');
const {pool} = require('../lib/Users');

const router = express.Router();

router.get('/', ensureAuthenticated, (req, res) => {

    pool.query('SELECT id, schedule FROM schedules WHERE email=$1', [req.user.email], (err, result) => {

        res.render('dashboard', {
            name: req.user.name,
            schedules: result.rows
        });

    })

});

module.exports = router;