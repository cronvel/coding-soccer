


function SvgField( params ) { return SvgField.create( params ) ; }

// TODO: use .setAttributeNS() instead, and so on...

SvgField.create = function create( params , pixelRatio )
{
	var self = Object.create( SvgField.prototype , {
		$: { value: document.createElementNS( 'http://www.w3.org/2000/svg' , 'svg' ) , writable: true , enumerable: true } ,
		params: { value: params , writable: true , enumerable: true } ,
		pixelRatio: { value: pixelRatio , writable: true , enumerable: true } ,
		lineColor: { value: '#fff' , writable: true , enumerable: true } ,
		//lineOpacity: { value: 0.8 , writable: true , enumerable: true } ,
		lineWidth: { value: 0.2 , writable: true , enumerable: true } ,
	} ) ;
	
	self.$.classList.add( 'svgField' ) ;
    self.$.setAttribute( 'viewBox' , [ params.outer.min.x , params.outer.min.y , params.outerLength , params.outerWidth ].join( ' ' ) ) ;
    self.$.setAttribute( 'width' , params.outerLength * pixelRatio ) ;
    self.$.setAttribute( 'height' , params.outerWidth * pixelRatio ) ;
	self.$.setAttribute( 'stroke' , self.lineColor ) ;
	self.$.setAttribute( 'stroke-opacity' , self.lineOpacity ) ;
	self.$.setAttribute( 'stroke-width' , self.lineWidth ) ;
	//self.$.setAttribute( 'stroke-opacity' , self.lineOpacity ) ;
	self.$.setAttribute( 'fill' , 'none' ) ;
	//self.$.setAttribute( 'fill-opacity' , self.lineOpacity ) ;
	
	self.createLines() ;
	
	return self ;
} ;



