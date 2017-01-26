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



var arrayKit = require( 'array-kit' ) ;
var Logfella = require( 'logfella' ) ;
var log = Logfella.global.use( 'physic' ) ;



/*
	Minkowski GJK algorithm resources, for the day I would want to make the switch:
	* http://www.dyn4j.org/2010/04/gjk-gilbert-johnson-keerthi/
*/

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
Shape.create = function create( surfaces , boundingBox , omni , noBackFaceCulling )
{
	var self = Object.create( Shape.prototype , {
		omni: { value: !! omni , writable: true , enumerable: true } ,
		surfaces: { value: surfaces , writable: true , enumerable: true } ,
		vertices: { value: [] , writable: true , enumerable: true } ,
		// edges are segments, a list of BoundVectors
		edges: { value: [] , writable: true , enumerable: true } ,
		noBackFaceCulling: { value: !! noBackFaceCulling , writable: true , enumerable: true } ,
		boundingBox: { value: boundingBox , writable: true , enumerable: true } ,
		surfaceFlags: { value: 0 , writable: true , enumerable: true } ,
		// surfaces that have dynamic vertices
		dynamicSurfaces: { value: [] , writable: true , enumerable: true } ,
	} ) ;
	
	self.init() ;
	
	return self ;
} ;



/*
	* create vertices from faces
	* create edges from faces
*/
Shape.prototype.init = function init()
{
	var i , j , k ,
		slen = this.surfaces.length ,
		edgeVertices ,
		sharedEdgeVertices = new Array( slen ) ,
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
			this.dynamicSurfaces.push( s1 ) ;
			continue ;
		}
		
		// Normalize the plane now:
		// .test() would produce the correct distance (faster)
		s1.surface.normalize() ;
		
		if ( ! sharedEdgeVertices[ i ] ) { sharedEdgeVertices[ i ] = [] ; }
		
		for ( j = i + 1 ; j < slen ; j ++ )
		{
			s2 = this.surfaces[ j ] ;
			
			// For instance, nothing to for non-plane
			if ( s2.type !== physic.PLANE ) { continue ; }
			
			// Parallel planes? skip them!
			if ( s1.surface.isParallelToPlane( s2.surface ) ) { continue ; }
			
			// Reset the edgeVertices
			edgeVertices = sharedEdgeVertices[ i ][ j ] ? sharedEdgeVertices[ i ][ j ].slice() : [] ;
			log.info( "%d %d edgeVertices count: %d" , i , j , edgeVertices.length ) ;
			
			if ( ! sharedEdgeVertices[ j ] ) { sharedEdgeVertices[ j ] = [] ; }
			
			for ( k = j + 1 ; k < slen ; k ++ )
			{
				s3 = this.surfaces[ k ] ;
				
				// At this stage, we do not care about non-plane
				if ( s3.type !== physic.PLANE ) { continue ; }
				
				vertex = s1.surface.threePlanesIntersection( s2.surface , s3.surface ) ;
				
				if ( vertex && Shape.isVertexTouchingVolume( vertex , this.surfaces ) )
				{
					this.vertices.push( vertex ) ;
					edgeVertices.push( vertex ) ;
					
					if ( ! sharedEdgeVertices[ i ][ k ] ) { sharedEdgeVertices[ i ][ k ] = [ vertex ] ; }
					else { sharedEdgeVertices[ i ][ k ].push( vertex ) ; }
					
					if ( ! sharedEdgeVertices[ j ][ k ] ) { sharedEdgeVertices[ j ][ k ] = [ vertex ] ; }
					else { sharedEdgeVertices[ j ][ k ].push( vertex ) ; }
					
					log.info( "Store me baby! (%d,%d) (%d,%d)" , i , k , j , k ) ;
				}
			}
			
			switch ( edgeVertices.length )
			{
				case 0 :
					// infinite edge (line)
					console.log( "Infinite edge (line)" ) ;
					break ;
				case 1 :
					// infinite edge (ray)
					console.log( "Infinite edge (ray)" ) ;
					break ;
				case 2 :
					// regular finite edges (line segment)
					console.log( "Regular finite edges (line segment)" ) ;
					this.edges.push( physic.BoundVector3D.fromTo( edgeVertices[ 0 ] , edgeVertices[ 1 ] ) ) ;
					break ;
				default :
					console.log( "Error: edge with more than 2 vertices (" + edgeVertices.length + ")" ) ;
					break ;
			}
		}
	}
	
	s1 = this.surfaces = outSurfaces ;
	
	log.error( "Created a shape with %d surfaces, %d edges and %d vertices" , this.surfaces.length , this.edges.length , this.vertices.length ) ;
} ;



