var way = null,
	open = false,
	loading = false

const fileSystem = require('fs'),
	{ promisify } = require('util'),
	express = require('express')

const fs = fileSystem
const asyncStat = promisify(fs.stat)

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
		const regexp = /\.\w{1,4}$/
		dirArray = dirArray.filter((elem)=>{
			return !regexp.test(elem) && elem[0]!=='.'
		})
		var responseObject = {}//objeto a retornar
		dirArray.forEach(function(value,index,array){
			responseObject[value] = ""
			try{
				var fileArray = fileSystem.readdirSync(readDir+'/'+value)
			}catch(e){
				// console.log('OOF')
			}
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

router.get('/song', async function(req, res) {
	if (req.query.artist===undefined||req.query.name===undefined||req.query.album===undefined) {
		res.writeHead(404,{'Content-Type':'audio/mpeg'})
		res.end()
		return
	}
	const artist = req.query.artist,
		album  = req.query.album,
		name   = req.query.name
	let path
	if (album==="singles") {
		path = way+'/'+artist+'/'+name+'.mp3'
	} else {
		path = way+'/'+artist+'/'+album+'/'+name+'.mp3'
	}
	const stat = await asyncStat(path)
	const fileSize = stat.size
	const range = req.headers.range
	if (range) {
		const parts = range.replace(/bytes=/, "").split("-")
		const start = parseInt(parts[0], 10)
		const end = parts[1] 
			? parseInt(parts[1], 10)
			: fileSize-1
		const chunksize = (end-start)+1
		const file = fs.createReadStream(path, {start, end})
		const head = {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunksize,
			'Content-Type': 'audio/mpeg',
		}
		res.writeHead(206, head);
		file.pipe(res);
	} else {
		const head = {
			'Content-Length': fileSize,
			'Content-Type': 'audio/mpeg',
		}
		res.writeHead(200, head)
		fs.createReadStream(path).pipe(res)
	}
});

module.exports = router