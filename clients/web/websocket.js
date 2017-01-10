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
	this.socket = new WebSocket('ws://localhost:15007') ;
	this.socket.onmessage = this.onmessage ;
	this.socket.onopen = this.onopen ;
} ;

client.prototype.send = function( data ) {
	this.send( JSON.stringify( data ) ) ;
} ;

client.prototype.onopen = function() {
	console.log('yay');
} ;

client.prototype.onmessage = function( jsonData ) {
	var data = JSON.parse( jsonData ) ;
	var frame = {
		ball: data.state.ball.bVector.position ,
		teams: []
	} ;

	var dataTeams = data.state.teams ;

	for ( var i = 0 ; i < dataTeams.length ; i++ ) {
		var players = dataTeams[i].players ;

		var teamsPlayers = [] ;

		for ( var j = 0 ; j < players.length ; i++ ) {
			teamsPlayers.push( players[i].bVector.position ) ;
		}


		frame.teams.push( teamsPlayers ) ;
	}


	renderer.addFrame( frame ) ;
} ;

client.prototype.close = function() {
	this.socket.close() ;
} ;
