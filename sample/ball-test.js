
var soccer = require( '../lib/coding-soccer.js' ) ;


var game = soccer.Game.create() ;

console.log( game ) ;
return ;
//game.state.ball.bVector.position.z = 10 ;
//game.state.ball.bVector.vector.y = 20 ;
console.log( game.state.ball.bVector , game.state.ball.accelVector ) ;

for ( var i = 0 ; i < 100 ; i ++ )
{
	game.update() ;
	console.log( game.state.ball.bVector , game.state.ball.accelVector ) ;
}

