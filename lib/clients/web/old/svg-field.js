


function SvgField( params ) { return SvgField.create( params ) ; }



SvgField.create = function create( params , pixelRatio )
{
	var self = Object.create( SvgField.prototype , {
		$: { value: document.createElement( 'svg' ) , writable: true , enumerable: true } ,
		w: { value: params.length / 2 + 5 , writable: true , enumerable: true } ,
		h: { value: params.width / 2 + 5 , writable: true , enumerable: true } ,
		params: { value: params , writable: true , enumerable: true } ,
		pixelRatio: { value: pixelRatio , writable: true , enumerable: true } ,
		lineColor: { value: '#aaa' , writable: true , enumerable: true } ,
	} ) ;
	
	self.$.classList.add( 'svgField' ) ;
    self.$.setAttribute( 'viewBox' , [ - self.w , - self.h , self.w , self.h ].join( ' ' ) ) ;
    self.$.setAttribute( 'width' , self.w * 2 * pixelRatio ) ;
    self.$.setAttribute( 'height' , self.h * 2 * pixelRatio ) ;
	
	self.createLines() ;
	
	return self ;
} ;



SvgField.prototype.createLines = function createLines()
{
	var svg = this.$ ;
	var svgNS = svg.namespaceURI ;
	
	var limit = document.createElementNS( svgNS ,'rect' ) ;
	limit.setAttribute( 'x' , - this.params.length / 2 ) ;
	limit.setAttribute( 'y' , - this.params.width / 2 ) ;
	limit.setAttribute( 'width' , this.params.length ) ;
	limit.setAttribute( 'height' , this.params.width ) ;
	limit.setAttribute( 'fill' , this.lineColor ) ;
	svg.appendChild( limit ) ;
} ;

