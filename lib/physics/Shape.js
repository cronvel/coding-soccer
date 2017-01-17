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

/* jshint -W072 */

"use strict" ;



var Logfella = require( 'logfella' ) ;
var log = Logfella.global.use( 'physic' ) ;



function Shape( primitives , boundingBox , omni ) { return Shape.create( primitives , boundingBox , omni ) ; }
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
	if ( ! this.boundingBox.translatedBoundingBoxesIntersection( boundVector.position , withShape.boundingBox , withBoundVector.position ) )
	{
		log.info( 'filtered out by bbox' ) ;
		return false ;
	}
	
	for ( i = 0 , iMax = this.primitives.length ; i < iMax ; i ++ )
	{
		p1 = this.primitives[ i ] ;
		
		for ( j = 0 , jMax = withShape.primitives.length ; j < jMax ; j ++ )
		{
			p2 = withShape.primitives[ j ] ;
			result = lqCollision[ p1.type ][ p2.type ](
				p1 , boundVector ,
				p2 , withBoundVector ,
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
	
	// Filtering out by moving bounding boxes
	if (
		// create bbox from both position and merges it with its bbox
		! physic.BoundingBox3D.fromTo( boundVector.position , oldBoundVector.position ).add( this.boundingBox )
			.boundingBoxIntersection(
				// create bbox from both position and merges it with its bbox
				physic.BoundingBox3D.fromTo( withBoundVector.position , withOldBoundVector.position ).add( withShape.boundingBox )
			)
	)
	{
		log.info( 'filtered out by HQ bbox' ) ;
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



var lqCollision = {} ;
lqCollision.sphere = {} ;
lqCollision.plane = {} ;

var hqCollision = {} ;
hqCollision.sphere = {} ;
hqCollision.plane = {} ;

/*
	The 'at' value contains the position against a static entity.
	If two dynamic entities collide, it should mix its position and its 'at' value.
*/

lqCollision.sphere.plane = function(
	spherePrimitive , sphereBoundVector ,
	planePrimitive , planeBoundVector ,
	solid )
{
	// Create the plane geometry
	var plane = physic.Plane3D.fromNormalVectors( planeBoundVector.position , planePrimitive.normal ) ;
	
	// Create the point where the collision may happen
	var sphereContact = sphereBoundVector.position.dup().moveAlong( planePrimitive.normal , - spherePrimitive.radius ) ;
	
	// If the test is positive, the sphere is on the outside of the plane
	var test = plane.testVector( sphereContact ) ;
	var intersecting = test <= 0 ;
	
	// Exit now if there is no intersection or if one is non-solid
	if ( ! intersecting || ! solid ) { return intersecting ; }
	
	// Get the plane contact point
	var planeContact ;
	if ( test === 0 ) { planeContact = sphereContact ; }
	else { planeContact = plane.pointProjection( sphereContact ) ; }
	//else { planeContact = plane.intersection( physic.BoundVector3D.fromVectors( sphereContact , planePrimitive.normal ) ) ; }
	
	return [
		// For the plane
		{
			at: planeContact.moveAlong( planePrimitive.normal , spherePrimitive.radius ) ,
			normal: planePrimitive.normal ,
			decomposed: sphereBoundVector.vector.decompose( planePrimitive.normal )
		} ,
		// For the sphere
		{
			at: sphereContact ,
			normal: planePrimitive.normal.dup().inv() ,
			decomposed: planeBoundVector.vector.decompose( planePrimitive.normal )
		}
	] ;
} ;

lqCollision.plane.sphere = function( e1p , e1b , e2p , e2b , s )
{
	var array = lqCollision.sphere.plane( e2p , e2b , e1p , e1b , s ) ;
	var tmp = array[ 1 ] ;
	array[ 1 ] = array[ 0 ] ;
	array[ 0 ] = tmp ;
	return array ;
} ;



hqCollision.sphere.plane = function(
	spherePrimitive , sphereBoundVector , sphereOldBoundVector ,
	planePrimitive , planeBoundVector , planeOldBoundVector ,
	solid )
{
	// Create the plane geometry
	var plane = physic.Plane3D.fromNormalVectors( planeBoundVector.position , planePrimitive.normal ) ;
	
	// Create the point where the collision may happen
	var sphereContact = sphereBoundVector.position.dup().moveAlong( planePrimitive.normal , - spherePrimitive.radius ) ;
	
	// It's a plane, so only the final point should be tested
	// If the test is positive, the sphere is on the outside of the plane
	var test = plane.testVector( sphereContact ) ;
	var intersecting = test <= 0 ;
	
	// Exit now if there is no intersection or if one is non-solid
	if ( ! intersecting || ! solid ) { return intersecting ; }
	
	var planeContact ;
	
	if ( test === 0 )
	{
		planeContact = sphereContact ;
	}
	else
	{
		// Compute it like if the plane was static: mix its movement with the sphere one
		var vector = physic.Vector3D.fromTo( sphereBoundVector.position , sphereOldBoundVector.position )
			.add( planeBoundVector.position ).sub( planeOldBoundVector.position ) ;
		
		// Fallback to the plane normal if the vector is null or perpendicular
		vector = vector.isNull() || vector.dot( planePrimitive.normal ) === 0 ? planePrimitive.normal : vector ;
		
		// Get the contact point
		planeContact = plane.intersection( physic.BoundVector3D.fromVectors( sphereContact , vector ) ) ;
	}
	
	return [
		// For the plane
		{
			at: planeContact.moveAlong( planePrimitive.normal , spherePrimitive.radius ) ,
			normal: planePrimitive.normal ,
			decomposed: sphereBoundVector.vector.decompose( planePrimitive.normal )
		} ,
		// For the sphere
		{
			at: sphereContact ,
			normal: planePrimitive.normal.dup().inv() ,
			decomposed: planeBoundVector.vector.decompose( planePrimitive.normal )
		}
	] ;
} ;

hqCollision.plane.sphere = function( e1p , e1b , e1o , e2p , e2b , e2o , s )
{
	var array = hqCollision.sphere.plane( e2p , e2b , e2o , e1p , e1b , e1o , s ) ;
	var tmp = array[ 1 ] ;
	array[ 1 ] = array[ 0 ] ;
	array[ 0 ] = tmp ;
	return array ;
} ;



lqCollision.sphere.sphere = function(
	s1Primitive , s1BoundVector ,
	s2Primitive , s2BoundVector ,
	solid )
{
	var radius = s1Primitive.radius + s2Primitive.radius ;
	
	// Squared distance
	var squaredDistance = s1BoundVector.position.pointSquaredDistance( s2BoundVector.position ) ;
	
	var diff = physic.Vector3D.fromTo( s1BoundVector.position , s2BoundVector.position ) ;
	
	var test = squaredDistance - radius * radius ;
	
	var intersecting = test <= 0 ;
	
	// Exit now if there is no intersection or if one is non-solid
	if ( ! intersecting || ! solid ) { return intersecting ; }
	
	if ( test === 0 )
	{
		// Useful? or just a micro-optimization?
		return [
			{
				at: s1BoundVector.position.dup() ,
				normal: diff.dup().inv() ,
				decomposed: s1BoundVector.vector.decompose( diff )
			} ,
			{
				at: s2BoundVector.position.dup() ,
				normal: diff ,
				decomposed: s2BoundVector.vector.decompose( diff )
			}
		] ;
	}
	
	// Displacement value
	var displacement = radius - Math.sqrt( squaredDistance ) ;
	
	return [
		// For S1
		{
			at: s1BoundVector.position.dup().moveAlong( diff , - displacement ) ,
			normal: diff.dup().inv() ,
			decomposed: s1BoundVector.vector.decompose( diff )
		} ,
		// For S2
		{
			at: s2BoundVector.position.dup().moveAlong( diff , displacement ) ,
			normal: diff ,
			decomposed: s2BoundVector.vector.decompose( diff )
		}
	] ;
} ;



hqCollision.sphere.sphere = function(
	s1Primitive , s1BoundVector , s1OldBoundVector ,
	s2Primitive , s2BoundVector , s2OldBoundVector ,
	solid )
{
	// We will make it as if it was a big static sphere and a moving point, i.e. a line
	var radius = s1Primitive.radius + s2Primitive.radius ;
	var sphere = physic.Sphere3D( s1BoundVector.position , radius ) ;
	
	// Fake old position
	var segmentOldPos = s2OldBoundVector.position.dup().add( s1BoundVector.position ).sub( s1OldBoundVector.position ) ;
	//log.error( 'Fake old pos: %Y %Y %Y %Y' , segmentOldPos , s2OldBoundVector.position , s1BoundVector.position , s1OldBoundVector.position ) ;
	
	if ( sphere.testVector( segmentOldPos ) <= 0 )
	{
		// The old position was already inside, move it on the sphere's surface
		segmentOldPos = sphere.pointProjection( segmentOldPos ) ;
	}
	
	// We use the fake old position as the target point
	var segment = physic.BoundVector3D.fromTo( s2BoundVector.position , segmentOldPos ) ;
	log.error( 'Fake segment: %Y' , segment ) ;
	
	var intersectionArray = sphere.intersection( segment ) ;
	log.error( 'Intersection array: %Y' , intersectionArray ) ;
	
	// Check if the intersection is on the segment (faster than performing .isOnLineSegment(),
	// since it would check for the line too: a fact we already know)
	intersectionArray = intersectionArray.filter( e => segment.isInBounds( e ) ) ;
	
	var intersection ;
	
	if ( ! intersectionArray.length )
	{
		return false ;
	}
	else if ( intersectionArray.length === 1 ||
		segmentOldPos.pointSquaredDistance( intersectionArray[ 0 ] ) <=
		segmentOldPos.pointSquaredDistance( intersectionArray[ 1 ] ) )
	{
		intersection = intersectionArray[ 0 ] ;
	}
	else
	{
		intersection = intersectionArray[ 1 ] ;
	}
	
	// Exit now if non-solid
	if ( ! solid ) { return true ; }
	
	var normal = physic.Vector3D.fromTo( s1BoundVector.position , intersection ) ;
	
	return [
		// For S1
		{
			at: s1BoundVector.position.dup().add( s1BoundVector.position ).sub( intersection ) ,
			normal: normal.dup().inv() ,
			decomposed: s1BoundVector.vector.decompose( normal )
		} ,
		// For S2
		{
			at: intersection ,
			normal: normal ,
			decomposed: s2BoundVector.vector.decompose( normal )
		}
	] ;
} ;



Shape.Omni = require( './shapes/Omni.js' ) ;
Shape.Sphere = require( './shapes/Sphere.js' ) ;
Shape.Plane = require( './shapes/Plane.js' ) ;

