
var soccer = require( '../lib/coding-soccer.js' ) ;


var state = soccer.GameState.create() ;
var phy = soccer.Phy.create() ;

//console.log( state ) ;

state.ball.bVector.position.z = 10 ;
console.log( state.ball.bVector ) ;

for ( var i = 0 ; i < 100 ; i ++ )
{
	phy.update( state ) ;
	console.log( state.ball.bVector ) ;
}

