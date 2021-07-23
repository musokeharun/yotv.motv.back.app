const express = require("express");
const push = express.Router();
const { innerQuery } = require("../query/index");
const { DateTime } = require("luxon");
const { getGreetingTime } = require("../utils");
const config = require("config");

const createChannelArray = (channel) => {
  const r = [];

  let split = channel.split(" ");
  r.push(channel);
  if (split.length > 1) {
    if (split.length > 2) {
      r.push(`${split[0]}${split[1]}`);
    } else {
      if (
        split[0].toLowerCase().trim() !== "radio" &&
        split[0].toLowerCase().trim() !== "tv" &&
        split[0].toLowerCase().trim() !== "fm"
      )
        r.push(split[0]);
    }
    r.push(split.join(""));
  }
  return r;
};

const resProcessor = (data, cols = false) => {
  let res = data["results"]["A"]["tables"][0];
  if (!cols) return res["rows"];
  return res;
};

const realChannelInText = (channels, logs, result) => {
  logs.forEach((log, index) => {
    if (log && log[4] && !log["4"]["isParsed"]) {
      let title = log[4]["title"];

      for (let i = 0; i < channels.length; i++) {
        let name = channels[i][0].toLowerCase();
        const array = createChannelArray(name);
        const channel = channels[i];

        let ti = title.toLowerCase();

        if (
          array.some((ch) => ti.includes(` ${ch}`)) ||
          array.some((ch) => ti.includes(`${ch} `))
        ) {
          !result[name] ? (result[name] = 1) : result[name]++;
          logs[index][4]["isParsed"] = true;
          console.log(`${name} found in ${ti}`);
          break;
        }
      }
    }
  });
};

const ifHas = (title, name, result, logs, index, label) => {
  if (
    title.toLowerCase().includes(`${name} `) ||
    title.toLowerCase().includes(` ${name}`)
  ) {
    if (label) name = label;
    result[name] ? result[name]++ : (result[name] = 1);
    console.log(name + " found " + title);
    logs[index][4]["isParsed"] = true;
  }
};

const othersTitle = (logs, result) => {
  logs.forEach((log, index) => {
    if (log && log[4] && !log[4]["isParsed"]) {
      let title = log[4]["title"];
      console.log("Others", title);
      result["others"] ? result["others"]++ : (result["others"] = 1);
    }
  });
};

const vodEnKibandaInText = (logs, result) => {
  logs.forEach((log, index) => {
    if (log && log[4] && !log[4]["isParsed"]) {
      let title = log[4]["title"];

      ifHas(title, "covid", result, logs, index);
      ifHas(title, "vs", result, logs, index, "sports");
      ifHas(title, "president", result, logs, index);
      ifHas(title, "vod", result, logs, index);
      ifHas(title, "kibanda", result, logs, index);
    }
  });
};

const getTimeGraph = (logs) => {
  let result = { times: {}, days: {}, period: {} };
  const { zoneInverted } = config.get("Time");

  logs.forEach((log) => {
    const dateTime = DateTime.fromISO(log[0], { zone: zoneInverted });
    result.days[dateTime.weekdayShort]
      ? result.days[dateTime.weekdayShort]++
      : (result.days[dateTime.weekdayShort] = 1);
    result.times[dateTime.toFormat("ha")]
      ? result.times[dateTime.toFormat("ha")]++
      : (result.times[dateTime.toFormat("ha")] = 1);
    result.period[getGreetingTime(dateTime.hour)]
      ? result.period[getGreetingTime(dateTime.hour)]++
      : (result.period[getGreetingTime(dateTime.hour)] = 1);
  });
  return result;
};

push.post("/report", async (req, res) => {
  const { sql } = req.body;
  if (!sql) {
    res.send("No Sql");
    return;
  }

  const { zone } = config.get("Time");

  let from = DateTime.now()
    .minus({ days: 1 })
    .startOf("day")
    .toMillis()
    .toString();
  let to = DateTime.now().endOf("day").toMillis().toString();

  try {
    let { data } = await innerQuery(from, to, sql);
    res.json(data);
  } catch (e) {
    console.log(e);
    res.send("Error").status(500).end();
  }
});

push.post("/", async (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) {
    res.send("No dates found");
    res.end();
  }

  const { zone } = config.get("Time");

  let fromObj = DateTime.fromMillis(parseInt(from))
    .setZone(zone)
    .startOf("day");
  let fromMillis = fromObj.toMillis().toString();
  let toObj = DateTime.fromMillis(parseInt(to)).setZone(zone).endOf("day");
  let toMilllis = toObj.toMillis().toString();

  console.log(zone, fromObj.toString());
  console.log(zone, toObj.toString());

  try {
    let { data: channelsRes } = await innerQuery(
      fromMillis,
      toMilllis,
      "SELECT channels_name,channels_active FROM channels;"
    );
    const channels = resProcessor(channelsRes);

    let { data } = await innerQuery(
      fromMillis,
      toMilllis,
      `SELECT log_time AS 'Time',users_email as 'Sent by',log_string_parameter2 as "Topic",log_int_parameter1 as 'Type',log_text_parameter1 as 'Message data' FROM log LEFT JOIN users ON log_users_id = users_id WHERE $__timeFilter(log_time) and log_type ='topic push message' ORDER BY log_time DESC`
    );
    const logs = resProcessor(data);

    //console.log(logs);

    const list = logs.map((row) => {
      row[4] = JSON.parse(row[4]);
      return row;
    });

    const result = {};

    realChannelInText(channels, logs, result);

    vodEnKibandaInText(logs, result);

    othersTitle(logs, result);

    const graphs = getTimeGraph(logs);

    console.log(logs.length);
    console.log(
      Object.getOwnPropertyNames(result).reduce(
        (previousValue, currentValue) => result[currentValue] + previousValue,
        0
      )
    );
    console.log(
      Object.getOwnPropertyNames(result).reduce(
        (previousValue, currentValue) =>
          previousValue.toUpperCase() + " " + currentValue.toUpperCase()
      )
    );
    console.log(
      Object.getOwnPropertyNames(graphs.days).reduce(
        (previousValue, currentValue) =>
          previousValue.toUpperCase() + " " + currentValue.toUpperCase()
      )
    );
    console.log(
      Object.getOwnPropertyNames(graphs.times).reduce(
        (previousValue, currentValue) =>
          previousValue.toUpperCase() + " " + currentValue.toUpperCase()
      )
    );

    res.json({ graphs, result, title: "Notifications", list });
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
});

module.exports = push;
