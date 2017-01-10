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



//var Client = require( './Client.js' ) ;
var serverKit = require( 'server-kit' ) ;
var Ngev = require( 'nextgen-events' ) ;

var log = require( 'logfella' ).global.use( 'spellcast' ) ;



function WsServer() { throw new Error( 'Use WsServer.create() instead.' ) ; }
module.exports = WsServer ;



WsServer.create = function create( game , options )
{
	options = options || {} ;
	
	var self = Object.create( WsServer.prototype , {
		game: { value: game , enumerable: true } ,
		port: { value: typeof options.port === 'number' ? options.port : 15007 , enumerable: true } ,
		//acceptTokens: { value: {} , enumerable: true } ,
		//hasHttp: { value: !! options.httpStaticPath , writable: true , enumerable: true } ,
		//httpStaticPath: { value: options.httpStaticPath , writable: true , enumerable: true } ,
		//httpRouter: { value: null , writable: true , enumerable: true } ,
	} ) ;
	
	//if ( Array.isArray( options.tokens ) ) { options.tokens.forEach( t => self.acceptTokens[ t ] = true ) ; }
	
	//if ( self.httpStaticPath ) { self.createRouter() ; }
	
	self.createWebSocketServer() ;
	
	// /!\ !!! Temporary hack: force a 500ms delay before closing the app, so few last messages can be sent !!! /!\
	game.on( 'exit' , {
		async: true ,
		fn: function( code , timeout , callback ) {
			setTimeout( callback , 500 ) ;
		}
	} ) ;
	
	return self ;
} ;



WsServer.prototype.createWebSocketServer = function createWebSocketServer()
{
	var self = this , token , path ;
	
	serverKit.createServer( {
			port: self.port ,
			ws: true ,
			//http: self.httpStaticPath ,
			verbose: true ,
			catchErrors: false
		} , function( client ) {
			
			if ( client.type === 'http' && self.hasHttp )
			{
				// Auth for HTTP content
				
				/*
				path = client.url.split( '/' ).slice( 1 ) ;
				token = path.unshift() ;
				
				log.info( 'HTTP client token: %s' , token ) ;
				
				if ( ! self.acceptTokens[ token ] )
				{
					console.log( 'HTTP client rejected: token not authorized' ) ;
					client.response.writeHeader( 403 ) ;
					client.response.end() ;
					return ;
				}
				*/
				
				if ( client.request.method === 'OPTIONS' ) { self.cors( client ) ; }
				else { self.httpRouter.requestHandler( client ) ; }
			}
			else if ( client.type === 'http.upgrade' && self.hasHttp )
			{
				// This happens only when a http+ws server is created.
				// Accept all websocket connection, it will be filtered out in .wsClientHandler() if it's needed.
				client.response.accept( true ) ;
			}
			else if ( client.type === 'ws' )
			{
				self.wsClientHandler( client ) ;
			}
			else
			{
				client.response.writeHeader( 400 ) ;
				client.response.end( "This server does not handle " + client.type ) ;
				return ;
			}
		}
	) ;
} ;



WsServer.prototype.wsClientHandler = function wsClientHandler( client )
{
	var self = this ;
	
	//log.info( 'client connected: %I' , websocket ) ;
	
	client.websocket.on( 'message' , function incoming( message ) {
		
		//console.log('received: %s', message ) ;
		
		try {
			message = JSON.parse( message ) ;
		}
		catch ( error ) {
			console.error( 'Parse error (client data): ' + error ) ;
			return ;
		}
		
		//log.info( 'Received message: %I' , message ) ;
	} ) ;
	
	this.game.on( 'frame' , function sendFrame( state ) {
		var json ;
		log.info( 'frame event received!' ) ;
		client.websocket.send( json = JSON.stringify( state ) ) ;
		log.info( 'Sending: %I' , json ) ;
	} ) ;
	
	// Clean up after everything is done
	client.websocket.on( 'close' , function close() {
		log.info( 'Client %s closed' , token ) ;
	} ) ;
	
	client.websocket.on( 'error' , function( error ) {
		log.info( 'Client %s error: %E' , token , error ) ;
		// What should be done here?
	} ) ;
} ;



