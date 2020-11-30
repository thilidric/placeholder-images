require("dotenv").config();

const express = require("express");
const logger = require("./modules/logger");
const imageGenerator = require("./modules/image");
const app = express();
const port = process.env.PORT || 1212;

app.get('/generate', (req, res) => {
  const image = new imageGenerator(parseInt(req.query.width), parseInt(req.query.height), req.query.color);
  image.get().then((result) => {
    const im = result.includes(",") ? result.split(",")[1] : result;
    const img = Buffer.from(im, 'base64');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });

    res.end(img);
  })
});

app.listen(port, () => {
  logger.info(`App listening at http://localhost:${port}`);
});
