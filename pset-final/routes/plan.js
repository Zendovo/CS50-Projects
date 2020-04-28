const express = require('express');
const { ensureAuthenticated } = require('../config/auth');
const getAvailTime = require('../lib/getAvailTime');
const {pool} = require('../lib/Users');

const router = express.Router();

router.get('/:id(\\d+)', ensureAuthenticated, (req, res) => {

    var id = req.params.id;

    pool.query('SELECT id FROM schedules WHERE id=$1 AND user_id=$2', [id, req.user.id], (err, result) => {

        if (result && result.rowCount > 0) {
        
            pool.query('SELECT friends.friend_id, users.name as friend_name, users.email FROM friends INNER JOIN users ON users.id = friends.friend_id WHERE friends.user_id=$1;', [req.user.id], (err, result1) => {

                var friends = groupBy('friend_id', result1.rows)
                
                res.render('plan', {
                    friends,
                    id,
                    loggedIn: req.isAuthenticated()
                })
            })

        } else {

            req.flash('error_msg', 'Error occurred, please try again!')
            res.redirect('/dashboard')
        }

    })

});

router.post('/:id(\\d+)/sch', ensureAuthenticated, async (req, res) => {

    if (!req.body.participants) {
        return res.redirect('/plan/11')
    }

    var idMatch = await pool.query('SELECT count(*) FROM schedules WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);

    if (!idMatch || idMatch.rowCount === 0) {
        req.flash('error_msg', 'An error occurred.');
        return redirect('/dashboard');
    }

    pool.query('SELECT schedules.id, friends.friend_id, users.name as friend_name, users.email, users.timezone, schedules.schedule, schedules.name AS schedule_name FROM schedules INNER JOIN friends ON schedules.user_id = friends.friend_id INNER JOIN users ON users.id = friends.friend_id WHERE friends.user_id=$1;', [req.user.id], (err, result1) => {

        var friends = groupBy('friend_id', result1.rows)
        var friends = friends.filter(friend => {
            var tmp = req.body.participants.includes(friend.friend_id);
            // console.log(tmp)
            return tmp
        })
        
        res.render('plan_selectSch', {
            friends,
            id: req.params.id,
            peopleCount: friends.length,
            loggedIn: req.isAuthenticated()
        })
    })

});

router.post('/:id(\\d+)/out', ensureAuthenticated, async (req, res) => {

    var schedules = [];
    var duration = req.body.duration;
    var peopleCount = parseInt(req.body.peopleCount);

    var user_sch = await pool.query('SELECT schedule, timezone FROM schedules INNER JOIN users ON schedules.user_id=users.id WHERE schedules.id=$1 AND schedules.user_id=$2', [req.params.id, req.user.id])
    schedules.push({
        sch: JSON.parse(user_sch.rows[0].schedule),
        tz: user_sch.rows[0].timezone
    });

    for (let i = 0; i < peopleCount; i++) {
        
        try {
            var body = req.body[i].split('-')
            if (body.length !== 2) throw 'bad code'
            var sch = JSON.parse(body[0])
            var tz = body[1]
        } catch (error) {
            req.flash('error_msg', 'Invalid Code.')
            res.redirect('/dashboard')
        }
        
        schedules.push({
            sch,
            tz
        });
    }
    
    var obj = await getAvailTime(schedules, duration)

    if (obj.msg === 'ERROR') {
        console.error(obj.error)
        req.flash('error_msg', 'Invalid Code.')
        res.redirect('/dashboard')
        return
    }

    res.render('output', {
        schedule: JSON.stringify(obj.schedule),
        freeSlots: obj.freeSlots,
        duration,
        loggedIn: req.isAuthenticated()
    })    

});

router.get('/codes', (req, res) => {

    res.render('codes', {
        loggedIn: req.isAuthenticated()
    });

});

router.post('/codes', async (req, res) => {

    var count = req.body.count;

    var schedules = [];
    var duration = req.body.duration;

    for (let i = 0; i < count; i++) {
        
        try {
            var body = req.body['code_' + (i+1)].split('-')
            if (body.length !== 2) throw 'bad code'
            var sch = JSON.parse(body[0])
            var tz = body[1]
        } catch (error) {
            console.log(error)
            req.flash('error_msg', 'Invalid Code.')
            return res.redirect('/plan/codes')
        }
        
        schedules.push({
            sch,
            tz
        });
    }
    
    var obj = await getAvailTime(schedules, duration)

    if (obj.msg === 'ERROR') {
        req.flash('error_msg', 'Invalid Code.')
        res.redirect('/plan/codes')
        return
    }

    res.render('output', {
        schedule: JSON.stringify(obj.schedule),
        freeSlots: obj.freeSlots,
        duration,
        loggedIn: req.isAuthenticated()
    })

});

// Didn't understand how it works but it does
// https://stackoverflow.com/questions/39725108/group-by-json-data-in-node

// Thanks Ki Jéy

function groupBy(key, array) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
      var added = false;
      for (var j = 0; j < result.length; j++) {
        if (result[j][key] == array[i][key]) {
          result[j].items.push(array[i]);
          added = true;
          break;
        }
      }
      if (!added) {
        var entry = {items: []};
        entry[key] = array[i][key];
        entry.items.push(array[i]);
        result.push(entry);
      }
    }
    return result;
  }

module.exports = router;