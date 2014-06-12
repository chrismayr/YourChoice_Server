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

    if (curResource === resourceName) {
      if (method === 'POST') {
    	//check mandatory fields of POST when creating user
        if (body[modelName] == undefined ||
            body[modelName].username == undefined ||
            body[modelName].email == undefined ||
            body[modelName].password == undefined) {
          throw new BadRequest('You must specify username, email, password.');
        }else{
        	//if all mandatory fields exist:
        	// check if there is already a user with the same username or email
        	global.db.users.findOne({ $or: [{ username: body[modelName].username }, { email: body[modelName].email }] }, function (err, otherdoc) {
	        		if(otherdoc!=null) {
	        			//if all mandatory fields exist &&
	                	//if there is a user with the same username or email:
	        			// throw Forbidden
	                    next(new Forbidden('This username or mail address already exists. Please define another one.'));
	                }else{
	                	//if all mandatory fields exist &&
	                	//if there is no user with the same username or email:
	                	// go further and create user
	                	next();
	                }
	              });        	
        }
      } else if(method === 'PUT'){
    	//check mandatory fields of PUT when editing user
        if (body[modelName] == undefined ||
            body[modelName].username == undefined ||
            body[modelName].password == undefined ||
            body[modelName].email == undefined) {
            throw new BadRequest('You must specify username, mail and password.');
        } else {
        	//if all mandatory fields exist:
        	// check if there is already a user with the same username or email
        		var id = req.url.split('/')[2];
	        	global.db.users.findOne({ $or: [{ username: body[modelName].username }, { email: body[modelName].email }] }, function (err, otherdoc) {
   	        		if(otherdoc!=null && id != otherdoc._id) {
   	        			//if all mandatory fields exist &&
	                	//if there is a user with the same username or email AND it is not the doc that is currently updated:
	        			// throw Forbidden
   	                    next(new Forbidden('This username or mail address already exists. Please define another one.'));
   	                }else{
   	                	//if all mandatory fields exist &&
	                	//if there is no user with the same username or email:
	                	//check if it is really the user who wants to modify his user profile
   	                	global.db.users.findOne({ _id: id }, function (err, doc) {
   	                		if(doc!=null){
   	                			if (req.session.userId == undefined ||
   	                				req.session.userId != doc.username){
   	                				//if all mandatory fields exist &&
   	                				//if there is no user with the same username or email &&
   	                				//if the logged in user is not the user which should be modified:
   	                				// throw Forbidden
   	                				next(new Forbidden('You must be logged in as this user.'));
   	                			}else{
   	                				//if all mandatory fields exist &&
   	                				//if there is no user with the same username or email &&
   	                				//if the logged in user is the user which should be modified:
   	                				// go further and update user
   	                				next();  	          		        	        		        	 
   	                			}
   	                		}else{
	   	                		//if all mandatory fields exist &&
	   	 	                	//if there is no user with the same username or email &&
   	                			//if there is no doc in db with the id which should be update:
	   	 	                	//throw bad request
   	                			next(new BadRequest('No user with this id found.'));
   	                		}  			
   	                	});
   	                }
   	              }); 
        }
      } else if(method === 'DELETE'){
    	  //check if the logged in user is the user which should be deleted:
    	  var id = req.url.split('/')[2];
          global.db.users.findOne({ _id: id }, function (err, doc) {
      			if(doc!=null){
      				if (req.session.userId == undefined ||
      					req.session.userId != doc.username){
      					//if there is a user in db with the id which should be deleted &&
      					//if the logged in user is not the user which should be deleted:
    	                //throw forbidden
      					next(new Forbidden('You must be logged in as this user.'));
      		         }else{
      		        	//if there is a user in db with the id which should be deleted &&
       					//if the logged in user is the user which should be deleted:
     	                // go further and delete user
      		        	next();
      		         }
      			}else{
      				//if there is no user in db with the id which should be deleted:
	                //throw bad request
      				next(new BadRequest('There is no user with this id.'));
      			}  			
      		});
      }else{
    	  next();
      }
    }else{
    	next();
    }// end if (curResource === resourceName)
  };

  router.use(authorizationMiddleware(name)); // check if user if authorized
  router.use(validationMiddleware); // validate input + throw errors
};
