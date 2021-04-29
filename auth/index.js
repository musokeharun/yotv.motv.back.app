const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now())
    next()
})
// define the home page route
router.get('/register', function (req, res) {
    res.send('Register page')
})
// define the about route
router.get('/login', function (req, res) {
    res.send('Login page')
})

module.exports = router