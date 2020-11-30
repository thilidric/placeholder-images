require("dotenv").config();

const express = require("express");
const path = require('path');
const winston = require("winston");
const pimage = require('pureimage');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 1300;
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "hots-server" },
  transports: [
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple(),
        winston.format.printf((msg) =>
          `${msg.timestamp} - ${msg.level}: ${msg.message}`
        )
      ),
    })
  );
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/generate', (req, res) => {
  let width = typeof parseInt(req.query.width) === 'number' && !Number.isNaN(parseInt(req.query.width)) ? req.query.width : process.env.DEFAULT_WIDTH;
  let height = typeof parseInt(req.query.height) === 'number' && !Number.isNaN(parseInt(req.query.height)) ? req.query.height : process.env.DEFAULT_HEIGHT;
  let color = req.query.color ? req.query.color : `${process.env.DEFAULT_COLOR}`;
  let fileName = `${width}x${height}-${color}.png`;

  logger.info(`Requested image generation with size ${width}x${height} and with color ${color}`);
  let image = pimage.make(width, height);
  let ctx = image.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  pimage.encodePNGToStream(image, fs.createWriteStream(`images/${fileName}`)).then(() => {
    logger.info(`^ image generated with a name ${fileName}`);
    res.sendFile(path.join(`${__dirname}/images/${fileName}`));
  }).catch((e) => {
    logger.info(`^ there was an error while generating the image`);
    logger.error(JSON.stringify(e));
  });
});

app.listen(port, () => {
  logger.info(`Example app listening at http://localhost:${port}`);
});
