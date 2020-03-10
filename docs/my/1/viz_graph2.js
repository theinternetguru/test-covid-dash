

//==================================================================
//
//==================================================================
function viz_graph2(sel, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var w = d3.max([innerWidth-100, 1024]),
			h = 700,
			margin = {
				top:20,
				left:20,
				right:20,
				bottom:20,
			};



	// clone data
	var data = M.raw.malaysia.map(d=>{ return {...d}});

	h = (data.length * 15) + margin.bottom + margin.top;

	var stratify = d3.stratify()
	    .id(function (d) {
	        return +d.case_no;
	    })
	    .parentId(function (d) {
	    		return +d.related_case_no > 0 ? +d.related_case_no
	    						: d.case_no==0 ? '' : 0
	    });

	// root
	data.unshift({
		case_no:0,
		related_case_no:'',
	});

	dbg&&console.log('stratify', stratify(data))

	var treeData = stratify(data);
	dbg&&console.log('treeData',treeData);


	// assign the name to each node
	treeData.each(function(d) {
	    d.name = d.id;
	  });




	// set the dimensions and margins of the diagram
	var margin = {top: 20, right: 90, bottom: 30, left: 0},
	    width = (innerWidth-200) - margin.left - margin.right,
	    height = 800 - margin.top - margin.bottom;

	// declares a tree layout and assigns the size
//	var treemap = d3.tree()
//	    .size([height, width]);

	var treemap = d3.tree()
	    .size([h, 300]);

	//  assigns the data to a hierarchy using parent-child relationships
	var nodes = d3.hierarchy(treeData, function(d) {
	    return d.children;
	  });

	// maps the node data to the tree layout
	nodes = treemap(nodes);

	dbg&&console.log('nodes', nodes);
	dbg&&console.log('nodes.descendants()', nodes.descendants());




	var hash={};
	var tmp	= [];

	function traverseChildren(d)	{
		if (d.children)	{
			d.children.forEach(k=>{
				if (!hash[k.data.id])	{
					hash[k.data.id]=1;
					tmp.push({...k.data.data});
					traverseChildren(k);
				}
			});
		}
	}

	nodes.descendants().filter(d=>+d.data.id>0).forEach(d=>{
		hash[d.data.id]=1;
		tmp.push({...d.data.data});
		traverseChildren(d);
	});


	dbg&&console.log('tmp', tmp);

	dbg&&console.log('nest', d3.nest().key(d=>d.case_no).entries(tmp));
	dbg&&console.log('nest nodes.descendants()', d3.nest().key(d=>d.data.id).entries(nodes.descendants()));


	var tree = [];
	d3.nest().key(d=>d.case_no).entries(tmp).forEach(d=>{
		tree.push(d.values[0]);
	});


	dbg&&console.log('tree', tree);

	//----------------------------
	//
	//----------------------------


	sel.call(viz_treeTimeline, tree, nodes.descendants(), fEnd);


}








