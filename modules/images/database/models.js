const Sequelize = require("sequelize");
const sequelize = require("../../../utilities/db");

const imageModel = require("./models/images");
const imageTagModel = require("./models/image_tags");

const Image = imageModel(sequelize, Sequelize);
const ImageTag = imageTagModel(sequelize, Sequelize);

Image.hasMany(ImageTag, { as: "tags", foreignKey: "image_uuid" });

sequelize.sync();

module.exports = {
  Image,
  ImageTag,
};
