/*
	Coding Soccer
	
	Copyright (c) 2017 Cédric Ronvel
	
	The MIT License (MIT)
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



var Game = require( './Game.js' ) ;
var WsServer = require( './WsServer.js' ) ;

var term = require( 'terminal-kit' ).terminal ;

var Logfella = require( 'logfella' ) ;
var log = Logfella.global.use( 'soccer' ) ;

var soccerPackage = require( '../package.json' ) ;



function cli()
{
	var book , bookPath , server , serverOptions , bookOptions = {} ;
	
	// Intro
	term.bold.magenta( 'Coding Soccer!' ).dim( ' v%s by the Ronvel brothers\n' , soccerPackage.version ) ;
	
	// Manage uncaughtException
	process.on( 'uncaughtException' , function( error ) {
		term.red( "uncaughtException: %E" , error ) ;
		throw error ;
	} ) ;
	
	// Manage command line arguments
	var args = require( 'minimist' )( process.argv.slice( 2 ) ) ;
	
	if ( args.h || args.help )
	{
		cli.usage( false , type ) ;
		return cli.exit( 0 ) ;
	}
	
	args.electron = args.electron || args.E ;
	args.browser = args.browser || args.B ;
	
	if ( args.electron || typeof args.browser === 'string' )
	{
		//args.ui = 'websocket' ;
		args['ws-server'] = true ;
	}
	else
	{
		args.browser = false ;
	}
	
	//if ( args.token && ! Array.isArray( args.token ) ) { args.token = [ args.token ] ; }
	
	// Init Logfella logger
	var logLevel = 'info' ;
	
	if ( args.debug ) { logLevel = 'debug' ; }
	else if ( args.verbose ) { logLevel = 'verbose' ; }
	
	Logfella.global.setGlobalConfig( {
		minLevel: logLevel ,
		overrideConsole: true ,
		transports: [
			{ "type": "console" , "timeFormatter": "time" , "color": true } ,
		]
	} ) ;
	
	var game = Game.create() ;
	cli.createWsServer( game ) ;
	
	game.loop() ;
	
	switch ( args.test )
	{
		case 'move' :
			cli.moveTest( game ) ;
			break ;
		case 'random' :
		case 'random-kick' :
		default:
			cli.randomKickTest( game ) ;
	}
}

module.exports = cli ;



cli.usage = function usage( noBaseline , type )
{
	if ( ! noBaseline ) { term.italic.brightBlack( "“A cool baseline!”\n\n" ) ; }
	
	term.blue( 'Usage is: ' ).cyan( 'coding-soccer [option1] [option2] [...]\n\n' ) ;
	term.blue( "Available options:\n" ) ;
	term.blue( "  --help , -h                Show this help\n" ) ;
	
	term.blue( "  --ws-server [<port>]       Create a web socket server (default to port 15007)\n" ) ;
	//term.blue( "  --token <token>            Add a token to server accepted token list (can be used multiple times)\n" ) ;
	term.blue( "  --browser , -B <exe>       Open a client browser <exe>, force --ws-server and --http\n" ) ;
	term.blue( "  --electron , -E            Open the Electron client, force --ws-server and --http\n" ) ;
	term( "\n" ) ;
} ;



cli.createWsServer = function createWsServer( game , options )
{
	var WsServer = require( './WsServer.js' ) ;
	return WsServer.create( game , options ) ;
} ;



cli.randomKickTest = function randomKickTest( game )
{
	if ( game.ballEntity.boundVector.position.length > 40 )
	{
		// If the ball is too far away, move it on the center
		console.log( "Teleport to center" ) ;
		game.ballEntity.boundVector.position.setNull() ;
	}
	
	game.ballEntity.boundVector.vector.set(
		Math.random() * 40 - 20 ,
		Math.random() * 40 - 20 ,
		Math.random() * 40 - 20
	) ;
	
	console.log( "Kick the ball!" , game.ballEntity.boundVector.vector ) ;
	
	setTimeout( randomKickTest.bind( cli , game ) , Math.random() * 4000 + 4000 ) ;
} ;



cli.moveTest = function moveTest( game )
{
	var gamepad = cli.initGamePad() ;
	var physic = require( 'uphysics' ) ;
	
	var kickVector = physic.Vector3D( 0 , 0 , 0 ) ;
	
	// Listen for move events on all gamepads
	gamepad.on( 'move' , function( id , axis , value ) {
		//term( "id: %s -- axis: %i -- value: %f\n" , id , axis , value ) ;
		//term( "Ball: %Y\n" , game.ballEntity.boundVector.position ) ;
		
		if ( id > 1 ) { return ; }
		
		var player = game.teams[ id ].playerEntities[ 0 ] ;
		
		if ( axis === 0 ) { kickVector.x = 20 * value ; }
		else if ( axis === 1 ) { kickVector.y = 20 * value ; }
		else if ( axis === 2 ) { kickVector.z = 20 * ( 1 + value ) / 2 ; }
		else if ( axis === 3 ) { player.input.speedVector.x = 8 * value ; }
		else if ( axis === 4 ) { player.input.speedVector.y = 8 * value ; }
	} ) ;
	
	// Listen for move events on all gamepads
	gamepad.on( 'down' , function( id , button ) {
		//term( "id: %s -- button: %i down\n" , id , button ) ;
		game.ballEntity.boundVector.vector.setVector( kickVector ) ;
		term( "Ball: %Y\n" , game.ballEntity.boundVector ) ;
	} ) ;
} ;



// Init gamepad (for test purpose)
cli.initGamePad = function initGamePad()
{
	var gamepad = require( 'gamepad' ) ;
	
	term.magenta( "\nThis works using a gamepad\n\n" ) ;
	
	gamepad.init() ;
	
	// Create a game loop and poll for events
	setInterval( gamepad.processEvents , 16 ) ;
	
	// Scan for new gamepads as a slower rate
	setInterval( gamepad.detectDevices , 500 ) ;
	
	gamepad.on( 'attach' , function( id , state ) {
		term.blue( 'attach %Y\n' , state ) ;
	} ) ;
	
	return gamepad ;
} ;



/*
cli.openBrowser = function openBrowser( book , server , exePath , options )
{
	var token , qs , url , execOptions = {} ;
	
	token = path.basename( exePath.split( ' ' )[ 0 ] ) + Math.floor( Math.random() * 1000000 ) ;
	
	server.acceptTokens[ token ] = true ;
	
	qs = {
		port: server.port ,
		token: token ,
		ui: options['client-ui'] || 'classic' ,
		name: options['client-name'] || 'local-user'
	} ;
	
	qs = '?' + querystring.stringify( qs ) ;
	url = 'http://localhost:' + server.port + '/' + qs ;
	
	exec( exePath + ' ' + string.escape.shellArg( url ) , execOptions , function( error , stdout , stderr ) {
		
		if ( error )
		{
			console.error( "Browser ERROR:" , error ) ;
			process.exit( 1 ) ;
		}
		//console.log( "Browser STDOUT:" , stdout ) ;
		//console.log( "Browser STDERR:" , stderr ) ;
	} ) ;
} ;



cli.openElectron = function openElectron( book , server , options )
{
	var exePath , appPath , token , qs , url , execOptions = {} ;
	
	exePath = __dirname + '/../node_modules/.bin/electron' ;
	appPath = __dirname + '/../electron' ;
	
	token = path.basename( exePath.split( ' ' )[ 0 ] ) + Math.floor( Math.random() * 1000000 ) ;
	
	server.acceptTokens[ token ] = true ;
	
	qs = {
		port: server.port ,
		token: token ,
		ui: options['client-ui'] || 'classic' ,
		name: options['client-name'] || 'local-user'
	} ;
	
	qs = '?' + querystring.stringify( qs ) ;
	url = 'http://localhost:' + server.port + '/' + qs ;
	
	exec( exePath + ' ' + appPath + ' --url ' + string.escape.shellArg( url ) , execOptions , function( error , stdout , stderr ) {
		
		if ( error )
		{
			console.error( "Electron ERROR:" , error ) ;
			process.exit( 1 ) ;
		}
		//console.log( "Browser STDOUT:" , stdout ) ;
		//console.log( "Browser STDERR:" , stderr ) ;
	} ) ;
} ;
*/


cli.exit = function exit( code )
{
	async.exit( code , 1000 ) ;
} ;


