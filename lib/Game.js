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
var physic = require( 'uphysics' ) ;

var Logfella = require( 'logfella' ) ;
var log = Logfella.global.use( 'soccer' ) ;



function Game() { return Game.create() ; }
Game.prototype = Object.create( Ngev.prototype ) ;
Game.prototype.constructor = Game ;

module.exports = Game ;



Game.create = function create()
{
	var self = Object.create( Game.prototype , {
		//state: { value: GameState.create() , writable: true , enumerable: true } ,
		world: { value: physic.World.create() , enumerable: true } ,
		material: { value: {} , enumerable: true } ,
		entity: { value: {} , enumerable: true } ,
		
		// Common gravity force
		gravity: { value: physic.dynamics.Gravity.create() , enumerable: true } ,
		
		// If one day the wind get implemented...
		wind: { value: physic.dynamics.Force.create() , enumerable: true } ,
	} ) ;
	
	self.initField() ;
	self.initPlayer() ;
	self.initBall() ;
	
	return self ;
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
		shape: physic.Shape.createPlane( physic.Vector3D( 0 , 0 , 1 ) )
	} ) ;
	
	this.world.addEntity( this.entity.ground ) ;
} ;



Game.prototype.initPlayer = function initPlayer()
{
	this.material.player = physic.Material.create( {
		id: 'player' ,
		isSolid: true
	} ) ;
	
	this.material.player.interactWith( this.material.player , physic.MaterialInteraction.create( {
		//hq: true ,
		normalBounceRate: 0.5 ,
		tangentBounceRate: 0.5
	} ) ) ;
	
	this.entity.player = physic.Entity.create( {
		material: this.material.player ,
		shape: physic.Shape.createSphere( 0.15 ) ,
		dynamics: [
			physic.dynamics.TopSpeedLimitController.create( {
				topSpeed: 8.5 ,
				maxAcceleration: 6.5 ,
				topSpeedViolationBrake: 12
			} )
		]
	} ) ;
	
	this.world.addEntity( this.entity.player ) ;
} ;



Game.prototype.initBall = function initBall()
{
	this.material.ball = physic.Material.create( {
		id: 'ball' ,
		isSolid: true
	} ) ;
	
	this.material.ball.interactWith( this.material.ground , physic.MaterialInteraction.create( {
		hq: true ,
		debounce: 1 ,
		normalBounceRate: 0.7 ,
		tangentBounceRate: 0.85 ,
		friction: 6
	} ) ) ;
	
	//*
	this.material.ball.interactWith( this.material.player , physic.MaterialInteraction.create( {
		hq: true ,
		normalBounceRate: 0.5 ,
		tangentBounceRate: 0.75
	} ) ) ;
	//*/
	
	this.entity.ball = physic.Entity.create( {
		material: this.material.ball ,
		shape: physic.Shape.createSphere( 0.15 ) ,
		dynamics: [
			this.gravity ,
			physic.dynamics.ProportionalFriction.create( 0.15 )
		]
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


