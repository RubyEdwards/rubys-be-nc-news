const {
  fetchArticle,
  fetchArticles,
  fetchArticleComments,
  insertArticleComment,
  updateArticle,
  insertArticle,
  countArticles,
  countComments,
  removeArticle,
} = require("../models/articles.model");
const { fetchTopic } = require("../models/topics.model");

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic, limit, p } = req.query;
  const promises = [
    fetchArticles(sort_by, order, topic, limit, p),
    countArticles(),
  ];

  if (topic) {
    promises.push(fetchTopic(topic));
  }

  Promise.all(promises)
    .then(([articles, total_count]) => {
      res.status(200).send({ articles, total_count });
    })
    .catch(next);
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  const { limit, p } = req.query;
  const promises = [
    fetchArticleComments(article_id, limit, p),
    countComments(article_id),
    fetchArticle(article_id),
  ];

  Promise.all(promises)
    .then(([comments, total_count]) => {
      res.status(200).send({ comments, total_count });
    })
    .catch(next);
};

exports.postArticleComment = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;
  const promises = [
    fetchArticle(article_id),
    insertArticleComment(article_id, newComment),
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
    updateArticle(article_id, inc_votes),
    fetchArticle(article_id),
  ];

  Promise.all(promises)
    .then(([article]) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const newArticle = req.body;
  insertArticle(newArticle)
    .then(({ article_id }) => {
      fetchArticle(article_id).then((article) => {
        res.status(201).send({ article });
      });
    })
    .catch(next);
};

exports.deleteArticle = (req, res, next) => {
  const { article_id } = req.params;
  removeArticle(article_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};
