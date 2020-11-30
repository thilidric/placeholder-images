const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const logger = require("./logger");

module.exports = class ImageGenerator {
  constructor(width, height, color, force) {
    this.width = width || process.env.DEFAULT_WIDTH;
    this.height = height || process.env.DEFAULT_HEIGHT;
    this.color = color || process.env.DEFAULT_COLOR;
    this.force = force || false;
    this.fileName = `${this.width}x${this.height}-${this.color}.png`;

    logger.info(`New image generator object. ${this.width}x${this.height}`);
  }

  async get() {
    if (this.exists()) {
      return await this.serve();
    }
    else {
      return await this.generate();
    }
  }

  exists() {
    if (fs.existsSync(`${process.env.IMAGES_DIR}/${this.fileName}`)) {
      return true;
    }
    else {
      return false;
    }
  }

  generate() {
    logger.info(`Requested image generation with size ${this.width}x${this.height} and with color ${this.color}`);

    return new Promise((resolve, reject) => {
      const canvas = createCanvas(parseInt(this.width), parseInt(this.height));
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, parseInt(this.width), parseInt(this.height));

      canvas.toDataURL('image/png', (err, data) => {
        const base64Data = data.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(`${process.env.IMAGES_DIR}/${this.fileName}`, base64Data, 'base64', function (err) {
          if (err) {
            logger.error(`Failed to write file ${process.env.IMAGES_DIR}/${this.fileName}.`);
            reject("Something went wrong while saving the placeholder image.");
          }
          resolve(data);
        });
      });
    });
  }

  serve() {
    return new Promise((resolve, reject) => {
      fs.readFile(`${process.env.IMAGES_DIR}/${this.fileName}`, 'base64', (err, data) => {
        if (err) {
          logger.error(`Failed to read file ${process.env.IMAGES_DIR}/${this.fileName}.`);
          reject("Something went wrong while reading the placeholder image.");
        }
        resolve(data);
      });
    });
  }
};
