function getSVG() {
	var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

	window.URL = (window.URL || window.webkitURL);


	var page = window.document,
	documents = [page];
	SVGSources = [];

	documents.forEach(function(doc) {
		var newSources = getSources(doc);
		// because of prototype on NYT pages
		for (var i = 0; i < newSources.length; i++) {
			SVGSources.push(newSources[i]);
		};
	})
	if (SVGSources.length > 1) {
		createPopover( SVGSources );
	} else if (SVGSources.length > 0) {
		download( SVGSources[0] );
	}


  function cleanup() {
    d3.selectAll(".svg-crowbar").remove();
  }



  function getSources(doc) {
  	styles = getStyles(doc);
    var svgInfo = [],
        svgs = d3.select(doc).selectAll("svg");

    styles = (styles === undefined) ? "" : styles;

    svgs.each(function () {
      var svg = d3.select(this);
      svg.attr("version", "1.1")
        .insert("defs", ":first-child")
          .attr("class", "svg-crowbar")
        .append("style")
          .attr("type", "text/css");

      // removing attributes so they aren't doubled up
      svg.node().removeAttribute("xmlns");
      svg.node().removeAttribute("xlink");

      // These are needed for the svg
      if (!svg.node().hasAttributeNS(d3.ns.prefix.xmlns, "xmlns")) {
        svg.node().setAttributeNS(d3.ns.prefix.xmlns, "xmlns", d3.ns.prefix.svg);
      }

      if (!svg.node().hasAttributeNS(d3.ns.prefix.xmlns, "xmlns:xlink")) {
        svg.node().setAttributeNS(d3.ns.prefix.xmlns, "xmlns:xlink", d3.ns.prefix.xlink);
      }

      var source = (new XMLSerializer()).serializeToString(svg.node()).replace('</style>', '<![CDATA[' + styles + ']]></style>');
      var rect = svg.node().getBoundingClientRect();
      svgInfo.push({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        class: svg.attr("class"),
        id: svg.attr("id"),
        childElementCount: svg.node().childElementCount,
        source: [doctype + source]
      });
    });
    return svgInfo;
  }

	function download(source) {
		var filename = "untitled";

		if (source.id) {
			filename = source.id;
		} else if (source.class) {
			filename = source.class;
		} else if (window.document.title) {
			filename = window.document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
		}

		var url = window.URL.createObjectURL(new Blob(source.source));

		var a = d3.select("body")
			.append('a')
			.attr({
				"class": "svg-crowbar",
				"download": filename + ".svg",
				"href": url
			})
			.style("display", "none");

		var canvas = document.querySelector("canvas"),
			context = canvas.getContext("2d");

		var image = new Image;
		image.onload = function() {
			context.drawImage(image, 0, 0);
			var a = document.createElement("a");
			a.download = "fallback.png";
			a.href = canvas.toDataURL("image/png");
			a.click();
		};
		console.log(source.source[0]);
		image.src = 'data:image/svg+xml;base64,'+window.btoa(source.source[0]);


		a.node().click();

		/*setTimeout(function() {
			window.URL.revokeObjectURL(url);
		}, 10);*/
	}




	function getStyles(doc) {
		var styles = "",
			styleSheets = doc.styleSheets;

		if (styleSheets) {
			for (var i = 0; i < styleSheets.length; i++) {
				processStyleSheet(styleSheets[i]);
			}
		}

		function processStyleSheet(ss) {
			if (ss.cssRules) {
				for (var i = 0; i < ss.cssRules.length; i++) {
					var rule = ss.cssRules[i];
					if (rule.type === 3) {
						// Import Rule
						processStyleSheet(rule.styleSheet);
					} else {
						// hack for illustrator crashing on descendent selectors
						if (rule.selectorText) {
							if (rule.selectorText.indexOf(">") === -1) {
								styles += "\n" + rule.cssText;
							}
						}
					}
				}
			}
		}
		return styles;
	}


}