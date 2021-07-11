const express = require("express");
const Vod = express.Router();
const { innerQuery } = require("../query");
const { DateTime } = require("luxon");

Vod.all("/", (req, res) =>
  res.status(403).json({ msg: "Not Allowed", status: 403 })
);

Vod.post("/report", async (req, res) => {
  let start = DateTime.now().endOf("day").toMillis();
  let end = DateTime.now().startOf("day").toMillis();

  let sql = `select vods_id as __value, vods_name as __text from vods`;

  try {
    let { data } = await innerQuery(start, end, sql);
  } catch (error) {
    if (error.isAxiosError) {
      res.status(403).send(error.message);
      return;
    }
    res.status(403).send("Could not process");
  }
});

module.exports = Vod;
