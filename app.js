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
  { model: 'quiz_session', resource: 'quiz_sessions' },
  { model: 'answeredQuestion', resource: 'answeredQuestions' }
];
//routes = ['answeredQuizzes', 'answeredSections', 'quiz_sessions', 'quizzes','sections', 'tags', 'users',  'answeredQuestions', 'choices', 'questions' ];

// setup all routes using the dynamicRoute template
routes.forEach(function(route) { dynamicRoute(route, router); });

//error middleware
router.use(errorMiddleware); // catch errors

// all of our routes will be prefixed with /api
app.use('/api', router);



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);