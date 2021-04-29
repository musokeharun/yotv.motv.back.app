const express = require('express');
const dataSource = express.Router();
const Joi = require('joi');
const JoiValidate = require("../utils/joi");
const Http = require("../utils/http");

const resCont = {"search_type": "query_then_fetch", "ignore_unavailable": true, "index": "watching_statistics"};
let url = "https://mw.channels256.com/monitoring-statistics/api/datasources/proxy/3/_msearch?max_concurrent_shard_requests=256";

dataSource.use(async function validator(req, res, next) {
        const schema = Joi.object().keys({
            channel: Joi.string().required(),
            from: Joi.number().integer().required(),
            vendor: Joi.string().required(),
            to: Joi.number().integer(),
            interval: Joi.string().required()
        })

        let result = await JoiValidate(schema, req.body);
        console.log("result", result);
        console.log("body", JSON.stringify(req.body));
        if (result) {
            res.status(404);
            res.json(result);
        } else
            next();
    }
)

dataSource.all("/", ((req, res) => {
    res.status(403).json({"msg": "Not Allowed", "status": 403});
}))

const resProcessor = (res, chartType, agg, nextAgg, lastAgg) => {
    const result = [];
    let {responses} = res;
    for (const response of responses) {
        let {aggregations} = response;
        let {buckets} = aggregations[agg];
        for (const bucket of buckets) {
            let item = {
                "key": bucket['key'],
                "hits": bucket['doc_count'],
            };
            item['total'] = bucket[nextAgg]['buckets'].reduce((acc, subBucket) => {
                return acc + subBucket[lastAgg].value;
            }, 0)

            if (chartType === "bar") {
                item["series"] = bucket[nextAgg]['buckets'].map((subBucket) => {
                    return {
                        "key": subBucket['key'],
                        "value": subBucket[lastAgg].value
                    }
                })
            }

            result.push(item)
        }

    }
    return result;
}

const bodyProcessor = (body, aggIndex, nextAgg, lastAgg) => {

    let {channel, to, from, vendor, interval, field} = body;
    const createEscapedString = (input) => {
        let inputArray = input.split(",");
        if (inputArray.length === 1) return `"${input}"`;

        return inputArray.reduce((acc, item) => {
            if (!acc.includes(" OR ")) return `${acc} OR ${item}`;
            return ` ${acc} OR ${item}`;
        })
    }

    let channels = createEscapedString(channel);
    let vendors = createEscapedString(vendor);

    return {
        "size": 0,
        "query": {
            "bool": {
                "filter": [{
                    "range": {
                        "@timestamp": {
                            "gte": from,
                            "lte": to,
                            "format": "epoch_millis"
                        }
                    }
                }, {
                    "query_string": {
                        "analyze_wildcard": true,
                        "query": `vendorsName:(${vendors}) AND devicesType:(\"android\" OR \"ios\" OR \"web\\player\" OR \"android\\tv\") AND type:(\"unicast\" OR \"multicast\" OR \"broadcast\") AND streamType:(\"live\" OR \"timeshift\" OR \"catchup\" OR \"recording\") AND (channelsName:${channels} OR (NOT _exists_: channelsName))`
                    }
                }]
            }
        },
        "aggs": {
            [aggIndex]: {
                "terms": {"field": `${field}`, "size": 500, "order": {"_key": "desc"}, "min_doc_count": 1},
                "aggs": {
                    [nextAgg]: {
                        "date_histogram": {
                            "interval": interval,
                            "field": "@timestamp",
                            "min_doc_count": 0,
                            "extended_bounds": {"min": from, "max": to},
                            "format": "epoch_millis"
                        }, "aggs": {[lastAgg]: {"cardinality": {"field": "devicesId"}}}
                    }
                }
            }
        }
    }
}

const dataProcessor = async (res, charType, body) => {
    let aggIndex = "3";
    let nextAgg = (Number(aggIndex) - 1).toString()
    let lastAgg = (Number(aggIndex) - 2).toString()

    const resBody = bodyProcessor(body, aggIndex, nextAgg, lastAgg);

    // console.log("body", JSON.stringify(resBody));
    let all = JSON.stringify(resCont) + "\n" + JSON.stringify(resBody) + "\n";

    try {
        let resp = await Http(url, all, "POST")
        console.log("success response");
        const {data} = resp;
        if (!data) res.status(404).send("No data");

        res.status(200).send(resProcessor(data, charType, aggIndex, nextAgg, lastAgg));
    } catch (e) {
        console.log(e);
        res.status(e.status || 500).send(e.message || e);
    }
}

dataSource.post("/streamTypes", async (req, res) => {
    // INPUT VARIABLES
    const {chartType} = res.locals;
    const body = {field: "streamType", ...req.body}
    await dataProcessor(res, chartType, body)
})

dataSource.post("/deviceTypes", (async (req, res) => {
    // INPUT VARIABLES
    const {chartType} = res.locals;
    const body = {field: "devicesType", ...req.body}
    await dataProcessor(res, chartType, body)
}))

dataSource.post("/type", (async (req, res) => {
    // INPUT VARIABLES
    const {chartType} = res.locals;
    const body = {field: "type", ...req.body}
    await dataProcessor(res, chartType, body)
}))

module.exports = dataSource;