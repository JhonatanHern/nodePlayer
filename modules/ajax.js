var way = null,
	open = false,
	loading = false

var fileSystem = require('fs'),
	express = require('express')


var loader = function(){
	fileSystem.readFile("./config/config.npl",function(err,info){
		if (err) {
			console.log("The configuration is not enabled")
			return
		}
		way = String(info)
		open = true
	})
}
loader()
var router = express.Router()

router.use(function(req, res, next){next()})

router.get('/artists',function(req,res){
	if (!open) {
		console.log("not open")
		if(!loading){
			loader()
		}
		loading=true
		res.send('{"wait":true}')
		return
	}
	loading=false
	fileSystem.readdir(way,function(err,fileArray){
		if (err) {
			console.log("fatal error at artists")
			return
		}
		res.send(JSON.stringify({
			artists:fileArray.filter(function(inp){
				return inp.indexOf(".")===-1
			})
		}))
	})
})
router.get('/albums',function(req,res){
	var art = req.query.art,
		readDir = way+"/"+art

	fileSystem.readdir(readDir,function(err,dirArray){
		if(err){
			console.log("error reading "+readDir)
			res.send("[]")
			return
		}
		singlesArray = dirArray.filter(function(elem){
			return /\.mp3$/.test(elem)//get the singles in the folder
		})
		const regexp = /\.\w{2,4}$/
		dirArray = dirArray.filter((elem)=>{
			return !regexp.test(elem) && elem[0]!=='.'
		})
		var responseObject = {}//objeto a retornar
		dirArray.forEach(function(value,index,array){
			responseObject[value] = ""
			var fileArray = fileSystem.readdirSync(readDir+'/'+value)
			if(fileArray===null){
				console.log("error on "+readDir+'/'+value)
				return
			}
			var array = fileArray.filter(function(elem){
				return /\.mp3$/.test(elem)
			})
			responseObject[value] = array//the values are asigned
		})
		if(singlesArray.length>0){
			responseObject["singles"] = singlesArray
		}
		res.send(JSON.stringify(responseObject))
	})
})
router.get('/song', function (req, res) {
	if (req.query.artist===undefined||req.query.name===undefined||req.query.album===undefined) {
		res.writeHead(404,{'Content-Type':'audio/mpeg'})
		res.end()
		return
	}
	var artist = req.query.artist
	var album  = req.query.album
	var name   = req.query.name.indexOf('&amp;')===-1?req.query.name:req.query.name.split('&amp;').join('&')
	var filePath
	if (album==="singles") {
		filePath = way+'/'+artist+'/'+name+'.mp3'
	} else {
		filePath = way+'/'+artist+'/'+album+'/'+name+'.mp3'
	}
	var stat = fileSystem.statSync(filePath)
	res.writeHead(200,{
						'Content-Type': 'audio/mpeg',
						'Content-Length': stat.size
					})
	var readStream = fileSystem.createReadStream(filePath)
	readStream.pipe(res)
})

module.exports = router