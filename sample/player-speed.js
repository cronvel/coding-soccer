
var soccer = require( '../lib/coding-soccer.js' ) ;
var term = require( 'terminal-kit' ).terminal ;
//var physic = require( '../lib/physic.js' ) ;



// Initialize the gamepad library

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



// Init game

var game = soccer.Game.create() ;

//console.log( game ) ;

//*
game.ballEntity.boundVector.position.z = 10 ;
//game.ballEntity.boundVector.vector.y = 10 ;
var player = game.teams[ 0 ].playerEntities[ 0 ] ;
player.boundVector.position.z = 8 ;
player.boundVector.position.y = 0.001 ;
//player.boundVector.position.y = 0 ;
//*/

/*
game.ballEntity.boundVector.position.z = 0.15 ;
game.ballEntity.boundVector.vector.y = 10 ;
//*/



// Listen for move events on all gamepads
gamepad.on( 'move' , function( id , axis , value ) {
	//term( "axis: %i -- value: %f" , axis , value ) ;
	
	if ( axis === 0 )
	{
		player.input.speedVector.x = 8 * value ;
	}
	else if ( axis === 1 )
	{
		player.input.speedVector.y = 8 * value ;
	}
	
	//entities.input.throttle = value ;
} ) ;



function update()
{
	game.update( 0.1 ) ;
	
	term.column( 1 ).eraseLineAfter() ;
	term.bold.yellow( "Vector %f %f" , player.boundVector.vector.x , player.boundVector.vector.y ) ;
}

setInterval( update , 100 ) ;
