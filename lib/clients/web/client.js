
function Client() { return Client.create() ; }



Client.create = function() {
	var self = Object.create( Client.prototype , {
		worker: { value: null , writable: true }
	} ) ;

	self.connect() ;
	return self ;
} ;



Client.prototype.connect = function() {
	this.worker = new Worker( 'websocket.js' ) ;
	this.worker.onmessage = this.onmessage ;
} ;



Client.prototype.send = function( data ) {
	this.worker.postmessage( data ) ;
} ;



Client.prototype.onmessage = function( event ) {
	game.renderer.addFrame( event.data ) ;
} ;



Client.prototype.close = function() {
	this.worker.terminate() ;
} ;

