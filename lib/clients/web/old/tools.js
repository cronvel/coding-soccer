var debug = function( str , name ) {
	var self = this ;

	if ( ! game.debugOn ) { return ; }

	if ( ! debug.$ ) {
		debug.$ = document.querySelector('.debug') ;
	}

	if ( ! name ) {
		name = Math.random() ;
	}

	if ( ! debug.list[ name ] ) {
		debug.list[ name ] = {} ;
		debug.list[ name ].$ = document.createElement('div') ;
		debug.$.append( debug.list[ name ].$ ) ;
	}
	else {
		clearTimeout( debug.list[ name ].timer ) ;
	}

	debug.list[ name ].$.textContent = name +': ' + str ;

	debug.list[ name ].timer = setTimeout( function() {
		debug.list[ name ].$.remove() ;
		delete debug.list[ name ] ;
	} , 5000 ) ;
} ;
debug.list = {} ;
debug.since = function( name ) {
	debug( `${since(name)}ms` , name ) ;
} ;


var since = function( name ) {
	var sinceTime = 0 ,
		time = Date.now() ;

	sinceTime = since.list[ name ] ? time - since.list[ name ] : 0 ;
	since.list[ name ] = time ;

	return sinceTime ;
} ;
since.list = {} ;
