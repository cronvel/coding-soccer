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



function Game( params ) { return Game.create( params ) ; }
Game.prototype = Object.create( Ngev.prototype ) ;
Game.prototype.constructor = Game ;

module.exports = Game ;



Game.create = function create( params )
{
	params = params || {} ;
	
	var self = Object.create( Game.prototype , {
		world: { value: physic.World.create() , enumerable: true } ,
		materials: { value: {} , enumerable: true } ,
		
		field: { value: {} , enumerable: true } ,
		
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
		playerFacing: {
			value: require( './physic/PlayerFacing.js' ).create( { followMaxSpeed: 3 } ) ,
			enumerable: true
		} ,
		
		// If one day the wind get implemented...
		wind: { value: physic.dynamics.Force.create() , enumerable: true } ,
		
		// Misc data
		frameNumber: { value: 0 , writable: true , enumerable: true } ,
		
		// Things that get exported
		parameterExports: { value: {} , enumerable: true } ,
		exports: { value: {} , enumerable: true } ,
	} ) ;
	
	self.initFieldDimensions( params ) ;
	
	self.initMaterials() ;
	self.initField() ;
	self.initBall() ;
	self.initTeams() ;
	
	// Minimalistic mirror of game parameters, for AI and GFX clients
	self.buildParameterExports() ;
	// Minimalistic mirror of the game state, for AI and GFX clients
	self.prepareExports() ;
	
	return self ;
} ;



Game.prototype.initFieldDimensions = function initFieldDimensions( params )
{
	var field = this.field ;
	
	// Between 90 and 120, 105 for international match
	field.length = params.fieldLength || 90 ;
	
	// Between 45 and 90, 68 for international match
	field.width = params.fieldWidth || 60 ;
	
	// Inner area (play area)
	field.inner = physic.BoundingBox2D( - field.length / 2 , field.length / 2 , - field.width / 2 , field.width / 2 ) ;
	
	// Extra length after the goal line, before the invisible wall
	field.extraLength = 5 ;
	
	// Extra width after the throw-in line, before the invisible wall
	field.extraWidth = 5 ;
	
	// Outer area (surrounded by invisible wall)
	field.outer = physic.BoundingBox2D(
		- field.length / 2 - field.extraLength ,
		field.length / 2 + field.extraLength ,
		- field.width / 2 - field.extraWidth ,
		field.width / 2 + field.extraWidth
	) ;
	
	// Left side
	field.leftSide = physic.BoundingBox2D( - field.length / 2 , 0 , - field.width / 2 , field.width / 2 ) ;
	
	// Right side
	field.rightSide = physic.BoundingBox2D( 0 , field.length / 2 , - field.width / 2 , field.width / 2 ) ;
	
	// Kick-off point and circle
	field.kickOff = physic.Circle2D( 0 , 0 , 9.15 ) ;
	
	// Goal dimensions
	field.goalWidth = 7.32 ;
	field.goalHeight = 2.44 ;
	field.goalDepth = 2 ;
	
	// Left inner goal
	field.leftGoal = physic.BoundingBox3D(
		- field.length / 2 - field.goalDepth ,
		- field.length / 2 ,
		- field.goalWidth / 2 ,
		field.goalWidth / 2 ,
		0 ,
		field.goalHeight
	) ;
	
	// Right inner goal
	field.rightGoal = physic.BoundingBox3D(
		field.length / 2 ,
		field.length / 2 + field.goalDepth ,
		- field.goalWidth / 2 ,
		field.goalWidth / 2 ,
		0 ,
		field.goalHeight
	) ;
	
	// Goal area
	field.goalAreaWidth = field.goalWidth + 2 * 5.5 ;
	field.goalAreaLength = 5.5 ;
	
	// Left goal area
	field.leftGoalArea = physic.BoundingBox2D(
		- field.length / 2 ,
		- field.length / 2 + field.goalAreaLength ,
		- field.goalAreaWidth / 2 ,
		field.goalAreaWidth / 2
	) ;
	
	// Right goal area
	field.rightGoalArea = physic.BoundingBox2D(
		field.length / 2 - field.goalAreaLength ,
		field.length / 2 ,
		- field.goalAreaWidth / 2 ,
		field.goalAreaWidth / 2
	) ;
	
	// Penalty
	field.penaltyDistance = 11 ;
	
	// Left penalty point and arc
	field.leftPenalty = physic.Circle2D( - field.length / 2 + field.penaltyDistance , 0 , 9.15 ) ;
	field.leftPenalty.startDeg = -60 ;
	field.leftPenalty.endDeg = 60 ;
	
	// Right penalty point and arc
	field.rightPenalty = physic.Circle2D( field.length / 2 - field.penaltyDistance , 0 , 9.15 ) ;
	field.rightPenalty.startDeg = 120 ;
	field.rightPenalty.endDeg = 240 ;
	
	// Penalty area
	field.penaltyAreaWidth = field.goalAreaWidth + 2 * 11 ;
	field.penaltyAreaLength = field.goalAreaLength + 11 ;
	
	// Left penalty area
	field.leftPenaltyArea = physic.BoundingBox2D(
		- field.length / 2 ,
		- field.length / 2 + field.penaltyAreaLength ,
		- field.penaltyAreaWidth / 2 ,
		field.penaltyAreaWidth / 2
	) ;
	
	// Right penalty area
	field.rightPenaltyArea = physic.BoundingBox2D(
		field.length / 2 - field.penaltyAreaLength ,
		field.length / 2 ,
		- field.penaltyAreaWidth / 2 ,
		field.penaltyAreaWidth / 2
	) ;
	
	// Corner
	field.cornerArcRadius = 1 ;
	
	// Bottom-left corner and arc
	field.bottomLeftCorner = physic.Circle2D( - field.length / 2 , - field.width / 2 , field.cornerArcRadius ) ;
	field.bottomLeftCorner.startDeg = 0 ;
	field.bottomLeftCorner.endDeg = 90 ;
	
	// Top-left corner and arc
	field.topLeftCorner = physic.Circle2D( - field.length / 2 , field.width / 2 , field.cornerArcRadius ) ;
	field.topLeftCorner.startDeg = -90 ;
	field.topLeftCorner.endDeg = 0 ;
	
	// Bottom-right corner and arc
	field.bottomRightCorner = physic.Circle2D( field.length / 2 , - field.width / 2 , field.cornerArcRadius ) ;
	field.bottomRightCorner.startDeg = 90 ;
	field.bottomRightCorner.endDeg = 180 ;
	
	// Top-right corner and arc
	field.topRightCorner = physic.Circle2D( field.length / 2 , field.width / 2 , field.cornerArcRadius ) ;
	field.topRightCorner.startDeg = 180 ;
	field.topRightCorner.endDeg = 270 ;
} ;