//==================================================================
//
//==================================================================
function viz_treeTimeline(sel, data, descendants, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	dbg&&console.log('data', data);


	const iW = innerWidth;
	dbg&&console.log('innerWidth', iW);

//	var w = d3.max([innerWidth-300, 1024]),
	var w = innerWidth-300,
			h = 700,
			margin = {
				top:50,
				left:50,
				right:50,
				bottom:50,
			};

	var tree = [];

	h = (data.length * 15) + margin.bottom + margin.top;

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


	var xTicks = d3.axisTop(x)
		.ticks(2)
		.tickSize(5)
	;


	var xTicks2 = d3.axisBottom(x)
		.ticks(2)
		.tickSize(5)
	;

	data = data.reverse();

	data.forEach((d,i)=>{
		d.seq = i+1;
	});

	data.forEach((d,i)=>{
		d.contact_events.forEach(k=>{
			k.seq = d.seq;
			k.related_case_seq = data.find(k=>+k.case_no == +d.related_case_no) && data.find(k=>+k.case_no == +d.related_case_no).seq;
			k.related_case_no = +d.related_case_no;
			k.date_confirmed = d.date_confirmed;
		});

		d._tree = descendants.filter(k=>+k.data.id == +d.case_no);
	});


	dbg&&console.log('data',data);



	data
		.filter(d=>!!d.related_case_no)
		.forEach(d=>{
			d.rel = data.filter(k=>d.related_case_no.split(',').map(d=>+d).indexOf(+k.case_no)>-1);
		});

	var rel=[];
	data.filter(d=>d.rel).forEach(d=>{
		d.rel.forEach(k=>{

			var j = {
				source:k,
				target:d
			};

//			j.x = d3.extent([
//							k.
//						]);

			rel.push(j);

		});
	});


	dbg&&console.log('rel',rel);


	var spreader = d3.nest().key(d=>d.related_case_no).entries(data);
	dbg&&console.log('spreader',spreader);


	const texture = textures.lines()
//	  .orientation("vertical", "horizontal")
	  .size(4)
	  .strokeWidth(1)
	  .shapeRendering("crispEdges")
	  .stroke("darkorange");


	var s = sel.selectAll('.svg-timeline').data([1])
	s.exit().remove();
	s.enter()
		.append('svg')
			.attrs({
				class:'svg-timeline',
				viewBox:[0,0,w+200,h].join(' '),
				width:w+200,
				height:h,
			})
			.call(sel=>{

				sel.call(texture);


				sel.append('g')
					.attrs({
						class:'axes',
						transform:'translate('+[margin.left, margin.left-20 ]+')',
					})
					.call(sel=>{

						sel.append('rect')
							.attrs({
								fill:'#fff',
								width:'100%',
								height:'100%',
							});


						sel.selectAll('.datelines').data([
							'2020-01-01',
							'2020-02-01',
							'2020-03-01',
						])
						.enter()
							 .append('line')
							 	.attrs({
							 		transform:d=>'translate('+[ x(moment(d)),0 ]+')',
							 		y1:0,
							 		y2:h,
							 		stroke:'#f7f7f7',
							 		'stroke-width':3,
							 		'shape-rendering':'crispEdges',
							 	});

						sel.call(xTicks);
						sel
							.append('g')
								.attr('transform','translate('+[ 0, h-margin.bottom ]+')')
							.call(xTicks2);

					});


				sel.append('g')
					.attrs({
						class:'plot-area',
						transform:'translate('+[margin.left, margin.top]+')',
					})
					.call(sel=>{



						sel.append('g').attr('class','g-events');
						sel.append('g').attr('class','g-bubbles');
						sel.append('g').attr('class','g-relation');
						sel.append('g').attr('class','g-tree');
						sel.append('g').attr('class','g-test');

					});


			})
		.merge(s)
			.call(sel=>{

				//----------------------------
				// g-events
				//----------------------------

				var node = sel.select('.g-events').selectAll('.g-node').data(data, d=>d.case_no);
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

								//----------------------------
								// contact_events
								//----------------------------
								sel.append('g')
									.attr('class','contact_events')
									.selectAll('.g-event').data(d=>d.contact_events, d=>d.date)
										.enter()
											.append('g')
												.call(sel=>{

													sel
														.append('line')
															.attrs({
																stroke:'#f90',
																x1:d=>x(moment(d.date)) - x(moment(d.date_confirmed)),
																x2:d=>x(moment(d.date)) - x(moment(d.date_confirmed)),
																y2:d=>d.related_case_seq ? y(+d.related_case_seq) - y(+d.seq) : 0,
																//'stroke-dasharray':"1 4"
																'shape-rendering':'crispEdges',
															});

												});



							});



				//----------------------------
				// g-bubbles
				//----------------------------

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

								//----------------------------
								// travel date
								//----------------------------
								sel.selectAll('.travel-line').data(d=>{
									var data=[];
									if (d.travel_date_from)	{
										data.push(d);
									}
									return data;
								})
								.enter()
									.append('line')
										.attrs({
											class:'travel-line',

											x1:d=>x(moment(d.travel_date_from)) - x(moment(d.date_confirmed)),
											//x2:d=>d.date_symptom||d.date_positive ? x(moment(d.date_symptom||d.date_positive)) - x(moment(d.date_confirmed)) : 0,
											x2:d=>x(moment(
												(d.contact_events.length&&d.contact_events[0].date)||
													d.date_symptom||d.date_positive||d.date_confirmed
												)) - x(moment(d.date_confirmed)),

											stroke:'#E8EFA6',
											'stroke-linecap':"round",
											'stroke-width':2,
											'stroke-dasharray':"1 4",
											'shape-rendering':'geometryPrecision',
										});

								//----------------------------
								// contact date
								//----------------------------
								sel.selectAll('.contact-line').data(d=>{
									var data = [];
									if (d.contact_events.length)	{
										data.push(d);
									}
									return data;
								})
								.enter()
									.append('line')
										.attrs({
											class:'contact-line',

											x1:d=>x(moment(d.contact_events[0].date)) - x(moment(d.date_confirmed)),
											//x2:d=>d.date_symptom||d.date_positive ? x(moment(d.date_symptom||d.date_positive)) - x(moment(d.date_confirmed)) : 0,
											x2:d=>x(moment(
													d.date_symptom||d.date_positive||d.date_confirmed
												)) - x(moment(d.date_confirmed)),

											stroke:'#f90',
											'stroke-linecap':"round",
											'stroke-width':2,
											'stroke-dasharray':"1 4",
											'shape-rendering':'geometryPrecision',
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
												'stroke-width':10,
												stroke:'#E8EFA6',
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
												fill:'steelblue',
											})
											.text(d=>d.travel_history);



									});



								//----------------------------
								// recovered
								//----------------------------
								sel.append('line')
									.attrs({
										x2:d=>d.date_recovered ? x(moment(d.date_recovered)) - x(moment(d.date_confirmed)) : 0,
										stroke:'steelblue',
										'stroke-width':10,
										'stroke-linecap':"round",
										opacity:.25,
									});

								//----------------------------
								// active
								//----------------------------
