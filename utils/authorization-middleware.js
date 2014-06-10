var errors = require('../utils/errors'),
    Unauthorized = errors.unauthorized,
    Logger = require('../utils/logger');

module.exports = function (route) {
  var resourceName = route.resource;

  return function(req, res, next) {
    var username = req.session.username,
        curResource = req.url.split('/')[1];

    if (curResource === resourceName) {
      if (username == undefined) {
        console.log('Authorization middleware: NOT authorized');
        Logger.warn('Authorization middleware: NOT authorized', req);
        // delete req.session.username;
        // throw new Unauthorized;  // TODO uncomment once session is used
      } else {
        console.log('Authorization middlware: Authorized');
      }
    }

    next();
  };
};
