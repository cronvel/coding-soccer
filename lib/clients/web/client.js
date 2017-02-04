var client = function() {
	throw 'blurp!' ;
} ;

client.create = function() {
	var self = Object.create( client.prototype , {
		worker: { value: null , writable: true }
	} ) ;

	self.connect() ;
	return self ;
} ;

client.prototype.connect = function() {
	this.worker = new Worker( 'websocket.js' ) ;
	this.worker.onmessage = this.onmessage ;
} ;

client.prototype.send = function( data ) {
	this.worker.postmessage( data ) ;
} ;

client.prototype.onmessage = function( event ) {
	game.renderer.addFrame( event.data ) ;
} ;

client.prototype.close = function() {
	this.worker.terminate() ;
} ;
