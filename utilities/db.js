const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.SQLITE_STORAGE,
  logging: process.env.NODE_ENV !== "production" ? true : false,
});

module.exports = sequelize;
