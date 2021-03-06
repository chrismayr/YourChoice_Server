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
    dynamicRoute = require('./dynamic-route')
    Logger = require('./utils/logger'),
    errors = require('./utils/errors'),
    BadRequest = errors.badrequest,
    startQuizRoute = require('./routes/start-quiz-route'),
    getUsers = require('./filters/getUsers'),
    getQuizzes = require('./filters/getQuizzes'),
    getAnsweredQuizzes = require('./filters/getAnsweredQuizzes'),
    getAnsweredQuiz = require('./filters/getAnsweredQuiz'),
    getAnsweredSections = require('./filters/getAnsweredSections'),
    getAnsweredSection =  require('./filters/getAnsweredSection'),
    getAnsweredQuestions = require('./filters/getAnsweredQuestions'),
    getAnsweredQuestion = require('./filters/getAnsweredQuestion');

var port = process.env.PORT || 3333;    // set our port

// to throw also all our custom errors when using nedb:
process.on('uncaughtException', function(err){
	throw err;
});

//DATABASE OBJECTS
//============================================================================
var Datastore = require('nedb');
global.db = {};

global.db.quizzes = new Datastore({ filename: './data/quizzes.db', autoload: true });
global.db.sections = new Datastore({ filename: './data/sections.db', autoload: true });
global.db.tags = new Datastore({ filename: './data/tags.db', autoload: true });
global.db.users = new Datastore({ filename: './data/users.db', autoload: true });
global.db.answeredQuizzes = new Datastore({ filename: './data/answeredQuizzes.db', autoload: true });
global.db.answeredSections = new Datastore({ filename: './data/answeredSections.db', autoload: true });
global.db.quizSessions = new Datastore({ filename: './data/quizSessions.db', autoload: true });
global.db.answeredQuestions = new Datastore({ filename: './data/answeredQuestions.db', autoload: true });
global.db.answeredChoices = new Datastore({ filename: './data/answeredChoices.db', autoload: true });
global.db.questions = new Datastore({ filename: './data/questions.db', autoload: true });
global.db.choices = new Datastore({ filename: './data/choices.db', autoload: true });
global.db.sessions = new Datastore({ filename: './data/sessions.db', autoload: true });
//=============================================================================

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
app.use(session({
    secret: 'keyboard cat'
  , proxy: true // if you do SSL outside of node.,
  , cookie: { path: '/', httpOnly: true, secure: false, maxAge: 9999999 }
}));

//filter middleware
router.get('/users', getUsers); //retrieve all users without password
router.get('/quizzes', getQuizzes); //retrieve all own and all public quizzes
router.get('/answeredQuizzes', getAnsweredQuizzes); //get all own answeredQuizzes
router.get('/answeredQuizzes/:id', getAnsweredQuiz);  //get own answeredQuiz with specific id
router.get('/answeredSections', getAnsweredSections); //get all own answeredSections
router.get('/answeredSections/:id', getAnsweredSection); //get own answeredSection with specific id
router.get('/answeredQuestions', getAnsweredQuestions); //get all own answeredQuestions
router.get('/answeredQuestions/:id', getAnsweredQuestion); //get own answeredQuestion with specific id
router.post('/answeredQuizzes/:id', startQuizRoute);

// REGISTER OUR ROUTES
var routes = [
  { model: 'quiz', resource: 'quizzes', customValidation: true },
  { model: 'tag', resource: 'tags', customValidation: true },
  { model: 'user', resource: 'users', customValidation: true},
  { model: 'section', resource: 'sections', customValidation: true },
  { model: 'question', resource: 'questions', customValidation: true },
  { model: 'choice', resource: 'choices', customValidation: true },
  { model: 'answeredQuiz', resource: 'answeredQuizzes', customValidation: true },
  { model: 'answeredSection', resource: 'answeredSections', customValidation: true },
  { model: 'quizSession', resource: 'quizSessions' },
  { model: 'answeredQuestion', resource: 'answeredQuestions', customValidation: true  },
  { model: 'answeredChoice', resource: 'answeredChoices'},
  { model: 'session', resource: 'sessions'}
];

// setup all routes using the dynamicRoute template
routes.forEach(function(route) { dynamicRoute(route, router); });

router.post('/logout', function(req, res) {
    req.session.destroy();
    console.log('destroyed session');
    res.json({ status: "logged out"});
  });

router.post('/login', function(req, res) {
  Logger.log('Login', req);

  var username = req.body.username,
      password = req.body.password;

  global.db.users.findOne({ username: username }, function (err, doc) {
    if (doc != null) {
      if (doc.password == password) {
    	console.log("login and userid: " + doc._id);
        console.log('init session');
        req.session.username = username;
        req.session.userId = doc._id;
        req.session.save();
        res.json(200, { user: doc });
      } else {
    	  res.json({"name":"BadRequest","message":"No User or not matching password!"});
          res.status(400);
        //next(new BadRequest('No User or not matching password!'));
      }
    } else {
    	res.json({"name":"BadRequest","message":"No User or not matching password!"});
         res.status(400);
      //next(new BadRequest('No User or not matching password!'));
    }
  });
});


//error middleware
router.use(errorMiddleware); // catch errors


// all of our routes will be prefixed with /api
app.use('/api', router);



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
