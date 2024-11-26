const { fetchUsers } = require("../models/users.model");

exports.getUsers = (req, res) => {
  fetchUsers().then((users) => {
    console.log(users);
    res.status(200).send({ users });
  });
};
