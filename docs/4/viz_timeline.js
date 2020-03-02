


//------------------------------------------------------------------
//
//------------------------------------------------------------------
function vizTimeline(key, data, cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('key', key);
//	dbg&&console.log('data', [...data]);


	d3.select('.content-timeline')
		.datum({key:key, data:[data]})
		.call(vizTimeline_layout, fEnd);


}




//------------------------------------------------------------------
//
//------------------------------------------------------------------
function vizTimeline_layout(sel, cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	var bb = sel.node().getBoundingClientRect();
	dbg&&console.log('bb',bb);


	var svg = sel.selectAll('.svg-timeline').data(d=>d.data, d=>d.key);
	svg.exit().remove();
	svg.enter()
		.append('svg')
			.attrs({
				class:'svg-timeline',
				'text-rendering':'geometricPrecision',
			})
//			.styles({
//				width:'98%',
//				height:'98%',
//				overflow:'hidden',
//			})
			.call(sel=>{

				sel.append('g')
					.attr('class','play-btn')
					.call(sel=>{

						sel.append('path')
							.attrs({
								fill:M.theme.hud[1],
								d:'M-25 -30 L25 0 -25 30 -25 -30Z',
								//d:
								cursor:'pointer',
							})
							.on('mouseover',function(d){
								d3.select(this)
									.transition()
										.attr('fill',M.theme.hud[0]);
							})
							.on('mouseout',function(d){
								d3.select(this)
									.transition()
										.attr('fill',M.theme.hud[1]);
							})
							.on('click',function(d){

								d3.select(this)
									.transition()
										.attr('fill',M.theme.hud[0]);

								M.current.play = !M.current.play;
								if (M.current.play) vizTimeline_play();

							})

						});



			})
		.merge(svg)
			.attrs({
				viewBox:'0 0 '+parseInt(bb.width)+' '+parseInt(bb.height),
				preserveAspectRatio:"none",
				height:'100%',
				width:'100%',
			})
//			.attrs({
//				viewBox:'0 0 100 100',
//				preserveAspectRatio:"xMidYMid slice",
//				width:100,
//				height:100,
//			})
			.call(sel=>{

				sel.select('.play-btn')
					.select('path')
						.attr('transform','translate(50,'+bb.height/2+')');
						//.attr('transform','translate(50,50)');

				sel.call(vizTimeline_chart, bb, fEnd);

			});





}



