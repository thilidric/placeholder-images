const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const cors = require("cors");

const userController = require("../controllers/user");

module.exports = function (app) {
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());

  router.post("/", userController.create);
  router.get("/", userController.list);

  app.use("/users", router);
};
