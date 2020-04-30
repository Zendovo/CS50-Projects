const express = require('express');
const { ensureAuthenticated } = require('../config/auth');
const {pool} = require('../lib/Users');

const router = express.Router();

router.get('/create', (req, res) => {

    if (req.isAuthenticated()) {
        pool.query('SELECT count(schedule) FROM schedules WHERE user_id = $1;', [req.user.id], (err, result) => {

            if (result.rows[0].count <= 7) {
                res.render('create', {
                    loggedIn: req.isAuthenticated()
                });
            } else {
                req.flash('error_msg', 'You have maxed out your schedule capacity')
                res.redirect('/dashboard')
            }

        })
    } else {
        res.render('create', {
            loggedIn: req.isAuthenticated()
        });
    }

});

router.get('/add', ensureAuthenticated, (req, res) => {

    pool.query('SELECT count(schedule) FROM schedules WHERE user_id = $1;', [req.user.id], (err, result) => {

        if (result.rows[0].count <= 7) {
            var schedule = req.query.schedule
    
            pool.query('INSERT INTO schedules (user_id, schedule) VALUES ($1, $2)', [req.user.id, schedule], (err, result) => {

                // Log error later
                res.redirect('/dashboard')

            })
        } else {
            req.flash('error_msg', 'You have maxed out your schedule capacity')
            res.redirect('/dashboard')
        }

    })

});

router.post('/delete', ensureAuthenticated, (req, res) => {
    
    var id = req.body.id;
    var userId = req.user.id;

    pool.query('DELETE FROM schedules WHERE id=$1 AND user_id=$2', [id, userId], (err, result) => {

        if (err) {
            // Log error

            req.flash('error_msg', 'Some error occurred! Try again or kindly report the issue to us.')
            res.redirect('/dashboard')
        }

        console.log(result);
        req.flash('success_msg', 'Successfully deleted schedule!')
        res.redirect('/dashboard')
    })

})

module.exports = router;