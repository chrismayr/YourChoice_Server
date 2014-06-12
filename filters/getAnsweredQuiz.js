var Logger = require('../utils/logger'),
	buildResponse = require('../utils/build-response');

module.exports = function(req, res) {
	Logger.log('Retrieve own answeredquiz', req);
	var id = req.params.id;
	global.db.answeredQuizzes.findOne({ $and: [{ _id: id }, { owner: req.session.userId }] }, function (err, doc) {
		if(doc!=null){
			res.json( buildResponse('answeredQuiz', doc) );
		}else {
	  		res.status(400);
	  		res.json( { status: "No document found with this id or you are not the owner!" } );
			 }
	});
}