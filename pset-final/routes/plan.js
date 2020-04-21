const express = require('express');
const { ensureAuthenticated } = require('../config/auth');
const getAvailTime = require('../lib/getAvailTime')

const router = express.Router();

router.get('/', ensureAuthenticated, (req, res) => {

    if (req.isAuthenticated()) {

    } else {
        res.render('codes')
    }

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