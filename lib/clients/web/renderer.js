/*
Renderer
	teams
		players
	ball
	field (include camera)
	videoPlayer


add pixelRatio by width
*/

function Renderer ( options ) { return Renderer.create( options ) ; }



Renderer.create = function( options ) {
	var $container = document.querySelector('main') ;

	var defaultOptions = {
		fieldWidth: 100, // in meters
		fieldHeight: 60, // in meters
		pixelRatio: 30, // meters to pixels

		matchLength: 5 * 60 * 60 , // in minutes

		engineFrameRate: 1000 / 30, // engine frameRate
		rendererFrameRate: 1000 / 30 // renderer frameRate
	} ;

	options = Object.assign( defaultOptions , options ) ;

	var self = Object.create( Renderer.prototype , {
		$container: { value: $container } ,
		clientWidth: { value: $container.clientWidth , writable: true } ,
		clientHeight: { value: $container.clientHeight , writable: true } ,

		fieldWidth: { value: options.fieldWidth } ,
		fieldHeight: { value: options.fieldHeight } ,
		pixelRatio: { value: options.pixelRatio } ,

		$field: { value: document.querySelector('.field') } ,
		$fieldWidth: { value: options.fieldWidth * options.pixelRatio } ,
		$fieldHeight: { value: options.fieldHeight * options.pixelRatio } ,

		frames: { value: [] } ,
		playState: { value: 'pause' , writable: true } ,
		playPosition: { value: 0 , writable: true } ,

		camera: { value: { x:0 , y:0 , z:0 } } ,
		// cameraMoveType: { value: 'scroll' } ,
		cameraMoveType: { value: 'transform' } ,
		ball: { value: Ball.create() } ,
		teams: { value: [] } ,

		$progress: { value: document.querySelector('.progress') } ,
		$progressBar: { value: document.querySelector('.progressBar') } ,
		$playState: { value: document.querySelector('.playState') } ,

		engineFrameRate: { value: options.engineFrameRate } ,
		rendererFrameRate: { value: options.rendererFrameRate } ,

		matchLength: { value: options.matchLength }
	} ) ;

	self.teams.push(
		Team.create( {
			color: 'blue'
		} ) ,
		Team.create( {
			color: 'red'
		} )
	) ;

	self.init() ;

	return self ;
} ;



Renderer.prototype.init = function() {
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
		self.clientWidth = self.$container.clientWidth ;
		self.clientHeight = self.$container.clientHeight ;
	} ) ;

	this.replay() ;
	this.play() ;
} ;



Renderer.prototype.replay = function() {
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
		var goto = Math.round( self.matchLength / ( self.clientWidth / event.clientX ) ) ;
		var bob = Math.min( self.frames.length , goto ) ;
		console.log( bob ) ;
		self.goto( bob ) ;
	} ) ;
} ;



Renderer.prototype.replayUpdate = function() {
	var playPosition = ( this.playPosition / ( this.matchLength ) ) * 100 ;
	var bufferPosition = ( this.frames.length / ( this.matchLength ) ) * 100 ;
	this.$progressBar.style.backgroundImage = `linear-gradient(to right, red , red ${playPosition}% , lightgrey 1px, lightgrey ${bufferPosition}% , transparent 1px )` ;
} ;



Renderer.prototype.addFrame = function( data ) {
	debug.since('PacketRate') ;

	this.frames.push( data ) ;
	if ( this.playState === 'waiting' ) {
		this.play() ;
	}
} ;



Renderer.prototype.pause = function() {
	this.playState = 'pause' ;
} ;



Renderer.prototype.play = function() {
	this.playState = 'play' ;
	this.draw() ;
} ;



Renderer.prototype.goto = function( position ) {
	this.playPosition = position ;
} ;



Renderer.prototype.cameraUpdate = function( ball ) {
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
} ;



