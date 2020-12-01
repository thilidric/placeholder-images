const imageGenerator = require("../classes/image");

function generate(req, res) {
  const image = new imageGenerator(
    parseInt(req.query.width),
    parseInt(req.query.height),
    req.query.color
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
}

module.exports = {
  generate: generate,
};
