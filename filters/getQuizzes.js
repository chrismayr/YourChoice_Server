var Logger = require('../utils/logger'),
	buildResponse = require('../utils/build-response');

module.exports = function(req, res) {
	Logger.log('Retrieve all own and public quizzes', req);	  
	global.db.quizzes.find({ $or: [{ owner: req.session.userId }, { isPublic: true }] }, function (err, docs) {
		res.json( buildResponse('quizzes', docs) );
	});
}