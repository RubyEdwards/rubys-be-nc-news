const db = require("../db/connection");

exports.removeComment = (id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1;", [id])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
    });
};

exports.updateComment = (id, inc_votes) => {
  return db
    .query(
      `UPDATE comments
      SET votes = votes + $1
      WHERE comment_id = $2
      RETURNING *;`,
      [inc_votes, id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.fetchComment = (id) => {
  return db
    .query("SELECT * FROM comments WHERE comment_id = $1", [id])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return rows[0];
    });
};