// Check if a position is inside
Shape.isVertexInsideVolume = function isVertexInsideVolume( vertex , surfaces )
{
	var i , slen = surfaces.length ;
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		if ( ! physic.epsilonLt( surfaces[ i ].surface.test( vertex.x , vertex.y , vertex.z ) , 0 ) )
		{
			return false ;
		}
	}
	
	return !! slen ;
} ;



// Check if a position is inside or touching (on the surface)
Shape.isVertexInsideOrTouchingVolume = function isVertexInsideOrTouchingVolume( vertex , surfaces )
{
	var i , slen = surfaces.length ;
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		if ( ! physic.epsilonLte( surfaces[ i ].surface.test( vertex.x , vertex.y , vertex.z ) , 0 ) )
		{
			return false ;
		}
	}
	
	return !! slen ;
} ;



// Check if a position is touching (on the surface)
Shape.isVertexTouchingVolume = function isVertexTouchingVolume( vertex , surfaces )
{
	var i , slen = surfaces.length , test , touching = false ;
	
	// A position is touching the shape if it has at least one test that is
	// epsilon-equal to zero and no test that is epsilon-greater than zero.
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		test = physic.epsilonZero( surfaces[ i ].surface.test( vertex.x , vertex.y , vertex.z ) ) ;
		if ( test > 0 ) { return false ; }
		if ( test === 0 ) { touching = true ; }
	}
	
	return !! slen ;
} ;



// Add to interaction surfaces all surfaces that are not back-face culled
Shape.prototype.addFrontFaces = function addFrontFaces( surfaces , vertices , vector , reciprocal )
{
	var i , len ;
	
	//if ( diffPosition.isEpsilonNull() )
	if ( vector.isNull() ) { vector = physic.Vector3D( reciprocal ? 1 : -1 , 0 , 0 ) ; }
	else if ( reciprocal ) { vector = vector.dup().inv() ; }
	
	// Add vertices
	for ( i = 0 , len = this.vertices.length ; i < len ; i ++ )
	{
		if ( physic.epsilonGte( this.vertices[ i ].dot( vector ) , 0 ) )
		{
			vertices.push( this.vertices[ i ] ) ;
		}
	}
	
	// Add surfaces
	for ( i = 0 , len = this.surfaces.length ; i < len ; i ++ )
	{
		// Non-plane are always added
		if ( this.surfaces[ i ].type !== physic.PLANE || physic.epsilonGte( this.surfaces[ i ].surface.dot( vector ) , 0 ) )
		{
			surfaces.push( this.surfaces[ i ] ) ;
		}
	}
} ;



Shape.prototype.addDynamicVertices = function addDynamicVertices( vertices , foreignSurfaces , diffPosition , reciprocal )
{
	var i , j , dsurf , fsurf , vertex , delta ,
		dlen = this.dynamicSurfaces.length ,
		flen = foreignSurfaces.length ;
	
	for ( i = 0 ; i < dlen ; i ++ )
	{
		dsurf = this.dynamicSurfaces[ i ] ;
		
		if ( dsurf.type === physic.SPHERE )
		{
			for ( j = 0 ; j < flen ; j ++ )
			{
				fsurf = foreignSurfaces[ j ] ;
				
				if ( fsurf.type === physic.PLANE )
				{
					vertex =
						physic.Vector3D.fromObject( dsurf.surface )
						.moveAlong( fsurf.surface , - dsurf.surface.r ) ;
				}
				else if ( fsurf.type === physic.SPHERE )
				{
					// Only one vertex per sphere pair (since both vertex would fail or succeed simultanously)
					// hence if we are in the reciprocal part of dynamic vertices creation, we can skip that one.
					if ( reciprocal ) { continue ; }
					
					vertex = physic.Vector3D.fromObject( dsurf.surface ) ;
					delta = diffPosition.dup().add( fsurf.surface ) ;
					
					// If delta is null, we use the center of the sphere, if not,
					// we project on the sphere surface, toward the foreign sphere center
					if ( ! delta.isEpsilonNull() )
					{
						vertex.moveAlong( delta , dsurf.surface.r ) ;
					}
				}
				
				console.log( "+Dynamic Vertex:" , vertex ) ;
				vertices.push( vertex ) ;
			}
		}
	}
} ;



