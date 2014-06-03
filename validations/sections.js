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
            body[modelName].name == undefined ||
            body[modelName].questions == undefined ||
            body[modelName].questions[0] == undefined) {
          throw new BadRequest('You must specify name, questions.');
        }
      }
    }

    next();
  };

  router.use(authorizationMiddleware(name)); // check if user if authorized
  router.use(validationMiddleware); // validate input + throw errors
};