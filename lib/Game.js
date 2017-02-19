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



var Team = require( './Team.js' ) ;
var Player = require( './Player.js' ) ;

var physic = require( 'uphysics' ) ;
var Ngev = require( 'nextgen-events' ) ;

var Logfella = require( 'logfella' ) ;
var log = Logfella.global.use( 'soccer' ) ;



function Game() { return Game.create() ; }
Game.prototype = Object.create( Ngev.prototype ) ;
Game.prototype.constructor = Game ;

module.exports = Game ;



Game.create = function create()
{
	var self = Object.create( Game.prototype , {
		world: { value: physic.World.create() , enumerable: true } ,
		materials: { value: {} , enumerable: true } ,
		
		fieldEntities: { value: {} , enumerable: true } ,
		ballEntity: { value: null , writable: true , enumerable: true } ,
		teams: { value: [] , enumerable: true } ,
		
		// Common gravity force
		gravity: { value: physic.dynamics.Gravity.create() , enumerable: true } ,
		
		// Player moves controller
		playerMoves: {
			value: physic.dynamics.TopSpeedLimitController.create( { topSpeedViolationBrake: 12 } ) ,
			enumerable: true
		} ,
		
		// If one day the wind get implemented...
		wind: { value: physic.dynamics.Force.create() , enumerable: true } ,
		
		// Misc data
		frameNumber: { value: 0 , writable: true , enumerable: true } ,
		
		// Things that get exported
		exports: { value: {} , enumerable: true } ,
	} ) ;
	
	self.initMaterials() ;
	self.initField() ;
	self.initBall() ;
	self.initTeams() ;
	
	// Minimalistic mirror of the game state, for IA and GFX client
	self.initExports() ;
	
	return self ;
} ;



Game.prototype.initMaterials = function initMaterials()
{
	// Ground
	this.materials.ground = physic.Material.create( {
		id: 'ground' ,
		isSolid: true
	} ) ;
	
	// Player
	this.materials.player = physic.Material.create( {
		id: 'player' ,
		isSolid: true
	} ) ;
	
	// Ball
	this.materials.ball = physic.Material.create( {
		id: 'ball' ,
		isSolid: true
	} ) ;
	
	// Ball - Ground interactions
	this.materials.ball.interactWith( this.materials.ground , physic.MaterialInteraction.create( {
		hq: true ,
		debounce: 1 ,
		normalBounceRate: 0.7 ,
		tangentBounceRate: 0.85 ,
		//friction: 6
		dynamics: [
			physic.dynamics.ConstantFriction.create( 6 )
		]
	} ) ) ;
	
	// Player - Ball interactions
	this.materials.player.interactWith( this.materials.player , physic.MaterialInteraction.create( {
		hq: true ,
		normalBounceRate: 0.5 ,
		tangentBounceRate: 0.5
	} ) ) ;
	
	this.materials.ball.interactWith( this.materials.player , physic.MaterialInteraction.create( {
		hq: true ,
		normalBounceRate: 0.5 ,
		tangentBounceRate: 0.75
	} ) ) ;
} ;



Game.prototype.initField = function initField()
{
	this.fieldEntities.ground = physic.Entity.create( {
		isStatic: true ,
		material: this.materials.ground ,
		shape: physic.Shape.createPlane( physic.Vector3D( 0 , 0 , 1 ) )
	} ) ;
	
	this.world.addEntity( this.fieldEntities.ground ) ;
} ;



Game.prototype.initBall = function initBall()
{
	this.ballEntity = physic.Entity.create( {
		material: this.materials.ball ,
		shape: physic.Shape.createSphere( 0.15 ) ,
		dynamics: [
			this.gravity ,
			physic.dynamics.LinearFriction.create( 0.15 )
		] ,
		x: 0 ,
		y: 0 ,
		z: 0.15
	} ) ;
	
	this.world.addEntity( this.ballEntity ) ;
} ;



Game.prototype.initTeams = function initTeams()
{
	var i , j , x , y , playerData ;
	
	for ( i = 0 ; i < 2 ; i ++ )
	{
		this.teams[ i ] = Team.create() ;
		
		x = i % 2 ? -10 : 10 ;
		y = -10 ;
		
		for ( j = 0 ; j < 11 ; j ++ )
		{
			playerData = Player.create( {
				stats: {
					topSpeed: 3 ,
					skills: 3 ,
					shootPower: 3 ,
					reaction: 3 ,
					jump: 3 ,
					balance: 3
				}
			} ) ;
			
			this.teams[ i ].playerEntities[ j ] = physic.Entity.create( {
				material: this.materials.player ,
				shape: physic.Shape.createSphere( 0.15 ) ,
				data: playerData ,
				dynamics: [ this.playerMoves ] ,
				x: x ,
				y: y ,
				z: 1
			} ) ;
			
			this.world.addEntity( this.teams[ i ].playerEntities[ j ] ) ;
			
			y += 2 ;
		}
	}
} ;



Game.prototype.loop = function loop()
{
	this.update() ;
	setTimeout( this.loop.bind( this ) , 1000 / 30 ) ;
} ;



Game.prototype.update = function update( period )
{
	this.frameNumber ++ ;
	this.world.update( period ) ;
	this.updateExports() ;
	this.emit( 'frame' , this.exports ) ;
} ;



Game.prototype.initExports = function initExports()
{
	var i , iMax , j , jMax ,
		playersLength ,
		teamsLength = this.teams.length ;
	
	this.exports.frame = 0 ;
	
	this.exports.ball = {
		boundVector: this.ballEntity.boundVector
	} ;
	
	this.exports.teams = [] ;
	
	for ( i = 0 ; i < teamsLength ; i ++ )
	{
		this.exports.teams[ i ] = {
			score: 0 ,
			players: []
		} ;
		
		playersLength = this.teams[ i ].playerEntities.length ;
		
		for ( j = 0 ; j < playersLength ; j ++ )
		{
			this.exports.teams[ i ].players[ j ] = {
				boundVector: this.teams[ i ].playerEntities[ j ].boundVector
			} ;
		}
	}
} ;



Game.prototype.updateExports = function updateExports()
{
	this.exports.frame = this.frame ;
} ;


