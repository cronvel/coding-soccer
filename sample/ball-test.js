
var soccer = require( '../lib/coding-soccer.js' ) ;


var game = soccer.Game.create() ;

console.log( game ) ;

game.entity.ball.boundVector.position.z = 10 ;
game.entity.ball.boundVector.vector.y = 10 ;
console.log( game.entity.ball.boundVector , game.entity.ball.accelVector ) ;

for ( var i = 0 ; i < 120 ; i ++ )
{
	game.update() ;
	console.log( game.entity.ball.boundVector , game.entity.ball.accelVector ) ;
}