//								sel.append('line')
//									.attrs({
//										x2:d=>d.date_recovered ? null : x(moment()) - x(moment(d.date_confirmed)),
//										stroke:'#f90',
//										'stroke-width':10,
//										'stroke-linecap':"round",
//										opacity:.5,
//									});


								sel.append('rect')
									.attrs({
										class:'active',
										//fill:texture.url(),
										fill:chroma('#ED9D97').hex(),
										y:-5,
										height:10,
										width:d=>d.date_recovered ? null : x(moment()) - x(moment(d.date_confirmed)),
									});
//

//								sel.append('line')
//									.attrs({
//										class:'symptom',
//										x2:d=>d.date_symptom||d.date_positive ? x(moment(d.date_symptom||d.date_positive)) - x(moment(d.date_confirmed)) : 0,
//										stroke:'orange',
//										'stroke-width':10,
//										'stroke-linecap':"round",
//									});

								sel.append('rect')
									.attrs({
										class:'symptom',
										x:d=>d.date_symptom||d.date_positive ? x(moment(d.date_symptom||d.date_positive)) - x(moment(d.date_confirmed)) : 0,
										y:-5,
										width:d=>Math.abs(d.date_symptom||d.date_positive ? x(moment(d.date_symptom||d.date_positive)) - x(moment(d.date_confirmed)) : 0),
										height:10,
										fill:texture.url(),
									});




