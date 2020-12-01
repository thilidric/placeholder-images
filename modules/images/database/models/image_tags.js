module.exports = (sequelize, type) => {
  return sequelize.define("ImageTags", {
    image_uuid: type.INTEGER,
    tag: type.STRING,
  });
};
