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
var Physic = require( '../Physic.js' ) ;

function Plane( radius ) { return Plane.create( radius ) ; }
Plane.prototype = Object.create( Shape.prototype ) ;
Plane.prototype.constructor = Plane ;

module.exports = Plane ;



Plane.create = function create( normal )
{
	var boundingBox = {} ;
	
	normal = normal || Physic.Vector3D( 0 , 0 , 1 ) ;
	
	if ( normal.y || normal.z ) { boundingBox.xMin = - Infinity ; boundingBox.xMax = Infinity ; }
	else { boundingBox.xMin = 0 ; boundingBox.xMax = 0 ; }
	
	if ( normal.x || normal.z ) { boundingBox.yMin = - Infinity ; boundingBox.yMax = Infinity ; }
	else { boundingBox.yMin = 0 ; boundingBox.yMax = 0 ; }
	
	if ( normal.x || normal.y ) { boundingBox.zMin = - Infinity ; boundingBox.zMax = Infinity ; }
	else { boundingBox.zMin = 0 ; boundingBox.zMax = 0 ; }
	
	return Shape.create(
		[ { type: 'rectangle' , normal: normal } ] ,
		boundingBox
	) ;
} ;


