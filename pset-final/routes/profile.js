const express = require('express');
const { ensureAuthenticated } = require('../config/auth');
const { pool } = require('../lib/Users');

const router = express.Router();

router.get('/', ensureAuthenticated, (req, res) => {

    pool.query('SELECT name, email, timezone FROM users WHERE id=$1', [req.user.id], (err, result) => {

        if (err) {
            req.flash('error_msg', 'An error occurred.')
            return res.redirect('/dashboard')
        }
        
        res.render('profile', {
            username: result.rows[0].name,
            email: result.rows[0].email,
            timezone: result.rows[0].timezone,
            loggedIn: req.isAuthenticated()
        });
    })
});

router.get('/edit', ensureAuthenticated, (req, res) => {

    res.render('edit_profile', {
        loggedIn: req.isAuthenticated(),
    });
});

router.post('/edit', ensureAuthenticated, (req, res) => {

    var timezone = req.body.timezone;

    pool.query('UPDATE users SET timezone = $1 WHERE id=$2', [timezone, req.user.id], (err, result) => {

        console.log(err, result)

        if (err) {
            req.flash('error_msg', 'An error occurred.')
            return res.redirect('/profile')
        }

        req.flash('success_msg', 'Profile Update')
        res.redirect('/profile')
    })

});


module.exports = router;