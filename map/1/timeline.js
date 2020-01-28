

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
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('date',date);


	var nest = d3.nest().key(d=>d.date_str).entries(data);
	var minDataDate = d3.min(data, d=>d.date_str);
	var maxDataDate = d3.max(data, d=>d.date_str);

	var minDate = '2020-01-01';
	var maxDate = maxDataDate;

	var days100 = moment(minDate,'YYYY-MM-DD').add(100,'days').format('YYYY-MM-DD')
	if (moment(maxDate) < moment(days100))	{
		maxDate = days100;
	}

	var w = innerWidth-100;
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


	var x = d3.scaleTime().domain([ moment(minDate),moment(maxDate) ]).range([0,w]);

	var maxConfirmed = d3.max(dates, d=>d.confirmed);

	var scaleHeight = d3.scaleLinear().domain([0,maxConfirmed]).range([0,70]);
//	var scaleHeight = d3.scaleSqrt().domain([0,maxConfirmed]).range([0,70]);

	var bw = x( moment(minDate).add(1,'days') ) - x( moment(minDate) );
	dbg&&console.log('bw', bw);




	var tl = sel.selectAll('.timeline-container').data([1])
	tl.exit().remove();
	tl.enter()
		.append('div')
			.attr('class','timeline-container')
			.styles({
				display:'flex',
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
					.append('div')
						//.attr('class','btn btn-primary')
						//.attr('type','button')
						.styles({
							background:'#000',
							'border-radius':0,
							border:'none',
							'line-height':'80px',
							cursor:'pointer',
						})
						.on('click', function(d){

							M.current.idle = moment();

							var sel = d3.select(this).select('.btn-play'),
									tf = sel.classed('fa-play');

							sel
								.classed('fa-play', tf ? false : true)
								.classed('fa-pause', tf ? true : false)
								.style('color','magenta');


							if (!tf)	{
								playStop();
							}

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

									d3.selectAll('.bar-bg')
											.transition()
												.attr('fill',(d,i)=>d.key!=dt ? '#171717' : 'lime' )
												.attr('opacity',(d,i)=>d.key!=dt ? (i%2==0?.5:.25) : .8 );

									d3.selectAll('.bar-confirmed')
											.transition()
												.attr('fill',k=>k.key!=dt ? chroma('purple').darken().hex() : 'purple');

									d3.selectAll('.bar-deaths')
											.transition()
												.attr('fill',k=>k.key!=dt ? chroma('crimson').darken().hex() : 'crimson');

									renderMap(M.data[M.current.data], dt);


									if (M.timer.play) window.clearTimeout(M.timer.play);
									M.timer.play = window.setTimeout(play, M.current.playSpeed + (dt==maxDataDate ? 10000 : 500));
								}
							}

							if (tf)	{

								M.current.playSpeed = 1000;

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


				//-----------------------------------
				//
				//-----------------------------------
				sel
					.append('div')
					.attr('class','timeline')
					.styles({
						flex:'1 1 auto',
					});



			})
		.merge(tl)
			.call(sel=>{

				var g = sel.select('.timeline').selectAll('svg').data([dates]);
				g.exit().remove();
				g.enter()
					.append('svg')
						.attrs({
							width:w,
							height:100,
						})
					.merge(g)
						.call(sel=>{

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
												height:80,
												fill:'#171717',
												opacity:(d,i)=>i%2==0?.5:.25,
											})
											.styles({
												cursor:'pointer',
											})
											.on('mouseover',function(d,i){

												M.current.idle = moment();

												if (!M.timer.play)	{
													d3.select(this)
														.transition()
															.attr('opacity',.8);
												}

											})
											.on('mouseout',function(d,i){

												M.current.idle = moment();

												if (!M.timer.play)	{
													d3.select(this)
														.transition()
															.delay(300)
															.attr('opacity',i%2==0?.5:.25);
												}

											})
											.on('click', function(d){

												M.current.idle = moment();

												if (!M.timer.play)	{

													d3.select(this.parentNode.parentNode)
														.call(sel=>{

															sel.selectAll('.bar-confirmed')
																.transition()
																	.attr('fill',k=>k.key!=d.key ? chroma('purple').darken().hex() : 'purple');

															sel.selectAll('.bar-deaths')
																.transition()
																	.attr('fill',k=>k.key!=d.key ? chroma('crimson').darken().hex() : 'crimson');

														});

													renderMap(M.data[M.current.data], d.key);

												}

											});

										//-----------------------------------
										// confirmed
										//-----------------------------------
										sel.append('rect')
											.attrs({
												class:'bar-confirmed',
												y:80,
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
												y:80,
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
												.duration(1000)
												.attrs({
													y:d=>80 - scaleHeight(d.confirmed),
													height:d=>scaleHeight(d.confirmed),
												});

										//-----------------------------------
										// deaths
										//-----------------------------------

										sel.select('.bar-deaths')
											.transition()
												.delay((d,i)=>i*20)
												.duration(1000)
												.attrs({
													y:d=>80 - scaleHeight(d.deaths),
													height:d=>scaleHeight(d.deaths),
												});


									});




						});



			});


	fEnd();
}

