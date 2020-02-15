

//==================================================================
//
//==================================================================
function vizPatients(from, to, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	var bb = d3.select('.content-map').node().getBoundingClientRect();
	var h = bb.height,
			w = h;


	var data = M.data['cryptokass'].filter(d=>d.date_str>=from && d.date_str<=to);


	//-----------------------------
	// viz-countries
	//-----------------------------
	var v = d3.select('body').selectAll('.viz-patients').data([{key:'patients'}], d=>d.key);
	v.exit().remove();
	v.enter()
		.append('div')
			.attr('class','viz-patients')
			.styles({
				position:'absolute',
				'z-index':8888,
				//'pointer-events':'none',
			})
		.merge(v)
			.styles({
				right	:'0px',
				top		:bb.y+'px',
				width	:w+'px',
				height:h+'px',
			})
			.call(sel=>{

				var svg = sel.selectAll('svg').data([1]);
				svg.enter()
					.append('svg')
						.attrs({
							width:'100%',
							height:'100%',
							viewBox:'0 0 400 400',
							preserveAspectRatio:'xMaxYMid meet',
							overflow:'hidden',
						})
						.call(sel=>{

//							sel.append('rect')
//								.attrs({
//									width:'100%',
//									height:'100%',
//									fill:'#000',
//									opacity:.5,
//								});
//


							sel.append('g')
								.attrs({
									class:'patient-onset',
									transform:'translate(-70,50)'
								});

							sel.append('g')
								.attrs({
									class:'patient-symptoms',
									transform:'translate(75,50)'
								});


							sel.append('g')
								.attr('transform','translate(200,50)')
								.call(sel=>{

									sel.append('g')
										.attrs({
											class:'patient-status',
											transform:'translate(0,0)'
										});


									sel.append('g')
										.attrs({
											class:'patient-wuhan',
											transform:'translate(0,50)'
										});


									sel.append('g')
										.attrs({
											class:'patient-gender',
											transform:'translate(0,100)'
										});


									sel.append('g')
										.attrs({
											class:'patient-age',
											transform:'translate(0,150)'
										});

								});


						})
					.merge(svg)
						.call(sel=>{

							sel.select('.patient-symptoms')
								.call(vizPatients_symptoms, data, from ,to);

							sel.select('.patient-status')
								.call(vizPatients_status, data, from ,to);

							sel.select('.patient-wuhan')
								.call(vizPatients_wuhan, data, from ,to);

							sel.select('.patient-gender')
								.call(vizPatients_gender, data, from ,to);

							sel.select('.patient-age')
								.call(vizPatients_age, data, from ,to);

							sel.select('.patient-onset')
								.call(vizPatients_onset, data, from ,to);

						});

			});






	fEnd();
}




//==================================================================
//
//==================================================================
function vizPatients_symptoms(sel, data, from, to, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('data', data);

	data = data.filter(d=>d.symptoms.length);

	var nest=d3.nest()
						.key(d=>d)
						.entries(
							d3.merge(data.map(d=>d.symptoms))
						)
						.map(d=>{
							var m = data.filter(k=>k.symptoms.indexOf(d.key)>-1)
							d.perc = (m.length/data.length)*100;
							return d;
						});


	dbg&&console.log('nest', nest);

	var max = d3.max(nest,d=>d.values.length)||0;
	var scale = d3.scaleLinear().domain([0,max]).range([0, d3.min([50,max]) ]);

	var bh = 11;

	sel.call(vizPatients_render, nest, scale, bh, 'value', fEnd);

}




//==================================================================
//
//==================================================================
function vizPatients_status(sel, data, from, to, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('data', data);

	var nest=d3.nest()
								.key(d=>d.death==1 ? 'death' : d.recovered==1 ? 'recovered' : 'active'  )
								.entries(data)
									.map(d=>{
										d.perc = (d.values.length/data.length)*100;
										return d;
									});

	dbg&&console.log('nest', nest);

	var max = d3.max(nest,d=>d.values.length)||0;
	var scale = d3.scaleLinear().domain([0,max]).range([0, d3.min([50,max]) ]);

	var bh = 11;

	sel.call(vizPatients_render, nest, scale, bh, 'value', fEnd);

}