Game.prototype.initMaterials = function initMaterials()
{
	// Ground
	this.materials.ground = physic.Material.create( {
		id: 'ground' ,
		isSolid: true
	} ) ;
	
	// For the goal posts
	this.materials.post = physic.Material.create( {
		id: 'post' ,
		isSolid: true
	} ) ;
	
	// For the goal bar
	this.materials.bar = physic.Material.create( {
		id: 'bar' ,
		isSolid: true
	} ) ;
	
	// Goal Net
	this.materials.net = physic.Material.create( {
		id: 'net' ,
		isSolid: true
	} ) ;
	
	// Wall: delimit the outer area
	this.materials.wall = physic.Material.create( {
		id: 'wall' ,
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
		dynamics: [
			physic.dynamics.ConstantFriction.create( 6 )
		]
	} ) ) ;
	
	// Ball - Goal Post interactions
	this.materials.ball.interactWith( this.materials.post , physic.MaterialInteraction.create( {
		hq: true ,
		debounce: 0 ,
		normalBounceRate: 0.8 ,
		tangentBounceRate: 0.9 ,
		dynamics: [
			physic.dynamics.ConstantFriction.create( 6 )
		]
	} ) ) ;
	
	// Ball - Goal Bar interactions
	this.materials.ball.interactWith( this.materials.bar , physic.MaterialInteraction.create( {
		hq: true ,
		debounce: 0 ,
		normalBounceRate: 0.8 ,
		tangentBounceRate: 0.9 ,
		dynamics: [
			physic.dynamics.ConstantFriction.create( 6 )
		]
	} ) ) ;
	
	// Ball - Player interactions
	this.materials.ball.interactWith( this.materials.player , physic.MaterialInteraction.create( {
		hq: true ,
		normalBounceRate: 0.5 ,
		tangentBounceRate: 0.75
	} ) ) ;
	
	// Player - Goal post interactions
	this.materials.player.interactWith( this.materials.post , physic.MaterialInteraction.create( {
		hq: true ,
		normalBounceRate: 0.5 ,
		tangentBounceRate: 0.5
	} ) ) ;
	
	// Player - Player interactions
	this.materials.player.interactWith( this.materials.player , physic.MaterialInteraction.create( {
		hq: true ,
		normalBounceRate: 0.5 ,
		tangentBounceRate: 0.5
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
	
	// Goal post, max 12cm of diameter
	// 2m44 heigh (inner height, plus the bar radius)
	// 7m32 width (inner width, plus the post radius)
	var postRadius = 0.06 ;
	var goalHeight = 2.44 ;
	var goalWidth = 7.32 ;
	
	this.fieldEntities.swPost = physic.Entity.create( {
		isStatic: true ,
		material: this.materials.post ,
		shape: physic.Shape.createCylinder( physic.Vector3D( 0 , 0 , 1 ) , postRadius , goalHeight ) ,
		x: - this.field.length / 2 ,
		y: - ( postRadius + goalWidth / 2 ) ,
		z: goalHeight / 2
	} ) ;
	
	this.fieldEntities.nwPost = physic.Entity.create( {
		isStatic: true ,
		material: this.materials.post ,
		shape: physic.Shape.createCylinder( physic.Vector3D( 0 , 0 , 1 ) , postRadius , goalHeight ) ,
		x: - this.field.length / 2 ,
		y: ( postRadius + goalWidth / 2 ) ,
		z: goalHeight / 2
	} ) ;
	
	this.fieldEntities.wBar = physic.Entity.create( {
		isStatic: true ,
		material: this.materials.bar ,
		shape: physic.Shape.createCylinder( physic.Vector3D( 0 , 1 , 0 ) , postRadius , goalWidth + 4 * postRadius ) ,
		x: - this.field.length / 2 ,
		y: 0 ,
		z: goalHeight + postRadius
	} ) ;
	
	this.fieldEntities.sePost = physic.Entity.create( {
		isStatic: true ,
		material: this.materials.post ,
		shape: physic.Shape.createCylinder( physic.Vector3D( 0 , 0 , 1 ) , postRadius , goalHeight ) ,
		x: this.field.length / 2 ,
		y: - ( postRadius + goalWidth / 2 ) ,
		z: goalHeight / 2
	} ) ;
	
	this.fieldEntities.nePost = physic.Entity.create( {
		isStatic: true ,
		material: this.materials.post ,
		shape: physic.Shape.createCylinder( physic.Vector3D( 0 , 0 , 1 ) , postRadius , goalHeight ) ,
		x: this.field.length / 2 ,
		y: ( postRadius + goalWidth / 2 ) ,
		z: goalHeight / 2
	} ) ;
	
	this.fieldEntities.eBar = physic.Entity.create( {
		isStatic: true ,
		material: this.materials.bar ,
		shape: physic.Shape.createCylinder( physic.Vector3D( 0 , 1 , 0 ) , postRadius , goalWidth + 4 * postRadius ) ,
		x: this.field.length / 2 ,
		y: 0 ,
		z: goalHeight + postRadius
	} ) ;
	
	this.world.addEntity( this.fieldEntities.nwPost ) ;
} ;



Game.prototype.initBall = function initBall()
{
	this.ballEntity = physic.Entity.create( {
		material: this.materials.ball ,
		shape: physic.Shape.createSphere( 0.15 ) ,
		dynamics: [
			this.gravity ,
			// Real size: 0.11
			physic.dynamics.LinearFriction.create( 0.15 )
		] ,
		x: 0 ,
		y: 0 ,
		z: 0.15
	} ) ;
	
	this.playerFacing.ballEntity = this.ballEntity ;
	
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
				shape: physic.Shape.createCylinder( physic.Vector3D( 0 , 0 , 1 ) , 0.4 , playerData.height ) ,
				data: playerData ,
				dynamics: [
					this.playerMoves ,
					this.playerFacing
				] ,
				x: x ,
				y: y ,
				z: playerData.height / 2
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



Game.prototype.buildParameterExports = function buildParameterExports()
{
	this.parameterExports.field = this.field ;
	this.parameterExports.halfTimeDuration = 600 ;
} ;



Game.prototype.prepareExports = function prepareExports()
{
	var i , iMax , j , jMax ,
		playersLength ,
		teamsLength = this.teams.length ;
	
	this.exports.frameNumber = 0 ;
	
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
		
		for ( j = 0 , playersLength = this.teams[ i ].playerEntities.length ; j < playersLength ; j ++ )
		{
			this.exports.teams[ i ].players[ j ] = {
				boundVector: this.teams[ i ].playerEntities[ j ].boundVector
			} ;
		}
	}
} ;



Game.prototype.updateExports = function updateExports()
{
	var i , iMax , j , jMax ,
		playersLength , player , playerExport ,
		teamsLength = this.teams.length , team , teamExport ;
	
	this.exports.frameNumber = this.frameNumber ;
	
	for ( i = 0 ; i < teamsLength ; i ++ )
	{
		team = this.teams[ i ] ;
		teamExport = this.exports.teams[ i ] ;
		
		teamExport.score = team.score ;
		
		for ( j = 0 , playersLength = team.playerEntities.length ; j < playersLength ; j ++ )
		{
			player = team.playerEntities[ j ] ;
			playerExport = teamExport.players[ j ] ;
			
			playerExport.facing = player.data.facing ;
		}
	}
} ;


