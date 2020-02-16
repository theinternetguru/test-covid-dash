

//==================================================================
//
//==================================================================
function vizEvents(date, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	if (!date) {
		d3.select('.annotations').selectAll('.viz-events').data([]).exit().remove();
		return;
	}

	var data = M.data.bnoevents.filter(d=>d.date_str==date);
	if (!data||data.length==0)	{
		data = M.data.bnoevents.filter(d=>d.date_str==moment(date).add(-1,'days').format('YYYY-MM-DD') );
		if (!data||data.length==0)	{
			data = M.data.bnoevents.filter(d=>d.date_str==moment(date).add(-2,'days').format('YYYY-MM-DD') );
			if (!data||data.length==0)	{
				data = M.data.bnoevents.filter(d=>d.date_str==moment(date).add(-3,'days').format('YYYY-MM-DD') );
				if (!data||data.length==0)	{
					data = M.data.bnoevents.filter(d=>d.date_str==moment(date).add(-4,'days').format('YYYY-MM-DD') );
					if (!data||data.length==0)	{
						data = M.data.bnoevents.filter(d=>d.date_str==moment(date).add(-5,'days').format('YYYY-MM-DD') );
					}
				}
			}
		}
	}

//	data = data.filter(d=>d.description.match(/first/i)||d.country_code=='MYS');

	dbg&&console.log('data', date, data);

	var nest = d3.nest()
							.key(d=>[f3(d.location.latitude),f3(d.location.longitude)].join('-'))
							.entries(data)
							.map(d=>{


								d.note = {
									title: [d.values[0].location.region, d.values[0].location.country_code].join(', '),
									label: d.values[0].description,
								};

								d.latitude = d.values[0].location.latitude;
								d.longitude = d.values[0].location.longitude;

								var p = M.leafletMap.latLngToLayerPoint(new L.LatLng(d.latitude, d.longitude));


								d.x = p.x;
								d.y = p.y;
//
//								d.dx = d3.shuffle([-50,-40,-30,30,40,50])[0];
//								d.dy = d3.shuffle([30,40,50,60,70])[0];
								d.dx = -50;
								d.dy = -50;

								return d;
							});

	dbg&&console.log('nest', nest);

	d3.shuffle(nest);

  var makeAnnotations = d3.annotation()
    .type(d3.annotationLabel)
    .annotations(nest.slice(0,1));


	var bb = d3.select('.content-map').node().getBoundingClientRect();

	var v = d3.select('.annotations').selectAll('.viz-events').data([1]);
	v.exit().remove();
	v.enter()
		.append('div')
			.attr('class','viz-events')
			.styles({
				position:'absolute',
				'z-index':6666,
				'pointer-events':'none',
			})
			.call(sel=>{

				sel.append('svg')
					.attrs({
						width	:'100%',
						height:'100%',
					});

			})
		.merge(v)
			.styles({
				left	:bb.x+'px',
				top		:bb.y+'px',
				width	:bb.width+'px',
				height:bb.height+'px',
			})
			.call(sel=>{

				var c = sel.select('svg')
					.attrs({
						viewBox:[0,0,bb.width,bb.height].join(' '),
						overflow:'hidden',
					})
					.call(makeAnnotations);

			});



	fEnd();

}

