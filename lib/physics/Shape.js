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



var physic = require( './physic.js' ) ;



/*
	* primitives: array of object, where:
		* type: the type of the primitive
		* ... parameters for this type
	* boundingBox: object having properties: xMin, xMax, yMin, yMax, zMin, zMax
	* omni: omni-present, non-solid and static
	
	For intance only 'sphere' and 'plane' primitives exists.
*/
Shape.create = function create( primitives , boundingBox , omni )
{
	var self = Object.create( Shape.prototype , {
		omni: { value: !! omni , writable: true , enumerable: true } ,
		primitives: { value: primitives , writable: true , enumerable: true } ,
		boundingBox: { value: boundingBox , writable: true , enumerable: true } ,
	} ) ;
	
	return self ;
} ;



Shape.prototype.isIntersectingWith = function isIntersectingWith(
	boundVector , oldBoundVector ,
	withShape , withBoundVector , withOldBoundVector ,
	solid )
{
	var i , iMax , j , jMax , p1 , p2 , result ;
	
	// Omni shapes always intersect, but are forced non-solid
	if ( this.omni || withShape.omni ) { return true ; }
	
	// Filtering out by bounding boxes
	if ( ! this.isBoundingBoxesIntersectingWith( boundVector , oldBoundVector , withShape , withBoundVector , withOldBoundVector ) )
	{
		return false ;
	}
	
	for ( i = 0 , iMax = this.primitives.length ; i < iMax ; i ++ )
	{
		p1 = this.primitives[ i ] ;
		
		for ( j = 0 , jMax = withShape.primitives.length ; j < jMax ; j ++ )
		{
			p2 = withShape.primitives[ j ] ;
			result = lqCollision[ p1.type ][ p2.type ](
				p1 , boundVector , oldBoundVector ,
				p2 , withBoundVector , withOldBoundVector ,
				solid ) ;
			
			if ( result ) { return result ; }
		}
	}
	
	return false ;
} ;



Shape.prototype.isHqIntersectingWith = function isHqIntersectingWith(
	boundVector , oldBoundVector ,
	withShape , withBoundVector , withOldBoundVector ,
	solid )
{
	var i , iMax , j , jMax , p1 , p2 , result ;
	
	// Omni shapes always intersect, but are forced non-solid
	if ( this.omni || withShape.omni ) { return true ; }
	
	// Filtering out by bounding boxes
	if ( ! this.isHqBoundingBoxesIntersectingWith( boundVector , oldBoundVector , withShape , withBoundVector , withOldBoundVector ) )
	{
		return false ;
	}
	
	for ( i = 0 , iMax = this.primitives.length ; i < iMax ; i ++ )
	{
		p1 = this.primitives[ i ] ;
		
		for ( j = 0 , jMax = withShape.primitives.length ; j < jMax ; j ++ )
		{
			p2 = withShape.primitives[ j ] ;
			result = hqCollision[ p1.type ][ p2.type ](
				p1 , boundVector , oldBoundVector ,
				p2 , withBoundVector , withOldBoundVector ,
				solid ) ;
			
			if ( result ) { return result ; }
		}
	}
	
	return false ;
} ;



// Check if bounding boxes are colliding.
// Check just the position.
Shape.prototype.isBoundingBoxesIntersectingWith = function isBoundingBoxesIntersectingWith(
	boundVector , oldBoundVector ,
	withShape , withBoundVector , withOldBoundVector )
{
	return (
		this.boundingBox.xMax + boundVector.position.x >= withShape.boundingBox.xMin + withBoundVector.position.x &&
		this.boundingBox.xMin + boundVector.position.x <= withShape.boundingBox.xMax + withBoundVector.position.x &&
		this.boundingBox.yMax + boundVector.position.y >= withShape.boundingBox.yMin + withBoundVector.position.y &&
		this.boundingBox.yMin + boundVector.position.y <= withShape.boundingBox.yMax + withBoundVector.position.y &&
		this.boundingBox.zMax + boundVector.position.z >= withShape.boundingBox.zMin + withBoundVector.position.z &&
		this.boundingBox.zMin + boundVector.position.z <= withShape.boundingBox.zMax + withBoundVector.position.z
	) ;
} ;



