
var game = {
	debugOn: true
} ;

document.addEventListener('DOMContentLoaded' , function() {
	
	game.renderer = Renderer.create( {
		fieldWidth:100,
		fieldHeight:60,
		pixelRatio:30
	} ) ;
	
	Client.create() ;
} ) ;
