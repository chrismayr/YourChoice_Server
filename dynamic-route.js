var buildResponse = require('./utils/build-response');
var findBy = require('./utils/find-by');
var indexOf = require('./utils/index-in-array');
var Datastore = require('nedb');

var db = {};

db.quizzes = new Datastore({ filename: './data/quizzes.db', autoload: true });
db.sections = new Datastore({ filename: './data/sections.db', autoload: true });
db.tags = new Datastore({ filename: './data/tags.db', autoload: true });
db.users = new Datastore({ filename: './data/users.db', autoload: true });
db.answeredQuizzes = new Datastore({ filename: './data/answeredQuizzes.db', autoload: true });
db.answeredSections = new Datastore({ filename: './data/answeredSections.db', autoload: true });
db.quiz_sessions = new Datastore({ filename: './data/quiz_sessions.db', autoload: true });

db.answeredQuestions = new Datastore({ filename: './data/answeredQuestions.db', autoload: true });
db.questions = new Datastore({ filename: './data/questions.db', autoload: true });
db.choices = new Datastore({ filename: './data/choices.db', autoload: true });


module.exports = function(resourceName, router) {
  router.get('/' + resourceName, function(req, res) {
    var result = [];
	var collection = eval("db." + resourceName);
    if (req.query != undefined && req.query.ids != undefined) {
      collection.find({  _id: { $in:  req.query.ids }}, function (err, docs) {
      	 res.json( buildResponse(resourceName, docs) );
      });
    } else {
		collection.find({}, function (err, docs) {
			res.json( buildResponse(resourceName, docs) );
		}); 	
    } 
  });

  router.get('/' + resourceName + '/:id', function(req, res) {
    var id = req.params.id;
    var collection = eval("db." + resourceName);
	collection.findOne({ _id: id }, function (err, doc) {
		if(doc!=null){
			res.json( buildResponse(resourceName, [doc]) );
		}else {
      		res.status(400);
      		res.json( { status: "No document found with this id!" } );
   		 }
	});
  });

  router.delete('/' + resourceName + '/:id', function(req, res) {
   var id = req.params.id;
   var collection = eval("db." + resourceName);
   collection.remove({ _id: id }, {}, function (err, numRemoved) {
		if (numRemoved == 1) {
			res.json({ status: "You have successfully deleted one of the " + resourceName + " with the id: " + id});
	   		res.status(204);
    	} else {
    		res.json( { status: "Deletion of one of the " + resourceName + " with the id: " + id + " was not successful. Please check the id!"} );
      		res.status(400);
    	}//end else
	});//end db.remove
  });//end router.delete

  router.post('/' + resourceName + '/:id', function(req, res) {
    var id = req.params.id,
        body = req.body;

    if (body != undefined) {
   		var collection = eval("db." + resourceName);
		var records = body[resourceName];
		records.forEach(function(record) {
			collection.update( {"_id":id},record, {}, function (err, numReplaced) {	
				res.json( { status: "One of the "+ resourceName + " was updated successfully."} );
				res.status(201);
			});
		});  
    } else {
      res.json( { status: "One of the "+ resourceName + " couldn't be updated successfully."} );
      res.status(400);
    }
  });

  router.put('/' + resourceName, function(req, res) {
    var body = req.body;
    if (body != undefined) {
      var collection = eval("db." + resourceName);
      var records = body[resourceName];
      collection.insert(records, function (err, newDocs) {
		res.json( { status: "Successfully stored in database."} );
	  });
      
    } else {
      res.json( { status: "Cannot be stored in database. Please check the provided data (structure)!"} );
      res.status(400);
    }
  });
};