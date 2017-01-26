
var physic = require( '../lib/physics/physic.js' ) ;


var cubePos = physic.Vector3D( 0 , 0 , 0 ) ;
var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
var spherePos = physic.Vector3D( 0 , 0 , 0 ) ;
var sphere2Pos = physic.Vector3D( 0 , 0 , 0 ) ;

var cubeOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var boxOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var dotOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var sphereOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var sphere2OldPos = physic.Vector3D( 5 , 0 , 0 ) ;

var cubeShape = physic.Shape.Box.create( 2 , 2 , 2 ) ;
var boxShape = physic.Shape.Box.create( 3 , 4 , 5 ) ;
var dotShape = physic.Shape.Dot.create() ;
var sphereShape = physic.Shape.Sphere.create( 2 ) ;
var sphere2Shape = physic.Shape.Sphere.create( 1 ) ;


/*
spherePos.set( 2 , 1 , 0 ) ;
console.log() ;
console.log( sphereShape.getContinuousCollision( spherePos , sphere2Shape , sphere2Pos ) ) ;
console.log() ;
console.log( sphere2Shape.getContinuousCollision( sphere2Pos , sphereShape , spherePos ) ) ;
//*/


//*
sphereOldPos.set( 8 , 8 , 0 ) ;
//sphereOldPos.set( 6 , 0 , 0 ) ;
spherePos.set( 0 , 0 , 0 ) ;
cubeOldPos.set( 0 , 0 , 0 ) ;
cubePos.set( 0 , 0 , 0 ) ;
console.log() ;
console.log( sphereShape.getContinuousCollision( sphereOldPos , spherePos , cubeShape , cubeOldPos , cubePos ) ) ;
console.log() ;
console.log( cubeShape.getContinuousCollision( cubeOldPos , cubePos , sphereShape , sphereOldPos , spherePos ) ) ;
//*/


/*
dotOldPos.set( 8 , 8 , 8 ) ;
dotPos.set( 0 , 0 , 0 ) ;
cubeOldPos.set( 0 , 0 , 0 ) ;
cubePos.set( 0 , 0 , 0 ) ;
console.log( dotShape.getContinuousCollision( dotOldPos , dotPos , cubeShape , cubeOldPos , cubePos ) ) ;
console.log( cubeShape.getContinuousCollision( cubeOldPos , cubePos , dotShape , dotOldPos , dotPos ) ) ;
//*/


/*
boxShape = physic.Shape.Box.create( 0.5 , 0.5 , 0.5 ) ;
boxPos.set( 0.5 , 0.5 , 0.51 ) ;
console.log() ;
console.log( cubeShape.getContinuousCollision( cubePos , boxShape , boxPos ) ) ;
console.log() ;
console.log( boxShape.getContinuousCollision( boxPos , cubeShape , cubePos ) ) ;
//*/


