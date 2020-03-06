



//==================================================================
//
//==================================================================
function vizClusters(cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	d3.select('body')
		.call(sel=>{

			sel.call(layoutNav);

			sel.append('div')
				.attr('class','container-fluid')
					.styles({
						padding:0,
						margin:0,
					})
					.call(sel=>{

						var bb = d3.select('nav').node().getBoundingClientRect();
						sel.style('height', (innerHeight - bb.height) +'px');


						sel.call(vizClusters_render,fEnd);

					});


		});



}



//==================================================================
//
//==================================================================
function vizClusters_render(sel, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var w = 1024,
			h = 600,
			margin = {
				top:20,
				left:20,
				right:20,
				bottom:20,
			};

	var tree = [];

	var data = M.raw.malaysia;

	var cases = d3.extent(data, d=>+d.case_no);
	var dates = d3.extent(data, d=>d.date_confirmed);
	var ages = d3.extent(data, d=>+d.age);

	dbg&&console.log('cases', cases);
	dbg&&console.log('dates', dates);
	dbg&&console.log('ages', ages);

	var r = d3.scaleSqrt().domain(ages).range([5,10])
	var y = d3.scaleLinear().domain(cases).range([1,h-margin.top-margin.bottom]);
	var x = d3.scaleTime().domain([ moment(dates[0]),moment(dates[1]) ]).range([0,w-margin.left-margin.right]);


	var s = sel.selectAll('.svg-clusters').data([1])
	s.exit().remove();
	s.enter()
		.append('svg')
			.attrs({
				class:'svg-clusters',
				viewBox:[0,0,w,h].join(' '),
				width:w,
				height:h,
			})
			.call(sel=>{

				sel.append('g')
					.attrs({
						class:'plot-area',
						transform:'translate('+[margin.top, margin.left]+')',
					})
					.call(sel=>{

						sel.append('rect')
							.attrs({
								fill:'#333',
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



				var node = sel.select('.g-bubbles').selectAll('.g-node').data(data, d=>d.case_no);
				node.exit().remove();
				node.enter()
						.append('g')
							.attrs({
								class:d=>'g-node node-'+d.case_no,
								transform:d=>'translate('+[
									x(moment(d.date_confirmed)),
									y(+d.case_no)
								]+')',
							})
							.call(sel=>{

								sel.append('circle')
									.attrs({
										class:d=>'case_no-'+d.case_no,
										fill:d=>{ return {male:'lime',female:'magenta'}[d.gender.toLowerCase()]||'teal' },
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
					data.forEach(d=>{
						d.bb = d3.select('.node-'+d.case_no).node().getBoundingClientRect();
					});

					data.filter(d=>!!d.related_case_no).forEach(d=>{
						var rbb = data.find(k=>d.related_case_no.split(',').map(d=>+d).indexOf(+k.case_no)>-1);
						d.relbb = rbb && rbb.bb;
					});

					var nest = d3.nest().key(d=>d.related_case_no).entries(data);
					dbg&&console.log('nest',nest);


					sel.select('.g-lines')
						.selectAll('.g-line').data(nest.filter(d=>d.key!=''), d=>d.key )
						.enter()
							.append('line')
								.attrs({
									class:'g-line',
								})
								.selectAll('line').data(d=>d.values, d=>d.case_no)
									.enter()
										.append('line')
											.attrs({
												x1:d=>d.bb.x,
												y1:d=>d.bb.y,
												x2:d=>d.relbb.x,
												y2:d=>d.relbb.y,
												stroke:'lime',
												'stroke-width':2,
											});

					//----------------------------
					//
					//----------------------------

					sel.select('.g-test').selectAll('.circles').data(data, d=>d.case_no)
						.enter()
							.append('g')
								.attr('class','circles')
								.call(sel=>{

									sel.append('circle')
										.attrs({
											cx:d=>d.bb.x - margin.left + d.bb.width/2,
											cy:d=>d.bb.y - margin.top - margin.bottom + d.bb.height/2,
											r:3,
											fill:'#ff0',
										});

								});


			});





	fEnd();

}
