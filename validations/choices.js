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

    if (curResource === resourceName) 
    {
      if (method === 'POST' || method === 'PUT') 
      {
        if (body[modelName] == undefined ||
            body[modelName].isSolution == undefined ||
            (body[modelName].text == undefined && body[modelName].imageUrl == undefined)) 
            {
                throw new BadRequest('You must specify text or imageUrl and if it is the solution.');
            }
      }else
      {
          if(method === 'PUT')
          {
              if (req.session.username != body[modelName].owner){
                throw new Forbidden('You must be the owner if you want to modify this quiz.');
            }
            else
            {
                 if (body[modelName] == undefined ||
                    body[modelName].isSolution == undefined ||
                    (body[modelName].text == undefined && body[modelName].imageUrl == undefined)) 
                    {
                        throw new BadRequest('You must specify text or imageUrl and if it is the solution.');
                    }
                }   
          }else
          {
              if(method === 'DELETE')
              {
                if (req.session.username != body[modelName].owner)
                {
                throw new Forbidden('You must be the owner if you want to modify this quiz.');
                }
                else
                {
                    if (body[modelName] == undefined ||
                        body[modelName].isSolution == undefined ||
                        (body[modelName].text == undefined && body[modelName].imageUrl == undefined)) 
                        {
                            throw new BadRequest('You must specify text or imageUrl and if it is the solution.');
                        }
                }
            }
           }
        }
    }

    next();
  };

  router.use(authorizationMiddleware(name)); // check if user if authorized
  router.use(validationMiddleware); // validate input + throw errors
};
