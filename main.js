const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));

const headers = {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-UG,en-US;q=0.9,en;q=0.8",
    "content-type": "application/json",
    "sec-ch-ua":
        '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-grafana-org-id": "1",
    referrerPolicy: "no-referrer-when-downgrade",
    cookie:
        "_nss=1; SERVERID=middleware; PHPSESSIDMW=e9t60soqm3brvqdt4v8qdhg2kb; mw_grafana_user=etalemwa@albayanmedia-africa.com; mw_grafana_hash=KuwPr_NfLqrVkxm0VqrbWQ; mw_grafana_expires=1621065940",
};

app.post("/query", async (req, res) => {
    console.log(req.body);
    if (!req.body.sql) {
        res.status(417).send("Not sql found");
        res.end();
    }

    const {sql} = req.body;

    try {
        let resp = await axios({
            url: "https://mw.channels256.com/monitoring-statistics/api/tsdb/query",
            headers,
            data: JSON.stringify({
                queries: [
                    {
                        refId: "channelsName",
                        datasourceId: 1,
                        rawSql: sql,
                        format: "table",
                    },
                ],
                from: "1618804911035",
                to: "1618815651035",
            }),
            method: "POST",
            mode: "cors",
        });
        const {data: response} = resp;
        console.log(resp);
        res.send(response);
    } catch (e) {
        console.log(e);
        res.status(e.status || 500).send(e.message || e);
    }
});

app.post("/datasource", async (req, res) => {
    if (!req.body.method || !req.body.data) {
        res.status(417).send("Not data found");
        res.end();
    }

    let {data: body, method} = req.body;

    if (!body || body.length != 2) {
        res.status(417).send("Not array");
        res.end();
    }

    let all = JSON.stringify(body[0]) + "\n" + JSON.stringify(body[1]) + "\n";

    try {
        let resp = await axios({
            url,
            headers,
            data: all,
            method,
            mode: "cors",
        });
        const {data} = resp;
        console.log(resp);
        res.send(data);
    } catch (e) {
        console.log(e);
        res.status(e.status || 500).send(e.message || e);
    }
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
