const { DataTypes } = require("sequelize");
const sequelize = require("../index");

const User = sequelize.define("User", {
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
});

User.sync();

module.exports = User;