// Check if bounding boxes are colliding
// Check the movement (old position, new position).
Shape.prototype.isHqBoundingBoxesIntersectingWith = function isHqBoundingBoxesIntersectingWith(
	boundVector , oldBoundVector ,
	withShape , withBoundVector , withOldBoundVector )
{
	var minMax = physic.Vector3D.minMax( boundVector.position , oldBoundVector.position ) ;
	var withMinMax = physic.Vector3D.minMax( withBoundVector.position , withOldBoundVector.position ) ;
	
	return (
		this.boundingBox.xMax + minMax.max.x >= withShape.boundingBox.xMin + withMinMax.min.x &&
		this.boundingBox.xMin + minMax.min.x <= withShape.boundingBox.xMax + withMinMax.max.x &&
		this.boundingBox.yMax + minMax.max.y >= withShape.boundingBox.yMin + withMinMax.min.y &&
		this.boundingBox.yMin + minMax.min.y <= withShape.boundingBox.yMax + withMinMax.max.y &&
		this.boundingBox.zMax + minMax.max.z >= withShape.boundingBox.zMin + withMinMax.min.z &&
		this.boundingBox.zMin + minMax.min.z <= withShape.boundingBox.zMax + withMinMax.max.z
	) ;
} ;



var lqCollision = {} ;
lqCollision.sphere = {} ;
lqCollision.plane = {} ;

var hqCollision = {} ;
hqCollision.sphere = {} ;
hqCollision.plane = {} ;



lqCollision.sphere.plane = function(
	spherePrimitive , sphereBoundVector , sphereOldBoundVector ,
	planePrimitive , planeBoundVector , planeOldBoundVector ,
	solid )
{
	// Create the plane geometry
	var plane = physic.Plane3D.fromNormalVectors( planeBoundVector.position , planePrimitive.normal ) ;
	
	// Create the point where the collision may happen
	var point = sphereBoundVector.position.dup().moveAlong( planePrimitive.normal , - spherePrimitive.radius ) ;
	
	// If the test is positive, the sphere is on the outside of the plane
	var intersecting = plane.testVector( point ) <= 0 ;
	
	// Exit now if there is no intersection or if one is non-solid
	if ( ! intersecting || ! solid ) { return intersecting ; }
	
	// Get the contact point
	var contact = plane.intersection( physic.BoundVector3D.fromVectors( point , planePrimitive.normal ) ) ;
	
	return [
		{
			at: contact.dup().moveAlong( planePrimitive.normal , spherePrimitive.radius ) ,
			normal: planePrimitive.normal ,
			decomposed: sphereBoundVector.vector.decompose( planePrimitive.normal )
		} ,
		{
			at: contact ,
			normal: planePrimitive.normal.dup().inv() ,
			decomposed: planeBoundVector.vector.decompose( planePrimitive.normal )
		}
	] ;
} ;



// Reverse of lqCollision.sphere.plane
lqCollision.plane.sphere = function(
	planePrimitive , planeBoundVector ,
	spherePrimitive , sphereBoundVector ,
	solid )
{
	// Create the plane geometry
	var plane = physic.Plane3D.fromNormalVectors( planeBoundVector.position , planePrimitive.normal ) ;
	
	// Create the point where the collision may happen
	var point = sphereBoundVector.position.dup().moveAlong( planePrimitive.normal , - spherePrimitive.radius ) ;
	
	// If the test is positive, the sphere is on the outside of the plane
	var intersecting = plane.testVector( point ) <= 0 ;
	
	// Exit now if there is no intersection or if one is non-solid
	if ( ! intersecting || ! solid ) { return intersecting ; }
	
	// Get the contact point
	var contact = plane.intersection( physic.BoundVector3D.fromVectors( point , planePrimitive.normal ) ) ;
	
	return [
		{
			at: contact ,
			normal: planePrimitive.normal.dup().inv() ,
			decomposed: planeBoundVector.vector.decompose( planePrimitive.normal )
		} ,
		{
			at: contact.dup().moveAlong( planePrimitive.normal , spherePrimitive.radius ) ,
			normal: planePrimitive.normal ,
			decomposed: sphereBoundVector.vector.decompose( planePrimitive.normal )
		}
	] ;
} ;



