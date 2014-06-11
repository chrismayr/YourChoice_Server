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
    	//check mandatory fields of POST when creating answeredQuestion
        if (body[modelName] == undefined ||
            body[modelName].owner == undefined ||
            body[modelName].question == undefined)
            {
                throw new BadRequest('You must specify owner and question.');
            }else{
            	//if all mandatory fields exist:
            	//check if correct owner will be stored
            	if (req.session.username != body[modelName].owner){
            		throw new Forbidden('You must be the owner if you want to save this answeredQuestion.');
            	}else{
            		//if all mandatory fields exist &&
                	//if correct owner will be stored:
            		// go further and create answeredQuestion
            		next();
            	}
            }
      }else if(method === 'PUT')
          {
    	  //check mandatory fields of PUT when editing answeredQuestion
    	  if (body[modelName] == undefined ||
              body[modelName].owner == undefined ||
              body[modelName].question == undefined)  {
                        throw new BadRequest('You must specify owner and question.');
           }else {
        	   //if all mandatory fields exist:
        	   //check if the current user is the owner of the answeredQuestion
			   var id = req.url.split('/')[2];
		       global.db.answeredQuestions.findOne({ _id: id }, function (err, doc) {
		  			if(doc!=null){
		  				if (req.session.username == undefined ||
		  					req.session.username != doc.owner ||
		  					req.session.username != body[modelName].owner){
			  					//if all mandatory fields exist &&
	           					//if the logged in user is not the owner of the answeredQuestion which should be modified:
	           					// throw Forbidden
		  						next(new Forbidden('You must be the owner if you want to modify this answeredQuestion.'));
		  		         }else{
                			//if all mandatory fields exist &&
		  		        	//if the logged in user is the owner of the answeredQuestion which should be modified:
                			// go further and update answeredQuestion
                			next();  	          		        	        		        	 
                		}
		  			}else{
		  				//if all mandatory fields exist &&
               			//if there is no doc in db with the id which should be update:
	 	                //throw bad request
		  				next(new BadRequest('No answeredQuestion with this id found.'));
		  			}  			
		  		});
           }   
          }else if(method === 'DELETE'){
        	//check if the logged in user is the owner of the answeredQuestion which should be deleted:
         	  var id = req.url.split('/')[2];
              global.db.answeredQuestions.findOne({ _id: id }, function (err, doc) {
           			if(doc!=null){
           				if (req.session.username == undefined ||
           					req.session.username != doc.owner){
           					//if there is a answeredQuestion in db with the id which should be deleted &&
           					//if the logged in user is not the owner of the answeredQuestion which should be deleted:
           					//throw forbidden
           					next(new Forbidden('You must be the owner of the answeredQuestion.'));
           		         }else{
           		        	//if there is a answeredQuestion in db with the id which should be deleted &&
            				//if the logged in user is the owner of the answeredQuestion which should be deleted:
          	                // go further and delete answeredQuestion
           		        	next();
           		         }
           			}else{
           				//if there is no answeredQuestion in db with the id which should be deleted:
           				//throw bad request
           				next(new BadRequest('There is no answeredQuestion with this id.'));
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
