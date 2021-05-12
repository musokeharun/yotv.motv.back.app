const express = require('express');
const Partner = express.Router();
const headers = require("../utils/headers");
const axios = require("axios");

Partner.all("/", ((req, res) => res.status(403).json({"msg": "Not Allowed", "status": 403})))

Partner.post("/save", ((req, res) => {

}))

module.exports = Partner;