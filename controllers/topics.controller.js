const { fetchTopics, insertTopic } = require("../models/topics.model");

exports.getTopics = (req, res) => {
  fetchTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.postTopic = (req, res, next) => {
  const newTopic = req.body;
  insertTopic(newTopic)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};
