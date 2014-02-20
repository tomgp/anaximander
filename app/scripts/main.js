
function go(){
	var degrees = 180 / Math.PI,
	    width = 400,
	    height = 400;

	var projection = orthographicProjection(width,height);



    d3.json("data/world-110m.json", function(error, world) {
		var path = d3.geo.path().projection(projection);

		var land = topojson.feature(world, world.objects.land),
			countries = topojson.feature(world, world.objects.countries).features,
			borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a != b; })

		var mainView = d3.select("#main-map").append("svg")
			.attr("width", width)
			.attr("height", height)
			.call(drawMap, path, true);

		mainView.selectAll(".foreground")
			.call(d3.geo.zoom().projection(projection)
			.scaleExtent([projection.scale() * .7, projection.scale() * 10])
			.on("zoom.redraw", function() {
				d3.event.sourceEvent.preventDefault();
				mainView.selectAll("path").attr("d", path);
			}));

		d3.selectAll("svg").insert("path", ".foreground")
			.datum(land)
			.attr("class", "land");

		d3.selectAll("svg").append("path", ".foreground")
			.datum(borders)
			.attr({
				"class":"mesh",
				"id":function(d){
					console.log(d);
					return d.id;
				}
			});
		
		mainView.selectAll(".foreground")
			.call(
				d3.behavior.drag()
					.origin(function() { var r = projection.rotate(); return {x: r[0], y: -r[1]}; })
					.on("drag", function() {
						projection.rotate([d3.event.x, -d3.event.y]);
						mainView.selectAll("path").attr("d", path);
			        }
				)
		);

	    mainView.selectAll("path").attr("d", path);
	});
}

function drawMap(svg, path, mousePoint) {
	console.log('drawing', svg);
	var projection = path.projection();

	svg.append("path")
		.datum(d3.geo.graticule())
		.attr("class", "graticule")
		.attr("d", path);

  svg.append("path")
	.datum({type: "Sphere"})
	.attr("class", "foreground")
	.attr("d", path)
	.on("mousedown.grab", function() {
		var point;

		if (mousePoint){ 
			point = svg.insert("path", ".foreground")
				.datum({type: "Point", coordinates: projection.invert(d3.mouse(this))})
				.attr("class", "point")
				.attr("d", path);
		}

        var path = d3.select(this).classed("zooming", true),
            w = d3.select(window).on("mouseup.grab", function() {
              path.classed("zooming", false);
              w.on("mouseup.grab", null);
              if (mousePoint) point.remove();
            });
      });
}

function orthographicProjection(width, height) {
	return d3.geo.orthographic()
		.precision(.5)
		.clipAngle(90)
		.clipExtent([[1, 1], [width - 1, height - 1]])
		.translate([width / 2, height / 2])
		.scale(width / 2 - 10)
		.rotate([0, -30]);
}

$().ready(go); 
