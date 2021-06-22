const express = require('express');
const query = express.Router();
const Http = require("../utils/http");

const url = "https://mw.channels256.com/monitoring-statistics/api/tsdb/query";

const bodyProcessor = (from, to, sql) => {
    return JSON.stringify(
        {
            "from": from,
            "to": to,
            "queries": [{
                "refId": "A",
                "intervalMs": 60000,
                "maxDataPoints": 1272,
                "datasourceId": 1,
                "rawSql": sql,
                "format": "table"
            }]
        }
    );


}

const innerQuery = (from, to, sql) => Http(url, bodyProcessor(from, to, sql));

query.post("/", ((req, res) => {
    res.json(res.locals);
    res.end()
}))

module.exports = {query, innerQuery};