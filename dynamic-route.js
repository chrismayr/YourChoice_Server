var buildResponse = require('./utils/build-response'),
    authorizationMiddleware = require('./utils/authorization-middleware'),
    Logger = require('./utils/logger');

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
			res.json( buildResponse(resourceName, doc) );
		}else {
      		res.status(400);
      		res.json( { status: "No document found with this id!" } );
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


// CREATE single
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
  
////filter middleware
  router.get('/users', function(req, res) {
		Logger.log('Retrieve all users without password', req);	    
			global.db.users.find({}, function (err, docs) {
				docs.forEach(function(doc) {
				    delete doc.password;
				  });
				res.json( buildResponse('users', docs) );
			});
  });
  
  router.get('/answeredQuizzes', function(req, res) {
	  Logger.log('Retrieve own answeredquizzes', req);
	  // todo all the things
	  var id = req.session.id;
		global.db.answeredQuizzes.find({ owner: req.session.username }, function (err, docs) {
			if(docs!=null){
				res.json( buildResponse('answeredQuizzes', docs) );
			}else {
	      		res.status(400);
	      		res.json( { status: "No documents found with this owner!" } );
	   		 }
		});

	  });


  router.get('/answeredQuizzes/:id', function(req, res) {
	Logger.log('Retrieve own answeredquiz', req);
    var id = req.params.id;
   global.db.answeredQuizzes.findOne({ $and: [{ _id: id }, { owner: req.session.username }] }, function (err, doc) {
		if(doc!=null){
			res.json( buildResponse('answeredQuiz', doc) );
		}else {
      		res.status(400);
      		res.json( { status: "No document found with this id or you are not the owner!" } );
   		 }
	});
  });
  
  router.get('/answeredSections', function(req, res) {
	  Logger.log('Retrieve own answeredSections', req);
	  // todo all the things
	  var id = req.session.id;
		global.db.answeredSections.find({ owner: req.session.username }, function (err, docs) {
			if(docs!=null){
				res.json( buildResponse('answeredSections', docs) );
			}else {
	      		res.status(400);
	      		res.json( { status: "No documents found with this owner!" } );
	   		 }
		});

	  });


  router.get('/answeredSections/:id', function(req, res) {
	Logger.log('Retrieve own answeredSections', req);
    var id = req.params.id;
   global.db.answeredSections.findOne({ $and: [{ _id: id }, { owner: req.session.username }] }, function (err, doc) {
		if(doc!=null){
			res.json( buildResponse('answeredSection', doc) );
		}else {
      		res.status(400);
      		res.json( { status: "No document found with this id or you are not the owner!" } );
   		 }
	});
  });
  
  router.get('/answeredQuestions', function(req, res) {
	  Logger.log('Retrieve own answeredQuestions', req);
	  // todo all the things
	  var id = req.session.id;
		global.db.answeredQuestions.find({ owner: req.session.username }, function (err, docs) {
			if(docs!=null){
				res.json( buildResponse('answeredQuestions', docs) );
			}else {
	      		res.status(400);
	      		res.json( { status: "No documents found with this owner!" } );
	   		 }
		});

	  });


  router.get('/answeredQuestions/:id', function(req, res) {
	Logger.log('Retrieve own answeredQuestion', req);
    var id = req.params.id;
   global.db.answeredQuestions.findOne({ $and: [{ _id: id }, { owner: req.session.username }] }, function (err, doc) {
		if(doc!=null){
			res.json( buildResponse('answeredQuestion', doc) );
		}else {
      		res.status(400);
      		res.json( { status: "No document found with this id or you are not the owner!" } );
   		 }
	});
  });
  

};
