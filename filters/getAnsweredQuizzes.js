var Logger = require('../utils/logger'),
	buildResponse = require('../utils/build-response');

module.exports = function(req, res) {
	Logger.log('Retrieve own answeredquizzes', req);
	  var userId = req.session.userId;
	  console.log(userId);
		global.db.answeredQuizzes.find({ owner: req.session.userId }, function (err, docs) {
			console.log(JSON.stringify(docs));
			if(docs!=null){
				res.json( buildResponse('answeredQuizzes', docs) );
			}else {
	      		res.status(400);
	      		res.json( { status: "No documents found with this owner!" } );
	   		 }
		});
}