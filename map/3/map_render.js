


//==================================================================
//
//==================================================================
function mapRender(date, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var facets;
	if (!date) date = vizTimeline_curDate();

	dbg&&console.log('date', date);

//	if (!M.map.facets) M.map.facets={};
//	if (M.map.facets[date])	{
//
//		facets = M.map.facets[date];
//
//		//----------
//		// regenerate x,y from longitude,latitude
//		//----------
//		facets.forEach(k=>{
//			k.mode.forEach(m=>{
//				m.data.forEach(d=>{
//
//					var p = M.leafletMap.latLngToLayerPoint(new L.LatLng(d.latitude, d.longitude));
//					d.x = p.x;
//					d.y = p.y;
//
//					return d;
//
//				});
//
//			});
//		});
//
//
//	}else	{


		var data = M.data.martine.concat(M.data.first41);
		data = data.filter(d=>!!d.longitude && !!d.latitude);


		var maxDate = d3.max(data,d=>d.date_str);
		var maxConfirmed = d3.max(data,d=>d.confirmed);
		var maxDeaths = d3.max(data,d=>d.deaths);
	//	var maxRecovered = d3.max(data,d=>d.recovered);

		var scaleRadius = d3.scaleSqrt().domain([0, d3.max([maxConfirmed,maxDeaths])/2 ]).range([2,30]);

		var scaleColorConfirmed = d3.scaleSqrt().domain([0, d3.max([maxConfirmed,maxDeaths]) ]).range(['purple','purple']);
		var scaleColorDeaths = d3.scaleSqrt().domain([0, d3.max([maxConfirmed,maxDeaths]) ]).range(['crimson','crimson']);

		var todays = data.filter(d=>d.date_str==date);

		// if no data, get previous
		if (!todays||todays.length==0) {
			var maxAvailableDate = d3.max(data.filter(d=>d.date_str<date),d=>d.date_str);
			if (maxAvailableDate) todays = data.filter(d=>d.date_str==maxAvailableDate);
		}


		var locationData = d3.nest()
												.key(d=>[f3(d.latitude),f3(d.longitude)].join('-'))
												.entries(todays)
												.map(d=>{

													d.confirmed = d3.sum(d.values, d=>d.confirmed);
													d.deaths = d3.sum(d.values, d=>d.deaths);

													d.confirmed_radius = scaleRadius(d.confirmed);
													d.deaths_radius = scaleRadius(d.deaths);

													d.latitude = d.values[0].latitude;
													d.longitude = d.values[0].longitude;
													d.country = d.values[0].country;
													d.location = d.values[0].location || d.values[0].region;

													var p = M.leafletMap.latLngToLayerPoint(new L.LatLng(d.latitude, d.longitude));
													d.x = p.x;
													d.y = p.y;

													return d;

												})
												.sort(d3.comparator().order(d3.descending,d=>d['confirmed']));

		dbg&&console.log('locationData', locationData);


		//----------
		// facets
		//----------

		facets = [

			{
				key		:	'confirmed',
				mode	:	[
									{
										key:'gooeys',
										type:'circle',

										data: locationData.map(d=>{
											d.scale = {
												key:'confirmed',
												value: 'confirmed',
												color: scaleColorConfirmed,
												radius: scaleRadius
											};
											d.properties = {
												stroke:'#000',
												'stroke-width':1,
												'stroke-opacity':.5,
												'fill-opacity':.5,
											};
											return {...d};
										}),

									},
									{
										key:'points',
										type:'circle',
										data: locationData.map(d=>{
											d.scale = {
												key:'confirmed',
												value: 'confirmed',
												color: scaleColorConfirmed,
												radius: scaleRadius
											};
											d.properties = {
												stroke:'#fff',
												'stroke-width':1,
												'stroke-opacity':.5,
												'fill-opacity':1,
											};
											return {...d};
										}),

									},
								],
			},

			{
				key		:	'deaths',
				mode	:	[
									{
										key:'gooeys',
										type:'circle',

										data: locationData.map(d=>{
											d.scale = {
												key:'deaths',
												value: 'deaths',
												color: scaleColorDeaths,
												radius: scaleRadius
											};
											d.properties = {
												stroke:'#000',
												'stroke-width':1,
												'stroke-opacity':1,
												'fill-opacity':1,
											};
											return {...d};
										}),

									},
									{
										key:'points',
										type:'circle',

										data: locationData.map(d=>{

											d.scale = {
												key:'deaths',
												value: 'deaths',
												color: scaleColorDeaths,
												radius: scaleRadius
											};
											d.properties = {
												stroke:'#fff',
												'stroke-width':1,
												'stroke-opacity':.5,
												'fill-opacity':1,
											};
											return {...d};
										}),

									},
								],
			},


		];

//	} // facets

	dbg&&console.log('facets', [...facets]);

//
//	//-----------------------------
//	//  transform svgmap
//	//-----------------------------
//	var collection = turf.featureCollection([
//	  turf.point([-180,-90]),
//	  turf.point([180,90]),
//	]);
//
//  var bounds = M.point.bounds(collection);
//  //dbg&&console.log('bounds', bounds);
//
//  var topLeft = bounds[0];
//  var bottomRight = bounds[1];
//	var margin = 0;
//
//	var svgmap = d3.select('.map-container');
//
//  svgmap
//  	.attr("width", bottomRight[0] - topLeft[0] + (margin*2))
//    .attr("height", bottomRight[1] - topLeft[1] + (margin*2))
//    .style("left", topLeft[0] - margin + "px")
//    .style("top", topLeft[1] - margin + "px");
//
//	var g = d3.select('.markers-container');
//  g.attr("transform", "translate(" + -(topLeft[0]+margin) + "," + -(topLeft[1]+margin) + ")")

//
//	//----------
//	// generate x,y from longitude,latitude
//	//----------
//	facets.forEach(k=>{
//		k.mode.forEach(m=>{
//			m.data.forEach(d=>{
//
//				var p = M.leafletMap.latLngToLayerPoint(new L.LatLng(d.latitude, d.longitude));
//				d.x = p.x;
//				d.y = p.y;
//
//				return d;
//
//			});
//
//		});
//	});
//
//	dbg&&console.log('facets',[...facets]);



	//----------
	// render
	//----------
	var facet = d3.select('.markers-container')
								.selectAll('.facets').data(facets,d=>d.key);
	facet.exit().remove();
	facet.enter()
				.append('g')
					.attr('class',d=>'facets facets-'+d.key)
			.merge(facet)
				.call(renderMapRedrawMode, fEnd);



}




