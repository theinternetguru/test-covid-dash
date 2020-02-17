

//==================================================================
//
//==================================================================
function vizCountries(data, maxValue, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	if (!data||!data.length) return;
	if (innerWidth < 400) return;

	var bb = d3.select('.content-map').node().getBoundingClientRect();

	var h = bb.height,
			w = d3.min([bb.height, innerWidth-50]);

	var bh = parseInt(bb.height / d3.max([ (data.length+5), 36 ]) );

	dbg&&console.log('h', h);
	dbg&&console.log('w', w);
	dbg&&console.log('bh', bh);

	dbg&&console.log('data', data);

	var maxChina = d3.max(data.filter(d=>d.key.match(/china/i)), d=>d3.max([ d.confirmed,d.deaths,d.recovered ])) || 0,
			maxWorld = d3.max(data.filter(d=>!d.key.match(/china/i)), d=>d3.max([d.confirmed,d.deaths,d.recovered ])) || 0;

	dbg&&console.log('maxChina', maxChina);
	dbg&&console.log('maxWorld', maxWorld);

	var scaleChina = d3.scaleLinear()
										.domain([0,maxChina])
										.range([0, d3.min([ w-120, maxChina ]) ]);

	var scaleWorld = d3.scaleLinear()
										.domain([0,maxWorld])
										.range([0, d3.min([ w-210, maxWorld ]) ]);

	var xTick1 = d3.axisTop(scaleChina).ticks(maxChina < 1000 ? 2 : 5);
	var xTick2 = d3.axisTop(scaleWorld).ticks(maxWorld < 100 ? 2 : 5);

	//dbg&&console.log('max value per line', parseInt(scaleWidth.invert(bb.width-200) ));

	var data1 = data.filter(d=>d.key.match(/china/i)),
			data2 = data.filter(d=>!d.key.match(/china/i));

	dbg&&console.log('scaleChina', scaleChina.domain(), scaleChina.range(), scaleChina(maxChina));
	dbg&&console.log('scaleWorld', scaleWorld.domain(), scaleWorld.range(), scaleWorld(maxWorld));

	var countries_data = [
		{
			key:'container',
			bb:bb,
			data: [
				data1.map(d=>{
					d.bb = bb;
					d.width_confirmed = scaleChina(d.confirmed);
					d.width_deaths = scaleChina(d.deaths);
					d.width_recovered = scaleChina(d.recovered);
					return d;
				}),
				data2.map(d=>{
					d.bb = bb;
					d.width_confirmed = scaleWorld(d.confirmed);
					d.width_deaths = scaleWorld(d.deaths);
					d.width_recovered = scaleWorld(d.recovered);
					return d;
				})
			],
			maxChina: maxChina,
			maxWorld: maxWorld,
		}
	];

	dbg&&console.log('countries_data', countries_data);

	//-----------------------------
	// viz-countries
	//-----------------------------
	var v = d3.select('.annotations').selectAll('.viz-countries').data(countries_data, d=>d.key);
	v.exit().remove();
	v.enter()
		.append('div')
			.attr('class','viz-countries')
			.styles({
				position:'absolute',
				'z-index':8888,
				'pointer-events':'none',
			})
		.merge(v)
			.styles({
				left	:d=>(d.bb.x)+'px',
				top		:d=>(d.bb.y)+'px',
				width	:h+'px',
				height:h+'px',
			})
			.call(sel=>{


				//-----------------------------
				// svg
				//-----------------------------
				var svg=sel.selectAll('svg').data(d=>[d], d=>d.key);
				svg.enter()
						.append('svg')
							.attrs({
								preserveAspectRatio:'none',
								//overflow:'hidden',
							})
							.call(sel=>{

								sel.append('g')
									.attr('transform','translate(0,20)')
									.call(sel=>{

										sel.append('g')
											.attr('class','g-axis-1')
												.attr('transform','translate(110,'+(bh)+')');

										sel.append('g')
											.attr('class','g-bars-1')
												.attr('transform','translate(0,'+((bh*1.5))+')');

										sel.append('g')
											.attr('class','g-axis-2')
												.attr('transform','translate(110,'+((bh*6))+')');

										sel.append('g')
											.attr('class','g-bars-2')
												.attr('transform','translate(0,'+((bh*6.5))+')');

									});

							})
					.merge(svg)
						.attrs({
							viewBox:d=>[0,0,h,h].join(' '),
						})
						.call(sel=>{

							sel.select('.g-axis-1')
								//.filter(d=>d.maxChina)
								.transition()
									//.duration(100)
									.call(xTick1);

							sel.select('.g-axis-2')
								//.filter(d=>d.maxWorld)
								.transition()
									//.duration(100)
									.call(xTick2);

							sel.select('.g-axis-1')
								.selectAll('.tick')
								.filter(d=>d==0||parseInt(d)!=d)
								.remove();

							sel.select('.g-axis-2')
								.selectAll('.tick')
								.filter(d=>d==0||parseInt(d)!=d)
								.remove();

							sel.select('.g-axis-2')
								.selectAll('path')
										.attr('opacity',maxWorld>0 ? 1: 0);


							sel.select('.g-axis-1').selectAll('.tick').select('text').attr('fill','#fff');
							sel.select('.g-axis-2').selectAll('.tick').select('text').attr('fill','#fff');

							sel.select('.g-bars-1').call(gBars, 0);
							sel.select('.g-bars-2').call(gBars, 1);



						});


			});




	//------------------------------------------------------------------
	//
	//------------------------------------------------------------------
	function gBars(sel, seq, cb)	{

		var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
		dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };

		dbg&&console.log('seq', seq);

		var bar = sel.selectAll('.g-bar')
									.data(d=>d.data[seq], d=>d.key);

		bar.exit()
			.transition()
				.duration(200)
					.attr('opacity',0)
						.remove();


		bar.enter()
			.append('g')
				.attrs({
					class:'g-bar',
					//transform:d=>'translate(0,'+d.bb.height+')',
					transform:(d,i)=>'translate(0,'+(i*bh)+')',
					opacity:0,
				})
				.call(sel=>{

					var clrIdx ={
						confirmed:0,
						deaths:1,
						recovered:2
					};

					['confirmed','recovered','deaths'].forEach(k=>{
						sel.append('rect')
							.attrs({
								class:k,
								transform:'translate(110,0)',
								x:0,
								width:0,
								height:bh-2,
								fill:M.theme.colors[clrIdx[k]],
								stroke:k=='deaths'?'red':null,
								//'stroke-width':.5,
							});
					});

					sel.append('text')
						.attrs({
							class:'label',
							x:100,
							y:(bh/2)+2,
							fill:M.theme.hud[2],
							'text-anchor':'end',
							'font-size':'10px',
							'font-weight':400,
						})
						.text(d=>d.key.toUpperCase());

					sel.append('text')
						.attrs({
							class:'value',
							transform:'translate(0,0)',
							x:100,
							y:(bh/2)+2,
							fill:M.theme.hud[2],
							'text-anchor':'begin',
							'font-size':'10px',
							'font-weight':500,
						});


				})
			.merge(bar)
				.sort(d3.comparator()
					.order(d3.descending, d=>d.confirmed - d.deaths - d.recovered )
					.order(d3.descending, d=>d.deaths )
					.order(d3.descending, d=>d.recovered )
				)
				.call(sel=>{

					sel.select('.confirmed')
						.transition()
							.duration(100)
							.attrs({
								width:d=>d.width_confirmed,
							});

					sel.select('.recovered')
						.transition()
							.duration(100)
							.attrs({
								x:d=>d.width_deaths,
								width:d=>d.width_recovered,
							});


					sel.select('.deaths')
						.transition()
							.duration(100)
							.attrs({
								//width:d=>d.deaths==0 ? 0 : d3.max([2, scale(d.deaths) ]),
								width:d=>d.width_deaths,
							});

					sel.select('.value')
						.text(d=>[d.confirmed-d.deaths-d.recovered, d.deaths, d.recovered]
											.map((d,i)=>comma(d)+' '+(d==1 ? ['active','death','recovered'][i] : ['active','deaths','recovered'][i]))
												.filter(d=>!d.match(/^0/))
													.join(', '))
						.transition()
							.duration(100)
								.attr('transform',d=>seq==1
																			? 'translate('+(d.width_confirmed+15)+',0)'
																			: 'translate(10,'+bh+')'
								);


				})
				.transition()
					.duration(200)
						.attr('opacity',1)
						.attr('transform',(d,i)=>'translate(0,'+(i*bh)+')') ;

		fEnd();

	}


	fEnd();
}

