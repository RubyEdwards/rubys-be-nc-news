const { getEndpoints } = require("../controllers/api.controller");

const apiRouter = require("express").Router();

apiRouter.get("/", getEndpoints);

module.exports = apiRouter;
