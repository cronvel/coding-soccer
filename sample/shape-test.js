
var physic = require( '../lib/physics/physic.js' ) ;


cubePos = physic.Vector3D( 0 , 0 , 0 ) ;
dotPos = physic.Vector3D( 0 , 0 , 0 ) ;

var cubeShape = physic.Shape.Box.create( 2 , 2 , 2 ) ;
var dotShape = physic.Shape.Dot.create() ;

/*
console.log( cubeShape ) ;
console.log( dotShape ) ;
//*/

console.log( cubeShape.isOverlapping( cubePos , dotShape , dotPos ) ) ;

dotPos.set( 3 , 0 , 0 ) ;
console.log( cubeShape.isOverlapping( cubePos , dotShape , dotPos ) ) ;
