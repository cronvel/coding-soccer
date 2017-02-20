/*
	Uphysics
	
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



var physic = require( 'uphysics' ) ;



/*
	Limit the top speed of entities.
	When the entity moves, its max acceleration is lowered in the move direction, and raised in the counter-direction.
	At top-speed, no more acceleration is possible in the move direction.
	When top-speed violation occurs, the entity simply brake until it move slower than the top-speed.
	
	Use entity.controllerData.speedVector as input.
*/

function PlayerFacing( params ) { return PlayerFacing.create( params ) ; }
module.exports = PlayerFacing ;



/*
	Params:
	* topSpeedViolationBrake: used when the entity move faster than its top-speed
*/
PlayerFacing.create = function create( params )
{
	var self = Object.create( PlayerFacing.prototype , {
		ballEntity: { value: params.ballEntity , writable: true , enumerable: true } ,
		followMaxSpeed: { value: params.followMaxSpeed , writable: true , enumerable: true } ,
		vector: { value: physic.Vector2D( 0 , 0 ) , writable: true , enumerable: true } ,
	} ) ;
	
	return self ;
} ;



PlayerFacing.prototype.init = function init( entity )
{
	if ( ! entity.data.facing ) { entity.data.facing = 0 ; }
} ;



PlayerFacing.prototype.apply = function apply( entity , period )
{
	this.vector.setVector( this.ballEntity.boundVector.position ).sub( entity.boundVector.position )
		.setLength( 2 )
		.add( entity.boundVector.vector ) ;
	entity.data.facing = this.vector.getAngle() || 0 ;
} ;


