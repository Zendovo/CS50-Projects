const express = require('express');
const { ensureAuthenticated } = require('../config/auth');
const getAvailTime = require('../lib/getAvailTime');
const {pool} = require('../lib/Users');

const router = express.Router();

router.get('/:id', ensureAuthenticated, (req, res) => {

    var id = req.params.id;

    pool.query('SELECT id FROM schedules WHERE id=$1 AND user_id=$2', [id, req.user.id], (err, result) => {

        if (result.rowCount > 0) {
        
            pool.query('SELECT id, user_id, friend_id FROM friends WHERE user_id=$1', [req.user.id], (err, result1) => {
                
                req.flash('success_msg', 'Changed name successfully!')
                res.redirect('/dashboard')
            })

        } else {

            req.flash('error_msg', 'Error occurred, please try again!')
            res.redirect('/dashboard')
        }

    })

    res.render('plan', {
        
    })

});

router.post('/', ensureAuthenticated, (req, res) => {

    

});

router.get('/codes', (req, res) => {

    res.render('codes')

});

router.post('/codes', (req, res) => {

    var count = req.body.count;

    var schedules = [];
    var duration = req.body.duration;

    for (let i = 0; i < count; i++) {
        
        try {
            var sch = JSON.parse(req.body['code_' + (i+1)])
        } catch (error) {
            req.flash('error_msg', 'Invalid Code.')
            res.redirect('/plan/codes')
        }
        
        schedules.push(sch);
    }
    
    var obj = getAvailTime(schedules, duration)

    if (obj.msg === 'ERROR') {
        req.flash('error_msg', 'Invalid Code.')
        res.redirect('/plan/codes')
        return
    }

    res.render('output', {
        schedule: JSON.stringify(obj.schedule),
        freeSlots: obj.freeSlots,
        duration
    })

});

module.exports = router;