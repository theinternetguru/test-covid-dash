

//------------------------------------------------------------------
//
//------------------------------------------------------------------
function vizSummary(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	fEnd();

}




//------------------------------------------------------------------
//
//------------------------------------------------------------------
function vizSummary_layout(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	d3.select('.content-summary')
		.call(sel=>{

//
//
//			sel.selectAll('div').data([
//				'summary-confirmed',
//				'summary-deaths',
//				'summary-recovered',
//				'summary-region',
//			], d=>d)
//			.enter()
//				.append('div')
//					.attr('class',d=>d);


		});


	fEnd();

}




//------------------------------------------------------------------
//
//------------------------------------------------------------------
function vizSummary_bars(key,data,colorIdx, mdate, dur, cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	var w		= 180,
			bh	= 70,
			beg = d3.min(data,d=>d.key),
			tdy	= d3.max(data,d=>d.key),
			mxv = d3.max(data,d=>d['diff_'+key]),
			max = d3.max([10, mxv ]),
			x		= d3.scaleTime().domain([ moment(tdy).add(-30,'days'), moment(tdy) ]).range([0,w]),
			y		= d3.scaleLinear().domain([0,max]).range([0,bh]),
			bw 	= parseInt(x( moment(beg).add(1,'days') ) - x( moment(beg) ));

	bw = d3.max([ 5, (180/30)/2 ]);

	if (!dur) dur = 150;

	var yScale = d3.scaleLinear().domain([max,0]).range([0,bh]);
	var yTicks = d3.axisRight(yScale).ticks(5);
	var xTicks = d3.axisBottom(x).ticks(2).tickSize(1);


	d3.select('.summary-bars-new-'+key)
		.call(sel=>{

			sel.select('.axis-x')
				.transition()
					.duration(100)
						.call(xTicks);

			if (mxv)	{
				sel.select('.axis')
					.transition()
						.duration(100)
							.call(yTicks);
			}

			sel.select('.axis')
				.selectAll('.tick')
				.filter(d=>d==0)
				.remove();

			var bar = sel.select('.bars-holder').selectAll('.bar').data(data,d=>d.key);
			bar.exit().remove();
			bar
				.enter()
					.append('rect')
						.attrs({
							class:'bar',
							fill:'#fff',
							//fill:'#000',
							x:d=>x(+moment(d.key)),
							y:bh,
							width: bw,
							height: 0,
						})
					.merge(bar)
						.attrs({
							//fill:d=>d.key==moment(mdate).format('YYYY-MM-DD') ? '#fff' : chroma(M.theme.colors[colorIdx]).darken().hex(),
							fill:d=>d.key==moment(mdate).format('YYYY-MM-DD') ? '#fff' : M.theme.hud[1],
						})
//						.transition()
//							.duration(dur)
							.attrs({
								x:d=>x(+moment(d.key)),
								y:d=>d['diff_'+key] > 0 ? d3.max([0, bh - y(d['diff_'+key]) ]) : bh,
								width: bw,
								height: d=>d['diff_'+key] > 0  ? d3.max([0, y(d['diff_'+key]) ]) : 0,
							});

		});


	var mxv2	= d3.max(data,d=>d[key]),
			max2 	= d3.max([10, mxv2 ]),
			y2		= d3.scaleLinear().domain([0,max2]).range([0,bh]);

	var yScale2 = d3.scaleLinear().domain([max2,0]).range([0,bh]);
	var yTicks2 = d3.axisRight(yScale2).ticks(5, ',d');

	d3.select('.summary-bars-all-'+key)
		.call(sel=>{

			sel.select('.axis-x')
				.transition()
					.duration(100)
						.call(xTicks);

			if (mxv2)	{
				sel.select('.axis')
					.transition()
						.duration(100)
							.call(yTicks2);
			}

			sel.select('.axis')
				.selectAll('.tick')
				.filter(d=>d==0||parseInt(d)!=d)
				.remove();

			var bar = sel.select('.bars-holder').selectAll('.bar').data(data,d=>d.key);
			bar.exit().remove();
			bar
				.enter()
					.append('rect')
						.attrs({
							class:'bar',
							fill:'#fff',
							//fill:'#000',
							x:d=>x(+moment(d.key)),
							y:bh,
							width: bw,
							height: 0,
						})
					.merge(bar)
						.attrs({
							//fill:d=>d.key==moment(mdate).format('YYYY-MM-DD') ? '#fff' : chroma(M.theme.colors[colorIdx]).darken().darken().hex(),
							fill:d=>d.key==moment(mdate).format('YYYY-MM-DD') ? '#fff' : M.theme.hud[1],
						})
//						.transition()
//							.duration(dur)
							.attrs({
								x:d=>x(+moment(d.key)),
								y:d=>bh - (d[key] > 0 ? y2(d[key]) : 0),
								width: bw,
								height: d=>d[key] > 0 ? y2(d[key]) : 0,
							});

		});

	fEnd();

}


