


function SvgField( params ) { return SvgField.create( params ) ; }



SvgField.create = function create( params , pixelRatio )
{
	var self = Object.create( SvgField.prototype , {
		$: { value: document.createElementNS( 'http://www.w3.org/2000/svg' , 'svg' ) , writable: true , enumerable: true } ,
		w: { value: params.length / 2 + 5 , writable: true , enumerable: true } ,
		h: { value: params.width / 2 + 5 , writable: true , enumerable: true } ,
		params: { value: params , writable: true , enumerable: true } ,
		pixelRatio: { value: pixelRatio , writable: true , enumerable: true } ,
		lineColor: { value: '#ccc' , writable: true , enumerable: true } ,
		lineWidth: { value: 0.2 , writable: true , enumerable: true } ,
	} ) ;
	
	self.$.classList.add( 'svgField' ) ;
    self.$.setAttribute( 'viewBox' , [ - self.w , - self.h , 2 * self.w , 2 * self.h ].join( ' ' ) ) ;
    self.$.setAttribute( 'width' , self.w * 2 * pixelRatio ) ;
    self.$.setAttribute( 'height' , self.h * 2 * pixelRatio ) ;
	self.$.setAttribute( 'stroke' , self.lineColor ) ;
	self.$.setAttribute( 'stroke-width' , self.lineWidth ) ;
	self.$.setAttribute( 'fill' , 'none' ) ;
	
	// Add variables that are not (yet?) present in the params
	params.penaltyDistance = 11 ;
	params.goalWidth = 7.32 ;
	params.goalAreaWidth = params.goalWidth + 2 * 5.5 ;
	params.goalAreaLength = 5.5 ;
	params.penaltyAreaWidth = params.goalAreaWidth + 2 * 11 ;
	params.penaltyAreaLength = 16.5 ;
	
	self.createLines() ;
	
	return self ;
} ;



