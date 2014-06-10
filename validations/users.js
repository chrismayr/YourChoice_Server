var authorizationMiddleware = require('../utils/authorization-middleware'),
    errors = require('../utils/errors'),
    Unauthorized = errors.unauthorized,
    NotFound = errors.notfound,
    BadRequest = errors.badrequest,
    Forbidden= errors.forbidden;

module.exports = function(name, router) {
  var modelName = name.model,
      resourceName = name.resource;

  var validationMiddleware = function(req, res, next) {
    var body = req.body,
        method = req.method,
        curResource = req.url.split('/')[1];

    if (curResource === resourceName) {
      if (method === 'POST') {
        if (body[modelName] == undefined ||
            body[modelName].username == undefined ||
            body[modelName].email == undefined ||
            body[modelName].password == undefined) {
          throw new BadRequest('You must specify username, email, password.');
        }
      }else if(method === 'PUT'){
           if (body[resourceName] == undefined ||
                body[resourceName].username == undefined ||
                body[resourceName].email == undefined ||
                body[resourceName].password == undefined) {
                throw new BadRequest('You must specify username, email, password.');
            }
            if (req.session.username != body[resourceName].username){
                throw new Forbidden('You must be the owner if you want to modify this quiz.');
            }
          }else if(method === 'DELETE'){
                  if (req.session.username != body[modelName].owner){
                    throw new Forbidden('You must be the owner if you want to modify this quiz.');
                  }
              }
    }// end if (curResource === resourceName)

    next();
  };

  router.use(authorizationMiddleware(name)); // check if user if authorized
  router.use(validationMiddleware); // validate input + throw errors
};
