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
      if (method === 'POST') {
        if (body[modelName] == undefined ||
            body[modelName].name == undefined ||
            body[modelName].questions == undefined ||
            body[modelName].questions[0] == undefined ||
            body[modelName].owner == undefined) {
          throw new BadRequest('You must specify name, questions.');
            }
            if (req.session.username != body[modelName].owner){
            		throw new Forbidden('You must be the owner if you want to modify this section.');
            }
      }else if (method === 'PUT') {
          if (body[modelName] == undefined ||
                  body[modelName].name == undefined ||
                  body[modelName].tags == undefined ||
                  body[modelName].tags[0] == undefined ||
                  body[modelName].sections == undefined ||
                  body[modelName].sections[0] == undefined||
                  body[modelName].owner == undefined) {
                     throw new BadRequest('You must specify name, tags, sections, owner.');
                  }
            	if (req.session.username != body[modelName].owner){
            		throw new Forbidden('You must be the owner if you want to modify this section.');
            	}
             }else if(method === 'DELETE')
                 {
                     if (req.session.username != body[modelName].owner){
            	    	throw new Forbidden('You must be the owner if you want to modify this section.');
            	     }
                 }
             
             
    }

    next();
  };

  router.use(authorizationMiddleware(name)); // check if user if authorized
  router.use(validationMiddleware); // validate input + throw errors
}