//==================================================================
//
//==================================================================
function vizPatients_gender(sel, data, from, to, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('data', data);

	data = data.filter(d=>d.gender!='');

	var nest=d3.nest()
								.key(d=>d.gender  )
								.entries(data)
									.map(d=>{
										d.perc = (d.values.length/data.length)*100;
										return d;
									});


	dbg&&console.log('nest', nest);

	var max = d3.max(nest,d=>d.values.length)||0;
	var scale = d3.scaleLinear().domain([0,max]).range([0, d3.min([50,max]) ]);

	var bh = 11;

	sel.call(vizPatients_render, nest, scale, bh, 'value', fEnd);


}




//==================================================================
//
//==================================================================
function vizPatients_age(sel, data, from, to, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('data', data);

	data = data.filter(d=>d.age>0);

	var nest=d3.nest()
								.key(d=>parseInt(d.age/10)*10==0 ? 1 : parseInt(d.age/10)*10  )
								.entries(data)
								.map(d=>{
									d.perc = (d.values.length/data.length)*100;
									return d;
								});


	dbg&&console.log('nest', nest);

	var max = d3.max(nest,d=>d.values.length)||0;
	var scale = d3.scaleLinear().domain([0,max]).range([0, d3.min([50,max]) ]);

	var bh = 11;

	sel.call(vizPatients_render, nest, scale, bh, 'key', fEnd);


}



//==================================================================
//
//==================================================================
function vizPatients_onset(sel, data, from, to, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('data', data);

	data = data.filter(d=>d.onset_days>0);

	var nest=d3.nest()
								.key(d=>d.onset_days )
								.entries(data)
								.map(d=>{
									d.perc = (d.values.length/data.length)*100;
									return d;
								});


	dbg&&console.log('nest', nest);

	var max = d3.max(nest,d=>d.values.length)||0;
	var scale = d3.scaleLinear().domain([0,max]).range([0, d3.min([50,max]) ]);

	var bh = 11;

	sel.call(vizPatients_render, nest, scale, bh, 'key', 'numeric', fEnd);


}




//==================================================================
//
//==================================================================
function vizPatients_wuhan(sel, data, from, to, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('data', data);

	var nest=d3.nest()
								.key(d=>d.from_wuhan==1 ? 'from wuhan' : d.visit_wuhan ? 'visited wuhan' : '-'  )
								.entries(data)
								.map(d=>{
									d.perc = (d.values.length/data.length)*100;
									return d;
								});


	dbg&&console.log('nest', nest);

	var max = d3.max(nest,d=>d.values.length)||0;
	var scale = d3.scaleLinear().domain([0,max]).range([0, d3.min([50,max]) ]);

	var bh = 11;

	sel.call(vizPatients_render, nest, scale, bh, 'key', fEnd);


}



//==================================================================
//
//==================================================================
function vizPatients_render(sel, data, scale, bh, sorter, datatype,  cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	var bar = sel.selectAll('.g-bar').data(data, d=>d.key);
	bar.exit().remove();
	bar.enter()
		.append('g')
			.attrs({
				class:'g-bar',
				opacity:0,
				transform:(d,i)=>'translate(0,'+(i*bh)+')',
			})
			.call(sel=>{

				sel.append('rect')
					.attrs({
						transform:'translate(105,0)',
						width:0,
						height:bh-1,
						fill:M.theme.colors[0],
					});

				sel.append('text')
					.attrs({
						class:'label',
						x:100,
						y:bh-2,
						fill:M.theme.hud[2],
						'font-weight':400,
						'font-size':'10px',
						'text-anchor':'end',
					})
					.text(d=>d.key);

				sel.append('text')
					.attrs({
						class:'value',
						transform:'translate(109,0)',
						x:0,
						y:bh-2,
						//fill:M.theme.colors[0],
						fill:M.theme.hud[1],
						'font-weight':400,
						'font-size':'10px',
						'text-anchor':'begin',
					});


			})
		.merge(bar)
			.sort(d3.comparator().order(d3.descending, d=>sorter=='key' ? datatype=='numeric' ? +d.key : d.key : d.values.length))
			.call(sel=>{

				sel.select('rect')
					.transition()
						.attr('width',d=>scale(d.values.length));

				sel.select('.value')
					//.text(d=>d.values.length)
					.text(d=>f1(d.perc)+'%')
					//.attr('text-anchor',d=>scale(d.values.length < 50 ) ? 'begin':'end' )
					.transition()
						//.attr('x', d=>scale(d.values.length < 50 ) ? scale(d.values.length)+5 : scale(d.values.length)-5 );
						.attr('x', d=>scale(d.values.length) );

			})
			.transition()
				.attrs({
					opacity:1,
					transform:(d,i)=>'translate(0,'+(i*bh)+')',
				});

	fEnd();

}
