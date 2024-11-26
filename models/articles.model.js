const db = require("../db/connection");

exports.fetchArticle = (id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [id])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return rows[0];
    });
};

exports.fetchArticles = () => {
  return db
    .query(
      `SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments)::INT AS comment_count FROM articles
      LEFT JOIN comments
      ON articles.article_id = comments.article_id
      GROUP BY articles.article_id
      ORDER BY created_at DESC;`
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchArticleComments = (id) => {
  return db
    .query(
      `SELECT * FROM comments
      WHERE comments.article_id = $1
      ORDER BY created_at DESC`,
      [id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.insertComment = (id, { username, body }) => {
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: "bad request",
    });
  }
  return db
    .query(
      `INSERT INTO comments (author, body, article_id)
      VALUES ($1, $2, $3)
      RETURNING *;`,
      [username, body, id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.updateArticle = (id, inc_votes) => {
  return db
    .query(
      `UPDATE articles
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *;`,
      [inc_votes, id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeComment = (id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1;", [id])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
    });
};
