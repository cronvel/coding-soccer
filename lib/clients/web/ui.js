function UI ( options ) { return UI.create( options ) ; }

UI.create = function( options ) {
	var $container = document.querySelector('main') ;

	var self = Object.create( UI.prototype , {
	} ) ;

	self.init() ;

	return self ;
} ;


UI.prototype.replay = function() {

} ;
