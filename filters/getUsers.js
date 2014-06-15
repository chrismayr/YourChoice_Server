var Logger = require('../utils/logger'),
	buildResponse = require('../utils/build-response');

module.exports = function(req, res) {
	Logger.log('Retrieve all users without password', req);	    
	global.db.users.find({}, function (err, docs) {
		docs.forEach(function(doc) {
		    delete doc.password;
		  });
		res.json( buildResponse('users', docs) );
	});
}