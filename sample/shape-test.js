
var physic = require( '../lib/physics/physic.js' ) ;


var cubePos = physic.Vector3D( 0 , 0 , 0 ) ;
var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;

var cubeShape = physic.Shape.Box.create( 2 , 2 , 2 ) ;
var boxShape = physic.Shape.Box.create( 3 , 4 , 5 ) ;
var dotShape = physic.Shape.Dot.create() ;

/*
console.log( cubeShape ) ;
console.log( dotShape ) ;
//*/

//console.log( cubeShape.isOverlapping( cubePos , dotShape , dotPos ) ) ;

dotPos.set( 3 , 0 , 0 ) ;
//console.log( cubeShape.isOverlapping( cubePos , dotShape , dotPos ) ) ;


//boxPos.set( 2.4 , 0 , 0 ) ;
boxShape = physic.Shape.Box.create( 5 , 5 , 5 ) ;
console.log() ;
console.log( cubeShape.isOverlapping( cubePos , boxShape , boxPos ) ) ;
console.log() ;
console.log( boxShape.isOverlapping( boxPos , cubeShape , cubePos ) ) ;