// Prepare interaction between 2 shapes
Shape.prototype.prepareInteraction = function prepareInteraction( position , foreignShape , foreignPosition )
{
	// Shorthand to the static object
	var interaction = prepareInteraction.interaction ;
	
	interaction.diffPosition.setFromTo( position , foreignPosition ) ;
	
	if ( ! this.noBackFaceCulling || this.dynamicSurfaces.length )
	{
		// Reset arrays
		interaction.surfaces = interaction.cachedSurfaces ;
		interaction.vertices = interaction.cachedVertices ;
		interaction.cachedSurfaces.length = 0 ;
		interaction.cachedVertices.length = 0 ;
	}
	else
	{
		interaction.surfaces = this.surfaces ;
		interaction.vertices = this.vertices ;
	}
	
	if ( ! foreignShape.noBackFaceCulling || foreignShape.dynamicSurfaces.length )
	{
		// Reset arrays
		interaction.foreignSurfaces = interaction.cachedForeignSurfaces ;
		interaction.foreignVertices = interaction.cachedForeignVertices ;
		interaction.cachedForeignSurfaces.length = 0 ;
		interaction.cachedForeignVertices.length = 0 ;
	}
	else
	{
		interaction.foreignSurfaces = foreignShape.surfaces ;
		interaction.foreignVertices = foreignShape.vertices ;
	}
	
	
	if ( ! this.noBackFaceCulling )
	{
		this.addFrontFaces( interaction.surfaces , interaction.vertices , interaction.diffPosition ) ;
	}
	
	if ( ! foreignShape.noBackFaceCulling )
	{
		foreignShape.addFrontFaces( interaction.foreignSurfaces , interaction.foreignVertices , interaction.diffPosition , true ) ;
	}
	
	if ( this.dynamicSurfaces.length )
	{
		this.addDynamicVertices( interaction.vertices , interaction.foreignSurfaces , interaction.diffPosition ) ;
	}
	
	if ( foreignShape.dynamicSurfaces.length )
	{
		foreignShape.addDynamicVertices( interaction.foreignVertices , interaction.surfaces , interaction.diffPosition , true ) ;
	}
	
	return prepareInteraction.interaction ;
} ;



// Static cached object.
// Avoid massive object creation that would cause GC to kick in often
Shape.prototype.prepareInteraction.interaction = {
	diffPosition: physic.Vector3D( 0 , 0 , 0 ) ,
	surfaces: null ,
	vertices: null ,
	cachedSurfaces: [] ,
	cachedVertices: [] ,
	foreignSurfaces: null ,
	foreignVertices: null ,
	cachedForeignSurfaces: [] ,
	cachedForeignVertices: []
} ;



// Check if a shape is overlapping another
Shape.prototype.isOverlapping = function isOverlapping( position , foreignShape , foreignPosition )
{
	var i , vlen ,
		vertex = Object.create( physic.Vector3D.prototype ) ;
	
	var interaction = this.prepareInteraction( position , foreignShape , foreignPosition ) ;
	
	// Check the foreign vertices against the shape
	for ( i = 0 , vlen = interaction.surfaces.length && interaction.foreignVertices.length ; i < vlen ; i ++ )
	{
		vertex.set3Vectors( interaction.foreignVertices[ i ] , foreignPosition , position ) ;
		
		console.log( '#' + i + 'a:' , interaction.foreignVertices[ i ] , '->' , vertex ) ;
		
		if ( Shape.isVertexInsideVolume( vertex , interaction.surfaces ) ) { return true ; }
	}
	
	// Check the vertices against the foreign shape
	for ( i = 0 , vlen = interaction.foreignSurfaces.length && interaction.vertices.length ; i < vlen ; i ++ )
	{
		vertex.set3Vectors( interaction.vertices[ i ] , position , foreignPosition ) ;
		
		console.log( '#' + i + 'b:' , interaction.vertices[ i ] , '->' , vertex ) ;
		
		if ( Shape.isVertexInsideVolume( vertex , interaction.foreignSurfaces ) ) { return true ; }
	}
	
	return false ;
} ;



// /!\ Where the bounding box test should be done? here? upstream? /!\

