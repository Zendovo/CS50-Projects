const express = require('express');
const { ensureAuthenticated } = require('../config/auth');
const {pool} = require('../lib/Users');

const router = express.Router();

router.get('/', ensureAuthenticated, (req, res) => {

    pool.query('SELECT code FROM friend_request_code WHERE user_id=$1', [req.user.id], (err, codes) => {
        
    pool.query('SELECT users.name, friend_requests.sender_id, CAST(EXTRACT(epoch FROM friend_requests.timestamp) AS BIGINT), friend_requests.receiver_id FROM friend_requests INNER JOIN users ON friend_requests.sender_id=users.id WHERE receiver_id=$1', [req.user.id], (err, requests) => {
    
    pool.query('SELECT friends.id, friends.friend_id, users.name, users.email FROM friends INNER JOIN users ON friends.friend_id=users.id WHERE user_id=$1', [req.user.id], (err, friends) => {

        console.log(requests.rows)
        
        res.render('friends', {
            friendRequestCode: codes.rows[0].code,
            friendRequests: requests.rows,
            friends: friends.rows
        })

    })
        
    })

    })

})

router.post('/', ensureAuthenticated, (req, res) => {

    var regenCode = code => {

        pool.query('UPDATE friend_request_code SET code=$1 WHERE user_id=$2', [code, req.user.id], (err, result) => {
            
            if (err !== undefined) {
                if(err.code === '23505' && err.contraint === 'friend_request_code_code_key') {
                    regenCode(randomString(6))
                    return
                }
            }

            // Log error

            req.flash('success_msg', 'Refreshed code!')
            res.redirect('/friends')

        })
    }
    regenCode(randomString(6))

})

router.post('/sendrequest', ensureAuthenticated, (req, res) => {

    pool.query('SELECT user_id FROM friend_request_code WHERE code=$1', [req.body.friendCode], (err, findUser) => {

        // Log error

        if (findUser.rowCount !== 1) {
            req.flash('error_msg', 'User not found! Invalid code.')
            res.redirect('/friends')
            return
        }

        var friend_id = findUser.rows[0].user_id

        pool.query('SELECT * FROM friends WHERE user_id=$1 AND friend_id=$2', [req.user.id, friend_id], (err, checkExistingFriend) => {

            if (checkExistingFriend.rowCount !== 0) {
                req.flash('error_msg', 'You are already friends with this person! Check your friends section!')
                res.redirect('/friends')
                return
            }

            pool.query('SELECT sender_id, receiver_id FROM friend_requests WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)', [req.user.id, friend_id], (err, result) => {

                if (result.rowCount > 0) {

                    if(result.rows[0].sender_id === req.user.id) {

                        req.flash('error_msg', 'It seems you have already sent this user a friend request!')
                        res.redirect('/friends')

                    } else {

                        req.flash('success_msg', 'It seems both of you tried sending each other friend requests, so we have added you!')
                        addFriend(req.user.id, friend_id)
                        res.redirect('/friends')

                    }
                    return;
                }
                
                pool.query('INSERT INTO friend_requests (sender_id, receiver_id) VALUES ($1, $2)', [req.user.id, friend_id], (err, result) => {
                    req.flash('success_msg', 'Friend Request Sent!')
                    res.redirect('/friends')
                })
            })

        })

    })

})

router.post('/acceptrequest', ensureAuthenticated, (req, res) => {

    pool.query('SELECT count(*) FROM friend_requests WHERE sender_id=$1 AND receiver_id=$2', [req.body.sender, req.user.id], (err, result) => {

        // Log error
        if (err) {
            req.flash('error_msg', 'Some error occurred.');
            return res.redirect('/friends');
        }

        addFriend(req.body.sender, req.user.id);

    })

});

router.post('/deleterequest', ensureAuthenticated, (req, res) => {

    var result = deleteRequest(req.body.sender, req.user.id);

    if (result === undefined) {
        req.flash('error_msg', 'Some error occurred.');
        return res.redirect('/friends');
    }

    req.flash('success_msg', 'Friend request deleted.');
    res.redirect('/friends');

});

function addFriend(user1, user2) {

    pool.query('INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)', [user1, user2], (err, result) => {

        // Log error

        // if (err) throw err;
        if (err) return err;
    })

    pool.query('INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)', [user2, user1], (err, result) => {
        
        // Log error
        
        // if (err) throw err;
        if (err) return err;
    })

    deleteRequest(user1, user2)
    
}

function deleteRequest(user1, user2) {

    pool.query('DELETE FROM friend_requests WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)', [user1, user2], (err, result) => {

        // if (err) throw err;

        return result;
    })
    
}

function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

module.exports = router;