//
//
////==================================================================
////
////==================================================================
//function mapRender_render(date, cb)	{
//	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
//			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
//	if (dbg){ console.group(f); console.time(f) };
//
//
//	if (!M.current.data) M.current.data = 'martine';
//	var data = M.data[M.current.data]||[];
//
//	renderMap(data, date, fEnd);
//
//}
//




//
//
//
////==================================================================
////
////==================================================================
//function renderMap(data, date, cb)	{
//	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
//			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
//	if (dbg){ console.group(f); console.time(f) };
//
//	dbg&&console.log('data', data);
//
//	if (!date) date = d3.max(data, d=>d.date_str);
//	if (date) M.current.date = date;
//
//	dbg&&console.log('date', date);
//
//
//
//	//-----------------------------------
//	//
//	//-----------------------------------
//
//
//
//	renderMapRedraw(data, date, fEnd);
//
//}



//
////-----------------------------------
////
////-----------------------------------
//function renderMapRedraw(data, date, cb)	{
//	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
//			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
//	if (dbg){ console.group(f); console.time(f) };
//
//
//
//	dbg&&console.log('data', [...data]);
//
//	if (date)	M.current.date = date;
//	dbg&&console.log('date', date);
//
//
//
//	data = data.filter(d=>!!d.longitude && !!d.latitude);
//
//
//
//
//	var maxDate = d3.max(data,d=>d.date_str);
//	var maxConfirmed = d3.max(data,d=>d.confirmed);
//	var maxDeaths = d3.max(data,d=>d.deaths);
//
//	var scaleRadius = d3.scaleSqrt().domain([0, d3.max([maxConfirmed,maxDeaths]) ]).range([2,30]);
////	var scaleColorConfirmed = d3.scaleSqrt().domain([0, d3.max([maxConfirmed,maxDeaths]) ]).range(['purple','purple']);
//	var scaleColorConfirmed = d3.scaleSqrt().domain([0, d3.max([maxConfirmed,maxDeaths]) ]).range(['purple','purple']);
//	var scaleColorDeaths = d3.scaleSqrt().domain([0, d3.max([maxConfirmed,maxDeaths]) ]).range(['crimson','crimson']);
//
//	//dbg&&console.log('scaleRadius', scaleRadius.domain(), scaleRadius.range(), maxConfirmed, scaleRadius(maxConfirmed) );
//
//
//
//
//	var locationData = d3.nest().key(d=>d.location_id).entries([...data]);
//	locationData.forEach(d=>{
//		d.values.sort(d3.comparator().order(d3.descending, d=>d.date_str));
//
//		if (M.current.date)	{
//			var k = d.values.find(j=>j.date_str==M.current.date);
//			if (k)	{
//				for (var i in k)	{
//					d[i]=k[i];
//				}
//			}else	{
//				for (var i in d.values[0])	{
//					d[i]=d.values[0][i];
//				}
//				d.confirmed = 0;
//				d.deaths = 0;
//			}
//		}else	{
//			for (var i in d.values[0])	{
//				d[i]=d.values[0][i];
//			}
//		}
//	});
//
//	locationData.sort(d3.comparator().order(d3.descending,d=>d['confirmed']));
//
//	dbg&&console.log('locationData', locationData);
//
//
//	//----------
//	// facets
//	//----------
//
//	var facets = [
//
//		{
//			key		:	'confirmed',
//			mode	:	[
//								{
//									key:'gooeys',
//									type:'circle',
//
//									data: locationData.map(d=>{
//										d.scale = {
//											key:'confirmed',
//											value: 'confirmed',
//											color: scaleColorConfirmed,
//											radius: scaleRadius
//										};
//										d.properties = {
//											stroke:'#000',
//											'stroke-width':1,
//											'stroke-opacity':.5,
//											'fill-opacity':.5,
//										};
//										return {...d};
//									}),
//
//								},
//								{
//									key:'points',
//									type:'circle',
//									data: locationData.map(d=>{
//										d.scale = {
//											key:'confirmed',
//											value: 'confirmed',
//											color: scaleColorConfirmed,
//											radius: scaleRadius
//										};
//										d.properties = {
//											stroke:'#fff',
//											'stroke-width':1,
//											'stroke-opacity':.5,
//											'fill-opacity':1,
//										};
//										return {...d};
//									}),
//
//								},
//							],
//		},
//
//		{
//			key		:	'deaths',
//			mode	:	[
//								{
//									key:'gooeys',
//									type:'circle',
//
//									data: locationData.map(d=>{
//										d.scale = {
//											key:'deaths',
//											value: 'deaths',
//											color: scaleColorDeaths,
//											radius: scaleRadius
//										};
//										d.properties = {
//											stroke:'#000',
//											'stroke-width':1,
//											'stroke-opacity':1,
//											'fill-opacity':1,
//										};
//										return {...d};
//									}),
//
//								},
//								{
//									key:'points',
//									type:'circle',
//
//									data: locationData.map(d=>{
//
//										d.scale = {
//											key:'deaths',
//											value: 'deaths',
//											color: scaleColorDeaths,
//											radius: scaleRadius
//										};
//										d.properties = {
//											stroke:'#fff',
//											'stroke-width':1,
//											'stroke-opacity':.5,
//											'fill-opacity':1,
//										};
//										return {...d};
//									}),
//
//								},
//							],
//		},
//
//
//	];
//
//
//	dbg&&console.log('facets', [...facets]);
//
//
//
//
//
//
//	//----------
//	// transform svgmap
//	//----------
//
//	//dbg&&console.log('getBounds()', M.leafletMap.getBounds());
//
//
//	var collection = turf.featureCollection([
//	  turf.point([-180,-90]),
//	  turf.point([180,90]),
//	]);
//
//  var bounds = M.point.bounds(collection);
//  //dbg&&console.log('bounds', bounds);
//
//  var topLeft = bounds[0];
//  var bottomRight = bounds[1];
//	var margin = 0;
//
//	var svgmap = d3.select('.map-container');
//
//  svgmap
//  	.attr("width", bottomRight[0] - topLeft[0] + (margin*2))
//    .attr("height", bottomRight[1] - topLeft[1] + (margin*2))
//    .style("left", topLeft[0] - margin + "px")
//    .style("top", topLeft[1] - margin + "px");
//
//	var g = d3.select('.markers-container');
//  g.attr("transform", "translate(" + -(topLeft[0]+margin) + "," + -(topLeft[1]+margin) + ")")
//
//
//	//----------
//	// generate x,y from longitude,latitude
//	//----------
//	facets.forEach(k=>{
//		k.mode.forEach(m=>{
//			m.data.forEach(d=>{
//
//				var p = M.leafletMap.latLngToLayerPoint(new L.LatLng(d.latitude, d.longitude));
//				d.x = p.x;
//				d.y = p.y;
//
//				return d;
//
//			});
//
//		});
//	});
//
//	dbg&&console.log('facets',[...facets]);
//
//	//----------
//	// render
//	//----------
//	var facet = g.selectAll('.facets').data(facets,d=>d.key);
//	facet.exit().remove();
//	facet.enter()
//				.append('g')
//					.attr('class',d=>'facets facets-'+d.key)
//			.merge(facet)
//				.call(renderMapRedrawMode, fEnd);
//
//
//
//	//-----------
//	// annotation
//	//-----------
////
////	var annotations = [
////    {
////      note: {
////        label: "Basic settings with subject position(x,y) and a note offset(dx, dy)",
////        title: "d3.annotationLabel"
////      },
////      x:M.leafletMap.latLngToLayerPoint(new L.LatLng(3, 102)).x,
////      y:M.leafletMap.latLngToLayerPoint(new L.LatLng(3, 102)).y,
//////      dx:M.leafletMap.latLngToLayerPoint(new L.LatLng(3, 102)).x,
//////      dy:M.leafletMap.latLngToLayerPoint(new L.LatLng(3, 102)).y,
//////      x: 50,
//////      y: 150,
//////      dy: 137,
//////      dx: 162
////    },
//////    {
//////      note: {
//////          label: "Added connector end 'arrow', note wrap '180', and note align 'left'",
//////          title: "d3.annotationLabel",
//////          wrap: 150,
//////          align: "left"
//////        },
//////        connector: {
//////          end: "arrow"
//////        },
//////        x: 170,
//////        y: 150,
//////        dy: 137,
//////        dx: 162
//////    },{
//////      note: {
//////        label: "Changed connector type to 'curve'",
//////        title: "d3.annotationLabel",
//////       wrap: 150
//////      },
//////      connector: {
//////        end: "dot",
//////        type: "curve",
//////        points: [[100, 14],[190, 52]]
//////      },
//////      x: 350,
//////      y: 150,
//////      dy: 137,
//////      dx: 262
//////    },{
//////      type: d3.annotationCalloutCircle,
//////      note: {
//////        label: "A different annotation type",
//////        title: "d3.annotationCalloutCircle",
//////        wrap: 190
//////      },
//////      subject: {
//////        radius: 50
//////      },
//////      x: 620,
//////      y: 150,
//////      dy: 137,
//////      dx: 102
//////    }
////   ];
//
//
//
////
////	var k = {
////		note: {
////			label: "Basic settings with subject position(x,y) and a note offset(dx, dy)",
////			title: "d3.annotationLabel"
////		},
////		x:M.leafletMap.latLngToLayerPoint(new L.LatLng(0, 0)).x,
////		y:M.leafletMap.latLngToLayerPoint(new L.LatLng(0, 0)).y,
////  };
////
////	k.dy = k.y + 10;
////	k.dx = k.x + 10;
////
////	dbg&&console.log('k annotation', k);
////
//////      dx:M.leafletMap.latLngToLayerPoint(new L.LatLng(3, 102)).x,
//////      dy:M.leafletMap.latLngToLayerPoint(new L.LatLng(3, 102)).y,
//////      x: 50,
//////      y: 150,
//////      dy: 137,
//////      dx: 162
//////    },
////
////
////  var makeAnnotations = d3.annotation()
////    .type(d3.annotationLabel)
////    .annotations([k]);
////
//////  d3.select("svg")
////  d3.select('.markers-container')
////    .append("g")
////    	.attr("class", "annotation-group")
////    	.call(makeAnnotations)
//
//
//}


