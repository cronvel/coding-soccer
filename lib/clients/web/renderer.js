var renderer = function() {
	throw 'blurp!' ;
} ;

renderer.create = function( data ) {
	var $container = document.querySelector('main') ;

	if ( ! data ) {
		data = {
			fieldWidth:100,
			fieldHeight:60,
			pixelRatio:30
		} ;
	}

	var self = Object.create( renderer.prototype , {
		$container: { value: $container } ,
		clientWidth: { value: $container.clientWidth , writable: true } ,
		clientHeight: { value: $container.clientHeight , writable: true } ,

		fieldWidth: { value: data.fieldWidth } ,
		fieldHeight: { value: data.fieldHeight } ,
		pixelRatio: { value: data.pixelRatio } ,

		$field: { value: document.querySelector('.field') } ,
		$fieldWidth: { value: data.fieldWidth * data.pixelRatio } ,
		$fieldHeight: { value: data.fieldHeight * data.pixelRatio } ,

		frames: { value: [] } ,
		playState: { value: 'pause' , writable: true } ,
		playPosition: { value: 0 , writable: true } ,

		camera: { value: { x:0 , y:0 , z:0 } } ,
		// cameraMoveType: { value: 'scroll' } ,
		cameraMoveType: { value: 'transform' } ,
		ball: { value: ball.create() } ,
		teams: { value: [] } ,

		$progress: { value: document.querySelector('.progress') } ,
		$progressBar: { value: document.querySelector('.progressBar') } ,
		$playState: { value: document.querySelector('.playState') } ,
	} ) ;

	self.teams.push(
		team.create( {
			color: 'blue'
		} ) ,
		team.create( {
			color: 'red'
		} )
	) ;

	self.init() ;

	return self ;
} ;


renderer.prototype.init = function() {
	var self = this ;

	if ( this.cameraMoveType === 'scroll' ) {
		document.querySelector('main').style.overflow = 'visible' ;
	}
	else {
		document.querySelector('main').style.overflow = 'hidden' ;
	}

	this.$field.style.width = this.$fieldWidth + 'px' ;
	this.$field.style.height = this.$fieldHeight + 'px' ;
	this.$field.style.backgroundSize = `${this.$field.style.width} ${this.$field.style.height} , 500px` ;

    window.addEventListener( 'resize' , function() {
		this.clientWidth = self.$container.clientWidth ;
		this.clientHeight = self.$container.clientHeight ;
	} ) ;

	this.player() ;
	this.play() ;
} ;


renderer.prototype.player = function() {
	var self = this ;

	this.$playState.addEventListener( 'click' , function() {
		if ( this.getAttribute('data-state') === 'play' ) {
			this.setAttribute('data-state' , 'pause' ) ;
			self.pause() ;
		}
		else {
			this.setAttribute('data-state' , 'play' ) ;
			self.play() ;
		}
	} ) ;

	this.$progressBar.addEventListener( 'click' , function( event ) {
		var goto = Math.round( self.frames.length / ( self.clientWidth / event.clientX ) ) ;
		self.goto( goto ) ;
	} ) ;
} ;

renderer.prototype.addFrame = function( data ) {
	debug.since('PacketRate') ;

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
	var state = this.frames[ this.playPosition ] , statePlayer ;

	if ( ! state ) {
		console.log( `waiting for frame: ${this.playPosition}` ) ;
		this.playState = 'waiting' ;
		return ;
	}

	this.$progressBar.style.width = ( this.playPosition / this.frames.length ) * 100 + '%' ;

	/********/
	/* BALL */
	/********/

	var ball = {
		x: Math.round( ( state.ball.x * this.pixelRatio ) + ( this.$fieldWidth / 2 ) ) ,
		y: Math.round( ( state.ball.y * this.pixelRatio ) + ( this.$fieldHeight / 2 ) ) ,
		z: Math.round( Math.max( 0 , ( state.ball.z - 0.15 ) * this.pixelRatio ) )
	} ;

	this.ball.draw( ball ) ;

	/***********/
	/* PLAYERS */
	/***********/

	//*
	for ( var i = 0 ; i < state.teams.length ; i++ ) {
		for ( var j = 0 ; j < state.teams[ i ].length ; j++ ) {
			statePlayer = state.teams[ i ][ j ] ;
			//this.teams[ i ].players[ j ].draw( statePlayer ) ;
			this.teams[ i ].players[ j ].draw( {
				x: Math.round( ( statePlayer.x * this.pixelRatio ) + ( this.$fieldWidth / 2 ) ) ,
				y: Math.round( ( statePlayer.y * this.pixelRatio ) + ( this.$fieldHeight / 2 ) ) ,
			} ) ;
		}
	}
	//*/

	
	/**********/
	/* CAMERA */
	/**********/

	this.camera.x = Math.min( ball.x - this.clientWidth / 2 , this.$fieldWidth - this.clientWidth ) ;
	this.camera.y = Math.min( ball.y - this.clientHeight / 2 , this.$fieldHeight - this.clientHeight ) ;

	if ( this.camera.x < 0 ) {
		this.camera.x = 0 ;
	}

	if ( this.camera.y < 0 ) {
		this.camera.y = 0 ;
	}

	this.camera.x = Math.round( this.camera.x ) ;
	this.camera.y = Math.round( this.camera.y ) ;


	if ( this.cameraMoveType === 'scroll' ) {
		window.scrollTo( this.camera.x , this.camera.y ) ;
	}
	else {
		this.$field.style.transform = `translate( ${-this.camera.x}px , ${-this.camera.y}px )` ;
	}


	debug.since('FrameRate') ;

	if ( this.frames[ ++this.playPosition ] && this.playState === 'play' ) {
		window.requestAnimationFrame( this.draw.bind( this ) ) ;
	}
	else {
		this.playState = 'waiting' ;
	}
} ;



function team() { throw 'NOOOOO' ; }

team.create = function( options ) {
	var self = Object.create( {} , {
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
