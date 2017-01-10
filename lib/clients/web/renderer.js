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
		fieldWidth: { value: 100 , writable: true } ,
		fieldHeight: { value: 60 , writable: true } ,
		pixelRatio: { value: 20 } ,

		frames: { value: [] } ,
		playState: { value: 'pause' , writable: true } ,
		playPosition: { value: 0 , writable: true } ,

		ball: { value: ball.create() } ,
		teams: { value: [] } ,

	} ) ;

	self.$field.style.width = self.fieldWidth * self.pixelRatio + 'px' ;
	self.$field.style.height = self.fieldHeight * self.pixelRatio + 'px' ;
	// $field.style.backgroundSize = fieldHeight * 20 ;

	self.teams.push(
		team.create( {
			color: 'blue'
		} ) ,
		team.create( {
			color: 'red'
		} )
	) ;

	self.play() ;

	return self ;
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

renderer.prototype.createBall = function() {} ;
renderer.prototype.createField = function() {} ;
renderer.prototype.createPlayer = function() {} ;
renderer.prototype.createTeam = function() {} ;



renderer.prototype.coordRatioKane = function() {} ;


renderer.prototype.draw = function() {
	var self = this ,
		state = this.frames[ this.playPosition ] ;

	if ( ! state ) {
		console.log( 'waiting for frame' ) ;
		this.playState = 'waiting' ;
		return ;
	}

	/********/
	/* BALL */
	/********/
	console.log( state.ball.x + ' / ' + state.ball.y ) ;
	// use coordRatioKane
	var ball = {
		x: ( state.ball.x * this.pixelRatio ) + ( ( this.fieldWidth * this.pixelRatio ) / 2 ) ,
		y: ( state.ball.y * this.pixelRatio ) + ( ( this.fieldHeight * this.pixelRatio ) / 2 ) ,
		z: state.ball.z * this.pixelRatio
	} ;

	this.ball.draw( ball ) ;


	/**********/
	/* CAMERA */
	/**********/

	var camera = {} ;
	camera.x = Math.min( ball.x - this.clientWidth / 2 , ( this.fieldWidth * this.pixelRatio ) - this.clientWidth ) ;
	camera.y = Math.min( ball.y - this.clientHeight / 2 , ( this.fieldHeight * this.pixelRatio ) - this.clientHeight ) ;

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
		for ( var j = 0 ; j < state.teams[ i ].length ; j++ ) {
			this.teams[ i ].players[ j ].draw( state.teams[ i ][ j ] ) ;
		}
	}


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
		players: { value: [] , writable: true } ,

		$: { value: document.createElement('div') }
	} ) ;

	self.$.classList.add('team') ;
	self.$.setAttribute( 'data-team' , options.color ) ;

	for( var i = 0 ; i < 11 ; i++ ) {
		self.players.push( player.create( self , i+1 ) ) ;
	}

	var field = document.querySelector('.field') ;
	field.append( self.$ ) ;

	return self ;
} ;
team.prototype.noop = function() {} ;


function player() {	throw 'NOOOO' ; }

player.create = function( team , number ) {
	var self = Object.create( player.prototype , {
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