hqCollision.sphere.plane = function(
	spherePrimitive , sphereBoundVector , sphereOldBoundVector ,
	planePrimitive , planeBoundVector , planeOldBoundVector ,
	solid )
{
	// Create the plane geometry
	var plane = physic.Plane3D.fromNormalVectors( planeBoundVector.position , planePrimitive.normal ) ;
	
	// Create the point where the collision may happen
	var point = sphereBoundVector.position.dup().moveAlong( planePrimitive.normal , - spherePrimitive.radius ) ;
	
	// It's a plane, so only the final point should be tested
	// If the test is positive, the sphere is on the outside of the plane
	var intersecting = plane.testVector( point ) <= 0 ;
	
	// Exit now if there is no intersection or if one is non-solid
	if ( ! intersecting || ! solid ) { return intersecting ; }
	
	// Compute it like if the plane was static: mix its movement with the sphere one
	var vector = physic.Vector3D.fromTo( sphereBoundVector.position , sphereOldBoundVector.position )
		.add( planeBoundVector.position ).sub( planeOldBoundVector.position ) ;
	
	// Fallback to the plane normal if the vector is null or perpendicular
	vector = vector.isNull() || vector.dot( planePrimitive.normal ) === 0 ? planePrimitive.normal : vector
	
	// Get the contact point
	var contact = plane.intersection( physic.BoundVector3D.fromVectors( point , vector ) ) ;
	
	return [
		{
			at: contact.dup().moveAlong( planePrimitive.normal , spherePrimitive.radius ) ,
			normal: planePrimitive.normal ,
			decomposed: sphereBoundVector.vector.decompose( planePrimitive.normal )
		} ,
		{
			at: contact ,
			normal: planePrimitive.normal.dup().inv() ,
			decomposed: planeBoundVector.vector.decompose( planePrimitive.normal )
		}
	] ;
} ;



hqCollision.plane.sphere = function(
	planePrimitive , planeBoundVector , planeOldBoundVector ,
	spherePrimitive , sphereBoundVector , sphereOldBoundVector ,
	solid )
{
	// Create the plane geometry
	var plane = physic.Plane3D.fromNormalVectors( planeBoundVector.position , planePrimitive.normal ) ;
	
	// Create the point where the collision may happen
	var point = sphereBoundVector.position.dup().moveAlong( planePrimitive.normal , - spherePrimitive.radius ) ;
	
	// It's a plane, so only the final point should be tested
	// If the test is positive, the sphere is on the outside of the plane
	var intersecting = plane.testVector( point ) <= 0 ;
	
	// Exit now if there is no intersection or if one is non-solid
	if ( ! intersecting || ! solid ) { return intersecting ; }
	
	// Compute it like if the plane was static: mix its movement with the sphere one
	var vector = physic.Vector3D.fromTo( sphereBoundVector.position , sphereOldBoundVector.position )
		.add( planeBoundVector.position ).sub( planeOldBoundVector.position ) ;
	
	// Fallback to the plane normal if the vector is null or perpendicular
	vector = vector.isNull() || vector.dot( planePrimitive.normal ) === 0 ? planePrimitive.normal : vector
	
	// Get the contact point
	var contact = plane.intersection( physic.BoundVector3D.fromVectors( point , vector ) ) ;
	
	return [
		{
			at: contact ,
			normal: planePrimitive.normal.dup().inv() ,
			decomposed: planeBoundVector.vector.decompose( planePrimitive.normal )
		} ,
		{
			at: contact.dup().moveAlong( planePrimitive.normal , spherePrimitive.radius ) ,
			normal: planePrimitive.normal ,
			decomposed: sphereBoundVector.vector.decompose( planePrimitive.normal )
		}
	] ;
} ;



Shape.Omni = require( './shapes/Omni.js' ) ;
Shape.Sphere = require( './shapes/Sphere.js' ) ;
Shape.Plane = require( './shapes/Plane.js' ) ;

