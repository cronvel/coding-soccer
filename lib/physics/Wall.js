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


function Wall( params ) { return Wall.create( params ) ; }
module.exports = Wall ;



Wall.create = function create( params )
{
	params = params || {} ;
	
	var self = Object.create( Wall.prototype , {
		// Ball parameters
		ballBounceAbsorption: { value: params.groundNormalBounceAbsorption || 1 , writable: true , enumerable: true } ,
		ballNormalBounceRate: { value: params.groundNormalBounceRate || 0.7 , writable: true , enumerable: true } ,
		ballTangentBounceRate: { value: params.groundTangentBounceRate || 0.85 , writable: true , enumerable: true } ,
		ballFriction: { value: params.groundFriction || 6 , writable: true , enumerable: true } ,
		
		// Player parameters
		playerBounceAbsorption: { value: params.groundNormalBounceAbsorption || 1 , writable: true , enumerable: true } ,
		playerNormalBounceRate: { value: params.groundNormalBounceRate || 0.7 , writable: true , enumerable: true } ,
		playerTangentBounceRate: { value: params.groundTangentBounceRate || 0.85 , writable: true , enumerable: true } ,
		playerFriction: { value: params.groundFriction || 6 , writable: true , enumerable: true } ,
	} ) ;
	
	return self ;
} ;


