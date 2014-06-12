var authorizationMiddleware = require('../utils/authorization-middleware'),
    errors = require('../utils/errors'),
    Unauthorized = errors.unauthorized,
    NotFound = errors.notfound,
    BadRequest = errors.badrequest,
    Forbidden= errors.forbidden;

module.exports = function(name, router) {
  var modelName = name.model,
      resourceName = name.resource;

  var validationMiddleware = function(req, res, next) {
    var body = req.body,
        method = req.method,
        curResource = req.url.split('/')[1];

    if (curResource === resourceName) 
    {
      if (method === 'POST') 
      {
    	//check mandatory fields of POST when creating answeredQuiz
        if (body[modelName] == undefined ||
            body[modelName].owner == undefined )
            {
                throw new BadRequest('You must specify owner');
            }else{
            	//if all mandatory fields exist:
            	//check if correct owner will be stored
            	if (req.session.userId != body[modelName].owner){
            		throw new Forbidden('You must be the owner if you want to save this answeredQuiz.');
            	}else{
            		//if all mandatory fields exist &&
                	//if correct owner will be stored:
            		// go further and create answeredQuiz
            		next();
            	}
            }
      }else if(method === 'PUT')
          {
    	  //check mandatory fields of PUT when editing answeredQuiz
    	  if (body[modelName] == undefined ||
              body[modelName].owner == undefined )  {
                        throw new BadRequest('You must specify owner.');
           }else {
        	   //if all mandatory fields exist:
        	   //check if the current user is the owner of the answeredQuiz
			   var id = req.url.split('/')[2];
		       global.db.answeredQuizzes.findOne({ _id: id }, function (err, doc) {
		  			if(doc!=null){
		  				if (req.session.userId == undefined ||
		  					req.session.userId != doc.owner ||
		  					req.session.userId != body[modelName].owner){
			  					//if all mandatory fields exist &&
	           					//if the logged in user is not the owner of the answeredQuiz which should be modified:
	           					// throw Forbidden
		  						next(new Forbidden('You must be the owner if you want to modify this answeredQuiz.'));
		  		         }else{
                			//if all mandatory fields exist &&
		  		        	//if the logged in user is the owner of the answeredQuiz which should be modified:
                			// go further and update answeredQuiz
                			next();  	          		        	        		        	 
                		}
		  			}else{
		  				//if all mandatory fields exist &&
               			//if there is no doc in db with the id which should be update:
	 	                //throw bad request
		  				next(new BadRequest('No answeredQuiz with this id found.'));
		  			}  			
		  		});
           }   
          }else if(method === 'DELETE'){
        	//check if the logged in user is the owner of the answeredQuiz which should be deleted:
         	  var id = req.url.split('/')[2];
              global.db.answeredQuizzes.findOne({ _id: id }, function (err, doc) {
           			if(doc!=null){
           				if (req.session.userId == undefined ||
           					req.session.userId != doc.owner){
           					//if there is a answeredQuiz in db with the id which should be deleted &&
           					//if the logged in user is not the owner of the answeredQuiz which should be deleted:
           					//throw forbidden
           					next(new Forbidden('You must be the owner of the answeredQuiz.'));
           		         }else{
           		        	//if there is a answeredQuiz in db with the id which should be deleted &&
            				//if the logged in user is the owner of the answeredQuiz which should be deleted:
          	                // go further and delete answeredQuiz
           		        	next();
           		         }
           			}else{
           				//if there is no answeredQuiz in db with the id which should be deleted:
           				//throw bad request
           				next(new BadRequest('There is no answeredQuiz with this id.'));
           			}  			
           		}); 
        }else{
     	  	next();
        }// end methods  
     
    } else{
   	  	next();
    }// end if (curResource === resourceName) 

  };// end validationMiddleware

  router.use(authorizationMiddleware(name)); // check if user if authorized
  router.use(validationMiddleware); // validate input + throw errors
}
