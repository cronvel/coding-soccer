
var game = {
	debugOn: true ,
	params: {}
} ;

document.addEventListener('DOMContentLoaded' , function() {
	
	game.renderer = Renderer.create( game , {
		pixelRatio: 30
	} ) ;
	
	game.playback = Playback.create( game ) ;
	
	game.client = Client.create( game ) ;
} ) ;


