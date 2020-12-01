require("dotenv").config();

const express = require("express");
const glob = require("glob");
const logger = require("./utilities/logger");
const sequelize = require("./utilities/db");
const app = express();

const port = process.env.PORT || 1212;

sequelize
  .authenticate()
  .then(() => {
    logger.info(`App has connected to database.`);

    glob.sync("./modules/*/web/routes.js").forEach((moduleRoutes) => {
      require(moduleRoutes)(app);
    });

    app.listen(port, () => {
      logger.info(`App listening at port ${port}`);
      if (process.env.NODE_ENV === "production") {
        console.log(
          "App started, logging is turned off in production mode, all logs are stored in log files."
        );
      }
    });
  })
  .catch((error) => {
    logger.error(`App was unable to connect to the database: ${error}`);
  });
