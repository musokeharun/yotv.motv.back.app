const express = require('express');
const RealTime = express.Router();
const headers = require("../utils/headers");
const axios = require("axios");
const {DateTime} = require("luxon");


const resCont = {"search_type": "query_then_fetch", "ignore_unavailable": true, "index": "watching_statistics"};
let url = "https://mw.channels256.com/monitoring-statistics/api/datasources/proxy/3/_msearch?max_concurrent_shard_requests=256";

// RealTime().all("/", ((req, res) => {
//     res.status(403).json({"msg": "Not Allowed", "status": 403});
//
//
//
// }))

RealTime.post("/", (async (req, res) => {

        const {channel} = req.locals;

        let agg = "3";
        let nextAgg = "1";

        let zone = 'Africa/Kampala';
        let back = DateTime.fromObject({zone: zone}).minus({minutes: 3}).toMillis();
        let now = DateTime.fromObject({zone: zone}).minus({seconds: 5}).toMillis();
        const obj = {
            "size": 0,
            "query": {
                "bool": {
                    "filter": [{
                        "range": {
                            "@timestamp": {
                                "gte": back,
                                "lte": now,
                                "format": "epoch_millis"
                            }
                        }
                    }, {
                        "query_string": {
                            "analyze_wildcard": true,
                            "query": "vendorsName:(\"Albayan\" OR \"Yotvs\") AND streamType:live AND (channelsName:\"NTV\" OR (NOT _exists_: channelsName))"
                        }
                    }]
                }
            },
            "aggs": {
                [agg]: {
                    "date_histogram": {
                        "interval": "1d",
                        "field": "@timestamp",
                        "min_doc_count": 0,
                        "extended_bounds": {"min": back, "max": now},
                        "format": "epoch_millis"
                    }, "aggs": {[nextAgg]: {"cardinality": {"field": "devicesId"}}}
                }
            }
        }
        let all = JSON.stringify(resCont) + "\n" + JSON.stringify(obj) + "\n";
        try {
            let resp = await axios({
                url, headers,
                data: all, method: "POST", mode: "cors",
            });
            const {data: response} = resp;
            let {responses} = response;
            let result = [];
            for (const respons of responses) {
                let {aggregations} = respons;
                let {buckets} = aggregations[agg];
                for (const bucket of buckets) {
                    result.push({
                        value: bucket[nextAgg].value,
                        key: bucket.key,
                        label: "Watching",
                        hits: bucket.doc_count
                    })
                }
            }

            res.send(result);
        } catch (e) {
            res.status(e.status || 500).send(e.message || e);
        }
    }
))


module.exports = RealTime;