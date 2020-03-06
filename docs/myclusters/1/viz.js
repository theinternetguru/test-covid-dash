




//==================================================================
//
//==================================================================
function viz(cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	vizClusters(fEnd);

}



//==================================================================
//
//==================================================================
function vizClusters(cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	d3.select('.content')
		.call(sel=>{

			sel.append('div')
				.attr('class','container-fluid')
					.styles({
						padding:0,
						margin:0,
					})
					.call(sel=>{

						var bb = d3.select('nav').node().getBoundingClientRect();
						sel
							.style('height', (innerHeight - bb.height) +'px')
							.style('overflow','auto');


						sel.call(viz_timeline);
						sel.call(viz_graph);

					});


		});



	fEnd();

}






//==================================================================
//
//==================================================================
function viz_graph(sel, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var w = 1024,
			h = 700,
			margin = {
				top:20,
				left:20,
				right:20,
				bottom:20,
			};




	var data = M.raw.malaysia;

	var tree = [];

//	data.filter(d=>d.



	fEnd();
}




//==================================================================
//
//==================================================================
function viz_timeline(sel, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var w = 1024,
			h = 700,
			margin = {
				top:50,
				left:20,
				right:20,
				bottom:50,
			};

	var tree = [];

	var data = M.raw.malaysia;

	h = (data.length * 20) + margin.bottom + margin.top;

	var cases = d3.extent(data, d=>+d.case_no);
	var dates = d3.extent(data, d=>d.travel_date_from||d.contact_date1||d.date_symptom||d.date_positive||d.date_confirmed);
	var ages = d3.extent(data, d=>+d.age);

	dbg&&console.log('cases', cases);
	dbg&&console.log('dates', dates);
	dbg&&console.log('ages', ages);

	var r = d3.scaleSqrt().domain(ages).range([5,10])
	var y = d3.scaleLinear().domain(cases).range([1,h-margin.top-margin.bottom]);
	var x = d3.scaleTime()
							.domain([
								moment(dates[0]).add(-2,'days'),
								moment().add(2,'days')
							])
							.range([0,w-margin.left-margin.right]);


	var s = sel.selectAll('.svg-timeline').data([1])
	s.exit().remove();
	s.enter()
		.append('svg')
			.attrs({
				class:'svg-timeline',
				viewBox:[0,0,w,h].join(' '),
				width:w,
				height:h,
			})
			.call(sel=>{


				sel.append('g')
					.attr('class','axes');

				sel.append('g')
					.attrs({
						class:'plot-area',
						transform:'translate('+[margin.top, margin.left]+')',
					})
					.call(sel=>{

						sel.append('rect')
							.attrs({
								fill:'#fff',
								width:'100%',
								height:'100%',
							});

						sel.append('g').attr('class','g-bubbles');
						sel.append('g').attr('class','g-lines');
						sel.append('g').attr('class','g-test');

					});


			})
		.merge(s)
			.call(sel=>{


				data.filter(d=>!!d.related_case_no).forEach(d=>{
					d.rel = data.filter(k=>d.related_case_no.split(',').map(d=>+d).indexOf(+k.case_no)>-1);
				});

				var rel=[];
				data.filter(d=>d.rel).forEach(d=>{
					d.rel.forEach(k=>{

						rel.push({
							source:k,
							target:d
						});

					});
				});


				dbg&&console.log('rel',rel);


				var spreader = d3.nest().key(d=>d.source.case_no).entries(rel);

				dbg&&console.log('spreader',spreader);


				data.sort(d3.comparator()
//					.order(d3.ascending, d=>d.date_confirmed)
//					.order(d3.ascending, d=>d.date_confirmed)
					.order(d3.ascending, d=>d.contact_date1||d.date_symptom||d.date_positive||d.date_confirmed)
				);

				data.forEach((d,i)=>{
					d.seq = i+1;
				});



				dbg&&console.log('data',data);

				var node = sel.select('.g-bubbles').selectAll('.g-node').data(data, d=>d.case_no);
				node.exit().remove();
				node.enter()
						.append('g')
							.attrs({
								class:d=>'g-node node-'+d.case_no,
								transform:(d,i)=>'translate('+[
									x(moment(d.date_confirmed)),
									y(d.seq)
								]+')',
							})
							.call(sel=>{

								sel.append('line')
									.attrs({
										x2:d=>d.travel_date_from ? x(moment(d.travel_date_from)) - x(moment(d.date_confirmed)) : 0,
										stroke:'#ccc',
										'stroke-linecap':"round",
										'stroke-width':1,
										'stroke-dasharray':"1 6"
									});

								//----------------------------
								// contact
								//----------------------------
								sel.append('line')
									.attrs({
										x2:d=>d.contact_date1 ? x(moment(d.contact_date1)) - x(moment(d.date_confirmed)) : 0,
										stroke:'#ddd',
										'stroke-linecap':"round",
										'stroke-width':2,
//										'stroke-dasharray':"1 6"
									});


								//----------------------------
								// travels
								//----------------------------
								sel.append('g')
									.attr('class','travels')
									.call(sel=>{

										sel.append('line')
											.attrs({
												x1:d=>d.travel_date_from && x(moment(d.travel_date_from)) - x(moment(d.date_confirmed)) || null,
												x2:d=>d.travel_date_to && x(moment(d.travel_date_to)) - x(moment(d.date_confirmed)) || null,
												'stroke-linecap':"round",
												'stroke-width':4,
												stroke:'#A0C3FF',
											});


										sel.append('text')
											.attrs({
												transform:d=>'translate('+[
													d.travel_date_to && moment(d.travel_date_to).diff(moment(dates[0]), 'days')<10 ? 5
													: !d.travel_date_to ? -10 : -5,
													3
												]+')',
												x:d=>d.travel_date_to && x(moment(d.travel_date_to)) - x(moment(d.date_confirmed)) || null,
												'text-anchor':d=>d.travel_date_to && moment(d.travel_date_to).diff(moment(dates[0]), 'days')<10 ? 'begin' : 'end',
												'font-size':'10px',
												//y:3,
											})
											.text(d=>d.travel_history);



									});



								//----------------------------
								// recovered
								//----------------------------
								sel.append('line')
									.attrs({
										x2:d=>d.date_recovered ? x(moment(d.date_recovered)) - x(moment(d.date_confirmed)) : 0,
										stroke:'#ccc',
										'stroke-width':10,
										'stroke-linecap':"round",
										opacity:.5,
									});

								//----------------------------
								// active
								//----------------------------
								sel.append('line')
									.attrs({
										x2:d=>d.date_recovered ? null : x(moment()) - x(moment(d.date_confirmed)),
										stroke:'#ddd',
										'stroke-width':10,
										'stroke-linecap':"round",
										opacity:.5,
									});

								sel.append('line')
									.attrs({
										x2:d=>d.date_symptom ? x(moment(d.date_symptom)) - x(moment(d.date_confirmed)) : 0,
										stroke:'orange',
										'stroke-width':5,
										'stroke-linecap':"round",
									});
//
//								sel.append('circle')
//									.attrs({
//										class:'symptom',
//										fill:'orange',
//										r:3,
//										cx:d=>d.date_symptom ? x(moment(d.date_symptom)) - x(moment(d.date_confirmed)) : 0,
//									});

								sel.append('circle')
									.attrs({
										class:'positive',
										fill:'red',
										r:3,
										cx:d=>d.date_positive ? x(moment(d.date_positive)) - x(moment(d.date_confirmed)) : 0,
									});


								sel.append('circle')
									.attrs({
										class:d=>'case_no-'+d.case_no,
										fill:d=>{ return {male:'cyan',female:'magenta'}[d.gender.toLowerCase()]||'#ccc' },
										r:d=>r(+d.age||40),
										'fill-opacity':.8,
									});

								sel.append('text')
									.attrs({
										'font-weight':700,
										'font-size':'10px',
										'text-anchor':'middle',
										fill:'#000',
										y:4,
									})
									.text(d=>d.case_no)



							});




					//----------------------------
					//
					//----------------------------

					sel.select('.g-lines')
						.selectAll('.g-line').data(rel)
						.enter()
							.append('line')
								.attrs({
									x1:d=>x(moment(d.source.date_confirmed)),
									y1:d=>y(d.source.seq),
									x2:d=>x(moment(d.target.date_confirmed)),
									y2:d=>y(d.target.seq),
									stroke:'lime',
									opacity:.5,
								});


					//----------------------------
					//
					//----------------------------



			});





	fEnd();

}