// Check if a shape is overlapping another
Shape.prototype.getCollision = function getCollision( position , foreignShape , foreignPosition )
{
	var i , vlen , collision , offset ,
		maxOffset = 0 ,
		vertex = Object.create( physic.Vector3D.prototype ) ;
	
	var interaction = this.prepareInteraction( position , foreignShape , foreignPosition ) ;
	
	var collisions = getCollision.collisions ;
	collisions.length = 0 ;
	
	// Check the vertices against the foreign shape
	for ( i = 0 , vlen = interaction.foreignSurfaces.length && interaction.vertices.length ; i < vlen ; i ++ )
	{
		vertex.set3Vectors( interaction.vertices[ i ] , position , foreignPosition ) ;
		
		console.log( '#' + i + 'a:' , interaction.vertices[ i ] , '->' , vertex ) ;
		
		collision = Shape.getAllVertexCollisions( vertex , interaction.foreignSurfaces , false ) ;
		//console.log( '??' , collision ) ;
		
		if ( collision )
		{
			if ( ( offset = collision[ collision.minIndex ].offset ) > maxOffset )
			{
				maxOffset = offset ;
				collisions.maxIndex = collisions.length ;
			}
			
			collisions.push( collision ) ;
		}
	}
	
	// Check the foreign vertices against the shape
	for ( i = 0 , vlen = interaction.surfaces.length && interaction.foreignVertices.length ; i < vlen ; i ++ )
	{
		vertex.set3Vectors( interaction.foreignVertices[ i ] , foreignPosition , position ) ;
		
		console.log( '#' + i + 'b:' , interaction.foreignVertices[ i ] , '->' , vertex ) ;
		
		collision = Shape.getAllVertexCollisions( vertex , interaction.surfaces , true ) ;
		//console.log( '??' , collision ) ;
		
		if ( collision )
		{
			if ( ( offset = collision[ collision.minIndex ].offset ) > maxOffset )
			{
				maxOffset = offset ;
				collisions.maxIndex = collisions.length ;
			}
			
			collisions.push( collision ) ;
		}
	}
	
	if ( ! collisions.length )
	{
		// No collision!
		return null ;
	}
	else if ( ! maxOffset )
	{
		// Just touching
		return physic.Vector3D( 0 , 0 , 0 ) ;
	}
	
	return this.solveVerticesCollisions( collisions ) ;
} ;

Shape.prototype.getCollision.collisions = [] ;



// Check if a shape is overlapping another
Shape.prototype.getContinuousCollision = function getContinuousCollision(
	oldPosition , position ,
	foreignShape , foreignOldPosition , foreignPosition )
{
	var i , vlen , collision , bestCollision ,
		minT = 2 ;	// minT should be anything greater than 1
	
	// Relative movement
	var trace = physic.BoundVector3D( 0 , 0 , 0 , 0 , 0 , 0 ) ;
	trace.vector.setVector( position ).sub( oldPosition ).add( foreignOldPosition ).sub( foreignPosition ) ;
	
	// Maybe we should fallback too if old positions are already overlapping?
	if ( trace.vector.isNull() )
	{
		console.log( "\n!!! No movement! fallback to the discrete collision! !!!\n" ) ;
		return this.getContinuousCollision( position , foreignShape , foreignPosition ) ;
	}
	
	var interaction = this.prepareInteraction( oldPosition , foreignShape , foreignOldPosition ) ;
	
	var collisions = getContinuousCollision.collisions ;
	collisions.length = 0 ;
	
	// Check the vertices against the foreign shape
	for ( i = 0 , vlen = interaction.foreignSurfaces.length && interaction.vertices.length ; i < vlen ; i ++ )
	{
		trace.position.set3Vectors( interaction.vertices[ i ] , oldPosition , foreignOldPosition ) ;
		
		console.log( '#' + i + 'a:' , interaction.vertices[ i ] , '->' , trace ) ;
		
		collision = Shape.getTraceCollision( trace , interaction.foreignSurfaces , false ) ;
		//console.log( '??' , collision ) ;
		
		if ( collision && collision.t < minT )
		{
			minT = collision.t ;
			bestCollision = collision ;
		}
	}
	
	// Inverse the movement
	trace.vector.inv() ;
	
	// Check the foreign vertices against the shape
	for ( i = 0 , vlen = interaction.surfaces.length && interaction.foreignVertices.length ; i < vlen ; i ++ )
	{
		trace.position.set3Vectors( interaction.foreignVertices[ i ] , foreignOldPosition , oldPosition ) ;
		
		console.log( '#' + i + 'b:' , interaction.foreignVertices[ i ] , '->' , trace ) ;
		
		collision = Shape.getTraceCollision( trace , interaction.surfaces , true ) ;
		//console.log( '??' , collision ) ;
		
		if ( collision && collision.t < minT )
		{
			minT = collision.t ;
			bestCollision = collision ;
		}
	}
	
	return bestCollision ;
} ;

