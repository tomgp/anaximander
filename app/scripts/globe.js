function globe(parent, options){

	var theGlobe = {
		width:400,
		height:400,
		projection:d3.geo.orthographic()
			.precision(.5)
			.clipAngle(90)
			.clipExtent([[1, 1], [this.width - 1, this.height - 1]])
			.translate([this.width / 2, this.height / 2])
			.scale(this.width / 2 - 10)
			.rotate([0, -30]),
			shapes:[],
		group:d3.select(parent).append('svg').attr({width:this.width,height:this.height}).append('g'),
	};



	if(options){
		for( var o in options ){
			theGlobe[o] = options[o];
		}
	}

	theGlobe.path = d3.geo.path().projection( theGlobe.projection );


	theGlobe.addShapes = function( shapes ){ //shape is geojson
		console.log(theGlobe.path);
		theGlobe.group.selectAll('path')
			.data(shapes)
				.enter().append('path')
				.attr("d", theGlobe.path);
	}

	theGlobe.addClass = function(selector, c){

	}


	return theGlobe;
}