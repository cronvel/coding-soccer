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



Shape.prototype.checkCollision = function checkCollision( boundVector , againstBoundVector , againstShape )
{
	return this.checkBoundingBoxesCollision( boundVector , againstBoundVector , againstShape ) ;
} ;



Shape.prototype.checkBoundingBoxesCollision = function checkBoundingBoxesCollision( boundVector , againstBoundVector , againstShape )
{
	/*
	return (
		( boundVector.xMin - againstBoundVector.xMax ) * ( boundVector.xMax - againstBoundVector.xMin ) <= 0 &&
		( boundVector.yMin - againstBoundVector.yMax ) * ( boundVector.yMax - againstBoundVector.yMin ) <= 0 &&
		( boundVector.zMin - againstBoundVector.zMax ) * ( boundVector.zMax - againstBoundVector.zMin ) <= 0
	) ;
	*/
	
	// Check collision
	return this.boundingBox.xMax + boundVector.position.x >= againstShape.boundingBox.xMin + againstBoundVector.position.x &&
		this.boundingBox.xMin + boundVector.position.x <= againstShape.boundingBox.xMax + againstBoundVector.position.x &&
		this.boundingBox.yMax + boundVector.position.y >= againstShape.boundingBox.yMin + againstBoundVector.position.y &&
		this.boundingBox.yMin + boundVector.position.y <= againstShape.boundingBox.yMax + againstBoundVector.position.y &&
		this.boundingBox.zMax + boundVector.position.z >= againstShape.boundingBox.zMin + againstBoundVector.position.z &&
		this.boundingBox.zMin + boundVector.position.z <= againstShape.boundingBox.zMax + againstBoundVector.position.z ;
} ;



Shape.Omni = require( './shapes/Omni.js' ) ;
Shape.Sphere = require( './shapes/Sphere.js' ) ;
Shape.Plane = require( './shapes/Plane.js' ) ;

