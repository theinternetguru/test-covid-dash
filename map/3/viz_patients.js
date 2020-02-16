

//==================================================================
//
//==================================================================
function vizPatients(from, to, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	if (innerWidth < 800) return;


	var bb = d3.select('.content-map').node().getBoundingClientRect();
	var h = bb.height,
			w = h;


	var data = M.data['cryptokass'].filter(d=>d.date_str>=from && d.date_str<=to);


	//-----------------------------
	// viz-countries
	//-----------------------------
	var v = d3.select('.annotations').selectAll('.viz-patients').data([{key:'patients'}], d=>d.key);
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


//
//							sel.append('rect')
//								.attrs({
//									width:'100%',
//									height:'100%',
//									fill:'#000',
//									opacity:.5,
//								});



								sel
									.append('text')
									.attrs({
										class:'panel-header',
										x:200,
										y:40,
										fill:M.theme.hud[1],
										'font-weight':600,
										'font-size':'12px',
										'text-anchor':'middle',
									})
									.call(sel=>{

										sel.append('tspan')
											.attrs({
												class:'patient-number'
											});

										sel.append('tspan')
											.attrs({
												class:'patient-label',
												dx:6,
											});

									});


							sel.append('g')
								.attr('transform','translate(10,50)')
								.call(sel=>{

									sel.append('g')
										.attrs({
											class:'patient-onset',
											transform:'translate(0,0)'
										});

//									sel.append('g')
//										.attrs({
//											class:'patient-exposed',
//											transform:'translate(0,160)'
//										});

								});

							sel.append('g')
								.attr('transform','translate(75,50)')
								.call(sel=>{

									sel.append('g')
										.attrs({
											class:'patient-symptoms',
											transform:'translate(0,0)'
										});


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
											transform:'translate(0,57)'
										});


									sel.append('g')
										.attrs({
											class:'patient-gender',
											transform:'translate(0,112)'
										});


//									sel.append('g')
//										.attrs({
//											class:'patient-age',
//											transform:'translate(0,167)'
//										});

									sel.append('g')
										.attrs({
											class:'patient-age-gender',
											transform:'translate(-4,167)'
										});

								});


						})
					.merge(svg)
						.call(sel=>{

							sel.select('.patient-number')
								.text(data.length > 0 ? comma(data.length) : '')

							sel.select('.patient-label')
								.text(data.length ? 'Patients Data' : '')


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

//							sel.select('.patient-exposed')
//								.call(vizPatients_exposed, data, from ,to);

							sel.select('.patient-age-gender')
								.call(vizPatients_age_gender, data, from ,to);


							// custom
							sel.select('.patient-onset')
								.call(sel=>{

									sel.select('.text-labels')
										.attr('transform','translate(20,0)');

								});

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

	nest.sort(d3.comparator().order(d3.descending, d=>d.values.length));
	nest = nest.slice(0,15);

	dbg&&console.log('nest', nest);

	var max = d3.max(nest,d=>d.values.length)||0;
	var scale = d3.scaleLinear().domain([0,max]).range([0, d3.min([50,max]) ]);

	var bh = 11,
			bw = 100;

	sel.call(vizPatients_render, nest, scale, bw, bh, 'value', 'string', 'Common Symptoms', '* multiple symptoms per person', fEnd);

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
								.key(d=>d.death==1 ? 'death' : d.recovered==1 ? 'recovered' : 'not specified'  )
								.entries(data)
									.map(d=>{
										d.perc = (d.values.length/data.length)*100;
										return d;
									});

	dbg&&console.log('nest', nest);

	var max = d3.max(nest,d=>d.values.length)||0;
	var scale = d3.scaleLinear().domain([0,max]).range([0, d3.min([50,max]) ]);

	var bh = 11,
			bw = 100;

	sel.call(vizPatients_render, nest, scale, bw, bh, 'value', 'string', 'Status', null, fEnd);

}



//==================================================================
//
//==================================================================
function vizPatients_gender(sel, data, from, to, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('data', data);

//	data = data.filter(d=>d.gender!='');

	var nest=d3.nest()
								.key(d=>d.gender==''? 'not specified' : d.gender  )
								.entries(data)
									.map(d=>{
										d.perc = (d.values.length/data.length)*100;
										return d;
									});


	dbg&&console.log('nest', nest);

	var max = d3.max(nest,d=>d.values.length)||0;
	var scale = d3.scaleLinear().domain([0,max]).range([0, d3.min([50,max]) ]);

	var bh = 11,
			bw = 100;

	sel.call(vizPatients_render, nest, scale, bw, bh, 'value', 'string', 'Gender', null, fEnd);


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

	var bh = 11,
			bw = 100;

	sel.call(vizPatients_render, nest, scale, bw, bh, 'key', 'string', 'Age Group', null, fEnd);


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

	var bh = 11,
			bw = 100;

	sel.call(vizPatients_render, nest, scale, bw, bh, 'key', 'string', 'Wuhan Travellers', null, fEnd);


}










//==================================================================
//
//==================================================================
function vizPatients_onset(sel, data, from, to, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('data', data);

	data = data.filter(d=>d.onset_days);

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

	var bh = 11,
			bw = 30;

	sel.call(vizPatients_render, nest, scale, bw, bh, 'key', 'numeric', 'Days before symptoms', 'since exposure date', fEnd);


}





//==================================================================
//
//==================================================================
function vizPatients_exposed(sel, data, from, to, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('data', data);

	data = data.filter(d=>d.exposure_days>0);

	var nest=d3.nest()
								.key(d=>d.exposure_days )
								.entries(data)
								.map(d=>{
									d.perc = (d.values.length/data.length)*100;
									return d;
								});


	dbg&&console.log('nest', nest);






	var max = d3.max(nest,d=>d.values.length)||0;
	var scale = d3.scaleLinear().domain([0,max]).range([0, d3.min([50,max]) ]);

	var bh = 11,
			bw = 100;

	sel.call(vizPatients_render, nest, scale, bw, bh, 'key', 'numeric', 'No of days exposed', null, fEnd);


}








//==================================================================
//
//==================================================================
function vizPatients_age_gender(sel, data, from, to, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	// d3.nest().key(d=>d.gender).key(d=>parseInt(d.age/10)*10).entries(M.data.cryptokass.filter(d=>d.death))


	dbg&&console.log('data', data);
	dbg&&console.log('death',
		d3.nest().key(d=>d.gender).key(d=>parseInt(d.age/10)*10).entries(data.filter(d=>d.death))
	);

	data = data.filter(d=>d.age>0 && d.gender);

	var nest=d3.nest()
								.key(d=>parseInt(d.age/10)*10==0 ? 1 : parseInt(d.age/10)*10  )
								.key(d=>d.gender  )
								.key(d=>d.death==1 ? 'death' : d.recovered==1 ? 'recovered' : 'active'  )
								.entries(data)
									.map(d=>{

										d.total=0;

										['male','female'].forEach(j=>{
											d[j]={ total:0, perc:0 };
											var g = d.values.find(d=>d.key==j);
											var ms = g&&g.values.map(d=>{return { key:d.key, value:d.values.length }})||[];

											['active','recovered','death'].forEach(s=>{
												var t = ms.find(k=>k.key==s),
														ttl = t && t.value || 0;

												d[j][s] = ttl;
												d[j]['total'] += ttl;
												d.total += ttl;
											});

											d[j].perc = (d[j].total/data.length)*100;

										});

										d.perc = (d.total/data.length)*100;

										return d;
									});


	nest.sort(d3.comparator().order(d3.descending, d=>+d.key));

	dbg&&console.log('nest', nest);

	var max = d3.max(nest,d=>d3.max([d.male.total,d.female.total]))||0;
//	var scale = d3.scaleSqrt().domain([0,max]).range([0, d3.min([70,max]) ]);
	var scale = d3.scaleLinear().domain([0,max]).range([0, d3.min([100,max]) ]);

	var bh = 11,
			bw = 0;

	dbg&&console.log('max', max);
	dbg&&console.log('scale', scale.domain(), scale.range(), scale(max));

	//sel.call(vizPatients_render, nest, scale, bw, bh, 'key', 'string', 'Age Group', null, fEnd);


	//-----------------------------
	//
	//-----------------------------


	var panelData = [];
	if (data.length)	{
		panelData.push(
			{
				key:'Age / Gender',
				subtitle: 'Female : Male  .',
				data:nest
			}
		);
	}


	var panel = sel.selectAll('.g-panel').data(panelData, d=>d.key);
	panel.exit().remove();
	panel.enter()
		.append('g').attr('class','g-panel')
			.attr('transform','translate(100,0)')
			.call(sel=>{

				sel.append('g')
					.attr('class','text-labels')
					.attr('transform','translate(0,0)')
					.call(sel=>{

						sel
								.append('text')
									.attrs({
										class:'title',
										x:bw,
										y:bh-2,
										fill:M.theme.hud[1],
										'font-weight':600,
										'font-size':'10px',
										'text-anchor':'middle',
										'text-decoration':'underline',
									})
									.text(d=>d.key);

						sel
							.append('text')
								.attrs({
									class:'subtitle',
									transform:'translate(-7,'+bh+')',
									x:bw,
									y:bh-2,
									fill:M.theme.hud[1],
									'font-weight':300,
									'font-size':'10px',
									'text-anchor':'end',
								})
								.text('Female');

						sel
							.append('text')
								.attrs({
									class:'subtitle',
									transform:'translate(7,'+bh+')',
									x:bw,
									y:bh-2,
									fill:M.theme.hud[1],
									'font-weight':300,
									'font-size':'10px',
									'text-anchor':'begin',
								})
								.text('Male');

					});


				sel
						.append('g')
							.attrs({
								class:'bars-holder',
								transform:d=>'translate(0,'+(bh * 2.2)+')',
							});

			})
		.merge(panel)
			.select('.bars-holder')
				.call(renderBar);



	//-----------------------------
	//
	//-----------------------------

	function renderBar(sel)	{

		var bar = sel.selectAll('.g-bar').data(d=>d.data, d=>d.key);
		bar.exit().remove();
		bar.enter()
			.append('g')
				.attrs({
					class:'g-bar',
					opacity:0,
					transform:(d,i)=>'translate(0,'+(i*bh)+')',
				})
				.call(sel=>{


					sel.append('text')
						.attrs({
							class:'key-label',
							x:0,
							y:bh-2,
							fill:M.theme.hud[2],
							'font-weight':400,
							'font-size':'10px',
							'text-anchor':'middle',
						})
						.text(d=>d.key);


					var clr = {
						active:0,
						death:1,
						recovered:2,
					};

					['male','female'].forEach(g=>{

						sel.append('g')
							.attr('class','rect-'+g)
							.attr('transform','translate('+(g=='male'?7:-7)+',0)')
							.call(sel=>{

								['active','recovered','death'].forEach(s=>{

									sel.append('rect')
										.attrs({
											class:'rect-'+g+'-'+s,
											x:0,
											width:0,
											height:bh-1,
											//stroke:s=='death'?'crimson':null,
											//opacity:.5,
											fill:M.theme.colors[clr[s]],
											'shape-rendering':'geometricPrecision',
										});

								});

							});
					});

					['male','female'].forEach(g=>{

						sel.append('text')
							.attr('class','value-'+g)
							.attr('transform','translate('+(g=='male'?7:-7)+',0)')
							.attrs({
								class:'value-'+g,
								transform:'translate('+(g=='male'?10:-10)+',0)',
								x:0,
								y:bh-2,
								fill:M.theme.hud[1],
								'font-weight':400,
								'font-size':'9px',
								'text-anchor': g=='male' ? 'begin' : 'end',
							});

					});


				})
			.merge(bar)
				.sort(d3.comparator().order(d3.descending, d=>+d.key))
				.call(sel=>{

					['male','female'].forEach(g=>{

						sel.select('.value-'+g)
							.text(d=>f1(d[g].perc)+'%')
							.transition()
								.attr('x', d=>scale(d[g].total) * (g=='male'?1:-1));

						var status=['death','recovered','active'];
						status.forEach((s,i)=>{

							sel.select('.rect-'+g+'-'+s)
								.transition()
									.attr('x',d=>	g=='male' && s=='death' 			? 0
															: g=='male' && s=='recovered' 	? scale( d[g]['death'] )
															: g=='male' && s=='active' 			? scale( d[g]['death'] + d[g]['recovered'] )
															: g=='female' && s=='death' 		? scale( d[g]['death'] )*-1
															: g=='female' && s=='recovered' ? scale( d[g]['death'] + d[g]['recovered'] )*-1
															: g=='female' && s=='active' 		? scale( d[g]['death'] + d[g]['recovered'] + d[g]['active'] )*-1
															: 0
												)

									.attr('width',d=>scale(d[g][s]));

						});

					});

//
//					sel.select('.rect-male')
//						.transition()
//							.attr('width',d=>{ console.log(d); return scale(d.male) });
//
//					sel.select('.rect-female')
//						.transition()
//							.attr('x',d=>scale(d.female)*-1)
//							.attr('width',d=>scale(d.female));

//					sel.select('.value')
//						//.text(d=>d.values.length)
//						.text(d=>f1(d.perc)+'%')
//						//.attr('text-anchor',d=>scale(d.values.length < 50 ) ? 'begin':'end' )
//						.transition()
//							//.attr('x', d=>scale(d.values.length < 50 ) ? scale(d.values.length)+5 : scale(d.values.length)-5 );
//							.attr('x', d=>scale(d.values.find(d=>d.key=='male').length) );

				})
				.transition()
					.attrs({
						opacity:1,
						transform:(d,i)=>'translate(0,'+(i*bh)+')',
					});

		fEnd();

	}

}