Shape.prototype.getContinuousCollision.collisions = [] ;



/*
	vertex: relative coordinate to the surface space
*/
Shape.getAllVertexCollisions = function getAllVertexCollisions( vertex , surfaces , foreign )
{
	var i , slen = surfaces.length , normal , offset , contact , minOffset = Infinity ;
	
	if ( ! slen ) { return null ; }
	
	var tests = getAllVertexCollisions.tests ;
	tests.length = 0 ;
	
	// First run all tests, early out if one does not pass
	for ( i = 0 ; i < slen ; i ++ )
	{
		tests[ i ] = physic.epsilonZero( surfaces[ i ].surface.test( vertex.x , vertex.y , vertex.z ) ) ;
		if ( tests[ i ] > 0 ) { return null ; }
	}
	
	var collisions = [] ;
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		switch ( surfaces[ i ].type )
		{
			case physic.PLANE :
				// The normal is the surface normal
				normal = physic.Vector3D.fromObject( surfaces[ i ].surface ) ;
				
				// For plane, the 'test' value IS the distance from the surface
				offset = - tests[ i ] ;
				break ;
			
			case physic.SPHERE :
				// The normal is the vector from the sphere center toward the vertex
				normal = physic.Vector3D.fromTo( surfaces[ i ].surface , vertex ).normalize() ;	// MUST BE normalized
				
				// For sphere, the 'test' value is not the distance until normalized
				offset = - surfaces[ i ].surface.normalizeTest( tests[ i ] ) ;
				console.log( "offset:" , offset , "normal:" , normal ) ;
				break ;
		}
		
		// If foreign, reverse the normal: act as if it's the self shape that is moving, not the foreign shape
		if ( foreign ) { normal.inv() ; }
		
		if ( offset < minOffset ) { minOffset = offset ; collisions.minIndex = i ; }
		
		contact = tests[ i ] === 0 ? vertex : vertex.dup().apply( normal , offset ) ;
		// surfaces[ i ].surface.pointProjection( vertex )
		
		collisions[ i ] = {
			//vertex: vertex.dup() ,
			normal: normal ,
			offset: offset ,
			currentOffset: offset ,
			contact: contact ,
			foreign: foreign
		} ;
	}
	
	//collisions.sort( ( a , b ) => a.offset - b.offset ) ;
	
	return collisions ;
} ;

Shape.getAllVertexCollisions.tests = [] ;



/*
	vertex: relative coordinate to the surface space
*/
Shape.getTraceCollision = function getTraceCollision( trace , surfaces , foreign )
{
	var i , slen = surfaces.length , contact , intersection ,
		minT = 2 ,	// anything greater than 1
		normal = Object.create( physic.Vector3D.prototype ) ;
	
	if ( ! slen ) { return null ; }
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		// Get the contact point
		intersection = surfaces[ i ].surface.intersectionTrace( trace ) ;
		
		// Quit now if no intersection for this trace, or if the intersection would happen after
		// the current best candidate, or if is not inside/touching the volume
		if (
			! intersection ||
			intersection.t >= minT ||
			! Shape.isVertexInsideOrTouchingVolume( intersection , surfaces )
		)
		{
			continue ;
		}
		
		// We've got a new best candidate!
		
		switch ( surfaces[ i ].type )
		{
			case physic.PLANE :
				// The normal is *ALWAYS* the surface normal, wherever the contact happend
				normal.setVector( surfaces[ i ].surface ) ;
				break ;
			
			case physic.SPHERE :
				// The normal is the vector from the sphere center toward the contact
				normal.setFromTo( surfaces[ i ].surface , intersection ).normalize() ;	// MUST BE normalized
				break ;
		}
		
		
		// Replace the former candidate
		contact = intersection ;
		minT = contact.t ;
	}
	
	if ( ! contact ) { return null ; }
	
	var displacement = contact.dup().sub( trace.position ).sub( trace.vector ) ;
	//displacement = contact.dup().sub( trace.getEndPoint() ) ;
	
	// If foreign, reverse the normal and the displacement: act as if
	// it's the self shape that is moving, not the foreign shape
	if ( foreign )
	{
		normal.inv() ;
		displacement.inv() ;
	}
	
	return {
		//vertex: vertex.dup() ,
		normal: normal ,
		t: contact.t ,
		//currentT: contactT ,
		contact: contact ,
		displacement: displacement ,
		foreign: foreign
	} ;
} ;



