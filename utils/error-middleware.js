var errors = require('../utils/errors'),
    Unauthorized = errors.unauthorized,
    NotFound = errors.notfound,
    BadRequest = errors.badrequest;

module.exports = function(err, req, res, next) {
  if (err instanceof Unauthorized) {
    res.send(401, err.toJson());
  } else if (err instanceof NotFound) {
    res.send(404, err.toJson());
  } else if (err instanceof BadRequest || err instanceof Error) {
    res.send(400, err.toJson());
  } else if (err instanceof Error) {
    res.send(400, { name: "BadRequest", message: err.message });
  } else {
    next();
  }
};