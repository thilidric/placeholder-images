const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const logger = require("./logger");

module.exports = class ImageGenerator {
  constructor(width, height, color, token, force) {
    this.width = width || process.env.DEFAULT_WIDTH;
    this.height = height || process.env.DEFAULT_HEIGHT;
    this.color = color || process.env.DEFAULT_COLOR;
    this.force = force || false;
    this.userToken = token || null;
    this.fileName = `${this.width}x${this.height}-${this.color}.png`;
    this.fileDirectory = this.userToken
      ? `${process.env.IMAGES_DIR}/${this.userToken}`
      : process.env.IMAGES_DIR;

    if (!fs.existsSync(this.fileDirectory)) {
      fs.mkdirSync(this.fileDirectory);
    }

    logger.info(
      `New image generator object: ${this.fileDirectory}/${this.fileName}`
    );
  }

  async get() {
    if (this.exists() && !this.force) {
      return await this.serve();
    } else {
      return await this.generate();
    }
  }

  exists() {
    if (fs.existsSync(`${this.fileDirectory}/${this.fileName}`)) {
      return true;
    } else {
      return false;
    }
  }

  generate() {
    logger.info(
      `Requested image generation with size ${this.width}x${this.height} and with color ${this.color}`
    );

    return new Promise((resolve, reject) => {
      const canvas = createCanvas(parseInt(this.width), parseInt(this.height));
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, parseInt(this.width), parseInt(this.height));

      ctx.font = "bold 18px verdana, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeText(
        `${this.width}x${this.height}`,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width
      );

      ctx.fillStyle = "#ffffff";
      ctx.fillText(
        `${this.width}x${this.height}`,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width
      );

      canvas.toDataURL("image/png", (err, data) => {
        const base64Data = data.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(
          `${this.fileDirectory}/${this.fileName}`,
          base64Data,
          "base64",
          function (err) {
            if (err) {
              logger.error(
                `Failed to write file ${this.fileDirectory}/${this.fileName}.`
              );
              reject(
                "Something went wrong while saving the placeholder image."
              );
            }
            resolve(data);
          }
        );
      });
    });
  }

  serve() {
    return new Promise((resolve, reject) => {
      fs.readFile(
        `${this.fileDirectory}/${this.fileName}`,
        "base64",
        (err, data) => {
          if (err) {
            logger.error(
              `Failed to read file ${this.fileDirectory}/${this.fileName}.`
            );
            reject("Something went wrong while reading the placeholder image.");
          }
          resolve(data);
        }
      );
    });
  }
};
