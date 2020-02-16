


//==================================================================
//
//==================================================================
function map(cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var width = 1137.78
			height = 429.792;

	dbg&&console.log('width x height',width, height);


	var ratio = width/height;
	dbg&&console.log('ratio',ratio);

	var mapContentWidth = +d3.select('.content-map').style('height').replace(/^\D+|\D+$/g,''),
			mapContentHeight = +d3.select('.content-map').style('height').replace(/^\D+|\D+$/g,'');


	dbg&&console.log('mapContentHeight',mapContentHeight);

	dbg&&console.log('mapContentHeight * ratio',mapContentHeight * ratio);

	var showInfoPanel = false;
	if (mapContentWidth - (mapContentHeight * ratio) > 300)	{
		showInfoPanel = true;
	}





	d3.select('.content-map')
		.call(sel=>{
			sel.selectAll('*').remove();

			sel.append('div')
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

	dbg&&console.log('width',width);
	dbg&&console.log('height',height);

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
						background:'#3F448E',
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
								fill:'#000',
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
  		innerWidth>1300 ? [cases.y,cases.x] : [wuhan.y, wuhan.x-20],
  		innerWidth>1000 ? 2 : 3
  	);

//  	.setView(
//  		[wuhan.y, wuhan.x],
//  		2
//  	);

	dbg&&console.log('getBounds()', M.leafletMap.getBounds());

	//M.leafletMap.setMaxBounds(M.leafletMap.getBounds());
	//M.leafletMap.setMaxBounds(M.leafletMap.getBounds());


	//-----------------------------
	// credits
	//-----------------------------

	var attribution = d3.nest().key(d=>d.source.label).entries(
											M.config.data.hot.concat(M.config.data.cold).filter(d=>d.key!='summary')
										)
										.map(d=>'<a href="'+d.values[0].source.url+'" target="_blank">'+d.values[0].source.label+'</a>')
										.join(', ');


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

		Thunderforest_TransportDark : L.tileLayer('https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey={apikey}', {
			attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			apikey: '716a32cce364498cbddcc5f329050dc1',
			maxZoom: 22
		}),

		CartoDB_Positron: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 19,
			minZoom: 2,
			opacity:1,
//			opacity:1,
		}),

		CartoDB_DarkMatterNoLabels:L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
			//attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
			attribution: [
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
				'Data: '+attribution,
			].join('<br>'),
			subdomains: 'abcd',
			maxZoom: 19,
			minZoom:1,
			opacity:1,
		}),

	};


	var baseLayers = {
	    'Stamen TonerLite'				: layers.stamen,
	    'Stamen TonerBackground'	: layers.stamen_toner,
	    'Esri_Gray'								: layers.esri_gray,
	    'Esri_WorldImagery'				: layers.Esri_WorldImagery,
	    'Esri_WorldTerrain'				: layers.Esri_WorldTerrain,
	    'Esri_WorldShadedRelief'			: layers.Esri_WorldShadedRelief,
	    'Thunderforest.Transport'			: layers.thunderforest,
	    'Thunderforest_TransportDark' : layers.Thunderforest_TransportDark,
	    'CartoDB_Positron'						: layers.CartoDB_Positron,
	    'CartoDB_DarkMatterNoLabels'						: layers.CartoDB_DarkMatterNoLabels,
	};

//	L.control.layers(baseLayers).addTo(M.leafletMap);
//  layers.CartoDB_Positron.addTo(M.leafletMap);
  layers.CartoDB_DarkMatterNoLabels.addTo(M.leafletMap);





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




	//-----------------------------------
	//
	//-----------------------------------
	var svgmap = d3.select('.map-container');

  M.leafletMap.on('movestart', mapmovestart);
  M.leafletMap.on('moveend', mapmove);

	function mapmovestart(e){
		M.current.idle = moment();
		svgmap.style('display','none');
	}

  function mapmove(e) {
    //renderMapRedraw(data);
   	mapPlotArea();
    mapRender();
		svgmap.style('display','block');
  }

  M.leafletMap.on('zoomstart', mapzoomstart);
  M.leafletMap.on('zoomend', mapzoom);


	function mapzoomstart(e){
		M.current.idle = moment();
		svgmap.style('display','none');
	}

  function mapzoom(e) {
   	//renderMapRedraw(data);
   	mapPlotArea();
    mapRender();
		svgmap.style('display','block');
  }




	mapPlotArea();

	//-----------------------------
	//  transform svgmap
	//-----------------------------
	function mapPlotArea()	{

//		var collection = turf.featureCollection([
//		  turf.point([-180,-90]),
//		  turf.point([180,90]),
//		]);

		var collection = turf.featureCollection([
		  turf.point([-180*2,-90*2]),
		  turf.point([180*2,90*2]),
		]);

	  var bounds = M.point.bounds(collection);
	  //dbg&&console.log('bounds', bounds);

	  var topLeft = bounds[0];
	  var bottomRight = bounds[1];
		var margin = 0;

		var svgmap = d3.select('.map-container');

	  svgmap
	  	.attr("width", bottomRight[0] - topLeft[0] + (margin*2))
	    .attr("height", bottomRight[1] - topLeft[1] + (margin*2))
	    .style("left", topLeft[0] - margin + "px")
	    .style("top", topLeft[1] - margin + "px");

		var g = d3.select('.markers-container');
	  g.attr("transform", "translate(" + -(topLeft[0]+margin) + "," + -(topLeft[1]+margin) + ")")

	}


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



//-----------------------------
//
//-----------------------------

/*
 * Workaround for 1px lines appearing in some browsers due to fractional transforms
 * and resulting anti-aliasing.
 * https://github.com/Leaflet/Leaflet/issues/3575
 */
(function(){
    var originalInitTile = L.GridLayer.prototype._initTile
    L.GridLayer.include({
        _initTile: function (tile) {
            originalInitTile.call(this, tile);

            var tileSize = this.getTileSize();

            tile.style.width = tileSize.x + 1.5 + 'px';
            tile.style.height = tileSize.y + 1.5 + 'px';
        }
    });
})();


