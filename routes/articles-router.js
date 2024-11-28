const {
  getArticles,
  getArticle,
  getArticleComments,
  postArticleComment,
  patchArticle,
} = require("../controllers/articles.controller");

const articlesRouter = require("express").Router();

articlesRouter.get("/", getArticles);
articlesRouter.route("/:article_id").get(getArticle).patch(patchArticle);
articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComment);

module.exports = articlesRouter;
