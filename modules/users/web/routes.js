const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const userController = require("../controllers/user");
const authMiddleware = require("./authMiddleware");

module.exports = function (app) {
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());

  router.post("/", userController.create);
  router.get("/", userController.list);

  router.post("/auth", userController.auth);

  app.use("/users", router);
};
