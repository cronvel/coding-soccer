var client = function() {
	throw 'blurp!' ;
} ;
client.create = function() {
	var self = Object.create( client.prototype , {
		socket: { value: null , writable: true }
	} ) ;

	self.connect() ;
	return self ;
} ;

client.prototype.connect = function() {
	
	if ( location.hostname )
	{
		this.socket = new WebSocket('ws://' + location.hostname + ':15007') ;
	}
	else
	{
		// Probably file://
		this.socket = new WebSocket('ws://localhost:15007') ;
	}
	
	this.socket.onmessage = this.onmessage ;
	this.socket.onopen = this.onopen ;
} ;

client.prototype.send = function( data ) {
	this.send( JSON.stringify( data ) ) ;
} ;

client.prototype.onopen = function() {
	console.log('yay');
} ;

client.prototype.onmessage = function( message ) {
	var state = JSON.parse( message.data ) ;
	postMessage( state ) ;
} ;

client.prototype.close = function() {
	this.socket.close() ;
} ;

client.create() ;
