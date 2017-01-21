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



/*
	Shapes are like “Brushes”: they are convex CSG intersection of basic primitives:
	* plane: separate the space in two side: the positive side (outside) and the negative side (inside)
	* cylinder: infinite tube, separate into the inner (inside) and the outer (outside)
	* sphere: separate into the inner (inside) and the outer (outside) of the sphere
*/



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
Shape.create = function create( surfaces , boundingBox , omni )
{
	var self = Object.create( Shape.prototype , {
		omni: { value: !! omni , writable: true , enumerable: true } ,
		surfaces: { value: surfaces , writable: true , enumerable: true } ,
		vertices: { value: [] , writable: true , enumerable: true } ,
		// edges are only useful for dynamic vertices, when planes and non-planes are mixed - not coded ATM
		edges: { value: [] , writable: true , enumerable: true } ,
		hasDynamicVertices: { value: false , writable: true , enumerable: true } ,
		boundingBox: { value: boundingBox , writable: true , enumerable: true } ,
		surfaceFlags: { value: 0 , writable: true , enumerable: true } ,
	} ) ;
	
	self.init() ;
	
	return self ;
} ;



Shape.prototype.init = function init()
{
	var i , j , k ,
		slen = this.surfaces.length ,
		outSurfaces = [] ,
		s1 , s2 , s3 , vertex ;
	
	// Reset vertices
	this.vertices.length = 0 ;
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		s1 = this.surfaces[ i ] ;
		
		this.surfaceFlags &= s1.type ;
		
		if ( s1.type === physic.DOT )
		{
			// Filter them out of surfaces, move them to vertices
			this.vertices.push( s1.surface.dup() ) ;
			continue ;
		}
		
		outSurfaces.push( s1 ) ;
		
		if ( s1.type !== physic.PLANE )
		{
			// For instance, we do not create special edges
			this.hasDynamicVertices = true ;
			continue ;
		}
		
		for ( j = i + 1 ; j < slen ; j ++ )
		{
			s2 = this.surfaces[ j ] ;
			
			// For instance, we do not create special edges
			if ( s2.type !== physic.PLANE ) { continue ; }
			
			for ( k = j + 1 ; k < slen ; k ++ )
			{
				s3 = this.surfaces[ k ] ;
				
				// At this stage, we do not care about non-plane
				if ( s3.type !== physic.PLANE ) { continue ; }
				
				vertex = s1.surface.threePlanesIntersection( s2.surface , s3.surface ) ;
				if ( vertex && this.isVertexTouching( vertex ) ) { this.vertices.push( vertex ) ; }
			}
		}
	}
	
	s1 = this.surfaces = outSurfaces ;
} ;



// Check if a position is inside
Shape.prototype.isVertexInside = function isVertexInside( vertex )
{
	var i , slen = this.surfaces.length ;
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		if ( ! physic.epsilonLt( this.surfaces[ i ].surface.test( vertex.x , vertex.y , vertex.z ) , 0 ) )
		{
			return false ;
		}
	}
	
	return true ;
} ;



// Check if a position is inside or touching (on the surface)
Shape.prototype.isVertexInsideOrTouching = function isVertexInsideOrTouching( vertex )
{
	var i , slen = this.surfaces.length ;
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		if ( ! physic.epsilonLte( this.surfaces[ i ].surface.test( vertex.x , vertex.y , vertex.z ) , 0 ) )
		{
			return false ;
		}
	}
	
	return true ;
} ;



// Check if a position is touching (on the surface)
Shape.prototype.isVertexTouching = function isVertexTouching( vertex )
{
	var i , slen = this.surfaces.length , test , touching = false ;
	
	// A position is touching the shape if it has at least one test that is
	// epsilon-equal to zero and no test that is epsilon-greater than zero.
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		test = physic.epsilonZero( this.surfaces[ i ].surface.test( vertex.x , vertex.y , vertex.z ) ) ;
		if ( test > 0 ) { return false ; }
		if ( test === 0 ) { touching = true ; }
	}
	
	return touching ;
} ;



