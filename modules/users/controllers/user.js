const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../../../utilities/logger");
const userModel = require("../database/models/user");

function create(req, res) {
  logger.info(`[Users] Creating new user.`);

  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ "status": "error", "message": "Missing user email or password." })
  }

  userModel
    .create({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
    })
    .then((user) => {
      if (user) {
        res.status(200).send({
          message: `Your personal token for generating placeholder images is: ${user.uuid}`,
        });
      } else {
        res.status(400).send({ "status": "error", "message": "There have been error while creating user." });
      }
    }).catch((err) => {
      const errors = err.errors.map((item) => {
        return item.message;
      })
      res.status(400).send({ "status": "error", "message": `There have been errors while creating user: ${errors.join(',')}` });
    });
}

function list(req, res) {
  userModel.findAll().then((users) => {
    res.status(200).send(users);
  });
}

function auth(req, res) {
  logger.info(`Authentication request for: ${req.body.email}`);

  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ "status": "error", "message": "Missing user email or password." })
  }

  userModel.scope('withPassword')
    .findOne({
      where: {
        email: req.body.email,
      },
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ "status": "error", "message": "User not found for specified email." });
      }

      const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send({ "status": "error", "message": "Wrong password." });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: 86400
      })

      user.token = token;

      user.save(function (err) {
        if (err) {
          logger.error(err);
          return res.status(500).send({ 'status': 'error', 'message': "Failed to save user token." })
        }
      })

      res.status(200).set('Authorization', `Bearer ${token}`).send({ auth: true, token: token })
    })
    .catch((err) => {
      logger.error(err);
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
  auth: auth
};
