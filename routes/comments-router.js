const {
  deleteComment,
  patchComment,
} = require("../controllers/comments.controller");

const commentsRouter = require("express").Router();

commentsRouter.route("/:comment_id").delete(deleteComment).patch(patchComment);
commentsRouter.patch("/");

module.exports = commentsRouter;
