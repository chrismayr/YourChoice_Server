var errors = require('../utils/errors'),
    Unauthorized = errors.unauthorized,
    NotFound = errors.notfound,
    BadRequest = errors.badrequest,
    MethodNotAllowed = errors.methodnotallowed,
    Forbidden = errors.forbidden;

module.exports = function(err, req, res, next) {
  if (err instanceof Unauthorized) {
    res.send(401, err.toJson());
  } else if (err instanceof NotFound) {
    res.send(404, err.toJson());
  }else if (err instanceof MethodNotAllowed) {
	res.header('Access-Control-Allow-Methods', 'GET');
	res.send(405, { name: "MethodNotAllowed", message: err.message });
  }else if (err instanceof Forbidden) {
	res.send(403, { name: "Forbidden", message: err.message });
  } else if (err instanceof BadRequest || err instanceof Error) {
    res.send(400, err.toJson());
  } else if (err instanceof Error) {
    res.send(400, { name: "BadRequest", message: err.message });
  } else {
    next();
  }
};