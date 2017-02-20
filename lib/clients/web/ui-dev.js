document.addEventListener('DOMContentLoaded' , function() {
	var render = game.renderer ;

	document.querySelector('.smileys').addEventListener('click' , function( event ) {
		if ( event.target.nodeName === 'SPAN' ) {
			render.ball.$ball.setAttribute('data-balloon' , event.target.textContent ) ;
		}
	} ) ;

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
