require("dotenv").config();

const express = require("express");
const glob = require("glob");
const logger = require("./utilities/logger");
const { Sequelize } = require("sequelize");
const app = express();

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});
const port = process.env.PORT || 1212;

sequelize
  .authenticate()
  .then(() => {
    logger.info(`App has connected to database.`);

    require("./web/routes")(app);

    glob.sync("./modules/*/web/routes.js").forEach((moduleRoutes) => {
      require(moduleRoutes)(app);
    });

    app.listen(port, () => {
      logger.info(`App listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    logger.error(`App was unable to connect to the database: ${error}`);
  });
