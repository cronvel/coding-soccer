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



var math = require( 'math-kit' ) ;

function Player( params ) { return Player.create( params ) ; }
module.exports = Player ;



Player.create = function create( params )
{
	params = params || {} ;
	
	var self = Object.create( Player.prototype , {
		stats: { value: params.stats , enumerable: true } ,
	} ) ;
	
	self.buildRealStats() ;
	
	return self ;
} ;



function statToBonus( stat ) { return Math.pow( stat / 8 , 0.6 ) ; }



/*
	Stats start at 0 and max at 8.
*/
Player.prototype.buildRealStats = function buildRealStats()
{
	// 18 km/h to 36 km/h
	this.topSpeed = 5 + 5 * statToBonus( this.stats.topSpeed ) ;
	
	// 58 km/h to 130 km/h without speed bonus
	// Also if running at less than 3m/s should produce a malus:
	// a player have to run a bit to shoot properly.
	// Something like 60% of power at 0 m/s and 100% at 3 m/s.
	// After 3 m/s, the speed is pure bonus, hence running at 10m/s
	// give 100% of power + 7 m/s of bonus, for a max total of 43 m/s (154 km/h).
	this.shootPower = 16 + 20 * statToBonus( this.stats.shootPower ) ;
	
	// Acceleration is a mix of topSpeed and reaction
	this.baseAcceleration = 4 + 4 * statToBonus( this.stats.topSpeed > this.stats.reaction ?
		( 2 * this.stats.topSpeed + this.stats.reaction ) / 3 :
		( this.stats.topSpeed + 2 * this.stats.reaction ) / 3
	) ;
	
	// Skills: shoot accuracy and dribbling abilities
	// Reaction: when something unexpected happens, it lowers all malus. Great for stopping the ball. Also used for acceleration.
	// Jump: head, jump, height
	// Balance: how much a player is steadfast
} ;


