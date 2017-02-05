
var soccer = require( '../lib/coding-soccer.js' ) ;


var game = soccer.Game.create() ;

//console.log( game ) ;

//*
game.entity.ball.boundVector.position.z = 10 ;
//game.entity.ball.boundVector.vector.y = 10 ;
game.entity.player.boundVector.position.z = 8 ;
game.entity.player.boundVector.position.y = 0.001 ;
//game.entity.player.boundVector.position.y = 0 ;
//*/

/*
game.entity.ball.boundVector.position.z = 0.15 ;
game.entity.ball.boundVector.vector.y = 10 ;
//*/


//console.log( game.entity.ball.boundVector ) ; //, game.entity.ball.accelVector ) ;
console.error( "Here we go!" ) ;
var time = Date.now() ;

for ( var i = 0 ; i <= 60 ; i ++ )
{
	game.update() ;
	console.log( '-'.repeat(20) + '\n#' + i + ':' , game.entity.ball.boundVector ) ; //, game.entity.ball.accelVector ) ;
}

time = Date.now() - time ;
console.error( "Done!" , time , "ms" ) ;

