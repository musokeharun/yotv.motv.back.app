const express = require('express');
const query = express.Router();

query.post("/", ((req, res) => {
    res.json(res.locals);
    res.end()
}))


module.exports = query;