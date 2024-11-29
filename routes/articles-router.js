const {
  getArticles,
  getArticle,
  getArticleComments,
  postArticleComment,
  patchArticle,
  postArticle,
  deleteArticle,
} = require("../controllers/articles.controller");

const articlesRouter = require("express").Router();

articlesRouter.route("/").get(getArticles).post(postArticle);
articlesRouter
  .route("/:article_id")
  .get(getArticle)
  .patch(patchArticle)
  .delete(deleteArticle);
articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComment);

module.exports = articlesRouter;
