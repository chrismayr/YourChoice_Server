var authorizationMiddleware = require('../utils/authorization-middleware'),
    errors = require('../utils/errors'),
    Unauthorized = errors.unauthorized,
    NotFound = errors.notfound,
    BadRequest = errors.badrequest;

module.exports = function(name, router) {
  var modelName = name.model,
      resourceName = name.resource;

  var validationMiddleware = function(req, res, next) {
    var body = req.body,
        method = req.method,
        curResource = req.url.split('/')[1];

    if (curResource === resourceName) {
      if (method === 'POST' || method === 'PUT') {
        if (body[modelName] == undefined ||
            body[modelName].type == undefined ||
            (body[modelName].text == undefined && body[modelName].dropText == undefined && body[modelName].imageUrl == undefined) ||
            body[modelName].points == undefined ||
            body[modelName].choices == undefined ||
            body[modelName].choices[0] == undefined) {
          throw new BadRequest('You must specify type, points, choices, and text/droptext/imageUrl.');
        }
      }
    }

    next();
  };

  router.use(authorizationMiddleware(name)); // check if user if authorized
  router.use(validationMiddleware); // validate input + throw errors
};