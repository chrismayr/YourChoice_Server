// BASE SETUP
// =============================================================================

// call the packages we need

var express    = require('express'),    // call express
    app        = express(),         // define our app using express
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session      = require('express-session'),
    allowCrossDomain = require('./utils/cors-middleware'),
    errorMiddleware = require('./utils/error-middleware'),
    dynamicRoute = require('./dynamic-route');


var port = process.env.PORT || 3333;    // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();        // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  res.json({message: 'hooray! welcome to our api!'}); 
});

//SETUP MIDDLEWARE
app.use(allowCrossDomain); // use CORS middleware
app.use(bodyParser()); // use body parser

// use session
app.use(cookieParser());
app.use(session({ secret: 'mychoice rocks', cookie: { maxAge: 60000 } }));


// REGISTER OUR ROUTES
var routes = [
  { model: 'quiz', resource: 'quizzes', customValidation: true },
  { model: 'tag', resource: 'tags', customValidation: true },
  { model: 'user', resource: 'users', customValidation: true },
  { model: 'section', resource: 'sections', customValidation: true },
  { model: 'question', resource: 'questions', customValidation: true },
  { model: 'choice', resource: 'choices', customValidation: true },
  { model: 'answeredQuiz', resource: 'answeredQuizzes' },
  { model: 'answeredSection', resource: 'answeredSections' },
  { model: 'quizSession', resource: 'quizSessions' },
  { model: 'answeredQuestion', resource: 'answeredQuestions' }//,
  //{ model: 'login', resource: 'users' }
];

// setup all routes using the dynamicRoute template
routes.forEach(function(route) { dynamicRoute(route, router); });

router.post('/logout', function(req, res) {
	  // TODO destroy session
		req.session.destroy(funcition(err));
	  console.log('destroyed session');
	  res.json({ status: "logged out"});
	});

	router.post('/login', function(req, res) {
	  // TODO init session
		  var user = req.params.user;
		    var collection = "db.users";
			collection.findOne({ username: user.username }, function (err, doc) {
				if(doc!=null){
					if(ddoc.password == user.password){
						console.log('init session');
						req.session.user = user.username;
						req.session.userId = user._Id
						res.status(200);
						/*res.json({200
							user:{
								_id: user._id,
								username: user.username,
								firstname: user.firstname,
								lastname: user.lastname,
								password: user.password*/
							}
						});
					}else
						{
						res.status(400);
						//res.json( {status: "No User or not matching password!"});
						}
				}else {
		      		res.status(400);
		      		res.json( { status: "No document found with this id!" } );
		   		 }
			});
	  /*console.log('init session');
	  res.json({
	    user: {
	      _id: "1",
	      username: "manuel_mitasch",
	      firstname: "Manuel",
	      lastname: "Mitasch",
	      password: "test"
	    }
	  });*/
	});

//error middleware
router.use(errorMiddleware); // catch errors


// all of our routes will be prefixed with /api
app.use('/api', router);



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
