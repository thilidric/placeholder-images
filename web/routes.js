const imageGenerator = require("../utilities/image");
const userController = require("../modules/users/controllers/user");

module.exports = function (app) {
  app.get("/generate", (req, res) => {
    userController.exists(req.query.token || null).then((exists) => {
      const image = new imageGenerator(
        parseInt(req.query.width),
        parseInt(req.query.height),
        req.query.color,
        exists ? req.query.token : null
      );
      image.get().then((result) => {
        const im = result.includes(",") ? result.split(",")[1] : result;
        const img = Buffer.from(im, "base64");

        res.writeHead(200, {
          "Content-Type": "image/png",
          "Content-Length": img.length,
        });

        res.end(img);
      });
    });
  });
};