// Check if a shape is overlapping another
Shape.prototype.isOverlapping = function isOverlapping( position , withShape , withShapePosition )
{
	var i , vlen , vertex = Object.create( physic.Vector3D.prototype ) ;
	
	// A position is touching the shape if it has at least one test that is
	// epsilon-equal to zero and no test that is epsilon-greater than zero.
	
	// Check the vertices against the foreign shape
	for ( i = 0 , vlen = this.vertices.length ; i < vlen ; i ++ )
	{
		vertex.set3Vectors( this.vertices[ i ] , position , withShapePosition ) ;
		if ( withShape.isVertexInside( vertex ) ) { return true ; }
	}
	
	// Check the foreign vertices against the shape
	for ( i = 0 , vlen = withShape.vertices.length ; i < vlen ; i ++ )
	{
		vertex.setVector( withShape.vertices[ i ] , withShapePosition , position ) ;
		if ( this.isVertexInside( vertex ) ) { return true ; }
	}
	
	return false ;
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
		//log.info( 'filtered out by bbox' ) ;
		return false ;
	}
	
	for ( i = 0 , iMax = this.surfaces.length ; i < iMax ; i ++ )
	{
		p1 = this.surfaces[ i ] ;
		
		for ( j = 0 , jMax = withShape.surfaces.length ; j < jMax ; j ++ )
		{
			p2 = withShape.surfaces[ j ] ;
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
		//log.info( 'filtered out by HQ bbox' ) ;
		return false ;
	}
	
	for ( i = 0 , iMax = this.surfaces.length ; i < iMax ; i ++ )
	{
		p1 = this.surfaces[ i ] ;
		
		for ( j = 0 , jMax = withShape.surfaces.length ; j < jMax ; j ++ )
		{
			p2 = withShape.surfaces[ j ] ;
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
	Return values:
	* false: no collision and no contact between the entities
	* true:
		* if solid: this is a tangential contact, i.e. entity are touching each others but not colliding,
		  friction and other environmental effect applies but not bounces
		* if non-solid: entity are touching or inside each others
	* array: the two entities collide each others.
	  The array contains 2 objects, one for each entities, where:
		* at: it contains the position where the collision would had happend if against a static entity.
		  If two dynamic entities collide, the result should mix its current position and its 'at' value.
		* normal: the normal for that collision
		* decomposed: the speed vector of the entity decomposed along the normal and the tangential plane
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
	var test = physic.epsilonZero( plane.testVector( sphereContact ) ) ;
	
	// Exit now if there is no collision or if one entity is non-solid
	if ( test >= 0 || ! solid ) { return test <= 0 ; }
	
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
	var test = physic.epsilonZero( plane.testVector( sphereContact ) ) ;
	
	// Exit now if there is no collision or if one entity is non-solid
	if ( test >= 0 || ! solid ) { return test <= 0 ; }
	
	var planeContact ;
	
	// Compute it like if the plane was static: mix its movement with the sphere one
	var vector = physic.Vector3D.fromTo( sphereBoundVector.position , sphereOldBoundVector.position )
		.add( planeBoundVector.position ).sub( planeOldBoundVector.position ) ;
	
	// Fallback to the plane normal if the vector is null or perpendicular
	vector = vector.isNull() || vector.dot( planePrimitive.normal ) === 0 ? planePrimitive.normal : vector ;
	
	// Get the contact point
	planeContact = plane.intersection( physic.BoundVector3D.fromVectors( sphereContact , vector ) ) ;
	
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
	
	var test = physic.epsilonZero( squaredDistance - radius * radius ) ;
	
	// Exit now if there is no collision or if one entity is non-solid
	if ( test >= 0 || ! solid ) { return test <= 0 ; }
	
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
	var wasInside = false ;
	
	// We will make it as if it was a big static sphere and a moving point, i.e. a line
	var radius = s1Primitive.radius + s2Primitive.radius ;
	var sphere = physic.Sphere3D.fromVectorRadius( s1BoundVector.position , radius ) ;
	
	// Fake old position
	var segmentOldPos = s2OldBoundVector.position.dup().add( s1BoundVector.position ).sub( s1OldBoundVector.position ) ;
	//log.error( 'Fake old pos: %Y %Y %Y %Y' , segmentOldPos , s2OldBoundVector.position , s1BoundVector.position , s1OldBoundVector.position ) ;
	
	if ( physic.epsilonLt( sphere.testVector( segmentOldPos ) , 0 ) )
	{
		// The old position was already inside, move it on the sphere's surface
		segmentOldPos = sphere.pointProjection( segmentOldPos ) ;
		wasInside = true ;
	}
	
	// We use the fake old position as the target point
	var segment = physic.BoundVector3D.fromTo( s2BoundVector.position , segmentOldPos ) ;
	//log.error( 'Fake segment: %Y' , segment ) ;
	
	var intersectionArray = sphere.intersection( segment ) ;
	//log.error( 'Intersection array: %Y' , intersectionArray ) ;
	
	// No intersection
	if ( ! intersectionArray ) { return false ; }
	
	// Check if the intersection is on the segment (faster than performing .isOnLineSegment(),
	// since it would check for the line too: a fact already known).
	// Also, if the entity is moving outward, we check for exclusive bounds.
	if ( wasInside || physic.epsilonGt( segment.vector.dot( physic.Vector3D.fromTo( sphere , segmentOldPos ) ) , 0 ) )
	{
		intersectionArray = intersectionArray.filter( e => segment.isInBounds( e ) ) ;
	}
	else
	{
		//log.fatal( "Exclusive bounds filtering, segment: %Y %Y %Y" , segment.position , segment.getEndPoint() , segmentOldPos ) ;
		intersectionArray = intersectionArray.filter( e => segment.isInExclusiveBounds( e ) ) ;
	}
	
	//log.error( 'Filtered intersection array: %Y' , intersectionArray ) ;
	
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
Shape.Dot = require( './shapes/Dot.js' ) ;
Shape.Sphere = require( './shapes/Sphere.js' ) ;
Shape.Plane = require( './shapes/Plane.js' ) ;

Shape.Box = require( './shapes/Box.js' ) ;

