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



var Ngev = require( 'nextgen-events' ) ;
var GameState = require( './GameState.js' ) ;
var Physic = require( './physics/Physic.js' ) ;

function Game() { return Game.create() ; }
Game.prototype = Object.create( Ngev.prototype ) ;
Game.prototype.constructor = Game ;

module.exports = Game ;



Game.create = function create()
{
	var self = Object.create( Game.prototype , {
		//state: { value: GameState.create() , writable: true , enumerable: true } ,
		physic: { value: Physic.create() , writable: true , enumerable: true } ,
		material: { value: {} , writable: true , enumerable: true } ,
		entity: { value: {} , writable: true , enumerable: true } ,
	} ) ;
	
	self.initField() ;
	self.initBall() ;
	
	return self ;
} ;



Game.prototype.initField = function initField()
{
	this.material.ground = Physic.Material.create( { id: 'ground' } ) ;
	this.entity.ground = Physic.Entity.create( {
		isStatic: true ,
		material: this.material.ground ,
		shape: Physic.Shape.Plane.create( Physic.Vector3D( 0 , 0 , 1 ) ) ,
	} ) ;
	this.physic.addEntity( this.entity.ground ) ;
} ;



Game.prototype.initBall = function initBall()
{
	this.material.ball = Physic.Material.create( { id: 'ball' } ) ;
	this.material.ball.interactWith( this.material.ground , Physic.MaterialInteraction.create( {
		normalBounceRate: 0.7 ,
		tangentBounceRate: 0.85 ,
		friction: 6
	} ) ) ;
	this.entity.ball = Physic.Entity.create( {
		gravityEnabled: true ,
		material: this.material.ball ,
		shape: Physic.Shape.Sphere.create( 0.15 )
	} ) ;
	this.physic.addEntity( this.entity.ball ) ;
} ;



Game.prototype.loop = function loop()
{
	this.update() ;
	setTimeout( this.loop.bind( this ) , 1000 / 30 ) ;
} ;



Game.prototype.update = function update()
{
	this.physic.update( this.state ) ;
	this.emit( 'frame' , this.state ) ;
} ;