//------------------------------------------------------------------
//
//------------------------------------------------------------------
function vizTimeline_chart(sel, bb, cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	dbg&&console.log('M.filters.country',M.filters.country);

	var w = innerWidth-200,
			h = parseInt(+d3.select('.content-timeline').style('height').replace('px','') - 2),
			bh = h - 30;

	dbg&&console.log('bb',bb);
	dbg&&console.log('w',w,h,bh);


	var data = sel.data();

	dbg&&console.log('data',data);

	var minDataDate = d3.min(data[0], d=>d.date_str);
	var maxDataDate = d3.max(data[0], d=>d.date_str);

	dbg&&console.log('minDataDate',minDataDate);
	dbg&&console.log('maxDataDate',maxDataDate);



	var maxSummaryDate = d3.max(M.data.summary, d=>moment(d.updated).format('YYYY-MM-DD'));
//	dbg&&console.log('maxSummaryDate',maxSummaryDate, moment(maxSummaryDate) > moment(maxDate));

//	var minDate = '2020-01-01';
//	var minDate = '2019-11-30';
	var minDate = moment(minDataDate).add(-1,'days').format('YYYY-MM-DD');
	var maxDate = maxDataDate;

	var days100 = moment(minDate).add(100,'days').format('YYYY-MM-DD')
	if (moment(maxDate) < moment(days100))	{
		maxDate = days100;
	}

	var days = d3.timeDays( moment(minDate), moment(maxDate).add(1,'days'), 1);


	var dates=[];
	var prev = {
		confirmed:0,
		deaths:0,
		recovered:0,
		countries:0,
	};

	var cny = d3.timeDays(moment('2020-01-25'),moment('2020-02-08')).map(d=>moment(d).format('YYYY-MM-DD'));

	var tdy = moment().format('YYYY-MM-DD');


	//-----------------------------
	// date ranges & gaps
	//-----------------------------
//	var datesFirst41 		= d3.extent(M.data.martine, d=>d.date_str); 	// 2019-12-01", "2020-01-01
//	var datesMartine 		= d3.extent(M.data.martine, d=>d.date_str); 	// 2020-01-10", "2020-02-14
//	var datesJhu 				= d3.extent(M.data.jhu, d=>d.date_str); 			// 2020-01-21", "2020-02-14
//	var datesBnoRegion 	= d3.extent(M.data.bnoregion, d=>d.date_str); // 2020-01-24", "2020-02-15



	var nest = d3.nest().key(d=>d.date_str).entries(data[0]);
	dbg&&console.log('nest', [...nest]);



	days.forEach(d=>{

		var dt = moment(d).format('YYYY-MM-DD');
		var k=nest.find(k=>k.key==dt);

		var j = {
			key:dt,
			values:k&&k.values||[],
			confirmed:0,
			deaths:0,
			recovered:0,
			countries:0,
		};

		// chinese new year festivals
		j.cny = cny.indexOf(j.key) > -1 ? 1 : 0;

		if (dt <= tdy)	{

			j.confirmed = d3.sum(j.values, d=>d.confirmed) 	|| prev.confirmed;
			j.deaths 		= d3.sum(j.values, d=>d.deaths) 		|| prev.deaths;
			j.recovered = d3.sum(j.values, d=>d.recovered) 	|| prev.recovered;
			j.countries = d3.sum(j.values, d=>d.countries) 	|| prev.countries;
		}


		//-----------------------------
		// latest from summary
		//-----------------------------
		if (!M.filters.country)	{
			if (dt==tdy)	{
				j.confirmed = d3.max([ prev.confirmed,  d3.max(M.data.summary, d=>d.confirmed) ]);
				j.deaths 		= d3.max([ prev.deaths,  d3.max(M.data.summary, d=>d.deaths) ]);
				j.recovered = d3.max([ prev.recovered,  d3.max(M.data.summary, d=>d.recovered) ]);
			}
		}

		//-----------------------------
		// no later than today
		//-----------------------------
		if (dt <= tdy)	{

			j.diff_confirmed 	= j.confirmed - prev.confirmed;
			j.diff_deaths 		= j.deaths - prev.deaths;
			j.diff_recovered 	= j.recovered - prev.recovered;
			j.diff_countries 	= j.countries - prev.countries;




			//-----------------------------
			// countries
			//-----------------------------


	//		j.countries_data = j.values[0]&&j.values[0].values.find(d=>d.key=='first41') ? j.values[0].values.find(d=>d.key=='first41').countries
	//												: j.values[0]&&j.values[0].values.find(d=>d.key=='martine') ? j.values[0].values.find(d=>d.key=='martine').countries
	//												: j.values[0]&&j.values[0].values.find(d=>d.key=='jhu') ? j.values[0].values.find(d=>d.key=='jhu').countries
	//												: prev.countries_data;

			var tmp = j.values[0]&&j.values[0].values;

			if (tmp)	{
				j.countries_data 	= tmp.find(d=>d.key=='first41') ? tmp.find(d=>d.key=='first41').countries
													: tmp.find(d=>d.key=='bnoplace') ? tmp.find(d=>d.key=='bnoplace').countries
													: tmp.find(d=>d.key=='jhuarchive') ? tmp.find(d=>d.key=='jhuarchive').countries
													: tmp.find(d=>d.key=='jhu') ? tmp.find(d=>d.key=='jhu').countries
													: tmp.find(d=>d.key=='bnoregion') ? tmp.find(d=>d.key=='bnoregion').countries
													: tmp.find(d=>d.key=='martine') ? tmp.find(d=>d.key=='martine').countries
													: prev.countries_data;

			//-----------------------------
			// data gap
			//-----------------------------
			}else	{
				j.countries_data = prev.countries_data;
			}


		}



		dates.push(j);

		prev=j;

	});


	dbg&&console.log('dates',dates);
	M.data.dates = dates;

	//-----------------------------------
	// x,y scales, axis
	//-----------------------------------

	var x = d3.scaleTime().domain([ moment(minDate),moment(maxDate) ]).range([0,w]);

	var maxConfirmed = d3.max([10, d3.max(dates, d=>d.confirmed) ]);
	dbg&&console.log('maxConfirmed', maxConfirmed);

	var scaleType = M.current.scaleType||'linear';
	var y, yScale;

	if (scaleType=='linear')	{
		y = d3.scaleLinear().range([0,bh-10]);
		yScale = d3.scaleLinear().range([0,bh-10]);
	}else	if (scaleType=='sqrt') {
		y = d3.scaleSqrt().range([5,bh-10]);
		yScale = d3.scaleSqrt().range([5,bh-10]);
	}else if (scaleType=='log')	{
		y = d3.scaleLog().range([5,bh-10]);
		yScale = d3.scaleLog().range([5,bh-10]);
	}

	y.domain([scaleType=='log'?5:0, 10 ]);
	yScale.domain([10, scaleType=='log'?5:0 ]);

	var yTicks = d3.axisRight(yScale).ticks(5);

	var bw = d3.max([ 3, x( moment(minDate).add(1,'days') ) - x( moment(minDate) ) - 1 ]);

	//-----------------------------------
	// tests
	//-----------------------------------

//	var last14days = dates.filter(d=>moment(d.key) > moment().add(-14,'days') && moment(d.key) < moment().add(1,'days'));
//	vizSummary_bars('confirmed', last14days, 0);
//	vizSummary_bars('deaths', last14days, 1);
//	vizSummary_bars('recovered', last14days, 2);
//	vizSummary_bars('countries', last14days, 3);


	//-----------------------------------
	// render
	//-----------------------------------

	var pa = sel.selectAll('.plotarea').data(d=>[d],d=>d.key);
	pa.exit().remove();
	pa.enter()
		.append('g')
			.attrs({
				class:'plotarea',
				transform:'translate(100,10)',
				'pointer-events':'none',
			})
			.call(sel=>{

//				sel.append('rect')
//					.attrs({
//						class:'plotarea-bg',
//						width:w,
//						height:h,
//						//fill:chroma('#43459D').darken(50).hex(),
//						//fill:chroma('steelblue').darken(50).hex(),
//						fill:'#262626',
//						opacity:1,
//
//					});

				sel.append('g')
					.attr('class','bg-container');

				sel.append('g')
					.attr('class','bg-ticks');

				sel.append('g')
					.attr('class','plot-confirmed-container');

				sel.append('g')
					.attr('class','plot-recovered-container');

				sel.append('g')
					.attr('class','plot-deaths-container');

				sel.append('g')
					.attr('class','axis-x-container');

				sel.append('g')
					.attr('class','axis-y-container')
						.call(labelsY);

			})
		.merge(pa)
			.call(sel=>{

				sel.select('.plotarea-bg')
					.transition()
						.attrs({
							width:w,
							height:h,
						});

				sel.select('.bg-container')
					.call(bgRects);

				sel.select('.bg-ticks')
					.call(axisY);

				sel.select('.plot-confirmed-container')
					.call(plotBar, 0);

				sel.select('.plot-recovered-container')
					.call(plotBar, 2);

				sel.select('.plot-deaths-container')
					.call(plotBar, 1);

				sel.select('.axis-x-container')
					.call(axisX);



			});




	//-----------------------------------
	// set drag initial position
	//-----------------------------------
	var k = dates.filter(d=>d.confirmed||d.deaths||d.recovered)[0];
	dbg&&console.log('k',k);

	if (k)	{

		d3.select('.date-info')
			.style('display','block')
			.style('left', 100+(x(moment(k.key))-50+(bw/2))+'px')
			.select('.date-info-text')
				.text(moment(k.key).format('ddd, D MMM'));

		d3.select('.y-labels-right')
			.attr('transform','translate('+(x(moment(k.key)))+',0)');

	}

	if (M.current.disableautoplay) M.current.disableautoplay=true;
	if (!M.current.disableautoplay) M.current.play=true;

	//window.setTimeout(animatePlotsInit,2000);
	window.setTimeout(animatePlotsInit,500);





	fEnd();





	//-----------------------------------
	// bgrects
	//-----------------------------------
	function bgRects(sel)	{

		var bg = sel.selectAll('.bg').data(dates.filter(d=>d.cny),d=>d.key);
		bg.exit().remove();
		bg.enter()
			.append('rect')
				.attrs({
					class:'bg fill-1',
					x:d=>x(moment(d.key)),
					width:bw-1,
					height:bh,
					opacity:1,
					fill:d=>d.cny
									? chroma.mix(M.theme.colors[1],'#000',.8,'rgb').hex()
									: moment(d.key).format('d').match(/5|6/) ? chroma('#000').brighten(1).hex() : '#000',
					//'shape-rendering':'geometricPrecision',
					//'shape-rendering':'crispEdges',
				})
			.merge(bg)
				.transition()
					.attrs({
						x:d=>x(moment(d.key)),
						width:bw-1,
						height:bh,
					});


		var xd= sel.selectAll('.x-dateline').data([1]);
		xd.enter()
			.append('line')
				.attrs({
					class:'x-dateline',
					y2:bh,
					stroke:chroma(M.theme.colors[0]).hex(),
				})
			.merge(xd)
				.transition()
					.attrs({
						y2:bh,
					});

	}



	//-----------------------------------
	// plotBar
	//-----------------------------------
	function plotBar(sel, colorIdx)	{

		var bar = sel.selectAll('.bar').data(dates,d=>d.key);
		bar.exit().remove();
		bar.enter()
			.append('rect')
				.attrs({
					class:'bar',
					x:d=>x(moment(d.key)),
					width:bw-1,
					y:bh,
					height:0,

					stroke:colorIdx==1 ? 'crimson' : null,

					fill:M.theme.colors[colorIdx],
					//'shape-rendering':'crispEdges',
					//'shape-rendering':'optimizeSpeed',
					//'shape-rendering':'geometricPrecision',
				})
			.merge(bar)
				.transition()
					.attrs({
						x:d=>x(moment(d.key)),
						width:bw-1,
						y:bh,
						height:0,
					});


	}


	//-----------------------------------
	// axisY
	//-----------------------------------
	function axisY(sel)	{

//		var dt = sel.selectAll('.y-confirmed-line')
//			.data( dates.filter(d=>d.confirmed),d=>d.key);
//
//		dt.exit().remove()
//		dt.enter()
//			.append('line')
//				.attrs({
//					class:'y-confirmed-line',
//					x1:d=>x(moment(d.key)),
//					x2:d=>x(moment(d.key)+bw),
//					y1:d=>bh-y(d.diff_confirmed), // prev
//					y2:d=>bh-y(d.diff_confirmed),
//					stroke:chroma(M.theme.colors[0]).brighten().hex(),
//					'shape-rendering':'crispEdges',
//					opacity:1,
//				})
//			.merge(dt);



		var yt=sel.selectAll('.y-ticks-right').data([1]);
		yt.enter()
				.append('g')
					.attr('class','y-ticks-right')
				.merge(yt)
					.attr('transform','translate('+w+',10)')
					.call(sel=>{
						sel.call(yTicks);
						sel
							.selectAll('.tick')
							.select('line')
								.attrs({
									'stroke-width':.5,
									stroke:'#999',
									x1:-w,
								});
						});

		//var grids = sel.selectAll('.y-grid')


	}



	//-----------------------------------
	// axisX
	//-----------------------------------
	function axisX(sel)	{

		var line = sel.selectAll('line').data([1]);
		line.enter()
					.append('line')
					.merge(line)
						.attrs({
							class:'x-axis',
							x1:0,
							y1:bh,
							x2:w,
							y2:bh,
							stroke:'#666',
						});

		//------------------
		// days
		//------------------
		var xl = sel.selectAll('.x-axis-label').data([1]);
		xl.enter()
				.append('g')
					.attrs({
						class:'x-axis-label',
					})
			.merge(xl)
				.call(sel=>{

					var txt = sel.selectAll('text').data(
												dates
													.filter(d=>(moment(d.key).format('d')==0||moment(d.key).format('D')=='1')
														 && (+moment(d.key).format('D')==1 || +moment(d.key).format('D')>3)
													)
												,d=>d.key);
					txt.enter()
							.append('text')
						.merge(txt)
							.attrs({
								x:d=>x(moment(d.key)) + (moment(d.key).date()==1 ? (bw/2)-3 : (bw/2)),
								y:bh+10,
								fill:M.theme.hud[2],
								'font-size':'10px',
								'text-anchor':d=>moment(d.key).date()==1 ? 'begin' : 'middle',
								'font-weight':400,
							})
							.text(d=>moment(d.key).date()==1 ? moment(d.key).format('D MMM') : moment(d.key).format('D'));

				});

	}


	//-----------------------------------
	// labelsY
	//-----------------------------------
	function labelsY(sel)	{

		var ly = sel.selectAll('.y-labels-right').data([1]);
		ly.enter()
				.append('g')
				.attrs({
					class:'y-labels-right',
					transform:'translate(0,0)',
					opacity:0,
				})
			.merge(ly)
				.call(sel=>{


					//-----------------------------
					//  y-label
					//-----------------------------

					var ly2 =sel.selectAll('.y-label')
						.data([
							{
								key:'confirmed',
								colorIdx:0,
								label:'CONFIRMED',
							},
							{
								key:'recovered',
								colorIdx:2,
								label:'RECOVERED',
							},
							{
								key:'deaths',
								colorIdx:1,
								label:'DEATHS',
							},
						], d=>d.key);
					ly2.enter()
							.append('g')
								.attr('class',d=>'y-label y-'+d.key+'-label')
								.call(sel=>{

									//-----------------------------
									//  value-bg
									//-----------------------------
									sel.append('text')
										.attrs({
											class:'value-bg',
											x:bw+5,
											y:5,
											'font-weight':700,
										})
										.call(sel=>{

											sel.append('tspan')
												.attrs({
													class:d=>'y-'+d.key+'-value-bg',
													'font-size':'14px',
													fill:'#000',
													stroke:'#000',
													'stroke-width':5,
													x:bw+5,
												})
												.text('0');


											sel.append('tspan')
												.attrs({
													class:d=>'y-'+d.key+'-value-label-bg',
													fill:'#000',
													stroke:'#000',
													'stroke-width':5,
													'font-size':'8px',
													x:bw+5,
													dy:'1em',
												})
												.text(d=>d.label);


										});


									//-----------------------------
									//  value
									//-----------------------------
									sel.append('text')
										.attrs({
											class:'value',
											x:bw+5,
											y:5,
											'font-weight':700,
										})
										.call(sel=>{

											sel.append('tspan')
												.attrs({
													class:d=>'y-'+d.key+'-value',
													'font-size':'14px',
													fill:'#fff',
													x:bw+5,
												})
												.text('0');


											sel.append('tspan')
												.attrs({
													class:d=>'y-'+d.key+'-value-label',
													fill:d=>chroma(M.theme.colors[d.colorIdx]).brighten().brighten().hex(),
													'font-size':'8px',
													x:bw+5,
													dy:'1em',
												})
												.text(d=>d.label);


										});


								})
						.merge(ly2)
							.attr('transform','translate(0,'+bh+')')
							.call(sel=>{

								sel.selectAll('text')
									.attr('x', bw+5)
									.selectAll('tspan')
										.attr('x', bw+5);

							});


				});

	}



	//------------------------------------------------------------------
	//
	//------------------------------------------------------------------
	function dragTimeline(sel, cb)	{

		var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
		dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };

		if (M.timer.drag) window.clearTimeout(M.timer.drag);
		M.timer.drag = window.setTimeout(function(){


			var dateInfo = d3.select('.date-info');
			var posX = +dateInfo.node().style.left.replace('px','')-50;
			var mdate = moment(x.invert(posX));

			//dbg&&console.log('posX',posX);
			//dbg&&console.log('x.invert()', moment(x.invert(posX)).format('ddd, D MMM') );

			dateInfo.select('.date-info-text')
				.text(mdate.format('ddd, D MMM'));

			// x-dateline
			d3.select('.x-dateline')
				.attr('transform','translate('+(posX)+',0)');


			//--------------------------
			// y.domain
			//--------------------------

			var maxValue = d3.max([10, d3.max(dates.filter(d=>moment(d.key) <= mdate), d=>d.confirmed) ]);
			y.domain([ 0, maxValue ]);
			yScale.domain([ maxValue, 0]).ticks(
				maxValue<=10 ? 2 : 5
			);


			d3.select('.plot-confirmed-container')
				.selectAll('.bar')
					.attrs({
						display:d=>moment(d.key) <= mdate ? 'block' : 'none',
					})
					.transition()
						.duration(90)
						.ease(d3.easeLinear)
							.attrs({
								y:d=>d.confirmed ? d3.max([0, bh-y(d.confirmed) ]) : bh,
								height:d=>d.confirmed ? d3.min([bh, y(d.confirmed) ]) : 0,
							});


			d3.select('.plot-deaths-container')
				.selectAll('.bar')
					.attrs({
						display:d=>moment(d.key) <= mdate ? 'block' : 'none',
					})
					.transition()
						.duration(300)
						.ease(d3.easeLinear)
							.attrs({
								y:d=>d.deaths ? d3.max([0, bh-y(d.deaths) ]) : bh,
								height:d=>d.deaths ? d3.min([bh, y(d.deaths) ]) : 0,
							});


			d3.select('.plot-recovered-container')
				.selectAll('.bar')
					.attrs({
						display:d=>moment(d.key) <= mdate ? 'block' : 'none',
					})
					.transition()
						.duration(300)
						.ease(d3.easeLinear)
							.attrs({
								y:d=>d.recovered ? d3.max([0, bh-y(d.deaths+d.recovered) ]) : bh,
								height:d=>d.recovered ? d3.min([bh, y(d.deaths+d.recovered) ]) : 0,
							});


			window.setTimeout(function(){

				//--------------------------
				// y.labels
				//--------------------------

				var k = dates.find(d=>d.key==mdate.format('YYYY-MM-DD') );
				if (k)	{

					dbg&&console.log('k',k);

					updateYLabelsRight(
						x(moment(k.key)),
						[
							{
								key:'confirmed',
								y:(bh-y(k.deaths+k.recovered)) - (bh-y(k.confirmed)) < 24 ? bh-y(k.deaths+k.recovered) - 24 : bh-y(k.confirmed),
								value:k.confirmed,
							},
							{
								key:'recovered',
								y:(bh-y(k.deaths)) - (bh-y(k.deaths+k.recovered)) < 24 ? bh-y(k.deaths) - 24 : bh-y(k.deaths+k.recovered),
								value:k.recovered,
							},
							{
								key:'deaths',
								y:bh-y(k.deaths),
								value:k.deaths,
							}
						],
					);

					updateSummary(k);

				}

				//-----------------------------
				//  vizSummary_bars
				//-----------------------------

				//var last14days = dates.filter(d=>moment(d.key) > moment().add(-14,'days') && moment(d.key) < moment().add(1,'days'));
				var last14days = dates.filter(d=>moment(d.key) > moment(mdate).add(-30,'days')
															&& moment(d.key) < moment(mdate).add(1,'days')
													);
				var dur = 100;
				vizSummary_bars('confirmed', 	last14days, 0, mdate, dur);
				vizSummary_bars('deaths', 		last14days, 1, mdate, dur);
				vizSummary_bars('recovered', 	last14days, 2, mdate, dur);
				vizSummary_bars('countries', 	last14days, 3, mdate, dur);

				//-----------------------------
				// vizCountries
				//-----------------------------
				var cur = mdate.format('YYYY-MM-DD');

				//var maxValue = d3.max(k.countries_data, d=>d.confirmed);
				vizCountries(k&&k.countries_data||[]);
				vizPatients(minDate, cur);

				mapRender(cur);
				vizEvents(cur);



			},100);


			//d3.select('.y-ticks-right').call(yTicks);

			d3.select('.y-ticks-right')
				.transition()
					.duration(90)
//						.call(yTicks);
						.call(sel=>{
							sel.call(yTicks);
							sel
								.selectAll('.tick')
								.select('line').attr('x1',-w);
						});


			M.timer.drag=null;
			fEnd();

		},10);

	}


	//------------------------------------------------------------------
	//
	//------------------------------------------------------------------
	function animatePlotsInit(sel, cb)	{

		var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
		dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };


		//-----------------------------
		// resume from current date
		//-----------------------------
		var dateInfo = d3.select('.date-info');
		var posX = +dateInfo.node().style.left.replace('px','')-50;
		var curdate = moment(x.invert(posX)).format('YYYY-MM-DD');

		dbg&&console.log('curdate', curdate);

		if (curdate < moment().add(-1,'days').format('YYYY-MM-DD'))	{

			var curDates = dates.filter(d=>(d.confirmed||d.deaths) && d.key >= curdate);
			var dtExtent = d3.extent(curDates, d=>d.key);
			dbg&&console.log('dtExtent', dtExtent);

			var ttlDates = dates.filter(d=>d.confirmed||d.deaths);
			var dur = (M.current.playSpeed / ttlDates.length) * curDates.length;
			var barSpeed = M.current.barSpeed;

		//-----------------------------
		// play from start
		//-----------------------------

		}else	{

			var curDates = dates.filter(d=>d.confirmed||d.deaths);
			var dtExtent = d3.extent(curDates, d=>d.key);
			dbg&&console.log('dtExtent', dtExtent);

			var dur = M.current.playSpeed;
			var barSpeed = M.current.barSpeed;

		}


		var prev;
		d3.select('.date-info')
			.transition()
				.delay(300)
	      .duration(dur)
	      .ease(d3.easeLinear)
	      	.styleTween("left", function() {

	      		var i = d3.interpolateNumber(x(moment(dtExtent[0])), x(moment(dtExtent[1])));

	      		return function(t) {

							//-----------------------------
							// stop
							//-----------------------------
							if (!M.current.play) {
								d3.select('.date-info').transition().duration(0);
								return;
							}




							var mdate = moment(x.invert( i(t) ));
							var cur = mdate.format('YYYY-MM-DD');

							//-------------------------------
							// apply at every interval
							//-------------------------------
							d3.select('.y-labels-right')
								.attr('opacity',1)
								.attr('transform','translate('+(i(t))+',0)');

							// x-dateline
							d3.select('.x-dateline')
								.attr('transform','translate('+(i(t)+bw/2)+',0)');



							//-------------------------------
							// apply once at switch of new day
							//-------------------------------
	      			var k = curDates.find(j=>(!prev||prev!=j.key) && j.key==cur);

	      			if (k)	{



								//--------------------------
								// y.domain
								//--------------------------
								var maxValue = d3.max([10, d3.max(dates.filter(d=>moment(d.key) <= mdate), d=>d.confirmed) ]);
								y.domain([ 0, maxValue ]);
								yScale.domain([ maxValue, 0]);


								d3.select('.y-ticks-right')
									.transition()
										.duration(dur/curDates.length)
									//.call(yTicks);
									.call(sel=>{
										sel.call(yTicks);
										sel
											.selectAll('.tick')
											.select('line').attr('x1',-w);
									});


								//--------------------------
								// date-info-text
								//--------------------------
		      			d3.select('.date-info-text').text(
		      				moment(x.invert( i(t) )).format('ddd, D MMM')
		      			);


								//--------------------------
								// y-deaths-label
								//--------------------------
								var el2 = d3.select('.y-deaths-label');
								var y2 = el2.node().transform.baseVal.getItem(0).matrix.f;
								var yD = d3.interpolateNumber(y2, k.deaths ? bh-y(k.deaths) : bh);

								el2
									.attr('display',k.deaths>0?'inline':'none')
									.call(sel=>{
										sel.select('.y-deaths-value-bg').text(comma(k.deaths));
										sel.select('.y-deaths-value').text(comma(k.deaths));
									})
									.transition()
										.duration(dur/curDates.length)
										.ease(d3.easeLinear)
										.attrTween('transform',function(){
											return function(t2)	{
												return 'translate(0,'+ yD(t2) +')'
											}
										});


								//--------------------------
								// y-recovered-label (stack on-top of deaths)
								//--------------------------
								var el3 = d3.select('.y-recovered-label');
								var y3;
								if (d3.select('.y-recovered-label').node().transform.baseVal.length)	{
									y3 = el3.node().transform.baseVal.getItem(0).matrix.f;
								}else	{
									y3 = el3.node().getBBox().y;
								}
								var yR = d3.interpolateNumber(y3, k.deaths+k.recovered ? bh-y(k.deaths+k.recovered) : bh);

								el3
									.attr('display',k.recovered>0?'inline':'none')
									.call(sel=>{
										sel.select('.y-recovered-value-bg').text(comma(k.recovered));
										sel.select('.y-recovered-value').text(comma(k.recovered));
									})
									.transition()
										.ease(d3.easeLinear)
										.duration(dur/curDates.length)
										.attrTween('transform',function(){
											return function(t1)	{
												return 'translate(0,'+ (yR(t1) < (yD(t1) - 25) ? yR(t1) : yD(t1)-25) +')'
											}
										});

								//--------------------------
								// y-confirmed-label
								//--------------------------
								var el1 = d3.select('.y-confirmed-label');
								var y1 = el1.node().transform.baseVal.getItem(0).matrix.f;
								var yC = d3.interpolateNumber(y1, k.confirmed ? bh-y(k.confirmed) : bh);

								el1
									.attr('display',k.confirmed>0?'inline':'none')
									.call(sel=>{
										sel.select('.y-confirmed-value-bg').text(comma(k.confirmed));
										sel.select('.y-confirmed-value').text(comma(k.confirmed));
									})
									.transition()
										.ease(d3.easeLinear)
										.duration(dur/curDates.length)
										.attrTween('transform',function(){
											return function(t1)	{
												return 'translate(0,'+ (yC(t1) < (yD(t1) - 25) ? yC(t1) : yD(t1)-25) +')'
											}
										});


								//--------------------------
								// summary numbers
								//--------------------------

		      			updateSummary(k);


								//--------------------------
								// bars - hide not yet visible
								//--------------------------
								d3.select('.plot-confirmed-container')
									.selectAll('.bar')
										.attr('display',d=>d.key<=cur ? 'block' : 'none')
										.transition()
											.duration(barSpeed)
											.ease(d3.easeLinear)
												.attrs({
													y:d=>d.confirmed ? d3.max([0, bh-y(d.confirmed) ]) : bh,
													height:d=>d.confirmed ? d3.min([bh, y(d.confirmed) ]) : 0,
												});

								d3.select('.plot-deaths-container')
									.selectAll('.bar')
										.attr('display',d=>d.key<=cur ? 'block' : 'none')
										.transition()
											.duration(barSpeed)
											.ease(d3.easeLinear)
												.attrs({
													y:d=>d.deaths ? d3.max([0, bh-y(d.deaths) ]) : bh,
													height:d=>d.deaths ? d3.min([bh, y(d.deaths) ]) : 0,
												});

								d3.select('.plot-recovered-container')
									.selectAll('.bar')
										.attr('display',d=>d.key<=cur ? 'block' : 'none')
										.transition()
											.duration(barSpeed)
											.ease(d3.easeLinear)
												.attrs({
													y:d=>d.recovered ? d3.max([0, bh-y(d.deaths+d.recovered) ]) : bh,
													height:d=>d.recovered ? d3.min([bh, y(d.deaths+d.recovered) ]) : 0,
												});



								//-----------------------------
								//  vizSummary_bars
								//-----------------------------
								//var last14days = dates.filter(d=>moment(d.key) > moment().add(-14,'days') && moment(d.key) < moment().add(1,'days'));
								var last14days = dates.filter(d=>moment(d.key) > moment(mdate).add(-30,'days')
																			&& moment(d.key) < moment(mdate).add(1,'days')
																	);

								var dur = 100;
								vizSummary_bars('confirmed', 	last14days, 0, mdate, dur);
								vizSummary_bars('deaths', 		last14days, 1, mdate, dur);
								vizSummary_bars('recovered', 	last14days, 2, mdate, dur);
								vizSummary_bars('countries', 	last14days, 3, mdate, dur);



								//-----------------------------
								// vizCountries
								//-----------------------------
								//var maxValue = d3.max(k.countries_data, d=>d.confirmed);
								vizCountries(k.countries_data);
								vizPatients(minDate,cur);

								mapRender(cur);
								vizEvents(cur);

							}



	      			prev = cur;

							// date-info left
	      			return  (i(t)+50+(bw/2))+'px';
	      		};
	      	}) // styletween
	      	.on('start',function(){
	      		dbg&&console.log('transition start');
	      	})
	      	.on('end',function(){
	      		dbg&&console.log('transition end');
	      		M.current.play = !M.current.play;
	      	})
	      	.on('interrupt',function(){
	      		dbg&&console.log('transition interrupt');
	      	})
	      	.on('cancel',function(){
	      		dbg&&console.log('transition cancel');
	      	});


