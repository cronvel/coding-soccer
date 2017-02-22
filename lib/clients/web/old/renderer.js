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
		pixelRatio: 30, // meters to pixels

		engineFramePeriod: 1000 / 30, // engine framePeriod
		rendererFramePeriod: 1000 / 30 // renderer framePeriod
	} ;

	options = Object.assign( defaultOptions , options ) ;

	var self = Object.create( Renderer.prototype , {
		game: { value: game } ,
		$container: { value: $container } ,
		clientWidth: { value: $container.clientWidth , writable: true } ,
		clientHeight: { value: $container.clientHeight , writable: true } ,

		fieldWidth: { value: options.fieldWidth } ,
		fieldHeight: { value: options.fieldHeight } ,
		pixelRatio: { value: options.pixelRatio } ,

		$field: { value: document.querySelector('.field') } ,
		$fieldWidth: { value: 0 , writable: true } ,
		$fieldHeight: { value: 0 , writable: true } ,
		
		/*
		frames: { value: [] } ,
		playState: { value: 'pause' , writable: true } ,
		playPosition: { value: 0 , writable: true } ,
		*/
		
		camera: { value: { x: 0 , y: 0 , z: 0 } } ,
		// cameraMoveType: { value: 'scroll' } ,
		cameraMoveType: { value: 'transform' } ,
		ball: { value: Ball.create() } ,
		teams: { value: [] } ,
		posts: { value: [] } ,

		$progress: { value: document.querySelector('.progress') } ,
		$progressBar: { value: document.querySelector('.progressBar') } ,
		$playState: { value: document.querySelector('.playState') } ,

		engineFramePeriod: { value: options.engineFramePeriod } ,
		rendererFramePeriod: { value: options.rendererFramePeriod } ,
		
		// Sent by the back-end
		halfTimeDuration: { value: 0 , writable: true } ,
		// Situation dependent, usually 2 * 1000 * halfTimeDuration, but can be extended under some rules
		fullDurationMs: { value: 0 , writable: true } ,
		// fullDurationMs / engineFramePeriod
		maxFrame: { value: 0 , writable: true }
	} ) ;

	self.teams.push(
		Team.create( {
			color: 'blue'
		} ) ,
		Team.create( {
			color: 'red'
		} )
	) ;

	//self.init() ;

	return self ;
} ;



Renderer.prototype.coord = function( obj ) {
	return {
		x: Math.round( ( obj.x * this.pixelRatio ) + ( this.$fieldWidth / 2 ) ) ,
		y: Math.round( ( obj.y * this.pixelRatio ) + ( this.$fieldHeight / 2 ) ) ,
		z: Math.round( Math.max( 0 , ( obj.z || 0 * this.pixelRatio ) ) )
	} ;
} ;



Renderer.prototype.init = function() {
	var self = this ;
	var params = this.game.parameters ;
	
	this.$fieldWidth = params.field.outerLength * this.pixelRatio ;
	this.$fieldHeight = params.field.outerWidth * this.pixelRatio ;
	
	this.halfTimeDuration = params.halfTimeDuration ;
	this.fullDurationMs = 2000 * this.halfTimeDuration ;
	this.maxFrame = this.fullDurationMs / this.engineFramePeriod ;
	
	console.log( params ) ;
	var svgField = SvgField.create( params.field , this.pixelRatio ) ;
	//console.log( svgField , this.$field ) ;
	this.$field.append( svgField.$ ) ;
	
	//*
	this.posts.push( GoalPost.create( this.coord( params.field.topLeftGoalPost ) ) ) ;
	this.posts.push( GoalPost.create( this.coord( params.field.bottomLeftGoalPost ) ) ) ;
	this.posts.push( GoalPost.create( this.coord( params.field.topRightGoalPost ) ) ) ;
	this.posts.push( GoalPost.create( this.coord( params.field.bottomRightGoalPost ) ) ) ;
	//*/
	
	if ( this.cameraMoveType === 'scroll' ) {
		document.querySelector('main').style.overflow = 'visible' ;
	}
	else {
		document.querySelector('main').style.overflow = 'hidden' ;
	}
	
	this.$field.style.width = this.$fieldWidth + 'px' ;
	this.$field.style.height = this.$fieldHeight + 'px' ;

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
		var goto = Math.round( self.maxFrame / ( self.clientWidth / event.clientX ) ) ;
		goto = Math.min( self.frames.length , goto ) ;
		console.log( "goto:" , goto ) ;
		self.goto( goto ) ;
	} ) ;
} ;



Renderer.prototype.replayUpdate = function() {
	var playPositionPercent = 100 * this.playPosition / this.maxFrame ;
	var bufferPositionPercent = 100 * this.frames.length / this.maxFrame ;
	this.$progressBar.style.backgroundImage = `linear-gradient(to right, red , red ${playPositionPercent}% , lightgrey 1px, lightgrey ${bufferPositionPercent}% , transparent 1px )` ;
} ;



Renderer.prototype.addFrame = function( data ) {
	debug.since('PacketRate') ;

	this.frames.push( data ) ;
	if ( this.playState === 'waiting' ) {
		this.play() ;
	}
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

	if ( lastFrame < this.rendererFramePeriod ) {
		setTimeout( this.draw.bind( this ) , this.rendererFramePeriod - lastFrame ) ;
		return ;
	}
	else {
		var skipped = ( Math.round( lastFrame / this.rendererFramePeriod ) - 1 ) || 0 ;
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



function GoalPost( coord ) { return Player.create( coord ) ; }

GoalPost.create = function( coord ) {
	var self = Object.create( Player.prototype , {
		$: { value: document.createElement('div') }
	} ) ;

	console.log( "potal:" , coord.x , coord.y ) ;
	self.$.classList.add('goalPost') ;
	self.$.style.transform = `translate( ${coord.x}px , ${coord.y}px )` ;
	
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
