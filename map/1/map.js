


//==================================================================
//
//==================================================================
function map(cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	d3.select('.content-map')
		.call(sel=>{
			sel.selectAll('*').remove();
			sel.call(mapInit, fEnd);
		});


}





//==================================================================
//
//==================================================================
function mapInit(sel, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var width = +sel.style('width').replace('px',''),
			height = +d3.select('.content-map').style('height').replace(/\D+$/,'');


	window.addEventListener('resize', function(){

		if (M.timer.resize) window.clearTimeout(M.timer.resize);
		M.timer.resize = window.setTimeout(function(){

			eventLayoutResize();

			window.setTimeout(function(){

				var width = +sel.style('width').replace('px',''),
						height = +d3.select('.content-map').style('height').replace(/\D+$/,'');

				d3.select('#map')
					.styles({
						width:width+'px',
						height:height+'px',
					})
					.select('svg')
						.styles({
							width:width+'px',
							height:height+'px',
						});

			},1);

		},1);




	});



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
					})
					.call(sel=>{

						sel.append('rect')
							.attrs({
								class:'bg-rect',
								//x:-(1e6/3),
								//y:-(1e6/3),
								width:1e6,
								height:1e6,
								opacity:1,
								fill:'#D4DADC',
								//fill:chroma('purple').darken(30).hex(),
							});

					});



	function centered(ll)	{
		return {
			x: ll[0][0]+(ll[1][0]-ll[0][0])/2,
			y: ll[0][1]+(ll[1][1]-ll[0][1])/2,
		};
	}

	// initial center of map
	var my = centered([[99.5,0],[120,8]]),
			cases = centered([[-36.98, -120.959],[48.83, 146.77]]),
			wuhan = {y:25,x:114.093};


  M.leafletMap = L.map('map', {
		//scrollWheelZoom: false,
		//maxBounds: bounds,
	})
  	.setView(
  		innerWidth>1000 ? [cases.y,cases.x] : [wuhan.y, wuhan.x],
  		innerWidth>1000 ? 2 : 3
  	);

	dbg&&console.log('getBounds()', M.leafletMap.getBounds());

	//M.leafletMap.setMaxBounds(M.leafletMap.getBounds());
	//M.leafletMap.setMaxBounds(M.leafletMap.getBounds());


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
			maxZoom: 19,
			minZoom: 2,
			opacity:1,
//			opacity:1,
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

	L.control.layers(baseLayers).addTo(M.leafletMap);
  layers.CartoDB_Positron.addTo(M.leafletMap);





	//----------
	// point
	//----------
  // Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
  	if (x && y)	{
	  	//console.log('x,y',x,y);
	    var point = M.leafletMap.latLngToLayerPoint(new L.LatLng(y, x));
	    this.stream.point(point.x, point.y);
	  }
  }
	//Create a d3.geo.path to convert GeoJson to SVG
  var transform = d3.geoTransform({point: projectPoint});

  M.point = d3.geoPath().projection(transform);
  M.point.pointRadius(5);


	//----------
	// path
	//----------
  function projectPath(x, y) {
  	//console.log('x,y',x,y);
    var p = M.leafletMap.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(p.x, p.y);
  }

  var transformPath = d3.geoTransform({point: projectPath});
  M.path = d3.geoPath().projection(transformPath);




	//----------
	// svg
	//----------

	//adds an SVG element to Leaflet’s overlay pane
	d3.select(M.leafletMap.getPanes().overlayPane)
		.call(sel=>{

			sel.append("svg")
					.attr('class','map-container')
			    .attr('overflow','visible')
			    .call(sel=>{

			    	sel.call(defsGooey, 10,10,5,50);

					  sel.append("g")
							.attr("class", "leaflet-zoom-hide markers-container");

			    });

		});

 //svgmap = d3.select('.map-container');






//	window.setTimeout(function(){
//		var points = [
//			[-64.78407323879503,-196.5715026855469],[83.19212875892394,243.23318481445315]
//		];
//		M.leafletMap.flyToBounds(points);
//	},2000);



//	var points = M.data.martinedoesgis
//		.filter(d=>d.latitude&&d.longitude)
//		.map(d=>[d.latitude,d.longitude]);
//
//	dbg&&console.log({points});
////
////	var polygon = turf.polygon([points]);
////	var center = turf.centerOfMass(polygon);
////
////	dbg&&console.log({polygon});
////	dbg&&console.log({center});
//
//
//	M.leafletMap.flyToBounds(points);


	fEnd();

}





//==================================================================
//
//==================================================================
function mapBound(data)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

//	if (innerWidth > 640)	{

		dbg&&console.log('data', data);

		var lat = d3.extent(data,d=>d.latitude),
				lng = d3.extent(data,d=>d.longitude);

		dbg&&console.log('lat', JSON.stringify(lat,null,2) );

		if (lat[0]&&lng[0])	{

			//M.leafletMap.setMaxBounds(M.leafletMap.getBounds());
			var bounds = [
			    [lat[0], lng[0]],
			    [lat[1], lng[1]]
			];

			dbg&&console.log('bounds', JSON.stringify(bounds,null,2) );
			M.leafletMap.fitBounds(bounds);

		}

//	}

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