SvgField.prototype.createLines = function createLines()
{
	var svg = this.$ ;
	var svgNS = svg.namespaceURI ;
	var tag ;
	
	// Field limit
	tag = document.createElementNS( svgNS , 'rect' ) ;
	tag.setAttribute( 'x' , this.params.inner.min.x ) ;
	tag.setAttribute( 'y' , this.params.inner.min.y ) ;
	tag.setAttribute( 'width' , this.params.length ) ;
	tag.setAttribute( 'height' , this.params.width ) ;
	svg.appendChild( tag ) ;
	
	// Half-way line
	tag = document.createElementNS( svgNS , 'line' ) ;
	tag.setAttribute( 'x1' , this.params.leftSide.max.x ) ;
	tag.setAttribute( 'x2' , this.params.leftSide.max.x ) ;
	tag.setAttribute( 'y1' , this.params.leftSide.min.y ) ;
	tag.setAttribute( 'y2' , this.params.leftSide.max.y ) ;
	svg.appendChild( tag ) ;
	
	// Kick off point
	tag = document.createElementNS( svgNS , 'circle' ) ;
	tag.setAttribute( 'cx' , this.params.kickOff.center.x ) ;
	tag.setAttribute( 'cy' , this.params.kickOff.center.y ) ;
	tag.setAttribute( 'r' , this.lineWidth ) ;
	tag.setAttribute( 'fill' , this.lineColor ) ;
	tag.setAttribute( 'stroke' , 'none' ) ;
	svg.appendChild( tag ) ;
	
	// Kick off circle
	tag = document.createElementNS( svgNS , 'circle' ) ;
	tag.setAttribute( 'cx' , this.params.kickOff.center.x ) ;
	tag.setAttribute( 'cy' , this.params.kickOff.center.x ) ;
	tag.setAttribute( 'r' , this.params.kickOff.r ) ;
	svg.appendChild( tag ) ;
	
	// Penalty point (left)
	tag = document.createElementNS( svgNS , 'circle' ) ;
	tag.setAttribute( 'cx' , this.params.leftPenalty.center.x ) ;
	tag.setAttribute( 'cy' , this.params.leftPenalty.center.y ) ;
	tag.setAttribute( 'r' , this.lineWidth ) ;
	tag.setAttribute( 'fill' , this.lineColor ) ;
	tag.setAttribute( 'stroke' , 'none' ) ;
	svg.appendChild( tag ) ;
	
	// Penalty area arc circle (left)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		createArcDegPathStr(
			this.params.leftPenalty.center.x ,
			this.params.leftPenalty.center.y ,
			this.params.leftPenalty.r ,
			this.params.leftPenalty.startDeg ,
			this.params.leftPenalty.endDeg
		)
	) ;
	svg.appendChild( tag ) ;
	
	// Penalty point (right)
	tag = document.createElementNS( svgNS , 'circle' ) ;
	tag.setAttribute( 'cx' , this.params.rightPenalty.center.x ) ;
	tag.setAttribute( 'cy' , this.params.rightPenalty.center.y ) ;
	tag.setAttribute( 'r' , this.lineWidth ) ;
	tag.setAttribute( 'fill' , this.lineColor ) ;
	tag.setAttribute( 'stroke' , 'none' ) ;
	svg.appendChild( tag ) ;
	
	// Penalty area arc circle (right)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		createArcDegPathStr(
			this.params.rightPenalty.center.x ,
			this.params.rightPenalty.center.y ,
			this.params.rightPenalty.r ,
			this.params.rightPenalty.startDeg ,
			this.params.rightPenalty.endDeg
		)
	) ;
	svg.appendChild( tag ) ;
	
	// Penalty area (left)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		'M ' + this.params.leftPenaltyArea.min.x + ' ' + this.params.leftPenaltyArea.min.y +
		' h ' + this.params.penaltyAreaLength +
		' v ' + this.params.penaltyAreaWidth +
		' h ' + - this.params.penaltyAreaLength
	) ;
	svg.appendChild( tag ) ;
	
	// Penalty area (right)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		'M ' + this.params.rightPenaltyArea.max.x + ' ' + this.params.rightPenaltyArea.min.y +
		' h ' + - this.params.penaltyAreaLength +
		' v ' + this.params.penaltyAreaWidth +
		' h ' + this.params.penaltyAreaLength
	) ;
	svg.appendChild( tag ) ;
	
	// Goal area (left)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		'M ' + this.params.leftGoalArea.min.x + ' ' + this.params.leftGoalArea.min.y +
		' h ' + this.params.goalAreaLength +
		' v ' + this.params.goalAreaWidth +
		' h ' + - this.params.goalAreaLength
	) ;
	svg.appendChild( tag ) ;
	
	// Goal area (right)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		'M ' + this.params.rightGoalArea.max.x + ' ' + this.params.rightGoalArea.min.y +
		' h ' + - this.params.goalAreaLength +
		' v ' + this.params.goalAreaWidth +
		' h ' + this.params.goalAreaLength
	) ;
	svg.appendChild( tag ) ;
	
	// Corner arc circle (top-left)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		createArcDegPathStr(
			this.params.topLeftCorner.center.x ,
			- this.params.topLeftCorner.center.y ,
			this.params.topLeftCorner.r ,
			this.params.topLeftCorner.startDeg ,
			this.params.topLeftCorner.endDeg
		)
	) ;
	svg.appendChild( tag ) ;
	
	// Corner arc circle (bottom-left)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		createArcDegPathStr(
			this.params.bottomLeftCorner.center.x ,
			- this.params.bottomLeftCorner.center.y ,
			this.params.bottomLeftCorner.r ,
			this.params.bottomLeftCorner.startDeg ,
			this.params.bottomLeftCorner.endDeg
		)
	) ;
	svg.appendChild( tag ) ;
	
	// Corner arc circle (top-right)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		createArcDegPathStr(
			this.params.topRightCorner.center.x ,
			- this.params.topRightCorner.center.y ,
			this.params.topRightCorner.r ,
			this.params.topRightCorner.startDeg ,
			this.params.topRightCorner.endDeg
		)
	) ;
	svg.appendChild( tag ) ;
	
	// Corner arc circle (bottom-right)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		createArcDegPathStr(
			this.params.bottomRightCorner.center.x ,
			- this.params.bottomRightCorner.center.y ,
			this.params.bottomRightCorner.r ,
			this.params.bottomRightCorner.startDeg ,
			this.params.bottomRightCorner.endDeg
		)
	) ;
	svg.appendChild( tag ) ;
	
	// Optional inner goal lines (left)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		'M ' + this.params.leftGoal.max.x + ' ' + this.params.leftGoal.min.y +
		' h ' + - this.params.goalDepth +
		' v ' + this.params.goalWidth +
		' h ' + this.params.goalDepth
	) ;
	svg.appendChild( tag ) ;
	
	// Optional inner goal lines (right)
	tag = document.createElementNS( svgNS , 'path' ) ;
	tag.setAttribute( 'd' ,
		'M ' + this.params.rightGoal.min.x + ' ' + - this.params.goalWidth / 2 +
		' h ' + this.params.goalDepth +
		' v ' + this.params.goalWidth +
		' h ' + - this.params.goalDepth
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
	
	//console.log( str ) ;
	
	return str ;
}