//		});


		fEnd();
	}



	//------------------------------------------------------------------
	//
	//------------------------------------------------------------------
	function updateSummary(k)	{

		d3.select('.content-summary')
			.call(sel=>{

				sel.selectAll('.summary-source')
					.attr('display','none');

				sel.selectAll('.summary-asof')
					.attr('display','none');

				sel.select('.new-confirmed')
					.text(k.diff_confirmed>0 ? (k.diff_confirmed>0?'+':'')+comma(k.diff_confirmed) : '');

				sel.select('.value-confirmed')
					.text(k.confirmed ? comma(k.confirmed) : '');

				sel.select('.new-deaths')
					.text(k.diff_deaths>0 ? (k.diff_deaths>0?'+':'')+comma(k.diff_deaths) : '');

				sel.select('.value-deaths')
					.text(k.deaths ? comma(k.deaths) : '');

				sel.select('.new-recovered')
					.text(k.diff_recovered>0 ? (k.diff_recovered>0?'+':'')+comma(k.diff_recovered) : '');

				sel.select('.value-recovered')
					.text(k.recovered ? comma(k.recovered) : '');

				sel.select('.new-countries')
					.text(k.diff_countries>0 ? (k.diff_countries>0?'+':'')+comma(k.diff_countries) : '');

				sel.select('.value-countries')
					.text(k.countries ? comma(k.countries) : '');

			});

	}


	//------------------------------------------------------------------
	//
	//------------------------------------------------------------------
	function updateYLabelsRight(xPos, yData, dur)	{

		if (!dur||dur<50) dur = 100;

		// x
  	d3.select('.y-labels-right')
  		.transition()
  			.duration(dur)
	  		.attr('opacity', d3.sum(yData, d=>d.value)==0 ? 0 : 1)
	  		.attr('transform','translate('+(xPos)+',0)');


		// y & value
		yData
			//.filter(k=>k.value>0)
			.forEach(k=>{


		  	d3.select('.y-'+k.key+'-value-bg')
		  		.text(k.value ? comma(k.value) : '');

		  	d3.select('.y-'+k.key+'-value')
		  		.text(k.value ? comma(k.value) : '');

		  	d3.select('.y-'+k.key+'-label')
		  		.transition()
		  			.duration(dur)
			  		.attr('opacity',k.value?1:0)
			  		.attr('transform','translate(0,'+(k.y||0)+')');


			});


	}




	//------------------------------------------------------------------
	//
	//------------------------------------------------------------------
	function resetScale(cb)	{

		var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
		dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };

