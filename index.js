var way = null;

const PORT = 8080;

var express = require("express"),
	body_parser = require("body-parser"),
	fs = require("fs"),
	ajax = require('./modules/ajax');

var app = express();

app.use(express.static('./public'));
app.use('/ajax', ajax);
app.use(body_parser.urlencoded({extended:true}));

var open = false;

fs.readFile("./config/config.npl",function(err,info){
	if (err) {
		console.log("The configuration is not enabled");
		return;
	}
	way = String(info);
	open = true;
});

app.get("/",function(req,res){
	if(open) {
		res.sendFile( __dirname + '/public/app.html');
		return;
	}
	res.send('<!DOCTYPE html><html><head><title>nodePlayer | JhonatanHern</title><link rel="stylesheet" type="text/css" href="css/form.css"></head><body><form method="POST">Please, insert the directory<br><br><input type="text" name="directory" required><br><br><input type="submit"></form></body></html>');
});

app.post("/",function(req,res){
	console.log('posted');
	way = req.body.directory;
	fs.readdir(way,function(err,info){
		if (err) {
			res.send("error en el directorio");
			return;
		}
		open = true;
		fs.writeFile("./config/config.npl",way);
		res.redirect("/");
	});
});

app.listen(PORT,function(){
	console.log("server active");
});
