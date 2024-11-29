const db = require("../db/connection");

exports.fetchArticle = (id) => {
  return db
    .query(
      `SELECT articles.author, title, articles.article_id, articles.body, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments)::INT AS comment_count
  FROM articles
  LEFT JOIN comments
  ON articles.article_id = comments.article_id
  WHERE articles.article_id = $1
  GROUP BY articles.article_id`,
      [id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return rows[0];
    });
};

exports.fetchArticles = (
  sort_by = "created_at",
  order = "desc",
  topic,
  limit = 10,
  p = 1
) => {
  const validSortBy = [
    "created_at",
    "article_id",
    "title",
    "topic",
    "author",
    "votes",
  ];

  const validLimit = Number(limit);
  const validPage = Number(p);
  const offsetBy = limit * (p - 1);

  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  if (isNaN(validLimit) || isNaN(validPage)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  let sqlQuery = `SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments)::INT AS comment_count
  FROM articles
  LEFT JOIN comments
  ON articles.article_id = comments.article_id `;

  if (topic) {
    sqlQuery += `WHERE topic = $1
      GROUP BY articles.article_id `;
    return db.query(sqlQuery, [topic]).then(({ rows }) => {
      return rows;
    });
  } else {
    sqlQuery += `GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order} LIMIT $1 `;

    if (p > 1) {
      sqlQuery += `OFFSET $2 `;
      return db.query(sqlQuery, [limit, offsetBy]).then(({ rows }) => {
        if (!rows.length) {
          return Promise.reject({ status: 404, msg: "not found" });
        }
        return rows;
      });
    }

    return db.query(sqlQuery, [limit]).then(({ rows }) => {
      return rows;
    });
  }
};

exports.fetchArticleComments = (id, limit = 10, p = 1) => {
  const validLimit = Number(limit);
  const validPage = Number(p);
  const offsetBy = limit * (p - 1);

  if (isNaN(validLimit) || isNaN(validPage)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  let sqlQuery = `SELECT * FROM comments
      WHERE comments.article_id = $1
      ORDER BY created_at DESC LIMIT $2`;

  if (p > 1) {
    sqlQuery += `OFFSET $3 `;
    return db.query(sqlQuery, [id, limit, offsetBy]).then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return rows;
    });
  }
  return db.query(sqlQuery, [id, limit]).then(({ rows }) => {
    return rows;
  });
};

exports.insertArticleComment = (id, { username, body }) => {
  if (!username || !body) {
    return Promise.reject({
      status: 404,
      msg: "not found",
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

exports.insertArticle = ({ author, title, body, topic, article_img_url }) => {
  if (!author || !title || !body || !topic) {
    return Promise.reject({
      status: 404,
      msg: "not found",
    });
  }
  let sqlQuery = `INSERT INTO articles (author, title, body, topic`;
  const queryValues = [author, title, body, topic];
  if (!article_img_url) {
    sqlQuery += `)
      VALUES ($1, $2, $3, $4)
      RETURNING *;`;
  } else {
    sqlQuery += `, article_img_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;`;
    queryValues.push(article_img_url);
  }
  return db.query(sqlQuery, queryValues).then(({ rows }) => {
    return rows[0];
  });
};

exports.countArticles = () => {
  return db
    .query(`SELECT COUNT(articles)::INT FROM articles`)
    .then(({ rows }) => {
      return rows[0].count;
    });
};

exports.countComments = (id) => {
  return db
    .query(`SELECT COUNT(comments)::INT FROM comments WHERE article_id = $1`, [
      id,
    ])
    .then(({ rows }) => {
      return rows[0].count;
    });
};

exports.removeArticle = (id) => {
  return db
    .query("DELETE FROM articles WHERE article_id = $1;", [id])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
    });
};
