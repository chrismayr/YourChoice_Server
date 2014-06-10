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

    if (curResource === resourceName) 
    {
      if (method === 'POST') 
      {
        if (body[modelName] == undefined ||
            body[modelName].isSolution == undefined ||
            (body[modelName].text == undefined && body[modelName].imageUrl == undefined)) 
            {
                throw new BadRequest('You must specify text or imageUrl and if it is the solution.');
            }
      }else if(method === 'PUT')
          {
              if (req.session.username != body[resourceName].owner){
                throw new Forbidden('You must be the owner if you want to modify this choice.');
              }
            else if (body[resourceName] == undefined ||
                    body[resourceName].isSolution == undefined ||
                    (body[resourceName].text == undefined && body[resourceName].imageUrl == undefined)) 
                    {
                        throw new BadRequest('You must specify text or imageUrl and if it is the solution.');
                    }   
          }else if(method === 'DELETE')
              {
                if (req.session.username != body[modelName].owner)
                {
                throw new Forbidden('You must be the owner if you want to modify this quiz.');
                }  
                } // end delete
     
    } // end if (curResource === resourceName) 

    next();
  }; // end validationMiddleware

  router.use(authorizationMiddleware(name)); // check if user if authorized
  router.use(validationMiddleware); // validate input + throw errors
}
