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
            //body[modelName].type == undefined ||
            //(body[modelName].text == undefined && body[modelName].dropText == undefined && body[modelName].imageUrl == undefined) ||
            //body[modelName].points == undefined ||
            body[modelName].choices == undefined ||
            body[modelName].choices[0] == undefined) {
          throw new BadRequest('You must specify type, points, choices, and text/droptext/imageUrl.');
        }
      }else if(method === 'PUT'){
              if (req.session.username != body[resourceName].owner){
                throw new Forbidden('You must be the owner if you want to modify this question.');
              }else{
                    if (body[resourceName] == undefined ||
                    //body[modelName].type == undefined ||
                    //(body[modelName].text == undefined && body[modelName].dropText == undefined && body[modelName].imageUrl == undefined) ||
                    //body[modelName].points == undefined ||
                    body[resourceName].choices == undefined ||
                    body[resourceName].choices[0] == undefined) {
                    throw new BadRequest('You must specify type, points, choices, and text/droptext/imageUrl.');
                    }
                }
          }else if(method === 'DELETE'){
                 if (req.session.username != body[modelName].owner){
                    throw new Forbidden('You must be the owner if you want to modify this question.');
                 }        
               }
          
        
    }

    next();
  };

  router.use(authorizationMiddleware(name)); // check if user if authorized
  router.use(validationMiddleware); // validate input + throw errors
};
