const express = require('express');
const { ensureAuthenticated } = require('../config/auth');
const {pool} = require('../lib/Users');

const router = express.Router();

router.get('/', ensureAuthenticated, (req, res) => {

    pool.query('SELECT id, schedule, name FROM schedules WHERE user_id=$1', [req.user.id], (err, result) => {

        res.render('dashboard', {
            name: req.user.name,
            schedules: result.rows
        });

    });

});

router.post('/:id', ensureAuthenticated, (req, res) => {

    var id = req.params.id;

    pool.query('SELECT id FROM schedules WHERE id=$1 AND user_id=$2', [id, req.user.id], (err, result) => {

        if (result.rowCount > 0) {
        
            pool.query('UPDATE schedules SET name=$1 WHERE id=$2', [req.body.name, id], (err, result1) => {
                
                req.flash('success_msg', 'Changed name successfully!')
                res.redirect('/dashboard')
            })
        } else {

            req.flash('error_msg', 'Error occurred, please try again!')
            res.redirect('/dashboard')
        }

    })
});

module.exports = router;