const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {

    console.log(req.ip)

    res.render('index', {
        title: 'Welcome!',
        loggedIn: req.isAuthenticated()
    });

});

module.exports = router;