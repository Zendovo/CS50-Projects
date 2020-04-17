const express = require('express')

const router = express.Router()

router.get('/login', (req, res, next) => {

    res.send('Login')
});

router.get('/register', (req, res, next) => {

    res.send('Register')
});

module.exports = router;