const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const auth = require("./auth");
const dataSources = require("./datasources");
const query = require("./query");
const realTime = require("./realtime");
const push = require("./push")

//MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));

// AUTH MIDDLEWARE
app.use('/auth', auth)

app.use(function checkAccessCode(req, res, next) {
    // console.log("Access granted...", req.body)
    next();
})

//NOT ALLOWED
app.all("/", (req, res) => {
    res.status(403).json({"msg": "Not Allowed", "status": 403});
    res.end();
});

const HISTOGRAM_CHART_CONFIG = "bar";
const PIE_CHART_CONFIG = "pie";

//CHECK FOR CHART-TYPE ,
app.use(function commonVariables(req, res, next) {
    const {chartType, defaultData} = req.body;
    res.locals.chartType = chartType || HISTOGRAM_CHART_CONFIG;
    res.locals.defaultData = defaultData || false;
    delete req.body.chartType;
    delete req.body.defaultData;
    next()
})

// APP CONCENTRATED FUNCTIONALITY
app.use("/query", query.query)
app.use("/push", push)
app.use("/datasource", dataSources)
app.use("/realtime", realTime)
app.use("/partner", realTime)

//NOW LISTEN
let PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Started on PORT ${PORT}`);
});