// Produce a displacement vector from the array of array of collisions
Shape.prototype.solveVerticesCollisions = function solveVerticesCollisions( collisions )
{
	var i , iMax , j , jMax , adjustement ,
		vertCollisions , vertSurfCollision ,
		maxVertOffset , minVertSurfOffset ,
		maxVertCollisions , minVertSurfCollision ;
	
	/*
		1\ apply the new global maximum of minimum and remove it
		2\ for each remaining vertex, find if one collision is solved by the displacement
		3\ if so, remove the whole vertex collisions
		4\ if not, compute the remaining offset for each vertex collision and the new minimum
		5\ find the new global maximum of minimum
		6\ repeat until no vertex remains
		
		This works for plane, but it's not so great for sphere, because unlike plane,
		the normal depends on the vertex position.
		Anyway, this will be “good enough” for instance.
	*/
	
	var displacement = solveVerticesCollisions.displacement.set( 0 , 0 , 0 ) ;
	
	while ( collisions.length )
	{
		// Apply
		maxVertCollisions = collisions[ collisions.maxIndex ] ;
		minVertSurfCollision = maxVertCollisions[ maxVertCollisions.minIndex ] ;
		
		displacement.apply( minVertSurfCollision.normal , minVertSurfCollision.currentOffset ) ;
		console.log( "New displacement:" , minVertSurfCollision.currentOffset , "->" , displacement ) ;
		
		// Remove the collision
		//collisions.splice( collisions.maxIndex , 1 ) ;
		arrayKit.delete( collisions , collisions.maxIndex ) ;
		
		// Now find the next vertex needing to move
		maxVertOffset = 0 ;
		
		for ( i = 0 , iMax = collisions.length ; i < iMax ; i ++ )
		{
			vertCollisions = collisions[ i ] ;
			
			minVertSurfOffset = Infinity ;
			
			for ( j = 0 , jMax = vertCollisions.length ; j < jMax ; j ++ )
			{
				vertSurfCollision = vertCollisions[ j ] ;
				adjustement = physic.epsilonZero( vertSurfCollision.normal.dot( displacement ) ) ;
				
				if ( adjustement < 0 )
				{
					// Too bad, the displacement is wrong for this vertex collision!
					// There isn't much to do, just hope that things would be better for another surface
					console.log( '>>> Bad adjustement' ) ;
					continue ;
				}
				
				vertSurfCollision.currentOffset = vertSurfCollision.offset - adjustement ;
				
				if ( vertSurfCollision.currentOffset < minVertSurfOffset )
				{
					minVertSurfOffset = vertSurfCollision.currentOffset ;
					
					// If the previous displacement totally solved our constraint, we should break immediately
					if ( minVertSurfOffset <= 0 ) { break ; }
					
					vertCollisions.minIndex = j ;
				}
			}
			
			if ( minVertSurfOffset === Infinity || minVertSurfOffset <= 0 )
			{
				// This vertex has no adjustement possible OR has already been adjusted by another displacement,
				// remove it and update 'i' for the next iteration.
				//collisions.splice( i , 1 ) ;
				arrayKit.delete( collisions , i ) ;
				i -- ;
				iMax -- ;
			}
			else if ( minVertSurfOffset > maxVertOffset )
			{
				maxVertOffset = minVertSurfOffset ;
				collisions.maxIndex = i ;
			}
		}
	}
	
	return displacement ;
} ;

Shape.prototype.solveVerticesCollisions.displacement = physic.Vector3D( 0 , 0 , 0 ) ;






















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



Shape.Dot = require( './shapes/Dot.js' ) ;
Shape.Sphere = require( './shapes/Sphere.js' ) ;
Shape.Plane = require( './shapes/Plane.js' ) ;

Shape.Box = require( './shapes/Box.js' ) ;

