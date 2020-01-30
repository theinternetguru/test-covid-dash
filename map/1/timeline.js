

//==================================================================
//
//==================================================================
function timeline(data, date, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	d3.select('.content-timeline')
		.style('display','flex')
		.call(sel=>{


			sel.call(timelineCases, data, date);


		});


	fEnd();

}



//==================================================================
//
//==================================================================
function timelineCases(sel, data, date, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('date',date);



//	var w = innerWidth-100,
	var w = innerWidth-100,
			h = +d3.select('.content-timeline').style('height').replace('px','') - 2,
			bh = h - 30;






	var nest = d3.nest().key(d=>d.date_str).entries(data);
	var minDataDate = d3.min(data, d=>d.date_str);
	var maxDataDate = d3.max(data, d=>d.date_str);

	var minDate = '2020-01-01';
	var maxDate = maxDataDate;

	var days100 = moment(minDate).add(100,'days').format('YYYY-MM-DD')
	if (moment(maxDate) < moment(days100))	{
		maxDate = days100;
	}

	var days = d3.timeDays( moment(minDate), moment(maxDate), 1);

	var dates=[];
	var prev;

	days.forEach(d=>{

		var dt = moment(d).format('YYYY-MM-DD');
		var k=nest.find(k=>k.key==dt);

		var j = {
			key:dt,
			values:k&&k.values||[],
		};

		j.confirmed = d3.sum(j.values, d=>d.confirmed);
		j.deaths 		= d3.sum(j.values, d=>d.deaths);

		j.countries = d3.nest().key(d=>d.country).entries(j.values.filter(d=>d.confirmed+d.deaths > 0));

		j.diff_confirmed 	= prev && prev.confirmed && j.confirmed - prev.confirmed || null;
		j.diff_deaths 		= prev && prev.deaths && j.deaths - prev.deaths || null;


		var pc = prev ? prev.countries.map(d=>d.key) : [];
		var jc = j.countries.map(d=>d.key);
		//dbg&&console.log('intersection', jc.filter(d => pc.indexOf(d) < 0 ));

		j.diff_countries 	= pc && jc.filter(d => pc.indexOf(d) < 0 );

		dates.push(j);

		prev=j;

	});

	dbg&&console.log('dates', dates);


//
//	var firstDate = dates.map(d=>d.confirmed+d.deaths).indexOf(!0);
//	dbg&&console.log('firstDate', firstDate);




	//-----------------------------------
	// x,y scales, axis
	//-----------------------------------


	var x = d3.scaleTime().domain([ moment(minDate),moment(maxDate) ]).range([0,w]);

	var maxConfirmed = d3.max(dates, d=>d.confirmed);
	var y = d3.scaleLinear().domain([0,maxConfirmed]).range([0,bh-10]);


	var bw = x( moment(minDate).add(1,'days') ) - x( moment(minDate) );
	dbg&&console.log('bw', bw);


//
//	var xAxis = d3.axisBottom(x)
//	        //.ticks(d3.timeHour, 12)
//	        .ticks(d3.timeDay,7)
//	        //.ticks(d3.timeMonth,1)
//	        .tickSize(-bh)
//	        .tickFormat(function() { return null; });
//
//	var scaleYAxis = d3.scaleLinear()
//				.domain([0, maxConfirmed]) 			// start with 0
//				.range([ bh, 0 ]); 							// reverse scale
//
//	var axisY = d3.axisLeft(y)
//				//.tickValues([1,5,10,15,20,25])
//				//.ticks(5)
//				//.tickFormat(function(d){ return d ? 'RM'+f2(d): null })
//				.tickFormat(function() { return null; });
//			;







	//-----------------------------------
	// layout
	//-----------------------------------

	sel.call(timelineCases_layout, w, h, bh, dates, minDate, maxDate, minDataDate, maxDataDate);


	fEnd();







	//-----------------------------------
	// timelineCases_layout
	//-----------------------------------

	function timelineCases_layout(sel)	{

		var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
				dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };


		var tl = sel.selectAll('.timeline-container').data([1])
		tl.exit().remove();
		tl.enter()
			.append('div')
				.attr('class','timeline-container')
				.styles({
					display:'flex',
					'align-content':'stretch',
					width:'100%',
					height:h+'px',
					overflow:'hidden',
				})
				.call(sel=>{


					//-----------------------------------
					// play-btn
					//-----------------------------------
					sel
						.append('div')
						.attr('class','play-btn')
						.styles({
							flex:'0 0 100px',
							'text-align':'center',
						})
						.call(timelineCases_playButton);


					//-----------------------------------
					// timeline
					//-----------------------------------
					sel
						.append('div')
						.attr('class','timeline')
						.styles({
							flex:'1 1 '+w+'px',
							margin:0,
							padding:0,
	//						width:w+'px',
	//						height:h+'px',
							overflow:'hidden',
						});



				})
			.merge(tl)
				.call(sel=>{

					var g = sel.select('.timeline').selectAll('svg').data([dates]);
					g.exit().remove();
					g.enter()
						.append('svg')
							.attrs({
								class:'svg-timeline',
								viewBox:[0,0,w,h].join(' '),
							})
							.call(sel=>{

								sel.append('g')
									.attr('class','plot-area')
									.attr('transform','translate(0,10)')
									.call(timelineCases_layoutPlot);

								sel.append('g')
									.attr('class','annotations-area');

							})
						.merge(g)
							.call(sel=>{

								sel.select('.chart')
									.call(timelineCases_timelineBar);

							});


				});


		fEnd();

	}



	//-----------------------------------
	// layoutPlot
	//-----------------------------------

	function timelineCases_layoutPlot(sel, dt)	{

		var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
				dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };

		sel
			.call(sel=>{

				sel.append('g')
					.attr('class','chart');

				sel.append('g')
					.attr('class','decor')
					.attr('pointer-events','none')
					.call(sel=>{


						//--------------------------
						// axes
						//--------------------------
						sel.append('g').attr('class','axes')
							.call(sel=>{

								sel.append('line')
									.attrs({
										class:'y-axis',
										x1:0,
										y1:0,
										x2:0,
										y2:bh,
										stroke:'#ccc',
										transform:'translate(0,0)',
									});

								sel.append('line')
									.attrs({
										class:'x-axis',
										x1:0,
										y1:bh,
										x2:w,
										y2:bh,
										stroke:'#666',
									});


								sel.append('g')
									.attrs({
										class:'x-axis-label',
									})
									.selectAll('text').data(dates.filter(d=>moment(d.key).date()%7==1),d=>d.key)
										.enter()
											.append('text')
												.attrs({
													x:d=>x(moment(d.key)),
													y:bh+12,
													fill:'#999',
													'font-size':'10px',
												})
												.text(d=>{
													var t = moment(d.key);
													return t.date()==1
														? t.format('MMM')
														: t.format('D')
												});


							});


						//--------------------------
						// x-ticks
						//--------------------------

						sel.append('g').attr('class','x-ticks')
							.attr('transform','translate(0,0)') // animate this along x-axis
							.call(sel=>{

								//--------------------------
								// x-ticks-confirmed
								//--------------------------
								sel.append('g').attr('class','x-tick-confirmed')
									.attr('transform','translate(0,'+bh+')') // animate this along y-axis
									.attr('opacity',1)
									.call(sel=>{

										sel.append('line')
											.attrs({
												class:'x-tick-confirmed-line',
												x1:0,
												y1:0,
												x2:bw*1.5,
												y2:0,
												stroke:'#ccc',
											});

										sel.append('text')
											.attrs({
												class:'x-tick-confirmed-text',
												x:bw*1.5,
												y:7,
												'text-anchor':'begin',
												transform:'translate(0,0)',
											})
											.call(sel=>{

												sel.append('tspan')
													.attrs({
														class:'x-tick-confirmed-text-value-bg',
														x:bw*1.5,
														//dy:'1em',
														fill:'#fff',
														'font-weight':700,
														stroke:'#000',
														'stroke-width':5,
													});

												sel.append('tspan')
													.attrs({
														class:'x-tick-confirmed-text-value',
														x:bw*1.5,
														//dy:'1em',
														fill:'#fff',
														'font-weight':700,
													});


												sel.append('tspan')
													.attrs({
														class:'x-tick-confirmed-text-label',
														x:bw*1.5,
														y:16,
														fill:'#ff0',
														'font-weight':600,
														'font-size':'8px',
														stroke:'#000',
														'stroke-width':5,
													})
													.text('CONFIRMED');

												sel.append('tspan')
													.attrs({
														class:'x-tick-confirmed-text-label',
														x:bw*1.5,
														y:16,
														fill:'magenta',
														'font-weight':600,
														'font-size':'8px',
													})
													.text('CONFIRMED');


											});

									});

								//--------------------------
								// x-ticks-deaths
								//--------------------------

								sel.append('g').attr('class','x-tick-deaths')
									.attr('transform','translate(0,'+bh+')') // animate this along x-axis
									.attr('opacity',1)
									.call(sel=>{

										sel.append('line')
											.attrs({
												class:'x-tick-confirmed-line',
												x1:0,
												y1:0,
												x2:bw*1.5,
												y2:0,
												stroke:'#ccc',
											});

										sel.append('text')
											.attrs({
												class:'x-tick-deaths-text',
												x:bw*1.5,
												y:7,
												'text-anchor':'begin',
											})
											.call(sel=>{


												sel.append('tspan')
													.attrs({
														class:'x-tick-deaths-text-value-bg',
														x:bw*1.5,
														//dy:'-.5em',
														fill:'#fff',
														'font-weight':700,
														stroke:'#000',
														'stroke-width':5,
													});

												sel.append('tspan')
													.attrs({
														class:'x-tick-deaths-text-value',
														x:bw*1.5,
														//dy:'-.5em',
														fill:'#fff',
														'font-weight':700,
													});

												sel.append('tspan')
													.attrs({
														class:'x-tick-deaths-text-label',
														x:bw*1.5,
														y:16,
														//dy:'1em',
														fill:'crimson',
														'font-weight':600,
														'font-size':'8px',
														stroke:'#000',
														'stroke-width':5,
													})
													.text('DEATHS');

												sel.append('tspan')
													.attrs({
														class:'x-tick-deaths-text-label',
														x:bw*1.5,
														y:16,
														//dy:'1em',
														fill:'crimson',
														'font-weight':600,
														'font-size':'8px',
													})
													.text('DEATHS');

											});

									});

							});

					});


				sel.call(timelineCases_animateTicks, maxDataDate);

			})

		fEnd();
	}

	//-----------------------------------
	// animateTicks
	//-----------------------------------
	function timelineCases_animateTicks(sel, dt)	{

		var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
				dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };

