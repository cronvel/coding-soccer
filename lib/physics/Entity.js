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

function Entity( params ) { return Entity.create( params ) ; }
module.exports = Entity ;



Entity.create = function create( params )
{
	params = params || {} ;
	
	var self = Object.create( Entity.prototype , {
		isStatic: { value: !! params.isStatic , writable: true , enumerable: true } ,
		is2D: { value: !! params.is2D , writable: true , enumerable: true } ,
		gravityEnabled: { value: !! params.gravityEnabled , writable: true , enumerable: true } ,
		material: { value: params.material , writable: true , enumerable: true } ,
		shape: { value: params.shape , writable: true , enumerable: true } ,
		boundVector: {
			writable: true , enumerable: true ,
			value: new geo.BoundVector3D( new geo.Vector3D( params.x || 0 , params.y || 0 , params.z || 0 ) , new geo.Vector3D( 0 , 0 , 0 ) )
		} ,
		accelVector: { value: new geo.Vector3D( 0 , 0 , 0 ) , writable: true , enumerable: true } ,
		frameInteractions: { value: [] , writable: true , enumerable: true } ,
	} ) ;
	
	return self ;
} ;



Entity.prototype.prepareFrame = function prepareFrame()
{
	this.frameInteractions.length = 0 ;
} ;



Entity.prototype.interaction = function interaction( withEntity )
{
	var interaction , reverseInteraction ;
	
	interaction = this.material.interactions.get( withEntity.material ) ;
	
	// Do nothing if no interactions are possible between those objects
	if ( interaction === undefined ) { return false ; }
	
	reverseInteraction = withEntity.material.interactions.get( this.material ) ;
	
	// Interactions are possible, check if there is a collision
	if ( this.shape.checkCollision( this.boundVector , withEntity.boundVector , withEntity.shape ) )
	{
		console.log( "Collision!" ) ;
	}
} ;


