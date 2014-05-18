var express = require('express');
var router = express.Router();

/* GET user list*/

router.get('/users',function(req, res){
	var db = req.db;
	db.collection('users').find().toArray(function(err,items){
		res.json(items)
	});
});

router.delete('id', function(req,res){
	var db = req.db;
	var userTodelete = req.parms.id;
	db.collection('users').removeById(userTodelete,function(err,result){
		res.send((result === 1) ? {msg:''} : {msg:'error' + err});
	});
});

module.exports = router;