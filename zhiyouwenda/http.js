var express = require('express');


var bodyParser = require('body-parser');

var fs = require('fs');

var multer  = require('multer');

var cookieParser = require('cookie-parser');

var app = express();

app.use(express.static('www'));

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended:true}));

var storage = multer.diskStorage({
	
	destination:'www/uploads',
	
	filename:function(req,res,callback){
		var petname = req.cookies.petname
		callback('',petname + '.jpg');
		
		
	}
	
})


