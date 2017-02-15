
var soccer = require( '../lib/coding-soccer.js' ) ;


var game = soccer.Game.create() ;

//console.log( game ) ;

//*
game.entities.ball.boundVector.position.z = 10 ;
//game.entities.ball.boundVector.vector.y = 10 ;
game.entities.player.boundVector.position.z = 8 ;
game.entities.player.boundVector.position.y = 0.001 ;
//game.entities.player.boundVector.position.y = 0 ;
//*/

/*
game.entities.ball.boundVector.position.z = 0.15 ;
game.entities.ball.boundVector.vector.y = 10 ;
//*/


//console.log( game.entities.ball.boundVector ) ; //, game.entities.ball.accelVector ) ;
console.error( "Here we go!" ) ;
var time = Date.now() ;

for ( var i = 0 ; i <= 20 ; i ++ )
{
	game.update() ;
	console.log( '-'.repeat(20) + '\n#' + i + ':' , game.entities.ball.boundVector ) ; //, game.entities.ball.accelVector ) ;
}

time = Date.now() - time ;
console.error( "Done!" , time , "ms" ) ;

