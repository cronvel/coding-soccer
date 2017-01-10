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



function MaterialInteraction( params ) { return Wall.create( params ) ; }
module.exports = MaterialInteraction ;



MaterialInteraction.create = function create( params )
{
	params = params || {} ;
	
	var self = Object.create( MaterialInteraction.prototype , {
		priority: { value: params.priority || 0 , writable: true , enumerable: true } ,
		normalBounceAbsorption: { value: params.normalBounceAbsorption || 0 , writable: true , enumerable: true } ,
		tangentBounceAbsorption: { value: params.tangentBounceAbsorption || 0 , writable: true , enumerable: true } ,
		normalBounceRate: { value: params.normalBounceRate || 0.7 , writable: true , enumerable: true } ,
		tangentBounceRate: { value: params.tangentBounceRate || 0.85 , writable: true , enumerable: true } ,
		friction: { value: params.friction || 6 , writable: true , enumerable: true } ,
	} ) ;
	
	return self ;
} ;