SvgField.prototype.createLines = function createLines()
{
	var svg = this.$ ;
	var svgNS = svg.namespaceURI ;
	var tag ;
	//console.log( svgNS ) ;
	
	// Field limit
	tag = document.createElementNS( svgNS , 'rect' ) ;
	tag.setAttribute( 'x' , - this.params.length / 2 ) ;
	tag.setAttribute( 'y' , - this.params.width / 2 ) ;
	tag.setAttribute( 'width' , this.params.length ) ;
	tag.setAttribute( 'height' , this.params.width ) ;
	svg.appendChild( tag ) ;
	
	// Half-way line
	tag = document.createElementNS( svgNS , 'line' ) ;
	tag.setAttribute( 'x1' , 0 ) ;
	tag.setAttribute( 'x2' , 0 ) ;
	tag.setAttribute( 'y1' , - this.params.width / 2 ) ;
	tag.setAttribute( 'y2' , this.params.width / 2 ) ;
	svg.appendChild( tag ) ;
	
	// Kick off point
	tag = document.createElementNS( svgNS , 'circle' ) ;
	tag.setAttribute( 'cx' , 0 ) ;
	tag.setAttribute( 'cy' , 0 ) ;
	tag.setAttribute( 'r' , this.lineWidth ) ;
	tag.setAttribute( 'fill' , this.lineColor ) ;
	svg.appendChild( tag ) ;
	
	// Kick off circle
	tag = document.createElementNS( svgNS , 'circle' ) ;
	tag.setAttribute( 'cx' , 0 ) ;
	tag.setAttribute( 'cy' , 0 ) ;
	tag.setAttribute( 'r' , 9.15 ) ;
	svg.appendChild( tag ) ;
	
	// Penalty point (left)
	tag = document.createElementNS( svgNS , 'circle' ) ;
	tag.setAttribute( 'cx' , - this.params.length / 2 + this.params.penaltyDistance ) ;
	tag.setAttribute( 'cy' , 0 ) ;
	tag.setAttribute( 'r' , this.lineWidth ) ;
	tag.setAttribute( 'fill' , this.lineColor ) ;
	svg.appendChild( tag ) ;
	
	// Penalty area arc circle (left)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		createArcDegPathStr(
			- this.params.length / 2 + this.params.penaltyDistance ,
			0 ,
			this.params.penaltyDistance ,
			-60 ,
			60
		)
	) ;
	svg.appendChild( tag ) ;
	
	// Penalty point (right)
	tag = document.createElementNS( svgNS , 'circle' ) ;
	tag.setAttribute( 'cx' , this.params.length / 2 - this.params.penaltyDistance ) ;
	tag.setAttribute( 'cy' , 0 ) ;
	tag.setAttribute( 'r' , this.lineWidth ) ;
	tag.setAttribute( 'fill' , this.lineColor ) ;
	svg.appendChild( tag ) ;
	
	// Penalty area arc circle (right)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		createArcDegPathStr(
			this.params.length / 2 - this.params.penaltyDistance ,
			0 ,
			this.params.penaltyDistance ,
			120 ,
			240
		)
	) ;
	svg.appendChild( tag ) ;
	
	// Goal area (left)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		'M ' + - this.params.length / 2 + ' ' + - this.params.goalAreaWidth / 2 +
		' h ' + this.params.goalAreaLength +
		' v ' + this.params.goalAreaWidth +
		' h ' + - this.params.goalAreaLength
	) ;
	svg.appendChild( tag ) ;
	
	// Goal area (right)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		'M ' + this.params.length / 2 + ' ' + - this.params.goalAreaWidth / 2 +
		' h ' + - this.params.goalAreaLength +
		' v ' + this.params.goalAreaWidth +
		' h ' + this.params.goalAreaLength
	) ;
	svg.appendChild( tag ) ;
	
	// Penalty area (left)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		'M ' + - this.params.length / 2 + ' ' + - this.params.penaltyAreaWidth / 2 +
		' h ' + this.params.penaltyAreaLength +
		' v ' + this.params.penaltyAreaWidth +
		' h ' + - this.params.penaltyAreaLength
	) ;
	svg.appendChild( tag ) ;
	
	// Penalty area (right)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		'M ' + this.params.length / 2 + ' ' + - this.params.penaltyAreaWidth / 2 +
		' h ' + - this.params.penaltyAreaLength +
		' v ' + this.params.penaltyAreaWidth +
		' h ' + this.params.penaltyAreaLength
	) ;
	svg.appendChild( tag ) ;
	
	// Optional inner goal lines (left)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		'M ' + - this.params.length / 2 + ' ' + - this.params.goalWidth / 2 +
		' h -2 ' +
		' v ' + this.params.goalWidth +
		' h 2'
	) ;
	svg.appendChild( tag ) ;
	
	// Optional inner goal lines (right)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		'M ' + this.params.length / 2 + ' ' + - this.params.goalWidth / 2 +
		' h 2 ' +
		' v ' + this.params.goalWidth +
		' h -2'
	) ;
	svg.appendChild( tag ) ;
} ;



// Should be moved to dom-kit/lib/svg
function createArcDegPathStr( cx , cy , r , startAngleDeg , endAngleDeg )
{
	var startAngle = startAngleDeg * Math.PI / 180 ;
	var endAngle = endAngleDeg * Math.PI / 180 ;
	
	var startX = cx + r * Math.cos( startAngle ) ;
	var startY = cy - r * Math.sin( startAngle ) ;
	
	var endX = cx + r * Math.cos( endAngle ) ;
	var endY = cy - r * Math.sin( endAngle ) ;
	
	var str = 'M ' + startX + ' ' + startY +
		' A ' + r + ' ' + r + ' 0 ' +
		( Math.abs( startAngle - endAngle ) > 180 ? 1 : 0 ) +
		( startAngle > endAngle ? 1 : 0 ) +
		endX + ' ' + endY ;
	
	console.log( str ) ;
	
	return str ;
}


