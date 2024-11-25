const express = require("express");
const {
  getEndpoints,
  getTopics,
  getArticle,
} = require("./controllers/api.controller");
const {
  handlePsqlErrors,
  handleCustomErrors,
  handleServerErrors,
} = require("./errors");
const app = express();

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticle);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "not found" });
});
app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
