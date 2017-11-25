'use strict';

$(document).ready(function(){
	var center = $('#list'),
		search = $('#search'),
		img = document.getElementById('artImg'),
		trackSource = document.getElementById('trackReproducer'),
		audio = document.getElementById('audio'),
		currentArtist,
		artistsList,
		currentSong,
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
			let songs = []
			for(var album in result){
				var albumArticle = $('<article>');
				albumArticle.append("<h3>"+album+"</h3>");
				result[album].forEach(function(element,index,array){
					albumArticle.append("<div id='"+album+"'' class='song' >"+element.replace(".mp3","")+"</div>");
					songs.push({song:element,album:album})
				});
				center.append(albumArticle);
				currentArtist = id;
			}
			updateSongListener();
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
			console.log("waiting");
			$.get("ajax/artists",artistLoadHandler);
			return;
		}
		if (!result.artists) {
			location.reload();
		}
		result.artists.forEach(function(value,index,array) {
			var art = value;
			var div = $("<div id=\""+value+"\">"+art+"</div>");
			div.addClass('artistTrigger');
			search.append(div);
		});
		$('.artistTrigger').click(function(){
			artistClick(this.id);
		});
	}
	console.log("get");
	$.get("ajax/artists",artistLoadHandler);
	$('#randomizer').click(function(){
		this.classList.toggle('active')
		if (this.className === 'active') {
			audio.onended = function(argument) {
				artistClick(
					artistsList[ Math.floor( artistsList.length * Math.random() ) ],
					function (songs) {
						let song = songs[ Math.floor( songs.length * Math.random() ) ]

						header.innerHTML = "<span style='font-weight:bolder'>"+song.song+"</span> - "+currentArtist;
						var songName = encodeURIComponent(song.song);
						trackSource.src = "ajax/song?name="+songName.substr(0,songName.length-4)+"&artist="+currentArtist+"&album="+encodeURIComponent(song.album)
						audio.load();
						audio.play();
					})
			}
		} else {
			audio.onended = null
 		}
	})
});