//		w = innerWidth-200;
//		x.range([0,w]);
//
//		var sel = d3.select('.x-dateline');
//		var bb = sel.node().getBoundingClientRect();
//		var posX = sel.node().transform.baseVal.getItem(0).matrix.e;
//		var mdate = moment(x.invert(posX));
//
//		dbg&&console.log('mdate', mdate.format('YYYY-MM-DD'), posX, bb.x );
//
//		d3.select('.date-info')
//			.transition()
//				.style('left', bb.x+'px');

		d3.selectAll('.bar').attr('display','none');

		if (M.timer.vizTimeline) window.clearTimeout(M.timer.vizTimeline);
		M.timer.vizTimeline = window.setTimeout(function(){
			vizTimeline('daily', M.nest.daily, function(){
				M.timer.vizTimeline = null;
				fEnd();
			});
		},300);


	}


	//------------------------------------------------------------------
	//
	//------------------------------------------------------------------
	function getTimelineDate()	{
		var dateInfo = d3.select('.date-info');
		var posX = +dateInfo.node().style.left.replace('px','')-50;
		return moment(x.invert(posX)).format('YYYY-MM-DD');
	}




	vizTimeline_play = animatePlotsInit;
	vizTimeline_drag = dragTimeline;
	vizTimeline_resetScale = resetScale;
	vizTimeline_curDate = getTimelineDate;

}



var vizTimeline_drag;
var vizTimeline_play;
var vizTimeline_resetScale;
var vizTimeline_curDate;