Renderer.prototype.draw = function() {

	/* frameRate limiter and frame skip */
	/* Need review and rewrite */
	var time = Date.now() , lastFrame = time - this.lastFrame ;

	if ( lastFrame < this.rendererFrameRate ) {
		setTimeout( this.draw.bind( this ) , this.rendererFrameRate - lastFrame ) ;
		return ;
	}
	else {
		var skipped = ( Math.round( lastFrame / this.rendererFrameRate ) - 1 ) || 0 ;
		var nextFrame = Math.min( this.frames.length - 1 , this.playPosition + skipped ) ;
		debug( skipped , 'skipped' ) ;
		this.playPosition = nextFrame ;
	}
	this.lastFrame = time ;



	var state = this.frames[ this.playPosition ] ;
	//var oldState = this.frames[ this.playPosition && this.playPosition - 1 ] ;

	if ( ! state ) {
		console.log( `waiting for frame: ${this.playPosition}` ) ;
		this.playState = 'waiting' ;
		return ;
	}

	this.replayUpdate() ;


	/********/
	/* BALL */
	/********/
	var ball = {
		x: Math.round( ( state.ball.boundVector.position.x * this.pixelRatio ) + ( this.$fieldWidth / 2 ) ) ,
		y: Math.round( ( state.ball.boundVector.position.y * this.pixelRatio ) + ( this.$fieldHeight / 2 ) ) ,
		z: Math.round( Math.max( 0 , ( state.ball.boundVector.position.z - 0.15 ) * this.pixelRatio ) )
	} ;
	
	this.ball.draw( ball ) ;

	/***********/
	/* PLAYERS */
	/***********/
	
	var i , iMax , j , jMax ,
		playersLength , player , playerState ,
		teamsLength = this.teams.length , team , teamState ;
	
	for ( i = 0 ; i < teamsLength ; i ++ )
	{
		team = this.teams[ i ] ;
		teamState = state.teams[ i ] ;
		//oldTeamState = oldState.teams[ i ] ;
		
		for ( j = 0 , playersLength = team.players.length ; j < playersLength ; j ++ )
		{
			player = team.players[ j ] ;
			playerState = teamState.players[ j ] ;
			//oldPlayerState = oldTeamState.players[ j ] ;
			
			
			//this.teams[ i ].players[ j ].draw( playerState ) ;
			player.draw( {
				x: Math.round( ( playerState.boundVector.position.x * this.pixelRatio ) + ( this.$fieldWidth / 2 ) ) ,
				y: Math.round( ( playerState.boundVector.position.y * this.pixelRatio ) + ( this.$fieldHeight / 2 ) ) ,
				facing: playerState.facing
			} ) ;
		}
	}

	
	/**********/
	/* CAMERA */
	/**********/
	this.cameraUpdate( ball ) ;


	debug.since('FrameRate') ;

	if ( this.frames[ ++this.playPosition ] && this.playState === 'play' ) {
		window.requestAnimationFrame( this.draw.bind( this ) ) ;
	}
	else {
		this.playState = 'waiting' ;
	}
} ;



function Team( options ) { return Team.create( options ) ; }



Team.create = function( options ) {
	var self = Object.create( {} , {
		players: { value: [] , writable: true } ,

		$: { value: document.createElement('div') }
	} ) ;

	self.$.classList.add('team') ;
	self.$.setAttribute( 'data-team' , options.color ) ;

	for( var i = 0 ; i < 11 ; i++ ) {
		self.players.push( Player.create( self , i+1 ) ) ;
	}

	var field = document.querySelector('.field') ;
	field.append( self.$ ) ;

	return self ;
} ;



function Player( team , number ) { return Player.create( team , number ) ; }



Player.create = function( team , number ) {
	var self = Object.create( Player.prototype , {
		$: { value: document.createElement('div') } ,
		$shadow: { value: document.createElement('div') } ,
		$player: { value: document.createElement('div') } ,
		lastFacing: { value: 0 , writable: true }
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



var rad2deg = 360 / ( 2 * Math.PI ) ;



Player.prototype.draw = function( position ) {
	
	// The sprite is not facing the 0° angle
	var facing = position.facing * rad2deg + 90 ;
	if ( facing < 0 ) { facing += 360 ; }
	
	// Because of the way work transitions on the rotate transformation, we have
	// an extra operation to perform here to avoid the -180 +180 gap
	var lastFacingModulo = this.lastFacing % 360 ;
	if ( lastFacingModulo < 0 ) { lastFacingModulo += 360 ; }
	
	if ( facing > lastFacingModulo + 180 )
	{
		facing = this.lastFacing + facing - lastFacingModulo - 360 ;
	}
	else if ( facing < lastFacingModulo - 180 )
	{
		facing = this.lastFacing + facing - lastFacingModulo + 360 ;
	}
	else
	{
		facing = this.lastFacing + facing - lastFacingModulo ;
	}
	
	this.lastFacing = facing ;
	
	this.$.style.transform = `translate( ${position.x}px , ${position.y}px )` ;
	//this.$player.style.transform = `translateY( -${position.z}px ) rotate( ${position.facing}deg )` ;
	this.$player.style.transform = `rotate( ${facing}deg )` ;
} ;



function Ball() { return Ball.create() ; }



Ball.create = function() {
	var self = Object.create( Ball.prototype , {
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



Ball.prototype.draw2 = function( position ) {
	this.$.animate( [
		{ transform: `translate( ${position.x}px , ${position.y}px )` } ,
		{ transform: `translate( ${position.x}px , ${position.y}px )` }
	] , {
	    duration: 30
	} ) ;

	this.$ball.animate( [
		{
			backgroundPosition: `${position.x}px ${position.y}px` ,
			transform: `translateY( -${position.z}px )`
		}
	] , {
	    duration: 30
	} ) ;
} ;



Ball.prototype.draw = function( position ) {
	this.$.style.transform = `translate( ${position.x}px , ${position.y}px )` ;

	this.$ball.style.backgroundPosition = `${position.x}px ${position.y}px` ;
	this.$ball.style.transform = `translateY( -${position.z}px )` ;
} ;




function VideoPlayer() { return VideoPlayer.create() ; }



VideoPlayer.create = function() {
	var self = Object.create( VideoPlayer.prototype , {
		$: { value: document.createElement('div') } ,
	} ) ;

	return self ;
} ;

VideoPlayer.prototype.play = function( position ) {} ;
VideoPlayer.prototype.pause = function( position ) {} ;
VideoPlayer.prototype.moveTo = function( position ) {} ;
VideoPlayer.prototype.update = function( position ) {} ;
