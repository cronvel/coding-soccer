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



function Shape( primitives , boundingBoxes ) { return Shape.create( primitives , boundingBoxes ) ; }
module.exports = Shape ;



/*
	* primitives: array of object, where:
		* type: the type of the primitive
		* ... parameters for this type
	boundingBox: object having properties: xMin, xMax, yMin, yMax, zMin, zMax
	
	For intance only 'sphere' and 'rectangle' primitives exists.
*/
Shape.create = function create( primitives , boundingBox )
{
	var self = Object.create( Shape.prototype , {
		primitives: { value: primitives , writable: true , enumerable: true } ,
		boundingBox: { value: boundingBox , writable: true , enumerable: true } ,
	} ) ;
	
	return self ;
} ;



Shape.prototype.isCollidingWith = function isCollidingWith( boundVector , withBoundVector , withShape )
{
	// Filtering out by bounding boxes
	if ( ! this.isBoundingBoxesCollidingWith( boundVector , withBoundVector , withShape ) ) { return false ; }
	
	
	
	return true ;
} ;



// Check if bounding boxes are colliding
Shape.prototype.isBoundingBoxesCollidingWith = function isBoundingBoxesCollidingWith( boundVector , withBoundVector , withShape )
{
	return this.boundingBox.xMax + boundVector.position.x >= withShape.boundingBox.xMin + withBoundVector.position.x &&
		this.boundingBox.xMin + boundVector.position.x <= withShape.boundingBox.xMax + withBoundVector.position.x &&
		this.boundingBox.yMax + boundVector.position.y >= withShape.boundingBox.yMin + withBoundVector.position.y &&
		this.boundingBox.yMin + boundVector.position.y <= withShape.boundingBox.yMax + withBoundVector.position.y &&
		this.boundingBox.zMax + boundVector.position.z >= withShape.boundingBox.zMin + withBoundVector.position.z &&
		this.boundingBox.zMin + boundVector.position.z <= withShape.boundingBox.zMax + withBoundVector.position.z ;
} ;



Shape.Omni = require( './shapes/Omni.js' ) ;
Shape.Sphere = require( './shapes/Sphere.js' ) ;
Shape.Plane = require( './shapes/Plane.js' ) ;

