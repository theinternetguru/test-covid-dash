

var leafletMap;


//==================================================================
//
//==================================================================
function map(cb)	{
	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+'-'+fc++,
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	d3.select('.content')
		.call(sel=>{
			sel.selectAll('*').remove();
			sel.call(mapInit, fEnd);
		});


}





//==================================================================
//
//==================================================================
function mapInit(sel, cb)	{
	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+'-'+fc++,
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };





	var width = +sel.style('width').replace('px',''),
			height = innerHeight - +d3.select('nav').style('height').replace('px','');

	sel
		.append('div')
			.styles({
				//padding:'12px'
			})
			.append('div').attr('id', 'map')
				.styles({
					//position:'absolute',
					width:width+'px',
					height:height+'px',
				})
				.append('svg')
					.attrs({
						xmlns:'http://www.w3.org/2000/svg',
						width:width+'px',
						height:height+'px',
					});




//	// malaysia centric
//	var ll = [[99.5,0],[120,8]];
//	var center = {
//		x: ll[0][0]+(ll[1][0]-ll[0][0])/2,
//		y: ll[0][1]+(ll[1][1]-ll[0][1])/2,
//	};
//

  leafletMap = L.map('map', {
  		scrollWheelZoom: false,
  	})
  	//.setView([30.657,114.093],5)
  	.setView([40,20],2);
  	//.setView([center.y, center.x], 6);



	//----------
	// layers
	//----------
	var layers = {
		osm						: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
											maxZoom: 18,
											attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
										}),
		stamen				: L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png'),
		stamen_toner	: L.tileLayer('http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.png'),

		esri_gray			: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
											attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
											maxZoom: 16
										}),

		Esri_WorldImagery			: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
															attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
														}),

		Esri_WorldTerrain				: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
															attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
															maxZoom: 13
														}),

		Esri_WorldShadedRelief: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
															attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
															maxZoom: 13
														}),

		thunderforest					:	L.tileLayer.provider('Thunderforest.Transport', {apikey:'716a32cce364498cbddcc5f329050dc1'}),

		CartoDB_Positron: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 19
		}),

	};


	var baseLayers = {
	    'Stamen TonerLite'				: layers.stamen,
	    'Stamen TonerBackground'	: layers.stamen_toner,
	    'Esri_Gray'								: layers.esri_gray,
	    'Esri_WorldImagery'				: layers.Esri_WorldImagery,
	    'Esri_WorldTerrain'				: layers.Esri_WorldTerrain,
	    'Esri_WorldShadedRelief'				: layers.Esri_WorldShadedRelief,
	    'Thunderforest.Transport'	: layers.thunderforest,
	    'CartoDB_Positron'	: layers.CartoDB_Positron,
	};

	L.control.layers(baseLayers).addTo(leafletMap);
  layers.CartoDB_Positron.addTo(leafletMap);





	//----------
	// point
	//----------
  // Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
  	if (x && y)	{
	  	//console.log('x,y',x,y);
	    var point = leafletMap.latLngToLayerPoint(new L.LatLng(y, x));
	    this.stream.point(point.x, point.y);
	  }
  }
	//Create a d3.geo.path to convert GeoJson to SVG
  var transform = d3.geoTransform({point: projectPoint});

  var point = d3.geoPath().projection(transform);
  point.pointRadius(5);


	//----------
	// path
	//----------
  function projectPath(x, y) {
  	//console.log('x,y',x,y);
    var p = leafletMap.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(p.x, p.y);
  }

  var transformPath = d3.geoTransform({point: projectPath});
  var path = d3.geoPath().projection(transformPath);




	//----------
	// svg
	//----------

	//adds an SVG element to Leaflet’s overlay pane
  var svg = d3.select(leafletMap.getPanes().overlayPane).append("svg");
  var g = svg.append("g").attr("class", "leaflet-zoom-hide");





  leafletMap.on('movestart', mapmovestart);
  leafletMap.on('moveend', mapmove);

	function mapmovestart(e){
		svg.style('display','none');
	}

  function mapmove(e) {
    //redrawPoints();
		svg.style('display','block');
		dbg&&console.log('moveend', leafletMap.getBounds());
  }


		//----------
		// bounds
		//----------
		var mkr = {
			type:"FeatureCollection",
			features:[
				{
					type:'Feature',
					geometry:{
						type:'Point',
						coordinates:[-180,-90],
					}
				},
				{
					type:'Feature',
					geometry:{
						type:'Point',
						coordinates:[180,90],
					}
				}
			]
		};
    //dbg&&console.log('mkr', mkr);

//    var bounds = point.bounds(markers);
    var bounds = point.bounds(mkr);

    var topLeft = bounds[0];
    var bottomRight = bounds[1];
		var margin = 0;

    svg
    	.attr("width", bottomRight[0] - topLeft[0] + (margin*2))
      .attr("height", bottomRight[1] - topLeft[1] + (margin*2))
      .attr('overflow','visible')
      .style("left", topLeft[0] - margin + "px")
      .style("top", topLeft[1] - margin + "px");

		svg.call(defsGooey, 10,10,5,50);

//    g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")")
    g.attr("transform", "translate(" + -(topLeft[0]+margin) + "," + -(topLeft[1]+margin) + ")")


//	window.setTimeout(function(){
//		var points = [
//			[-64.78407323879503,-196.5715026855469],[83.19212875892394,243.23318481445315]
//		];
//		leafletMap.flyToBounds(points);
//	},2000);


	fEnd();

}






//==================================================================
//
//==================================================================
function defsGooey(sel, w, h, stdDeviation, r)	{


  var defs = sel.append('defs');

  var filter = defs.append('filter').attr('id','gooey');

  filter.append('feGaussianBlur')
    .attr('in','SourceGraphic')
    .attr('stdDeviation', stdDeviation)
    .attr('result','blur');

  filter.append('feColorMatrix')
  	.attr("class", "blurValues")
    .attr('in','blur')
    .attr('mode','matrix')
    .attr("values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 "+r+" -7")
    .attr('result','gooey');

  filter.append("feBlend")
  	.attr("in", "SourceGraphic")
  	.attr("in2", "gooey")
  	.attr("operator", "atop");



	var filter = defs.append('filter').attr('id','gooey2');
	filter.append('feGaussianBlur')
	  .attr('in','SourceGraphic')
	  .attr('stdDeviation',stdDeviation)
	  .attr('result','blur');
	filter.append('feColorMatrix')
	  .attr('in','blur')
	  .attr('mode','matrix')
	  .attr('values','1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 '+r+' -7');

}



