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
		isStatic: { value: !! params.isStatic || params.shape.omni , enumerable: true } ,
		is2D: { value: !! params.is2D , enumerable: true } ,
		gravityEnabled: { value: !! params.gravityEnabled , writable: true , enumerable: true } ,
		material: { value: params.material , writable: true , enumerable: true } ,
		shape: { value: params.shape , writable: true , enumerable: true } ,
		boundVector: {
			writable: true , enumerable: true ,
			value: physic.BoundVector3D( params.x || 0 , params.y || 0 , params.z || 0 , 0 , 0 , 0 )
		} ,
		oldBoundVector: {
			writable: true , enumerable: true ,
			value: physic.BoundVector3D( params.x || 0 , params.y || 0 , params.z || 0 , 0 , 0 , 0 )
		} ,
		//accelVector: { value: new physic.Vector3D( 0 , 0 , 0 ) , writable: true , enumerable: true } ,
		frameInteractions: { value: [] , writable: true , enumerable: true } ,
	} ) ;
	
	return self ;
} ;



Entity.prototype.prepareFrame = function prepareFrame()
{
	this.frameInteractions.length = 0 ;
} ;



Entity.prototype.move = function move( period )
{
	this.boundVector.apply( period ) ;
} ;



Entity.prototype.interaction = function interaction( withEntity , period )
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
			( solid = this.material.isSolid && withEntity.material.isSolid && ! this.shape.omni && ! withEntity.shape.omni )
		) )
	)
	{
		console.log( "Do something with dat intersection!" , intersection ) ;
		if ( ! this.isStatic && materialInteraction )
		{
			if ( solid ) { this.applyCollision( intersection[ 0 ] , materialInteraction , period ) ; }
			else { this.applyInfluence( materialInteraction , period ) ; }
		}
		
		if ( ! withEntity.isStatic && reverseMaterialInteraction )
		{
			if ( solid ) { withEntity.applyCollision( intersection[ 1 ] , reverseMaterialInteraction , period ) ; }
			else { this.applyInfluence( reverseMaterialInteraction , period ) ; }
		}
	}
} ;



Entity.prototype.applyCollision = function applyCollision( intersection , materialInteraction , period )
{
	this.boundVector.position.setVector( intersection.at ) ;
	
	// Apply debounce first
	if ( materialInteraction.debounce )
	{
		intersection.decomposed[ 0 ].reduceLength( materialInteraction.debounce ) ;
	}
	
	// If the normal is null, then this is not a collision/bounce anymore
	if ( intersection.decomposed[ 0 ].isNull() )
	{
		// Recompose the vector
		this.boundVector.vector.setVector( intersection.decomposed[ 0 ].add( intersection.decomposed[ 1 ] ) ) ;
		
		// use applyInfluence() now...
		this.applyInfluence( materialInteraction , period ) ;
		return ;
	}
	
	// For the entity to not move against the normal
	if ( intersection.decomposed[ 0 ].dot( intersection.normal ) < 0 )
	{
		intersection.decomposed[ 0 ].inv() ;
	}
	
	// Apply normal and tangential bounce rates on the decomposed vectors
	intersection.decomposed[ 0 ].mul( materialInteraction.normalBounceRate ) ;
	intersection.decomposed[ 1 ].mul( materialInteraction.tangentBounceRate ) ;
	
	// Recompose the vector
	this.boundVector.vector.setVector( intersection.decomposed[ 0 ].add( intersection.decomposed[ 1 ] ) ) ;
} ;



Entity.prototype.applyInfluence = function applyInfluence( materialInteraction , period )
{
	// Apply absolute friction first
	if ( materialInteraction.friction )
	{
		//console.log( '\n>>>> yo friction\n>>>>' , materialInteraction.friction , period , materialInteraction.friction * period , this.boundVector.vector ) ;
		this.boundVector.vector.reduceLength( materialInteraction.friction * period ) ;
		//console.log( '<<<<' , this.boundVector.vector ) ;
	}
	
	// Then apply proportional friction (before forces, because they would modify the speed vector)
	if ( materialInteraction.frictionRate )
	{
		this.boundVector.vector.mul( 1 - ( materialInteraction.frictionRate * period ) ) ;
	}
	
	// Apply force (gravity, wind, etc)
	if ( materialInteraction.force )
	{
		this.boundVector.vector.apply( materialInteraction.force , period ) ;
	}
	
	//console.log( '<<<<////' , this.boundVector.vector ) ;
} ;


