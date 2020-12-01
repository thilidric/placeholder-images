const Sequelize = require("sequelize");
const sequelize = require("../../../utilities/db");

const userModel = require("./models/user");

const User = userModel(sequelize, Sequelize);

sequelize.sync();

module.exports = {
  User,
};
