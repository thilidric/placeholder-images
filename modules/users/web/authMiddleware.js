const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
  var token = req.headers['x-access-token']
  if (!token) return res.status(403).send({ "status": "error", "message": "Missing access token." })

  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) return res.status(403).send({ "status": "error", "message": "Access forbidden." })

    req.user_id = decoded.id
    next()
  })
}

module.exports = verifyToken
