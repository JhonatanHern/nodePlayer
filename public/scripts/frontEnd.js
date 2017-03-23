'use strict';

$(document).ready(function(){
	var center = $('#list'),
		search = $('#search'),
		img = document.getElementById('artImg'),
		trackSource = document.getElementById('trackReproducer'),
		audio = document.getElementById('audio'),
		currentArtist;

	var updateSongListener = function(){
		$('.song').click(function(){
			var songName = this.innerHTML.split(" ").join("__").split("&amp;").join("CODEAND");
			trackSource.src = "ajax/song?name="+songName+"&artist="+currentArtist+"&album="+this.id.split(" ").join("__");
			audio.load();
			audio.play();
		});
	}
	var artistClick = function(id){
		$.getJSON("ajax/albums?art="+id,function(result){
			center.empty();
			for(var album in result){
				var albumArticle = $('<article>');
				albumArticle.append("<h3>"+album+"</h3>");
				result[album].forEach(function(element,index,array){
					albumArticle.append("<div id='"+album+"'' class='song' >"+element.replace(".mp3","")+"</div>");
				});
				center.append(albumArticle);
				currentArtist = id;
			}
			updateSongListener();
		});
	};
	var artistLoadHandler = function(result){
		if (JSON.stringify(result)==="{}") {
			alert("error");
			return;
		}
		result.artists.forEach(function(value,index,array) {
			var art = value.split("__").join(" ");
			var div = $("<div id=\""+value+"\">"+art+"</div>");
			div.addClass('artistTrigger');
			search.append(div);
		});
		$('.artistTrigger').click(function(){
			artistClick(this.id);
		});
	}
	$.getJSON("ajax/artists",artistLoadHandler);
});