const express = require('express');
const push = express.Router();
const {innerQuery} = require("../query/index");
const {DateTime} = require("luxon")

const createChannelArray = (channel) => {

    const r = [];

    let split = channel.split(" ");
    r.push(channel);
    if (split.length > 1)
        r.push(split.join(""));
    return r;
}

const resProcessor = (data, cols = false) => {
    let res = data['results']['A']['tables'][0]
    if (!cols) return res['rows'];
    return res;
}

const realChannelInText = (channels, logs, result) => {


    logs.forEach((log, index) => {
        if (log && log[4] && !log['4']['isParsed']) {
            let title = log[4]['title'];


            for (let i = 0; i < channels.length; i++) {
                let name = channels[i][0].toLowerCase();
                const array = createChannelArray(name);
                const channel = channels[i];

                let ti = title.toLowerCase();

                if (array.some(ch => ti.includes(` ${ch}`)) || array.some(ch => ti.includes(`${ch} `))) {
                    !result[name] ? result[name] = 1 : result[name]++;
                    logs[index][4]['isParsed'] = true;
                    console.log(`${name} found in ${ti}`)
                    break;
                }
            }
        }
    })

}

const ifHas = (title, name, result, logs, index) => {
    if (title.toLowerCase().includes(`${name} `) || title.toLowerCase().includes(` ${name}`)) {
        result[name] ? result[name]++ : result[name] = 1;
        console.log(name + " found " + title)
        logs[index][4]['isParsed'] = true;
    }
}

const othersTitle = (logs, result) => {

    logs.forEach((log, index) => {
        if (log && log[4] && !log[4]['isParsed']) {
            let title = log[4]['title'];
            console.log("Others", title)
            result['others'] ? result['others']++ : result['others'] = 1;
        }
    });
}

const vodEnKibandaInText = (logs, result) => {
    logs.forEach((log, index) => {
        if (log && log[4] && !log[4]['isParsed']) {
            let title = log[4]['title'];

            ifHas(title, "covid", result, logs, index);
            ifHas(title, "president", result, logs, index);
            ifHas(title, "vod", result, logs, index);
            ifHas(title, "kibanda", result, logs, index);
        }
    });
}

push.post("/report", (async (req, res) => {
    const {sql} = req.body;
    if (!sql) {
        res.send("No Sql");
        return;
    }

    let from = DateTime.now().minus({days: 1}).startOf('day').toMillis().toString();
    let to = DateTime.now().endOf('day').toMillis().toString();

    let {data} = await innerQuery(from, to, sql)
    res.json(data);
}))

push.post("/", (async (req, res) => {

    let fromObj = DateTime.now().minus({weeks: 1}).startOf('week');
    let from = fromObj.toMillis().toString();
    let toObj = DateTime.now().minus({weeks: 1}).endOf('week');
    let to = toObj.toMillis().toString();

    console.log(fromObj.toString())
    console.log(toObj.toString())

    try {
        let {data: channelsRes} = await innerQuery(from, to, "SELECT channels_name,channels_active FROM channels;")
        const channels = resProcessor(channelsRes);

        let {data} = await innerQuery(from, to, `SELECT log_time AS 'Time',users_email as 'Sent by',log_string_parameter2 as "Topic",log_int_parameter1 as 'Type',log_text_parameter1 as 'Message data' FROM log LEFT JOIN users ON log_users_id = users_id WHERE $__timeFilter(log_time) and log_type ='topic push message' ORDER BY log_time DESC`);
        const logs = resProcessor(data);

        logs.map(row => row[4] = JSON.parse(row[4]))

        const result = {};

        realChannelInText(channels, logs, result);

        vodEnKibandaInText(logs, result);

        othersTitle(logs, result);

        console.log(logs.length);
        console.log(Object.getOwnPropertyNames(result).reduce(((previousValue, currentValue) => result[currentValue] + previousValue), 0))

        res.json(result);
    } catch (e) {
        if (e.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log("Data", e.response.data);
            console.log("Status", e.response.status);
        } else if (e.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log("Request", e.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", e.message);
        }
        res.end();
    }
}))


module.exports = push;