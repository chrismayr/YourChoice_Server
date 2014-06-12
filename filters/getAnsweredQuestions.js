var Logger = require('../utils/logger'),
	buildResponse = require('../utils/build-response');

module.exports = function(req, res) {
	  Logger.log('Retrieve own answeredQuestions', req);
	  var id = req.session.id;
		global.db.answeredQuestions.find({ owner: req.session.userId }, function (err, docs) {
			if(docs!=null){
				res.json( buildResponse('answeredQuestions', docs) );
			}else {
	      		res.status(400);
	      		res.json( { status: "No documents found with this owner!" } );
	   		 }
		});
}