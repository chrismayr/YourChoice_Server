var authorizationMiddleware = require('../utils/authorization-middleware'),
    errors = require('../utils/errors'),
    Unauthorized = errors.unauthorized,
    NotFound = errors.notfound,
    BadRequest = errors.badrequest,
    Forbidden = errors.forbidden;

module.exports = function(name, router) {
  var modelName = name.model,
      resourceName = name.resource;

  var validationMiddleware = function(req, res, next) {
    var body = req.body,
        method = req.method,
        curResource = req.url.split('/')[1];
    if (curResource === resourceName) {
      if (method === 'POST') {
    	//check mandatory fields of POST when creating quiz
        if (body[modelName] == undefined ||
            body[modelName].name == undefined ||
            body[modelName].tags == undefined ||
            body[modelName].tags[0] == undefined ||
            body[modelName].sections == undefined ||
            body[modelName].sections[0] == undefined||
            body[modelName].owner == undefined) {
          throw new BadRequest('You must specify name, tags, sections, owner.');
        }else{
        	//if all mandatory fields exist:
        	//check if correct owner will be stored
        	if (req.session.userId != body[modelName].owner){
        		throw new Forbidden('You must be the owner if you want to save this quiz.');
        	}else{
        		//if all mandatory fields exist &&
            	//if correct owner will be stored:
        		// go further and create quiz
        		next();
        	}
        }
      }else if (method === 'PUT') {
    	//check mandatory fields of PUT when editing quiz
        if (body[modelName] == undefined ||
            body[modelName].name == undefined ||
            body[modelName].tags == undefined ||
            body[modelName].tags[0] == undefined ||
            body[modelName].sections == undefined ||
            body[modelName].sections[0] == undefined||
            body[modelName].owner == undefined) {
               throw new BadRequest('You must specify name, tags, sections, owner.');
            }else {
            	//if all mandatory fields exist:
         	   //check if the current user is the owner of the quiz
            	var id = req.url.split('/')[2];
                global.db.quizzes.findOne({ _id: id }, function (err, doc) {
           			if(doc!=null){
           				if (req.session.userId == undefined ||
           					req.session.userId != doc.owner ||
           					req.session.userId != body[modelName].owner){
           						//if all mandatory fields exist &&
           						//if the logged in user is not the owner of the quiz which should be modified:
           						// throw Forbidden
           						next(new Forbidden('You must be the owner if you want to modify this quiz.'));
           		         }else{
                 			//if all mandatory fields exist &&
 		  		        	//if the logged in user is the owner of the quiz which should be modified:
                 			// go further and update quiz
                 			next();  	          		        	        		        	 
                 		}
           			}else{
           				//if all mandatory fields exist &&
               			//if there is no doc in db with the id which should be update:
	 	                //throw bad request
           				next(new BadRequest('No quiz with this id found.'));
           			}  			
           		});//end findone
            }
       }else if(method === 'DELETE'){
    	   //check if the logged in user is the owner of the quiz which should be deleted:
    	   var id = req.url.split('/')[2];
           global.db.quizzes.findOne({ _id: id }, function (err, doc) {
       			if(doc!=null){
       				if (req.session.userId == undefined ||
       					req.session.userId != doc.owner){
       					//if there is a quiz in db with the id which should be deleted &&
     					//if the logged in user is not the owner of the quiz which should be deleted:
     					//throw forbidden
       					next(new Forbidden('You must be the owner if you want to delete this quiz.'));
       		         }else{
      		        	//if there is a quiz in db with the id which should be deleted &&
       					//if the logged in user is the owner of the quiz which should be deleted:
     	                // go further and delete quiz
      		        	next();
      		         }
       			}else{
       				//if there is no quiz in db with the id which should be deleted:
     				//throw bad request
       				next(new BadRequest('There is no quiz with this id.'));
       			} // end ifelse (doc!=null)  			
       		});//end findone
       }else{
      	  	next();
       }// end methods
    } else{
   	  	next();
    }// end if (curResource === resourceName)    
  };// end validationMiddleware

  router.use(authorizationMiddleware(name)); // check if user if authorized
  router.use(validationMiddleware); // validate input + throw errors
};
