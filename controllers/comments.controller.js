const {
  removeComment,
  updateComment,
  fetchComment,
} = require("../models/comments.model");

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  const promises = [
    updateComment(comment_id, inc_votes),
    fetchComment(comment_id),
  ];

  Promise.all(promises)
    .then(([comment]) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};
