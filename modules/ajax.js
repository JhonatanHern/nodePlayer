var way = "/home/main/Music";

var fileSystem = require('fs'),
	express = require('express');

var router = express.Router();

router.use(function(req, res, next){next();});

router.get('/artists',function(req,res){
	fileSystem.readdir(way,function(err,fileArray){
		fileArray.forEach(function(elem,index,array){
			array[index]=elem.split(" ").join("__");
		});
		res.send(JSON.stringify({
			artists:fileArray.filter(function(inp){
				return inp.indexOf(".")===-1;
			})
		}));
	});
});
router.get('/albums',function(req,res){
	var art = req.query.art.split('__').join(" ").split("'").join("\'"),
		readDir = way+"/"+art;

	fileSystem.readdir(readDir,function(err,dirArray){
		if(err){
			console.log("error reading "+readDir);
			res.send("{}");
			return;
		}
		singlesArray = dirArray.filter(function(elem){
			return elem.indexOf('.mp3')!==-1;//get the singles in the folder
		});
		dirArray = dirArray.filter(function(elem){
			return elem.indexOf('.')===-1;//para dejar solo a las carpetas
		});
		var responseObject = {};//objeto a retornar
		dirArray.forEach(function(value,index,array){
			responseObject[value] = "";
			var fileArray = fileSystem.readdirSync(readDir+'/'+value);
			if(fileArray===null){console.log("error on "+readDir+'/'+value);return;}
			var array = fileArray.filter(function(elem){
				return elem.indexOf('.mp3')!==-1;
			});
			responseObject[value] = array;//the values are asigned
		});
		if(singlesArray.length>0){
			responseObject["singles"] = singlesArray;
		}
		res.send(JSON.stringify(responseObject));
	});
});
router.get('/song', function (req, res) {
	if (req.query.artist===undefined||req.query.name===undefined||req.query.album===undefined) {
		res.writeHead(404,{'Content-Type':'audio/mpeg'});
		res.end();
		return;
	}
	console.log(req.query.artist);
	console.log(req.query.name);
	console.log(req.query.album);
	var artist = req.query.artist.split("__").join(" ").split("CODEAND").join("&");
	var name = req.query.name.split("__").join(" ").split("CODEAND").join("&");
	var album = req.query.album.split("__").join(" ");
	var filePath;
	if (album==="singles") {
		filePath = way+'/'+artist+'/'+name+'.mp3';
	} else {
		filePath = way+'/'+artist+'/'+album+'/'+name+'.mp3';
	}
	var stat = fileSystem.statSync(filePath);
	res.writeHead(200,{
						'Content-Type': 'audio/mpeg',
						'Content-Length': stat.size
					});
	var readStream = fileSystem.createReadStream(filePath);
	readStream.pipe(res);
});

module.exports = router;