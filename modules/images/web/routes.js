const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const logger = require("../../../utilities/logger");

const questImagesController = require("../controllers/questImages");
const userImagesController = require("../controllers/userImages");
const authMiddleware = require("../../users/web/authMiddleware");

module.exports = function (app) {
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());

  router.get("/", authMiddleware, userImagesController.list);
  router.delete("/", authMiddleware, userImagesController.remove);
  router.put("/", authMiddleware, userImagesController.update);
  router.get("/view/:uuid", userImagesController.view);

  router.get("/generate", (req, res) => {
    const token = req.headers["x-access-token"];
    if (!token) {
      return questImagesController.generate(req, res);
    }

    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        return res
          .status(400)
          .send({ status: "error", message: "Wrong access token." });
      } else {
        return userImagesController.generate(req, res, decoded.uuid);
      }
    });
  });

  app.use("/images", router);
};