//-----------------------------------
//
//-----------------------------------
function renderMapRedrawMode(sel,cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	var g = sel.selectAll('.modes').data(d=>d.mode, d=>d.key);
	g.exit().remove();
	g
		.enter()
			.append('g')
				.attr('class',d=>'modes modes-'+d.key)
				.attr('filter',d=>d.key=='gooeys' ? 'url(#gooey2)' : null)
		.merge(g)
			.call(renderMapRedrawPoints, fEnd);



}


//-----------------------------------
//
//-----------------------------------
function renderMapRedrawPoints(sel, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

//	dbg&&console.log('sel.datum()', sel.datum());

	var p = sel.selectAll('circle')
						.data(d=>d.data, d=>d.key)

	p.exit().remove();
	p.enter()
			.append('circle')
				.attrs({
					class:d=>'bubble key-'+d.scale.key,
					cx:d=>d.x,
					cy:d=>d.y,

					// get properties from parent
					//	r:function(d){
					//		var p = d3.select(this.parentNode).datum();
					//		return p.scale.radius(d[p.scale.key]);
					//	},

					// use attached properties
//					r:d=>d[d.scale.key] ? d.scale.radius(d[d.scale.key]) : 0,
//					fill:d=>d.scale.color(d[d.scale.key]),

					r:0,
					fill:'#000',

					'stroke':d=>d.properties['stroke']||null,
					'stroke-width':d=>d.properties['stroke-width']||null,

					'fill-opacity':d=>d.properties['fill-opacity']||null,
					'stroke-opacity':d=>d.properties['stroke-opacity']||null,

				})
//				.on('mouseover', function(d){
//					M.current.idle = moment();
//				})
//				.on('mouseout', function(d){
//					M.current.idle = moment();
//				})
				.on('click', function(d){
					//M.current.idle = moment();
					console.log('d', d);
				})
			.merge(p)
				.attrs({
					cx:d=>d.x,
					cy:d=>d.y,
				})
				.transition()
					//.duration(M.current.playSpeed)
					.attrs({
						r:d=>d[d.scale.key] ? d.scale.radius(d[d.scale.key]) : 0,
						fill:d=>d.scale.color(d[d.scale.key]),
					});


	fEnd();

}



//-----------------------------------
//
//-----------------------------------
function renderMapRedrawLabels(sel, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	fEnd();

}



