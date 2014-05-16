// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');    // call express
var app        = express();         // define our app using express
var bodyParser = require('body-parser');
// var globSync = require('glob').sync;
// var routes   = globSync('./routes/*.js', { cwd: __dirname }).map(require);
var dynamicRoute = require('./dynamic-route');

// configure app to use bodyParser()
// this will let us get the data from a POST
// app.use(bodyParser());

var port = process.env.PORT || 3333;    // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();        // get an instance of the express Router

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  res.json({message: 'hooray! welcome to our api!'}); 
});

// setup all routes using the dynamicRoute template
routes = ['answeredQuizzes', 'answeredSections', 'quiz_sessions', 'quizzes','sections', 'tags', 'users',  'answeredQuestions', 'choices', 'questions' ];
routes.forEach(function(route) { dynamicRoute(route, router); });

// use CORS middleware
app.use(allowCrossDomain);

// use body parser
app.use(bodyParser());

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);