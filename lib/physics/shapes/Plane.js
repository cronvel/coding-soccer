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



var Shape = require( '../Shape.js' ) ;
var physic = require( '../physic.js' ) ;

function Plane( normal ) { return Plane.create( normal ) ; }
Plane.prototype = Object.create( Shape.prototype ) ;
Plane.prototype.constructor = Plane ;

module.exports = Plane ;



Plane.create = function create( normal )
{
	var boundingBox = {} ;
	
	normal = normal || physic.Vector3D( 0 , 0 , 1 ) ;
	
	if ( normal.y || normal.z ) { boundingBox.xMin = - Infinity ; boundingBox.xMax = Infinity ; }
	else if ( normal.x > 0 ) { boundingBox.xMin = - Infinity ; boundingBox.xMax = 0 ; }
	else { boundingBox.xMin = 0 ; boundingBox.xMax = Infinity ; }
	
	if ( normal.x || normal.z ) { boundingBox.yMin = - Infinity ; boundingBox.yMax = Infinity ; }
	else if ( normal.y > 0 ) { boundingBox.yMin = - Infinity ; boundingBox.yMax = 0 ; }
	else { boundingBox.yMin = 0 ; boundingBox.yMax = Infinity ; }
	
	if ( normal.x || normal.y ) { boundingBox.zMin = - Infinity ; boundingBox.zMax = Infinity ; }
	else if ( normal.z > 0 ) { boundingBox.zMin = - Infinity ; boundingBox.zMax = 0 ; }
	else { boundingBox.zMin = 0 ; boundingBox.zMax = Infinity ; }
	
	return Shape.create(
		[ { type: 'rectangle' , normal: normal } ] ,
		boundingBox
	) ;
} ;