//		dbg&&console.log('dt',dt);
//		dbg&&console.log('datum',dates.find(d=>d.key==dt));

		sel.select('.decor')
			.datum(dates.find(d=>d.key==dt))
			.call(sel=>{


				sel.select('.y-axis')
					.transition()
						.duration(M.current.playSpeed/2)
							.attr('transform',d=>'translate('+x(moment(d.key))+',0)')


				sel.select('.x-ticks')
					.transition()
						.duration(M.current.playSpeed/2)
						//.attr('transform',d=>'translate('+x(moment( d.key ))+','+(bh-y(d.confirmed)-1)+')')
							.attr('transform',d=>'translate('+x(moment( d.key ))+',0)');


				sel.select('.x-tick-confirmed')
					.transition()
						//.delay(M.current.playSpeed/2)
						.duration(M.current.playSpeed/2)
							//.attr('transform',d=>'translate('+(y(d.confirmed)-y(d.deaths) < 20 ? (-bw *1.5) : 0)+','+(bh-y(d.confirmed))+')')
							.attr('transform',d=>'translate(0,'+(bh-y(d.confirmed))+')')
							.attr('opacity',d=>d.confirmed==0?0:1);


				sel.select('.x-tick-deaths')
					.transition()
						//.delay(M.current.playSpeed/2)
						.duration(M.current.playSpeed/2)
							.attr('transform',d=>'translate(0,'+(bh-y(d.deaths))+')')
							.attr('opacity',d=>d.deaths==0?0:1);



				sel.select('.x-tick-confirmed-text-value-bg')
					.text(d=>comma(d.confirmed));

				sel.select('.x-tick-deaths-text-value-bg')
					.text(d=>comma(d.deaths));

				sel.select('.x-tick-confirmed-text-value')
					.text(d=>comma(d.confirmed));

				sel.select('.x-tick-deaths-text-value')
					.text(d=>comma(d.deaths));





				// prevent overlap
				// d3.select('.x-tick-deaths-text').node().getBoundingClientRect()

				sel.select('.x-tick-confirmed-text')
					.transition()
						//.delay(M.current.playSpeed/2)
						.duration(M.current.playSpeed/2)
							.attr('transform',function(d){
								return y(d.confirmed)-y(d.deaths) < 20
									? 'translate(0,-'+(25-(y(d.confirmed)-y(d.deaths)))+')'
									: 'translate(0,0)';
							});

			});

		fEnd();
	}









	//-----------------------------------
	// annotations
	//-----------------------------------

	function timeline_annotations(sel)	{

		var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
				dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };






		fEnd();
	}







	//-----------------------------------
	// timelineCases_playButton
	//-----------------------------------

	function timelineCases_playButton(sel)	{

		var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
				dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };


		sel
			.append('div')
				//.attr('class','btn btn-primary')
				//.attr('type','button')
				.styles({
					background:'#000',
					'border-radius':0,
					border:'none',
					'line-height': h+'px',
					cursor:'pointer',
				})
				.on('click', function(d){


					var sel = d3.select(this).select('.btn-play'),
							tf = sel.classed('fa-play');

					//eventClick('timeline-play-'+!tf);
					//eventClick(category,action,label,value)
					eventClick('timeline','play', tf ? 'pause' : 'play',!tf)

					sel
						.classed('fa-play', tf ? false : true)
						.classed('fa-pause', tf ? true : false)
						.style('color','magenta');


//					if (!tf)	{
//						playStop();
//					}

					function playStop()	{

							d3.selectAll('.bar-bg')
									.transition()
										.attr('fill','#171717')
										.attr('opacity',(d,i)=>i%2==0?.5:.25);


					}


					function play(){

						dbg&&console.log('dates[M.current.idx].key',
							dates[M.current.idx].key,
							maxDataDate,
							moment(dates[M.current.idx].key)>moment(maxDataDate)
						);

						var stop = false;

						if (M.current.idx >= dates.length|| moment(dates[M.current.idx].key)>moment(maxDataDate)) {

							M.current.idx = dates.map(d=>d.key).indexOf(minDataDate) - 1;

							// loop
							if (M.current.loop)	{
								stop = false;

							// stop at last data
							}else	{
								stop = true;
							}

						}


						if (stop)	{

							//M.current.idx = 0;
							if (M.timer.play) window.clearTimeout(M.timer.play);
							M.timer.play = null;

							d3.select('.btn-play')
								.classed('fa-play',true)
								.classed('fa-pause',false)
								.style('color','lime')

							playStop();

							d3.selectAll('.bar-confirmed')
									.transition()
										.attr('fill','purple');

							d3.selectAll('.bar-deaths')
									.transition()
										.attr('fill','crimson');

						}else	{

							var dt = dates[M.current.idx++].key;

//							d3.selectAll('.bar-bg')
//									.transition()
//										.attr('fill',(d,i)=>d.key!=dt ? '#171717' : 'lime' )
//										.attr('opacity',(d,i)=>d.key!=dt ? (i%2==0?.5:.25) : .8 );

							d3.selectAll('.bar-confirmed')
									.transition()
										.attr('fill',k=>k.key!=dt ? chroma('purple').darken().hex() : 'purple');

							d3.selectAll('.bar-deaths')
									.transition()
										.attr('fill',k=>k.key!=dt ? chroma('crimson').darken().hex() : 'crimson');

							d3.select('.svg-timeline')
								.call(timelineCases_animateTicks, dt);

							renderMap(M.data[M.current.data], dt);

//							var curdata=M.data[M.current.data].filter(d=>d.date_str==dt);
//							dbg&&console.log('curdata',curdata);
//							mapBound(curdata);


							if (M.timer.play) window.clearTimeout(M.timer.play);
							M.timer.play = window.setTimeout(play, M.current.playSpeed + (dt==maxDataDate ? 10000 : 500));
						}
					}

					if (tf)	{

						M.current.playSpeed = 300;

						//M.current.idx = 0;
						// set start at minDataDate - 1
						if (!M.current.idx) M.current.idx = dates.map(d=>d.key).indexOf(minDataDate) - 1;
						play();

					}else	{

						M.current.playSpeed = 1500;

						if (M.timer.play) window.clearTimeout(M.timer.play);
						M.timer.play = null;
					}


				})
				.append('i')
					.attr('class','fas fa-play fa-2x btn-play')
					.style('color','lime');




		fEnd();
	}




	//-----------------------------------
	// timelineCases_timelineBar
	//-----------------------------------

	function timelineCases_timelineBar(sel)	{

		var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
				dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };








		var b = sel.selectAll('.bar').data(d=>d,d=>d.key);
		b.exit().remove();
		b.enter()
			.append('g')
				.attrs({
					class:'bar',
					transform:d=>'translate('+x(moment(d.key))+',0)',
				})
				.call(sel=>{



					//-----------------------------------
					// bg
					//-----------------------------------
					sel.append('rect')
						.attrs({
							class:'bar-bg',
							width:bw,
							height:bh,
							fill:'#171717',
							opacity:(d,i)=>i%2==0?.5:.25,
						})
						.styles({
							cursor:'pointer',
						})
						.on('mouseover',function(d,i){

							eventClick();

							if (!M.timer.play)	{
								d3.select(this)
									.transition()
										.attr('opacity',.8);
							}

						})
						.on('mouseout',function(d,i){

							eventClick();

							if (!M.timer.play)	{
								d3.select(this)
									.transition()
										.delay(300)
										.attr('opacity',i%2==0?.5:.25);
							}

						})
						.on('click', function(d){

							dbg&&console.group('CLICK');
							dbg&&console.log('d',d);

							var dt = d.key;

							eventClick('timeline','filter', 'select date '+dt,dt);

							dbg&&console.log(d3.select(this.parentNode.parentNode.parentNode).node().tagName);


							if (!M.timer.play)	{

								d3.select(this.parentNode.parentNode)
									.call(sel=>{

										sel.selectAll('.bar-confirmed')
											.transition()
												.attr('fill',k=>k.key!=dt ? chroma('purple').darken().hex() : 'purple');

										sel.selectAll('.bar-deaths')
											.transition()
												.attr('fill',k=>k.key!=dt ? chroma('crimson').darken().hex() : 'crimson');

									});

								d3.select(this.parentNode.parentNode.parentNode)
									.call(timelineCases_animateTicks, dt);

								renderMap(M.data[M.current.data], dt);

//								var curdata=M.data[M.current.data].filter(d=>d.date_str==dt);
//								dbg&&console.log('curdata',curdata);
//								mapBound(curdata);

							}

							dbg&&console.groupEnd('CLICK');

						});

					//-----------------------------------
					// confirmed
					//-----------------------------------
					sel.append('rect')
						.attrs({
							class:'bar-confirmed',
							y:bh,
							width:bw,
							height:0,
							fill:'purple',
							'pointer-events':'none',
						});

					//-----------------------------------
					// deaths
					//-----------------------------------
					sel.append('rect')
						.attrs({
							class:'bar-deaths',
							y:bh,
							width:bw,
							height:0,
							fill:'crimson',
							'pointer-events':'none',
						});

				})
			.merge(b)
				.call(sel=>{

					//-----------------------------------
					// confirmed
					//-----------------------------------

					sel.select('.bar-confirmed')
						.transition()
							.delay((d,i)=>i*20)
							.duration(M.current.playSpeed/2)
							.attrs({
								y:d=>bh - y(d.confirmed),
								height:d=>y(d.confirmed),
							});

					//-----------------------------------
					// deaths
					//-----------------------------------

					sel.select('.bar-deaths')
						.transition()
							.delay((d,i)=>i*20)
							.duration(M.current.playSpeed/2)
							.attrs({
								y:d=>bh - y(d.deaths),
								height:d=>y(d.deaths),
							});


				});




		fEnd();
	}


}