/*
WsServer.prototype.wsClientHandler = function wsClientHandler( client )
{
	var self = this ;
	
	//log.info( 'client connected: %I' , websocket ) ;
	
	var appClient ;
	var token = client.websocket.upgradeReq.url.slice( 1 ) ;
	
	log.info( 'Client connected: %s' , token ) ;
	
	if ( self.book.clients.getToken( token ) )
	{
		log.warning( 'Client rejected: token already connected' ) ;
		client.websocket.close() ;
		return ;
	}
	
	if ( ! self.acceptTokens[ token ] )
	{
		console.log( 'Client rejected: token not authorized' ) ;
		client.websocket.close() ;
		return ;
	}
	
	
	// Add the current websocket to the list of clients
	appClient = Client.create( {
		token: token ,
		book: self.book ,
		connection: client.websocket
	} ) ;
	
	if ( ! self.book.addClient( appClient ) )
	{
		console.log( 'Client rejected: not enough roles' ) ;
		client.websocket.close() ;
		return ;
	}
	
	//log.warning( self.book.clients ) ;
	
	var proxy = new Ngev.Proxy() ;
	
	// Add the local services and grant listen rights
	proxy.addLocalService( 'bus' , appClient , { emit: true , listen: true , ack: true } ) ;
	
	client.websocket.on( 'message' , function incoming( message ) {
		
		//console.log('received: %s', message ) ;
		
		try {
			message = JSON.parse( message ) ;
		}
		catch ( error ) {
			console.error( 'Parse error (client data): ' + error ) ;
			return ;
		}
		
		//log.info( 'Received message: %I' , message ) ;
		proxy.receive( message ) ;
	} ) ;
	
	// Define the send method
	proxy.send = function send( message ) {
		//log.info( 'Sending: %I' , message ) ;
		client.websocket.send( JSON.stringify( message ) ) ;
	} ;
	
	// Clean up after everything is done
	client.websocket.on( 'close' , function close() {
		log.info( 'Client %s closed' , token ) ;
		proxy.destroy() ;
		self.book.removeClient( appClient ) ;
		appClient = null ;
	} ) ;
	
	client.websocket.on( 'error' , function( error ) {
		log.info( 'Client %s error: %E' , token , error ) ;
		// What should be done here?
	} ) ;
} ;



WsServer.prototype.createRouter = function createRouter()
{
	this.httpRouter = serverKit.Router.create( 'mapRouter' ) ;
	this.httpRouter.setLocalRootPath( __dirname + '/../browser/' ) ;
	this.httpRouter.addStaticRoute( '/' , 'app.html' ) ;
	
	// Define the sub-router for built-in files (global spellcast app files)
	var builtinRouter = serverKit.Router.create( 'simpleStaticRouter' ) ;
	builtinRouter.setLocalRootPath( __dirname + '/../browser/' ) ;
	builtinRouter.setIndexFile( 'app.html' ) ;
	
	// Define the sub-router for the script files (specific files, assets, ...)
	var scriptRouter = serverKit.Router.create( 'simpleStaticRouter' ) ;
	scriptRouter.setLocalRootPath( this.httpStaticPath ) ;
	
	// Fallback route to the built-in sub-router
	this.httpRouter.addRoute( null , builtinRouter.requestHandler ) ;
	
	// /script route to the script sub-router
	this.httpRouter.addRoute( /^\/script(?=\/)/ , scriptRouter.requestHandler ) ;
} ;



// Manage CORS on OPTIONS request
WsServer.prototype.cors = function cors( client )
{
	// Allowed website
	client.response.setHeader( 'Access-Control-Allow-Origin' , '*' ) ;
	
	// Allowed methods
	client.response.setHeader( 'Access-Control-Allow-Methods' , 'GET, POST, OPTIONS' ) ;
	
	// Allowed headers
	client.response.setHeader( 'Access-Control-Allow-Headers' , 'Content-Type' ) ;
	
	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	//client.response.setHeader( 'Access-Control-Allow-Credentials' , true ) ;
	
	client.response.end() ;
} ;
*/

