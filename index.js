const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send(req.body);
  res.end("yes");
});

app.post("/login", (req, res) => {
  console.log(req);
  res.send(req.body);
  res.end("yes");
});

app.listen(5000, () => {
  console.log("Started on PORT 5000");
});
