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
	this.socket = new WebSocket('ws://' + location.hostname + ':15007') ;
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

	var frame = {
		ball: state.ball.bVector.position ,
		teams: []
	} ;

	var dataTeams = state.teams ;

	for ( var i = 0 ; i < dataTeams.length ; i++ ) {
		var players = dataTeams[i].players ;

		var teamsPlayers = [] ;

		for ( var j = 0 ; j < players.length ; j++ ) {
			teamsPlayers.push( players[j].bVector.position ) ;
		}

		frame.teams.push( teamsPlayers ) ;
	}

	game.renderer.addFrame( frame ) ;
} ;

client.prototype.close = function() {
	this.socket.close() ;
} ;
