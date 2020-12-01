module.exports = (sequelize, type) => {
  return sequelize.define(
    "User",
    {
      uuid: {
        type: type.UUID,
        defaultValue: type.UUIDV1,
        primaryKey: true,
      },
      email: {
        type: type.STRING,
        unique: true,
      },
      password: type.STRING,
    },
    {
      defaultScope: {
        attributes: { exclude: ["password"] },
      },
      scopes: {
        withPassword: {
          attributes: {},
        },
      },
    }
  );
};
