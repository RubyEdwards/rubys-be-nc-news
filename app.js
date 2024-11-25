const express = require("express");
const { getEndpoints, getTopics } = require("./controllers/api.controller");
const app = express();

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "not found" });
});

module.exports = app;
