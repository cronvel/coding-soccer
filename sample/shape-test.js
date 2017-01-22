
var physic = require( '../lib/physics/physic.js' ) ;


var cubePos = physic.Vector3D( 0 , 0 , 0 ) ;
var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
var spherePos = physic.Vector3D( 0 , 0 , 0 ) ;

var cubeShape = physic.Shape.Box.create( 2 , 2 , 2 ) ;
var boxShape = physic.Shape.Box.create( 3 , 4 , 5 ) ;
var dotShape = physic.Shape.Dot.create() ;
var sphereShape = physic.Shape.Sphere.create( 2 ) ;

/*
console.log( cubeShape ) ;
console.log( dotShape ) ;
//*/

/*
console.log( cubeShape.isOverlapping( cubePos , dotShape , dotPos ) ) ;

dotPos.set( 3 , 0 , 0 ) ;
console.log( cubeShape.isOverlapping( cubePos , dotShape , dotPos ) ) ;
//*/

/*
boxShape = physic.Shape.Box.create( 1 , 5 , 5 ) ;
boxPos.set( 1 , 0 , 0 ) ;
console.log() ;
console.log( cubeShape.isOverlapping( cubePos , boxShape , boxPos ) ) ;
console.log() ;
console.log( boxShape.isOverlapping( boxPos , cubeShape , cubePos ) ) ;
//*/

//*
spherePos.set( 1 , 0 , 0 ) ;
console.log() ;
console.log( cubeShape.isOverlapping( cubePos , sphereShape , spherePos ) ) ;
console.log() ;
console.log( sphereShape.isOverlapping( spherePos , cubeShape , cubePos ) ) ;
//*/


