var renderer = function() {
	throw 'blurp!' ;
} ;

renderer.create = function() {
	var $container = document.querySelector('main') ;

	var self = Object.create( renderer.prototype , {
		$container: { value: $container } ,
		clientWidth: { value: $container.clientWidth , writable: true } ,
		clientHeight: { value: $container.clientHeight , writable: true } ,

		$field: { value: document.querySelector('.field') } ,
		fieldWidth: { value: 3000 , writable: true } ,
		fieldHeight: { value: 2000 , writable: true } ,

		frames: { value: [] } ,
		playState: { value: 'pause' , writable: true } ,
		playPosition: { value: 0 , writable: true } ,

		ball: { value: ball.create() } ,
		teams: { value: [] } ,
	} ) ;

	self.addFrame( {
		ball: {
			x: 0,
			y: 0,
			z: 0,
		} ,
		teams: [
			{
				players: [ { x:0 , y:0 , z:0 } ] ,
			}
		]
	} ) ;

	self.teams.push(
		team.create( {
			color: 'blue'
		} ) ,
		team.create( {
			color: 'red'
		} )
	) ;


	self.play() ;
} ;

renderer.prototype.addFrame = function( data ) {
	this.frames.push( data ) ;
	if ( this.playState === 'waiting' ) {
		this.play() ;
	}
} ;

renderer.prototype.pause = function() {
	this.playState = 'pause' ;
} ;
renderer.prototype.play = function() {
	this.playState = 'play' ;
	this.draw() ;
} ;
renderer.prototype.goto = function( position ) {
	this.playPosition = position ;
} ;


renderer.prototype.draw = function() {
	var self = this ,
		state = this.frames[ this.playPosition ] ;


	/**********/
	/* CAMERA */
	/**********/

	var camera = {} ;
	camera.x = Math.min( state.ball.x - this.clientWidth / 2 , this.fieldWidth - this.clientWidth ) ;
	camera.y = Math.min( state.ball.y - this.clientHeight / 2 , this.fieldHeight - this.clientHeight ) ;

	if ( camera.x < 0 ) {
		camera.x = 0 ;
	}

	if ( camera.y < 0 ) {
		camera.y = 0 ;
	}


	var transforms = [] ;
	// var scale = Math.max( 1 , Math.random() * 1.5 ) ;
	// transforms.push( `scale( ${scale} , ${scale} )` ) ;
	transforms.push( `translate( ${-camera.x}px , ${-camera.y}px )` ) ;
	this.$field.style.transform = transforms.join(' ') ;

	// window.scrollTo( `${camera.x}` , `${camera.y}` );



	/***********/
	/* PLAYERS */
	/***********/

	for ( var i = 0 ; i < state.teams.length ; i++ ) {
		for ( var j = 0 ; j < state.teams[ i ].length ; i++ ) {
			this.teams[ i ][ j ].draw( state.teams[ i ][ j ] ) ;
		}
	}


	/********/
	/* BALL */
	/********/

	this.ball.draw( state.ball ) ;


	if ( this.frames[ this.playPosition + 1 ] ) {
		this.playPosition++ ;
	}
	else {
		console.log( 'waiting for frame' ) ;
		this.playState = 'waiting' ;
	}

	if ( this.playState === 'play' ) {
		window.requestAnimationFrame( self.draw.bind( self ) ) ;
	}
} ;


function team() { throw 'NOOOOO' ; }

team.create = function( options ) {
	var self = Object.create( team.prototype , {
		players: { value: {} , writable: true } ,

		$: { value: document.createElement('div') }
	} ) ;

	self.$.classList.add('team') ;
	self.$.setAttribute( 'data-team' , options.color ) ;

	for( var i = 1 ; i < 12 ; i++ ) {
		self.players[ i ] = player.create( self , i ) ;
	}

	var field = document.querySelector('.field') ;
	field.append( self.$ ) ;

	return self ;
} ;
team.prototype.noop = function() {} ;


function player() {	throw 'NOOOO' ; }

player.create = function( team , number ) {
	var self = Object.create( player.prototype , {
		x: { value:500 , writable: true , enumerable: true } ,
		y: { value:500 , writable: true , enumerable: true } ,
		z: { value:0 , writable: true , enumerable: true } ,
		angle: { value:0 , writable: true , enumerable: true } ,

		$: { value: document.createElement('div') } ,
		$shadow: { value: document.createElement('div') } ,
		$player: { value: document.createElement('div') }
	} ) ;

	self.$.classList.add('playerContainer') ;
	self.$player.classList.add('player') ;
	self.$shadow.classList.add('shadow') ;

	self.$.append( self.$player ) ;
	self.$.append( self.$shadow ) ;

	self.$.setAttribute('data-number' , number ) ;

	team.$.append( self.$ ) ;

	return self ;
} ;

player.prototype.draw = function( position ) {
	this.$.style.transform = `translate( ${position.x}px , ${position.y}px )` ;
	this.$player.style.transform = `translateY( -${position.z}px ) rotate( ${position.angle}deg )` ;
} ;


function ball() { throw 'NOOOOO' ; }

ball.create = function() {
	var self = Object.create( ball.prototype , {
		x: { value:500 , writable: true , enumerable: true } ,
		y: { value:500 , writable: true , enumerable: true } ,
		z: { value:0 , writable: true , enumerable: true } ,
		angle: { value:0 , writable: true , enumerable: true } ,

		$: { value: document.createElement('div') } ,
		$shadow: { value: document.createElement('div') } ,
		$ball: { value: document.createElement('div') }
	} ) ;

	self.$.classList.add('ballContainer') ;
	self.$ball.classList.add('ball') ;
	self.$shadow.classList.add('shadow') ;

	self.$.append( self.$ball ) ;
	self.$.append( self.$shadow ) ;

	var field = document.querySelector('.field') ;
	field.append( self.$ ) ;

	return self ;
} ;

ball.prototype.draw = function( position ) {
	this.$.style.transform = `translate( ${position.x}px , ${position.y}px )` ;

	this.$ball.style.backgroundPosition = `${position.x}px ${position.y}px` ;
	this.$ball.style.transform = `translateY( -${position.z}px )` ;
} ;
