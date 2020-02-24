


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

	if (!M.map.facets) M.map.facets={};
	if (M.map.facets[date])	{

		facets = M.map.facets[date];

		//----------
		// regenerate x,y from longitude,latitude
		//----------
		facets.forEach(k=>{
			k.mode.forEach(m=>{
				m.data.forEach(d=>{

					var p = M.leafletMap.latLngToLayerPoint(new L.LatLng(d.latitude, d.longitude));
					d.x = p.x;
					d.y = p.y;

					return d;

				});

			});
		});


	}else	{

		var max_martine = d3.max(M.data.martine,d=>d.date_str);
		var min_jhu = d3.min(M.data.jhu,d=>d.date_str);

		dbg&&console.log('max_martine', max_martine);
		dbg&&console.log('min_jhu', min_jhu);

//		var data = M.data.martine.concat(M.data.first41);
//		data = data.concat(M.data.jhu.filter(k=>k.date_str>max_martine));

		var data=[];
		data = data.concat(M.data.first41);
		data = data.concat(M.data.martine.filter(d=>d.date_str<min_jhu));
		data = data.concat(M.data.jhu);


		data = data.filter(d=>!!d.longitude && !!d.latitude);

//		dbg&&console.log('data',data);


		dbg&&console.log('countries',d3.nest().key(d=>d.country).entries(data));


		var maxDate = d3.max(data,d=>d.date_str);
		var maxConfirmed = d3.max(data,d=>d.confirmed);
		var maxDeaths = d3.max(data,d=>d.deaths);
	//	var maxRecovered = d3.max(data,d=>d.recovered);



		var maxConfirmedChina = d3.max(data.filter(d=>d.country.match(/china/i)),d=>d.confirmed);
		var maxConfirmedWorld = d3.max(data.filter(d=>!d.country.match(/china/i)),d=>d.confirmed);

		var scaleRadiusChina = d3.scaleSqrt().domain([0, maxConfirmedChina/2 ]).range([2,30]);
		var scaleRadius = d3.scaleSqrt().domain([0, maxConfirmedWorld ]).range([2,20]);

//		var scaleColorConfirmed = d3.scaleSqrt().domain([0, d3.max([maxConfirmed,maxDeaths]) ]).range(['purple','purple']);
		var scaleColorConfirmed = d3.scaleSqrt().domain([0, d3.max([maxConfirmed,maxDeaths]) ]).range(['mediumorchid','magenta']);
		var scaleColorDeaths = d3.scaleSqrt().domain([0, d3.max([maxConfirmed,maxDeaths]) ]).range(['crimson','crimson']);

		dbg&&console.log('scaleRadiusChina',scaleRadiusChina.domain());
		dbg&&console.log('scaleRadius',scaleRadius.domain());



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


													if (d.values[0].country.match(/china/i))	{
														d.scaleRadius = scaleRadiusChina;
														d.confirmed_radius = scaleRadiusChina(d.confirmed);
														d.deaths_radius = scaleRadiusChina(d.deaths);
													}else	{
														d.scaleRadius = scaleRadius;
														d.confirmed_radius = scaleRadius(d.confirmed);
														d.deaths_radius = scaleRadius(d.deaths);
													}

													d.latitude = d.values[0].latitude;
													d.longitude = d.values[0].longitude;
													d.country = d.values[0].country;
													d.location = d.values[0].location || d.values[0].region;

													var p = M.leafletMap.latLngToLayerPoint(new L.LatLng(d.latitude, d.longitude));
													d.x = p.x;
													d.y = p.y;

													// events data
													//d.events = M.data.bnoevents.filter(k=>k.date_str==date && k.location.region==d.location);
													d.events = M.data.events.filter(k=>k.date_str==date && (
														d.location&&k.location.region==d.location
														|| d.country&&k.location.country==d.country
													));

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
												radius: d.scaleRadius
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
												radius: d.scaleRadius
											};
//											d.properties = {
//												stroke:'#fff',
//												'stroke-width':1,
//												'stroke-opacity':.5,
//												'fill-opacity':1,
//											};
											d.properties = {
												stroke:'none',
//												'stroke-width':1,
//												'stroke-opacity':.5,
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
												radius: d.scaleRadius
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
												radius: d.scaleRadius
											};
//											d.properties = {
//												stroke:'#fff',
//												'stroke-width':1,
//												'stroke-opacity':.5,
//												'fill-opacity':1,
//											};
											d.properties = {
												stroke:'none',
//												'stroke-width':1,
//												'stroke-opacity':.5,
												'fill-opacity':1,
											};
											return {...d};
										}),

									},
								],
			},


		];

	} // facets

	dbg&&console.log('facets', [...facets]);


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



