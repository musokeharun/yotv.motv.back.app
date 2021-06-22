const axios = require("axios");
const headers = require("./headers");

const Http = (url, data, method = "POST") => axios({
    url,
    headers,
    data,
    method,
    mode: "cors",
});

module.exports = Http;