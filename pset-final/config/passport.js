const LocalStrategy = require('passport-local').Strategy;
const {pool} = require('../lib/Users');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {

    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match User
            pool.query('SELECT * FROM users WHERE email=$1', [email], (err, result) => {
                if (err) {
                    console.log(err)
                    return done(null, false, 'An error has occurred.')
                }

                if (result.rows.length === 0) {
                    return done(null, false, { message: 'That email is not registered.' })
                }

                let user = result.rows[0];

                // Match password
                bcrypt.compare(password, user.password, (err, success) => {
                    if (err) throw err;

                    if (success) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'The password and email do not match.'})
                    }
                })
            })
        })
    )

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        pool.query('SELECT * FROM users WHERE id = $1', [id], (err, results) => {
            if(err) {
              console.log('Error when selecting user on session deserialize: ', err)
              return done(err)
            }
        
            done(null, results.rows[0])
        })
    });
    
}