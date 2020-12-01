module.exports = (sequelize, type) => {
  return sequelize.define("Image", {
    uuid: {
      type: type.UUID,
      defaultValue: type.UUIDV1,
      primaryKey: true,
    },
    name: type.STRING,
    user_uuid: type.INTEGER,
    author: type.STRING,
  });
};
