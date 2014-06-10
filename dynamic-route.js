var buildResponse = require('./utils/build-response'),
    authorizationMiddleware = require('./utils/authorization-middleware'),
    Logger = require('./utils/logger');

//var db = {};
//
//db.quizzes = new Datastore({ filename: './data/quizzes.db', autoload: true });
//db.sections = new Datastore({ filename: './data/sections.db', autoload: true });
//db.tags = new Datastore({ filename: './data/tags.db', autoload: true });
//db.users = new Datastore({ filename: './data/users.db', autoload: true });
//db.answeredQuizzes = new Datastore({ filename: './data/answeredQuizzes.db', autoload: true });
//db.answeredSections = new Datastore({ filename: './data/answeredSections.db', autoload: true });
//db.quizSessions = new Datastore({ filename: './data/quizSessions.db', autoload: true });
//db.answeredQuestions = new Datastore({ filename: './data/answeredQuestions.db', autoload: true });
//db.answeredChoices = new Datastore({ filename: './data/answeredChoices.db', autoload: true });
//db.questions = new Datastore({ filename: './data/questions.db', autoload: true });
//db.choices = new Datastore({ filename: './data/choices.db', autoload: true });


module.exports = function(route, router) {

  var modelName = route.model,
      resourceName = route.resource;

  // either use a custom validation middleware (that also needs to include the authorization middleware)
  // or at least use standard authorization middleware
  if (route.customValidation) {
    var validateRequest = require('./validations/' + resourceName);
    validateRequest(route, router); // validate request (with validation middleware)
  } else {
    router.use(authorizationMiddleware(route)); // check if user if authorized/logged in
  }

// RETRIEVE all
  router.get('/' + resourceName, function(req, res) {
	Logger.log('Retrieve all', req);
    var result = [];
	var collection = eval("global.db." + resourceName);
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

// RETRIEVE single
  router.get('/' + resourceName + '/:id', function(req, res) {
	Logger.log('Retrieve single', req);
    var id = req.params.id;
    var collection = eval("global.db." + resourceName);
	collection.findOne({ _id: id }, function (err, doc) {
		if(doc!=null){
			res.json( buildResponse(resourceName, [doc]) );
		}else {
      		res.status(400);
      		res.json( { status: "No document found with this id!" } );
   		 }
	});
  });

  router.get('/answeredQuiz', function(req, res) {
  // todo all the things
  var id = req.session.id;
  var collection = eval("global.db." + resourceName);
	collection.find({ owner: id }, function (err, doc) {
		if(doc!=null){
			res.json( buildResponse(resourceName, [doc]) );
		}else {
      		res.status(400);
      		res.json( { status: "No document found with this userID!" } );
   		 }
	});

  });

  router.get('/answeredQuiz/:id', function(req, res) {
  // todo all the things
  var id = req.parms.id;
  var collection = eval("global.db." + resourceName);
	collection.find({ _id: id }, function (err, doc) {
		if(doc!=null){
			res.json( buildResponse(resourceName, [doc]) );
		}else {
      		res.status(400);
      		res.json( { status: "No document found with this QuizID!" } );
   		 }
	});

  });

// DELETE single
  router.delete('/' + resourceName + '/:id', function(req, res) {
   Logger.log('Delete single', req);
   var id = req.params.id;
   var collection = eval("global.db." + resourceName);
   collection.remove({ _id: id }, {}, function (err, numRemoved) {
		if (numRemoved == 1) {
			res.json({ status: "You have successfully deleted one of the " + resourceName + " with the id: " + id});
	   		res.status(204);
    	} else {
    		Logger.log('Resource not found', req);
    		res.send(400);
    	}//end else
	});//end db.remove
  });//end router.delete


// CREATE
  router.post('/' + resourceName, function(req, res) {
	Logger.log('Create single', req);
    var body = req.body;
    if (body != undefined && body[modelName] != undefined) {
      var collection = eval("global.db." + resourceName);
      var records = body[modelName];
      collection.insert(records, function (err, newDocs) {
        res.json( buildResponse(modelName, newDocs) );
        res.status(201);
	  });

    } else {
    	Logger.error('Wrong data in body', req);
    	res.send(400);
    }
  });

// UPDATE single
  router.put('/' + resourceName + '/:id', function(req, res) {
	  Logger.log('Update single', req);
    var id = req.params.id,
        body = req.body;

  	if (body != undefined && body[modelName] != undefined) {
     	var collection = eval("global.db." + resourceName);
  		var record = body[modelName];

      record._id = id;

  		collection.update( {"_id":id}, record, {}, function (err, numReplaced) {
  			res.json( buildResponse(modelName, [record]) );
  			res.status(201);
  		});
    } else {
    	Logger.error('Wrong data in body', req);
    	res.send(400);
    }
  });
};
