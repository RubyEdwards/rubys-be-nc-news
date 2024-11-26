const db = require("../db/connection");

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users;`).then(({ rows }) => {
    console.log(rows);
    return rows;
  });
};