//								sel.append('circle')
//									.attrs({
//										class:'symptom',
//										fill:'orange',
//										r:3,
//										cx:d=>d.date_symptom ? x(moment(d.date_symptom)) - x(moment(d.date_confirmed)) : 0,
//									});

								//----------------------------
								// contact_events
								//----------------------------
								sel.append('g')
									.attr('class','contact_events')
									.selectAll('.g-event').data(d=>d.contact_events, d=>d.date)
										.enter()
											.append('g')
												.call(sel=>{

													sel
														.append('circle')
															.attrs({
																fill:'#fff',
																stroke:'orangered',
																'stroke-width':2,
																r:3,
																cx:d=>x(moment(d.date)) - x(moment(d.date_confirmed)),
															});


												});




								//----------------------------
								// date_positive
								//----------------------------

								sel.append('circle')
									.attrs({
										class:'positive',
										fill:'red',
										r:3,
										cx:d=>d.date_positive ? x(moment(d.date_positive)) - x(moment(d.date_confirmed)) : null,
									});

								//----------------------------
								// date_confirmed
								//----------------------------

								sel.append('circle')
									.attrs({
										class:d=>'case_no-'+d.case_no,
										//fill:d=>{ return {male:'#333',female:'#999'}[d.gender.toLowerCase()]||'#ccc' },
										//r:d=>r(+d.age||40),
										r:7,
										//'fill-opacity':.8,
										//stroke:'#333',
										//fill:'#333',

										fill:d=>{return {imported:'#E2431E','local':'#4374E0','':'#F1CA3A'}[d.transmission_type]},
										//stroke:d=>{return {imported:'#E2431E','local':'#4374E0','':'#F1CA3A'}[d.transmission_type]},
										stroke:d=>d.date_recovered?'#fff':'#fff',
										'stroke-width':2,
									});

								sel.append('g')
									.attr('transform','translate(10,0)')
									.call(sel=>{


//										sel.append('text')
//											.attrs({
//												'font-weight':800,
//												'font-size':'10px',
//												'text-anchor':'middle',
//												fill:'red',
//												y:d=>(r(+d.age||40)/2) - 1,
//												stroke:'#000',
//												'stroke-width':3,
//											})
//											.text(d=>d.case_no)

										sel.append('text')
											.attrs({
//												'font-weight':800,
												'font-size':'12px',
												'text-anchor':'begin',
												fill:'#000',
												y:d=>(r(+d.age||40)/2),
											})
											.text(d=>d.case_no)

//										sel.append('text')
//											.attrs({
//												'font-weight':300,
//												'font-size':'9px',
//												'text-anchor':'begin',
//												fill:'#000',
//												x:30,
//												y:d=>(r(+d.age||40)/2),
//											})
//											.text(d=>d.nationality+' '+d.gender+', '+d.age)
//

									});

							});




					//----------------------------
					// g-relation
					//----------------------------

					sel.select('.g-relation')
						.selectAll('.g-line').data(rel)
						.enter()
							.append('line')
								.attrs({
									class:'g-line',
									x1:d=>x(moment( d3.max([
													d.source.date_confirmed ,
													d.source.date_recovered ? d.source.date_recovered : moment().add(1,'days').format('YYYY-MM-DD'),
													d.target.date_confirmed ,
													d.target.date_recovered ? d.target.date_recovered : moment().add(1,'days').format('YYYY-MM-DD')
												]) )),
									y1:d=>y(d.source.seq),
									x2:d=>x(moment( d3.max([
													d.source.date_confirmed ,
													d.source.date_recovered ? d.source.date_recovered : moment().add(1,'days').format('YYYY-MM-DD'),
													d.target.date_confirmed ,
													d.target.date_recovered ? d.target.date_recovered : moment().add(1,'days').format('YYYY-MM-DD')
												]) )),
									y2:d=>y(d.target.seq),
									stroke:'lime',
									opacity:.5,
								});


					//----------------------------
					// g-trees
					//----------------------------


					sel.select('.g-tree')
						.selectAll('.g-line').data(rel)
						.enter()
							.append('line')
								.attrs({
									class:'g-line',
									x1:d=>x(moment( d3.max([
													d.source.date_confirmed ,
													d.source.date_recovered ? d.source.date_recovered : moment().add(1,'days').format('YYYY-MM-DD'),
													d.target.date_confirmed ,
													d.target.date_recovered ? d.target.date_recovered : moment().add(1,'days').format('YYYY-MM-DD')
												]) )),
									y1:d=>y(d.source.seq),
									x2:d=>x(moment( d3.max([
													d.source.date_confirmed ,
													d.source.date_recovered ? d.source.date_recovered : moment().add(1,'days').format('YYYY-MM-DD'),
													d.target.date_confirmed ,
													d.target.date_recovered ? d.target.date_recovered : moment().add(1,'days').format('YYYY-MM-DD')
												]) )),
									y2:d=>y(d.target.seq),
									stroke:'lime',
									opacity:.5,
								});



			});





	fEnd();

}
