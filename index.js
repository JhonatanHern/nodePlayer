var way = null,
	appRoute = process.cwd()+"/",
	port=80;

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
	if(open){
		res.send('<!DOCTYPE html><html><head><title>nodePlayer | JhonatanHern</title><link rel="stylesheet" type="text/css" href="css/reproducer.css"><meta charset="utf-8"></head><body><header>Pick a song</header><main><section id = "search"><input type="text" id="searchBox"></section><section id = "list">Pick an artist</section><!--section id = "artist"><img id="artImg"><article id="description">Artist description</article></section--></main><footer><audio controls id="audio"><source id="trackReproducer" type="audio/mp3"></audio></footer><script type="text/javascript" src="scripts/jquery.js"></script><script type="text/javascript" src="scripts/frontEnd.js"></script></body></html>');
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

app.listen(port,function(){
	console.log("server active");
});