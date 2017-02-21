


function Client() { return Client.create() ; }



Client.create = function() {
	var self = Object.create( Client.prototype , {
		socket: { value: null , writable: true } ,
		parametersReceived: { value: false , writable: true }
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
	
	if ( ! this.parametersReceived )
	{
		game.parameters = data ;
		console.log( "Game parameters:" , data ) ;
		game.renderer.init() ;
		this.parametersReceived = true ;
	}
	else
	{
		game.renderer.addFrame( data ) ;
	}
} ;



Client.prototype.close = function() {
	this.socket.close() ;
} ;


