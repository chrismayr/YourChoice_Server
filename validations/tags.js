var authorizationMiddleware = require('../utils/authorization-middleware'),
    errors = require('../utils/errors'),
    Unauthorized = errors.unauthorized,
    NotFound = errors.notfound,
    BadRequest = errors.badrequest,
    MethodNotAllowed = errors.methodnotallowed;

module.exports = function(name, router) {
  var modelName = name.model,
      resourceName = name.resource;

  var validationMiddleware = function(req, res, next) {
    var body = req.body,
        method = req.method,
        curResource = req.url.split('/')[1];

    if (curResource === resourceName) {
      if (method === 'PUT') {
        if (body[modelName] == undefined ||
            body[modelName].name == undefined) {
          throw new BadRequest('You must specify a name.');
        }
      }else if (method === 'DELETE' || method === 'POST') {
    	  throw new MethodNotAllowed('It is not allowed to create or delete a tag.');
      }
    }

    next();
  };

  router.use(authorizationMiddleware(name)); // check if user if authorized
  router.use(validationMiddleware); // validate input + throw errors
};