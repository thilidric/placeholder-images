const sequelize = require("../../../utilities/db");
const logger = require("../../../utilities/logger");
const userController = require("../../users/controllers/user");
const imageGenerator = require("../classes/image");

const { Image, ImageTag } = require("./../database/models");

function generate(req, res, user_uuid) {
  userController.exists(user_uuid || null).then((exists) => {
    if (!exists) {
      return res.status(400).send({
        status: "error",
        message: "Access token for not existing user.",
      });
    }

    const image = new imageGenerator(
      parseInt(req.query.width),
      parseInt(req.query.height),
      req.query.color,
      user_uuid
    );
    image.get().then((result) => {
      createIfNotExists(req, user_uuid)
        .then(() => {
          const im = result.includes(",") ? result.split(",")[1] : result;
          const img = Buffer.from(im, "base64");

          res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": img.length,
          });

          res.end(img);
        })
        .catch((err) => {
          logger.error(err);
          return res.status(400).send({
            status: "error",
            message: "There have been error while generating image.",
          });
        });
    });
  });
}

function createIfNotExists(req, user_uuid) {
  return new Promise((resolve, reject) => {
    Image.findOrCreate({
      where: {
        name: `${req.query.width}x${req.query.height}-${req.query.color}.png`,
        user_uuid: user_uuid,
      },
      limit: 1,
      defaults: { author: req.query.author || null },
    })
      .then((img) => {
        if (img[0]._options.isNewRecord) {
          if (req.query.tags.split(",").length > 0) {
            const tags = req.query.tags.split(",").map((tag) => {
              return {
                image_uuid: img[0].uuid,
                tag: tag,
              };
            });

            ImageTag.bulkCreate(tags);
          }
        }
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function list(req, res) {
  Image.findAll({
    where: {
      user_uuid: req.user_uuid,
    },
    include: [{ model: ImageTag, as: "tags" }],
  }).then((images) => {
    res.status(200).send(images);
  });
}

function remove(req, res) {
  Image.destroy({
    where: {
      uuid: req.body.uuid,
      user_uuid: req.user_uuid,
    },
  })
    .then((rowDeleted) => {
      if (rowDeleted >= 1) {
        res.status(200).send({
          status: "success",
          message: "Selected image have been removed.",
        });
      } else {
        res.status(404).send({
          status: "error",
          message: "Selected image do not exists.",
        });
      }
    })
    .catch((err) => {
      logger.error(err);
      res.status(400).send({
        status: "error",
        message: "There have been error while removing image.",
      });
    });
}

function update(req, res) {
  let updateData = {};
  if (req.body.author) {
    updateData.author = req.body.author;
  }

  let tags = [];
  if (req.body.tags && req.body.tags.split(",").length > 0) {
    tags = req.body.tags.split(",").map((tag) => {
      return {
        image_uuid: req.body.uuid,
        tag: tag,
      };
    });
  }
  return sequelize
    .transaction((t) => {
      return Image.findOne({
        where: {
          uuid: req.body.uuid,
          user_uuid: req.user_uuid,
        },
        transaction: t,
      })
        .then((item) => {
          if (!item) {
            return {
              status: "error",
              message: "Selected image does not exists.",
            };
          }

          return Image.update(updateData, {
            where: {
              uuid: req.body.uuid,
              user_uuid: req.user_uuid,
            },
            transaction: t,
          })
            .then((rowsUpdated) => {
              if (tags.length === 0 && rowsUpdated[0] === 0) {
                return {
                  status: "error",
                  message: "Nothing to update in image.",
                };
              }

              if (tags.length > 0) {
                return ImageTag.destroy({
                  where: {
                    image_uuid: req.body.uuid,
                  },
                  transaction: t,
                })
                  .then(() => {
                    let promises = [];
                    tags.forEach((tag) => {
                      promises.push(ImageTag.create(tag, { transaction: t }));
                    });

                    return Promise.all(promises)
                      .then(() => {
                        return {
                          status: "success",
                          message: "Selected image have been updated.",
                        };
                      })
                      .catch((err) => {
                        logger.error(err);
                        return {
                          status: "error",
                          message: "Failed to update tags related to image.",
                        };
                      });
                  })
                  .catch((err) => {
                    logger.error(err);
                    return {
                      status: "error",
                      message: "Failed to update image.",
                    };
                  });
              }

              return {
                status: "success",
                message: "Selected image have been updated.",
              };
            })
            .catch((err) => {
              logger.error(err);
              return {
                status: "error",
                message: "Failed to update image.",
              };
            });
        })
        .catch((err) => {
          logger.error(err);
          return {
            status: "error",
            message: "Failed to find specific image.",
          };
        });
    })
    .then((result) => {
      if (result.status && result.status === "success") {
        return res.status(200).send(result);
      } else {
        return res.status(400).send(result);
      }
    })
    .catch((err) => {
      return res.status(400).send({
        status: "error",
        message: err,
      });
    });
}

function view(req, res) {
  Image.findOne({
    where: {
      uuid: req.params.uuid,
    },
  })
    .then((item) => {
      if (!item) {
        return res.status(404).send({
          status: "error",
          message: "Selected image does not exists.",
        });
      }

      const image = new imageGenerator(null, null, null, item.user_uuid);
      image.read(item.name).then((result) => {
        const im = result.includes(",") ? result.split(",")[1] : result;
        const img = Buffer.from(im, "base64");

        res.writeHead(200, {
          "Content-Type": "image/png",
          "Content-Length": img.length,
        });

        res.end(img);
      });
    })
    .catch((err) => {
      logger.error(err);
      return res.status(400).send({
        status: "error",
        message: err,
      });
    });
}

module.exports = {
  generate,
  list,
  remove,
  update,
  view,
};
