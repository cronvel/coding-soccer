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
		world: { value: params.world , writable: true , enumerable: true } ,
		isStatic: { value: !! params.isStatic , enumerable: true } ,
		is2D: { value: !! params.is2D , enumerable: true } ,
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
	if ( this.gravityEnabled ) { this.accelVector.add( this.world.gravity ) ; }
	this.boundVector.applyAcceleration( this.accelVector , period ) ;
} ;



Entity.prototype.interaction = function interaction( withEntity )
{
	var materialInteraction , reverseMaterialInteraction , intersection , solid ;
	
	materialInteraction = this.material.interactions.get( withEntity.material ) ;
	
	// Do nothing if no interactions are possible between those objects
	if ( materialInteraction === undefined ) { return false ; }
	
	reverseMaterialInteraction = withEntity.material.interactions.get( this.material ) ;
	
	// Interactions are possible, check if there is a intersection
	if (
		( ! this.isStatic || ! withEntity.isStatic ) &&
		( intersection = this.shape.isIntersectingWith(
			this.boundVector ,
			withEntity.boundVector ,
			withEntity.shape ,
			( solid = this.material.isSolid && withEntity.material.isSolid )
		) )
	)
	{
		console.log( "Do something with dat intersection!" , intersection ) ;
		if ( ! this.isStatic && materialInteraction )
		{
			
			this.applyCollision( intersection[ 0 ] , materialInteraction ) ;
		}
		
		if ( ! withEntity.isStatic && reverseMaterialInteraction )
		{
			withEntity.applyCollision( intersection[ 1 ] , reverseMaterialInteraction ) ;
		}
	}
} ;



Entity.prototype.applyCollision = function applyCollision( intersection , materialInteraction )
{
	this.boundVector.position.setVector( intersection.at ) ;
	
	// For the entity to not move against the normal
	if ( intersection.decomposed[ 0 ].dot( intersection.normal ) < 0 )
	{
		intersection.decomposed[ 0 ].inv() ;
	}
	
	intersection.decomposed[ 0 ].mul( materialInteraction.normalBounceRate ) ;
	intersection.decomposed[ 1 ].mul( materialInteraction.tangentBounceRate ) ;
	
	this.boundVector.vector.setVector( intersection.decomposed[ 0 ].add( intersection.decomposed[ 1 ] ) ) ;
} ;



Entity.prototype.applyInfluence = function applyInfluence( intersection , materialInteraction )
{
	this.boundVector.position.setVector( intersection.at ) ;
	
	// For the entity to not move against the normal
	if ( intersection.decomposed[ 0 ].dot( intersection.normal ) < 0 )
	{
		intersection.decomposed[ 0 ].inv() ;
	}
	
	intersection.decomposed[ 0 ].mul( materialInteraction.normalBounceRate ) ;
	intersection.decomposed[ 1 ].mul( materialInteraction.tangentBounceRate ) ;
	
	this.boundVector.vector.setVector( intersection.decomposed[ 0 ].add( intersection.decomposed[ 1 ] ) ) ;
} ;


