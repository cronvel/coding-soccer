var game = {
	debugOn: true
} ;

document.addEventListener('DOMContentLoaded' , function() {
	game.renderer = renderer.create( {
		fieldWidth:100,
		fieldHeight:60,
		pixelRatio:30
	} ) ;
	client.create() ;

	var render = game.renderer ;
	render.$container.addEventListener( 'mousemove' , function( event ) {
		var x = ( ( event.clientX + render.camera.x ) / render.pixelRatio ) - render.fieldWidth / 2 ,
			y = ( ( event.clientY + render.camera.y ) / render.pixelRatio ) - render.fieldHeight / 2 ;

		debug( `x: ${x} y: ${y} /// ${render.camera.x / render.pixelRatio}` , 'camera' ) ;
	} ) ;

	render.$container.addEventListener( 'click' , function( event ) {
		game.renderer.addFrame( {
			ball: {
				x: ( ( event.clientX + render.camera.x ) / render.pixelRatio ) - render.fieldWidth / 2 ,
				y: ( ( event.clientY + render.camera.y ) / render.pixelRatio ) - render.fieldHeight / 2 ,
				z: 0
			}
		} ) ;
	} ) ;
} ) ;
