const express = require('express');
var passwordValidator = require('password-validator');
const {pool} = require('../lib/Users');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const uuidv4 = require('uuid/v4');

var schema = new passwordValidator();

// Password requirements
schema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits()                                 // Must have digits

const router = express.Router()

router.get('/login', (req, res) => {

    if (req.isAuthenticated()) {
        return res.redirect('/dashboard')
    }

    res.render('login')
});

router.get('/register', (req, res) => {

    if (req.isAuthenticated()) {
        return res.redirect('/dashboard')
    }

    res.render('register')
});

router.post('/register', (req, res) => {

    const { name, email, password, password2 } = req.body;

    let errors = []

    // Check required fields
    if (!name || !email || !password || !password2 ) {
        errors.push({ msg: 'Please fill in all fields! '})
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' })
    }

    // Validate password
    if (!schema.validate(password)) {
        errors.push({ msg: 'Password must have a digit, uppercase letter, lowercase letter and be min 8 in length (100 max)' })
    }

    if (errors.length > 0) {
        res.render('register', { errors, name, email, password, password2 })
    } else {

        // Validation passed

        // Check if email already exists
        try {
            pool.query('SELECT id FROM users WHERE email=$1', [email], (err, result) => {

                if (result.rows[0]) {

                    // Email already exists
                    errors.push({ msg: 'Email is already registered. Try logging in instead.' })
                    res.render('register', { errors, name, email, password, password2 })

                } else {
                    let uuid = uuidv4()
                    let values = [uuid, name, email]

                    // generate salt and hash the password
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) throw err;
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) throw err;
                            values.push(hash)

                            // Add user to the database
                            pool.query('INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)', values, (err, result) => {
                                if (err) throw err;

                                console.log(result)

                                var regenCode = code => {

                                    pool.query('INSERT INTO friend_request_code (user_id, code) VALUES ($2, $1)', [code, uuid], (err, result) => {
                                        
                                        if (err !== undefined) {
                                            if(err.code === '23505' && err.contraint === 'friend_request_code_code_key') {
                                                regenCode(randomString(6))
                                                return
                                            }
                                        }
                            
                                        // Log error
                            
                                        req.flash('success_msg', 'You are now registered! Try logging in!')
                                        res.redirect('/login')
                            
                                    })
                                }
                                regenCode(randomString(6))
                            })
                        })
                    })
                }
            })
            
        } catch (e) {
            throw(e)
        }
        
    }

});

// Login Handler
// router.post('/login', (req, res, next) => {

//     passport.authenticate('local', {
//         successRedirect: '/dashboard',
//         failureRedirect: '/login',
//         failureFlash: true
//     })(req, res, next);

// });

router.post("/login", 

    passport.authenticate('local', { 
        failureRedirect: '/login',
        failureFlash: true
    }),
    
    (req, res) => {
        if (req.body.remember) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
        } else {
          req.session.cookie.expires = false; // Cookie expires at end of session
        }
    res.redirect(req.session.returnTo || '/dashboard');
});

// Logout Handler
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out!');
    res.redirect('/login');
})

function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

module.exports = router;