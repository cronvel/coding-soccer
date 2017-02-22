


function Client( game ) { return Client.create( game ) ; }



Client.create = function( game ) {
	var self = Object.create( Client.prototype , {
		game: { value: game } ,
		socket: { value: null , writable: true } ,
		paramsReceived: { value: false , writable: true }
	} ) ;

	self.connect() ;
	
	return self ;
} ;



Client.prototype.connect = function() {

	if ( location.hostname ) {
		this.socket = new WebSocket('ws://' + location.hostname + ':15007') ;
	}
	else {
		// Probably file://
		this.socket = new WebSocket('ws://localhost:15007') ;
	}

	this.socket.onmessage = this.onmessage ;
	this.socket.onopen = this.onopen ;
} ;



Client.prototype.send = function( data ) {
	this.send( JSON.stringify( data ) ) ;
} ;



Client.prototype.onopen = function() {
	console.log('yay');
} ;



Client.prototype.onmessage = function( message ) {
	var data = JSON.parse( message.data ) ;
	
	if ( ! this.paramsReceived )
	{
		this.game.params = data ;
		//console.log( "Game params:" , data ) ;
		this.game.renderer.init() ;
		this.paramsReceived = true ;
	}
	else
	{
		this.game.playback.addFrame( data ) ;
	}
} ;



Client.prototype.close = function() {
	this.socket.close() ;
} ;


