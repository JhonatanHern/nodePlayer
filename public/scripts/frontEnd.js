'use strict';
var center = $('#list'),
	search = $('#search'),
	img = document.getElementById('artImg'),
	trackSource = document.getElementById('trackReproducer'),
	audio = document.getElementById('audio'),
	currentArtist,
	artistsList,
	currentSong,
	currentSongList = [] ,
	header = document.querySelector('header');
var updateSongListener = function(){
	$('.song').click(function(){
		header.innerHTML = "<span style='font-weight:bolder'>"+this.innerHTML+"</span> - "+currentArtist.split("__").join(" ");
		var songName = encodeURIComponent(this.innerHTML);
		trackSource.src = "ajax/song?name="+songName+"&artist="+currentArtist+"&album="+encodeURIComponent(this.id);
		audio.load();
		audio.play();
	});
}
var artistClick = function(id,callback){
	$.getJSON("ajax/albums?art="+id,function(result){
		center.empty();
		var songs = []
		for(var album in result){
			var albumArticle = $('<article>');
			albumArticle.append("<h3>"+album+"</h3>");
			result[album].forEach(function(element,index,array){
				albumArticle.append("<div id=\""+album+"\" class='song' >"+element.replace(".mp3","")+"</div>");
				songs.push({song:element,album:album})
			});
			center.append(albumArticle);
			currentArtist = id;
		}
		updateSongListener()
		currentSongList = songs
		if (callback) {
			callback(songs)
		}
	});
};
var artistLoadHandler = function(result){
	result = JSON.parse(result);
	artistsList = result.artists
	if (JSON.stringify(result)==="{}") {
		console.log("error");
		return;
	}
	if(result.wait){
		console.log("waiting")
		$.get("ajax/artists",artistLoadHandler)
		return
	}
	if (!result.artists) {
		location.reload()
	}
	result.artists.sort(function(a,b){
		return a.toLowerCase() > b.toLowerCase()
	})
	result.artists.forEach(function(value,index,array) {
		var art = value
		var div = $("<div id=\""+value+"\">"+art+"</div>")
		div.addClass('artistTrigger')
		search.append(div)
	})
	$('.artistTrigger').click(function(){
		artistClick(this.id)
	})
}
$.get("ajax/artists",artistLoadHandler);
$('#randomizer').click(function(){
	this.classList.toggle('active')
	if (this.className === 'active') {
		$('#random-inside-artist').css('display','block')
		audio.onended = function(argument) {
			if($('#random-inside-artist')[0].classList.contains('active')){
				artistClick(
					artistsList[ Math.floor( artistsList.length * Math.random() ) ],
					function (songs) {
						var song = songs[ Math.floor( songs.length * Math.random() ) ]
						header.innerHTML = "<span style='font-weight:bolder'>"+song.song+"</span> - "+currentArtist
						var songName = encodeURIComponent(song.song)
						trackSource.src = "ajax/song?name="+songName.substr(0,songName.length-4)+"&artist="+currentArtist+"&album="+encodeURIComponent(song.album)
						audio.load()
						audio.play()
					})
			}else{
				var song = currentSongList[ Math.floor( currentSongList.length * Math.random() ) ]
				header.innerHTML = "<span style='font-weight:bolder'>"+song.song+"</span> - "+currentArtist
				var songName = encodeURIComponent(song.song)
				trackSource.src = "ajax/song?name="+songName.substr(0,songName.length-4)+"&artist="+currentArtist+"&album="+encodeURIComponent(song.album)
				audio.load()
				audio.play()
			}
		}
	} else {
		$('#random-inside-artist').css('display','none')
		audio.onended = null
 		}
})
$('#random-inside-artist').click(function(argument) {
	this.classList.toggle('active')
})
$('#menu').click(function() {
	$('#buttons')[0].classList.toggle('open')
})
$('#alarm').click(function() {
	var hours = Number(prompt('How many hours do you want before playing the song?'))
	setTimeout(function() {
		var audio = $('audio')[0]
		audio.play()
		audio.volume = 1
	} , hours * 1000 * 60 * 60)
})
