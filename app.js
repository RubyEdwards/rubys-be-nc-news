const express = require("express");
const {
  handlePsqlErrors,
  handleCustomErrors,
  handleServerErrors,
} = require("./errors");
const app = express();
const apiRouter = require("./routes/api-router");
const topicsRouter = require("./routes/topics-router");
const articlesRouter = require("./routes/articles-router");
const commentsRouter = require("./routes/comments-router");
const usersRouter = require("./routes/users-router");
app.use(express.json());

app.use("/api", apiRouter);

app.use("/api/topics", topicsRouter);

app.use("/api/articles", articlesRouter);

app.use("/api/users", usersRouter);

app.use("/api/comments", commentsRouter);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "not found" });
});
app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
