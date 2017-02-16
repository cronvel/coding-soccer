
var soccer = require( '../lib/coding-soccer.js' ) ;


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


//console.log( game.ballEntity.boundVector ) ; //, game.ballEntity.accelVector ) ;
console.error( "Here we go!" ) ;
var time = Date.now() ;

for ( var i = 0 ; i <= 20 ; i ++ )
{
	game.update() ;
	//console.log( '-'.repeat(20) + '\n#' + i + ':' , game.ballEntity.boundVector ) ; //, game.ballEntity.accelVector ) ;
}

time = Date.now() - time ;
console.error( "Done!" , time , "ms" ) ;

