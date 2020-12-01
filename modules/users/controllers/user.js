const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../../../utilities/logger");
const userModel = require("../database/models/user");

function create(req, res) {
  logger.info(`[Users] Creating new user.`);
  userModel
    .create({
      email: req.body.email,
    })
    .then((user) => {
      if (user) {
        res.status(200).send({
          message: `Your personal token for generating placeholder images is: ${user.uuid}`,
        });
      } else {
        res.status(400).send("Error in insert new record");
      }
    });
}

function list(req, res) {
  userModel.findAll().then((users) => {
    res.status(200).send(users);
  });
}

function exists(uuid) {
  return userModel
    .findOne({
      where: {
        uuid: uuid,
      },
    })
    .then((user) => {
      if (user) {
        return true;
      } else {
        return false;
      }
    })
    .catch((err) => {
      logger.error(err);
      return false;
    });
}

module.exports = {
  create: create,
  list: list,
  exists: exists,
};
