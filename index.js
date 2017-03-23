var way = "/home/main/Music",
	appRoute = process.cwd()+"/";
	
var express = require("express"),
	body_parser = require("body-parser"),
	fs = require("fs"),
	ajax = require('./modules/ajax');

var app = express();

app.use(express.static('./public'));
app.use('/ajax', ajax);
app.use(body_parser.urlencoded({extended:true}));

app.get("/",function(req,res){
	res.sendFile(appRoute+"public/app.html");//index page
});

app.listen(80,function(){
	console.log("server active");
});