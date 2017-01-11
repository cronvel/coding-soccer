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
var geo = math.geometry ;


function Physic( options ) { return Physic.create( options ) ; }
module.exports = Physic ;



Physic.Vector2D = geo.Vector2D ;
Physic.BoundVector2D = geo.BoundVector2D ;
Physic.Vector3D = geo.Vector3D ;
Physic.BoundVector3D = geo.BoundVector3D ;



Physic.create = function create( options )
{
	options = options || {} ;
	
	var self = Object.create( Physic.prototype , {
		period: { value: options.delay || ( options.fps && 1 / options.fps ) || 1 / 30 , writable: true , enumerable: true } ,
		
		// New parameters
		
		entities: { value: options.entities || [] , writable: true , enumerable: true } ,
		
		
		// Old parameters
		
		// Global parameters
		gravity: { value: options.gravity || 9.8 , writable: true , enumerable: true } ,
		
		// Ball parameters
		ballRadius: { value: options.ballRadius || 0.15 , writable: true , enumerable: true } ,
		groundBounceAbsorption: { value: options.groundNormalBounceAbsorption || 1 , writable: true , enumerable: true } ,
		groundNormalBounceRate: { value: options.groundNormalBounceRate || 0.7 , writable: true , enumerable: true } ,
		groundTangentBounceRate: { value: options.groundTangentBounceRate || 0.85 , writable: true , enumerable: true } ,
		airFrictionRate: { value: options.airFrictionRate || 0.15 , writable: true , enumerable: true } ,
		groundFriction: { value: options.groundFriction || 6 , writable: true , enumerable: true } ,
	} ) ;
	
	return self ;
} ;



Physic.prototype.addEntity = function addEntity( entity )
{
	this.entities.push( entity ) ;
} ;



Physic.prototype.newUpdate = function update()
{
	var i , j , len = this.entities.length , entity , altEntity ;
	
	// Prepare the frame calculation
	for ( i = 0 ; i < len ; i ++ )
	{
		this.entities[ i ].prepareFrame() ;
	}
	
	for ( i = 0 , len = this.entities.length ; i < len ; i ++ )
	{
		//entity = this.entities[ i ] ;
		
		//if ( entity.isStatic ) { continue ; } // nope, it has to interact with altEntity with lower priority
		
		for ( j = i + 1 ; j < len ; j ++ )
		{
			//altEntity = this.entities[ j ] ;
			
			this.entities[ i ].interaction( this.entities[ j ] ) ;
		}
	}
} ;



Physic.prototype.update = function update( state , actions )
{
	this.updateBall( state ) ;
} ;



Physic.prototype.updateBall = function updateBall( state )
{
	var vx , vy ,
		ball = state.ball ,
		bVector = ball.bVector ,
		accelVector = ball.accelVector ,
		normVector = bVector.vector.dup().normalize() ;
	
	// Compute the forces applied to the ball
	if ( bVector.position.z > this.ballRadius || bVector.vector.z )
	{
		//console.log( 'Air ball' ) ;
		// The ball is in the air, or bouncing
		accelVector.set( 
			- bVector.vector.x * this.airFrictionRate ,
			- bVector.vector.y * this.airFrictionRate ,
			- bVector.vector.z * this.airFrictionRate - this.gravity
		) ;
		
		// Apply acceleration to the bound vector
		bVector.applyAcceleration( accelVector , this.period ) ;
	}
	else
	{
		// The ball is on the ground
		if ( bVector.vector.x || bVector.vector.y )
		{
			//console.log( 'Ground ball' ) ;
			vx = bVector.vector.x ;
			vy = bVector.vector.y ;
			
			accelVector.set(
				- this.groundFriction * normVector.x - bVector.vector.x * this.airFrictionRate ,
				- this.groundFriction * normVector.y - bVector.vector.y * this.airFrictionRate ,
				0
			) ;
			
			// Apply acceleration to the speed vector
			bVector.vector.apply( accelVector , this.period ) ;
			
			if ( bVector.vector.x * vx < 0 || bVector.vector.y * vy < 0 )
			{
				// Sign has switched because of the absolute constant ball friction value, nullify the speed vector
				bVector.vector.setNull() ;
			}
			else
			{
				// Apply the speed vector to the position
				bVector.apply( this.period ) ;
			}
		}
		else
		{
			//console.log( 'Dead ball' ) ;
			accelVector.setNull() ;
			// Nothing to update!
		}
	}
	
	// If the ball hit the ground, make it bounce
	if ( bVector.position.z < this.ballRadius )
	{
		bVector.position.z = this.ballRadius ;
		bVector.vector.z = Math.max( 0 , - bVector.vector.z * this.groundNormalBounceRate - this.groundBounceAbsorption ) ;
	}
} ;



Physic.Entity = require( './Entity.js' ) ;
Physic.Material = require( './Material.js' ) ;
Physic.MaterialInteraction = require( './MaterialInteraction.js' ) ;
Physic.Shape = require( './Shape.js' ) ;


