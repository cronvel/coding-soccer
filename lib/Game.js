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
var physic = require( './physics/physic.js' ) ;

function Game() { return Game.create() ; }
Game.prototype = Object.create( Ngev.prototype ) ;
Game.prototype.constructor = Game ;

module.exports = Game ;



Game.create = function create()
{
	var self = Object.create( Game.prototype , {
		//state: { value: GameState.create() , writable: true , enumerable: true } ,
		world: { value: physic.World.create() , writable: true , enumerable: true } ,
		material: { value: {} , writable: true , enumerable: true } ,
		entity: { value: {} , writable: true , enumerable: true } ,
	} ) ;
	
	self.initEnvironment() ;
	self.initField() ;
	self.initBall() ;
	
	return self ;
} ;



Game.prototype.initEnvironment = function initEnvironment()
{
	this.material.environment = physic.Material.create( {
		id: 'environment' ,
		isSolid: false
	} ) ;
	this.entity.environment = physic.Entity.create( {
		isStatic: true ,
		material: this.material.environment ,
		shape: physic.Shape.Omni.create()
	} ) ;
	this.world.addEntity( this.entity.environment ) ;
} ;



Game.prototype.initField = function initField()
{
	this.material.ground = physic.Material.create( {
		id: 'ground' ,
		isSolid: true
	} ) ;
	this.entity.ground = physic.Entity.create( {
		isStatic: true ,
		material: this.material.ground ,
		shape: physic.Shape.Plane.create( physic.Vector3D( 0 , 0 , 1 ) )
	} ) ;
	this.world.addEntity( this.entity.ground ) ;
} ;



Game.prototype.initBall = function initBall()
{
	this.material.ball = physic.Material.create( {
		id: 'ball' ,
		isSolid: true
	} ) ;
	this.material.ball.interactWith( this.material.environment , physic.MaterialInteraction.create( {
		force: physic.Vector3D( 0 , 0 , -9.8 ) ,	// Gravity
		frictionRate: 0.15
	} ) ) ;
	this.material.ball.interactWith( this.material.ground , physic.MaterialInteraction.create( {
		hq: true ,
		debounce: 1 ,
		normalBounceRate: 0.7 ,
		tangentBounceRate: 0.85 ,
		friction: 6
	} ) ) ;
	this.entity.ball = physic.Entity.create( {
		material: this.material.ball ,
		shape: physic.Shape.Sphere.create( 0.15 )
	} ) ;
	this.world.addEntity( this.entity.ball ) ;
} ;



Game.prototype.loop = function loop()
{
	this.update() ;
	setTimeout( this.loop.bind( this ) , 1000 / 30 ) ;
} ;



Game.prototype.update = function update()
{
	this.world.update( this.state ) ;
	this.emit( 'frame' , this.state ) ;
} ;


