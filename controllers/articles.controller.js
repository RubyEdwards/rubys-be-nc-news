const {
  fetchArticle,
  fetchArticles,
  fetchArticleComments,
  insertComment,
  updateArticle,
} = require("../models/articles.model");

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res) => {
  fetchArticles().then((articles) => {
    res.status(200).send({ articles });
  });
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  const promises = [fetchArticleComments(article_id)];

  if (article_id) {
    promises.push(fetchArticle(article_id));
  }

  Promise.all(promises)
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;
  const promises = [
    fetchArticle(article_id),
    insertComment(article_id, newComment),
  ];

  Promise.all(promises)
    .then(([_, comment]) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  const promises = [
    fetchArticle(article_id),
    updateArticle(article_id, inc_votes),
  ];

  Promise.all(promises)
    .then(([_, article]) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
