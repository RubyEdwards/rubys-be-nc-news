const db = require("../db/connection");

exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics;").then(({ rows }) => {
    return rows;
  });
};

exports.fetchTopic = (slug) => {
  return db
    .query("SELECT * FROM topics WHERE slug = $1", [slug])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return rows[0];
    });
};

exports.insertTopic = ({ slug, description }) => {
  if (!slug || !description) {
    return Promise.reject({
      status: 404,
      msg: "not found",
    });
  }
  return db
    .query(
      `INSERT INTO topics (slug, description)
      VALUES ($1, $2)
      RETURNING *;`,
      [slug, description]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
