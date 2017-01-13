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



var physic = require( './physic.js' ) ;



function Entity( params ) { return Entity.create( params ) ; }
module.exports = Entity ;



Entity.create = function create( params )
{
	params = params || {} ;
	
	var self = Object.create( Entity.prototype , {
		physic: { value: params.physic , writable: true , enumerable: true } ,
		isStatic: { value: !! params.isStatic , writable: true , enumerable: true } ,
		is2D: { value: !! params.is2D , writable: true , enumerable: true } ,
		gravityEnabled: { value: !! params.gravityEnabled , writable: true , enumerable: true } ,
		material: { value: params.material , writable: true , enumerable: true } ,
		shape: { value: params.shape , writable: true , enumerable: true } ,
		boundVector: {
			writable: true , enumerable: true ,
			value: new physic.BoundVector3D.fromObject(
				new physic.Vector3D( params.x || 0 , params.y || 0 , params.z || 0 ) ,
				new physic.Vector3D( 0 , 0 , 0 )
			)
		} ,
		accelVector: { value: new physic.Vector3D( 0 , 0 , 0 ) , writable: true , enumerable: true } ,
		frameInteractions: { value: [] , writable: true , enumerable: true } ,
	} ) ;
	
	return self ;
} ;



Entity.prototype.prepareFrame = function prepareFrame()
{
	this.frameInteractions.length = 0 ;
} ;



Entity.prototype.applyForces = function applyForces( period )
{
	this.accelVector.setNull() ;
	if ( this.gravityEnabled ) { this.accelVector.add( this.physic.gravity ) ; }
	this.boundVector.applyAcceleration( this.accelVector , period ) ;
} ;



Entity.prototype.interaction = function interaction( withEntity )
{
	var materialInteraction , reverseMaterialInteraction , collision ;
	
	materialInteraction = this.material.interactions.get( withEntity.material ) ;
	
	// Do nothing if no interactions are possible between those objects
	if ( materialInteraction === undefined ) { return false ; }
	
	reverseMaterialInteraction = withEntity.material.interactions.get( this.material ) ;
	
	// Interactions are possible, check if there is a collision
	if (
		this.material.isSolid && withEntity.material.isSolid &&
		( ! this.isStatic || ! withEntity.isStatic ) &&
		( collision = this.shape.isCollidingWith( this.boundVector , withEntity.boundVector , withEntity.shape ) )
	)
	{
		console.log( "Do something with dat collision!" , collision ) ;
		if ( ! this.isStatic && materialInteraction )
		{
			this.applyCollision( collision[ 0 ] , materialInteraction ) ;
			//this.boundVector.position.setVector( collision[ 0 ].at ) ;
			//this.boundVector.vector.setVector( collision[ 0 ].decomposed[ 0 ].inv().add( collision[ 0 ].decomposed[ 1 ] ) ) ;
		}
		
		if ( ! withEntity.isStatic && reverseMaterialInteraction )
		{
			withEntity.applyCollision( collision[ 1 ] , reverseMaterialInteraction ) ;
			//withEntity.boundVector.position.setVector( collision[ 1 ].at ) ;
			//withEntity.boundVector.vector.setVector( collision[ 1 ].decomposed[ 0 ].inv().add( collision[ 1 ].decomposed[ 1 ] ) ) ;
		}
	}
} ;



Entity.prototype.applyCollision = function applyCollision( collision , materialInteraction )
{
	this.boundVector.position.setVector( collision.at ) ;
	
	// For the entity to not move against the normal
	if ( collision.decomposed[ 0 ].dot( collision.normal ) < 0 )
	{
		collision.decomposed[ 0 ].inv() ;
	}
	
	collision.decomposed[ 0 ].mul( materialInteraction.normalBounceRate ) ;
	collision.decomposed[ 1 ].mul( materialInteraction.tangentBounceRate ) ;
	
	this.boundVector.vector.setVector( collision.decomposed[ 0 ].add( collision.decomposed[ 1 ] ) ) ;
} ;


