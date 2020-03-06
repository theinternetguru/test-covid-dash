

//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadSummary(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	//----------
	// summary
	//----------
	var key = 'summary';


	loadSummary_latest(key,fEnd);

}


//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadSummary_latest(key, cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	dbg&&console.log('key', key);

	d3.tsv( M.config.data.hot.find(d=>d.key==key).url )
		.then(function(raw){

			dbg&&console.log('raw',raw);

			//		source	updated	confirmed	deaths	recovered
			//		jhu-opsdashboard	2020-02-05 02:33:06	24483	492	906
			//		dxy-total	2020-02-05 01:43:21	24235	491
			//		case_tracking	2020-02-05 00:13:48	20724	493	873
			//		bnonews-total	2020-02-04 20:44:00	24553	492	892
			//		cna	2020-02-04 19:01:32	20643	427
			//		who	2020-02-04 16:49:23	20647	425
			//		jhu-timeseries	2020-02-04 09:40:00	20600	426	644

			raw.forEach(d=>{

				d.confirmed = +d.confirmed;
				d.deaths = +d.deaths;
				d.recovered = +d.recovered;


			});

			M.data[key] = raw;

			if (!M.current.play) vizSummary_render(fEnd);

		});


}



//------------------------------------------------------------------
//
//------------------------------------------------------------------
function vizSummary_render(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	d3.select('.content-summary')
		.styles({
			display:'flex',
			'max-height':200,
		})
		.call(sel=>{

			sel.call(vizSummary_renderPanel, 'confirmed', 'Confirmed Cases', 0);
			sel.call(vizSummary_renderPanel, 'deaths', 'Deaths', 1);
			sel.call(vizSummary_renderPanel, 'recovered', 'Recovered',2);
			sel.call(vizSummary_renderPanel, 'countries', 'Countries Affected', 3, function(){

				eventLayoutResize();
				fEnd();

			});

		});



}



//------------------------------------------------------------------
//
//------------------------------------------------------------------
function vizSummary_renderPanel(sel, key, label, clrIdx, cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	if (!key) key = 'deaths';

	var clr = M.theme.colors[clrIdx];

	var p = sel.selectAll('.panel-'+key).data([
			{ key:key, data:M.data.summary }
		], d=>d.key);

	p.exit().remove();
	p.enter()
		.append('div')
			.attr('class','panel-'+key)
			.styles({
				flex:'1 0 auto',
				//overflow:'hidden',
			})
			.call(sel=>{

				sel
					.append('div')
						.append('svg')
							.attrs({
								viewBox:'0 0 400 200',
								'text-rendering':'geometricPrecision',
							})
							.call(sel=>{

								sel.append('rect')
									.attrs({
										width:400,
										height:30,
										fill:chroma(clr).darken(50).hex()
									});

								sel.append('rect')
									.attrs({
										y:30,
										width:200,
										height:30,
										fill:chroma(clr).darken(30).hex()
									});

								sel.append('rect')
									.attrs({
										x:200,
										y:30,
										width:200,
										height:30,
										fill:chroma(clr).darken(40).hex()
									});


								sel.append('rect')
									.attrs({
										y:60,
										width:200,
										height:170,
										fill:chroma(clr).darken(10).hex()
									});

								sel.append('rect')
									.attrs({
										x:200,
										y:60,
										width:200,
										height:170,
										fill:chroma(clr).darken(20).hex()
									});




								//-----------------------------
								//
								//-----------------------------

								sel.append('rect')
									.attrs({
										width:'100%',
										height:'100%',
										fill:'none',
										stroke:'#171717',
										'stroke-width':5,
									});




								//-----------------------------
								//
								//-----------------------------
								sel.append('g')
									.attr('transform','translate(10,105)')
									.append('svg')
										.attrs({
											width:180,
											height:100,
											preserveAspectRatio:"none",
											class:'summary-bars-new-'+key,
											overflow:'visible',
										})
										.call(sel=>{

//											sel.append('rect')
//												.attrs({
//													y:5,
//													width:180,
//													height:70,
//													fill:chroma(clr).darken(15).hex(),
//												});

											sel.append('g')
												.attr('class','bars-holder')
												.attr('transform','translate(0,5)');

											sel.append('g')
												.attr('class','axis')
												.attr('transform','translate(0,5)');

											sel.append('g')
												.attr('class','axis-x')
												.attr('transform','translate(0,75)');

										});

								//-----------------------------
								//
								//-----------------------------
								sel.append('g')
									.attr('transform','translate(210,105)')
									.append('svg')
										.attrs({
											width:180,
											height:100,
											preserveAspectRatio:"none",
											class:'summary-bars-all-'+key,
											overflow:'visible',
										})
										.call(sel=>{

//											sel.append('rect')
//												.attrs({
//													y:5,
//													width:180,
//													height:70,
//													fill:chroma(clr).darken(25).hex(),
//												});

											sel.append('g')
												.attr('class','bars-holder')
												.attr('transform','translate(0,5)');

											sel.append('g')
												.attr('class','axis')
												.attr('transform','translate(0,5)');

											sel.append('g')
												.attr('class','axis-x')
												.attr('transform','translate(0,75)');

										});



								//---------------------------------
								// labels
								//---------------------------------

								sel.append('text')
									.attrs({
										x:200,
										y:23,
										fill:chroma(clr).brighten().hex(),
										'text-anchor':'middle',
										'font-weight':700,
										//'font-size':'100%',
									})
									.text(label.toUpperCase());


								sel.append('text')
									.attrs({
										x:100,
										y:50,
										fill:chroma(clr).brighten().hex(),
										'text-anchor':'middle',
										'font-weight':400,
										'font-size':'14px',
									})
									.text('DAILY');

								sel.append('text')
									.attrs({
										x:300,
										y:50,
										fill:chroma(clr).brighten().hex(),
										'text-anchor':'middle',
										'font-weight':400,
										'font-size':'14px',
									})
									.text('CUMULATIVE');

								//---------------------------------
								// values-NEW
								//---------------------------------
								sel.append('g')
									.attr('transform','translate(100,40)')
									.call(sel=>{

										sel.append('text')
											.attrs({
												class:'new-'+key,
												x:0,
												y:60,
												fill:'#fff',
												'text-anchor':'middle',
												'font-weight':900,
												'font-size':'45px',
											});

									});


								//---------------------------------
								// values-TOTAL
								//---------------------------------
								sel.append('g')
									.attr('transform','translate(300,40)')
									.call(sel=>{

										sel.append('text')
											.attrs({
												class:'value-'+key,
												x:0,
												y:60,
												fill:'#fff',
												'text-anchor':'middle',
												'font-weight':900,
												'font-size':'45px',
											});

										sel.append('g')
											.attr('transform','translate(0,60)')
											.call(sel=>{

												sel.append('text')
													.attrs({
														fill:'#fff',
														'text-anchor':'middle',
														'font-weight':5600,
														'font-size':'14px',
														opacity:.7,
														x:300,
														y:20,
													})
													.call(sel=>{

														sel.append('tspan')
															.attrs({
																class:'summary-source source-'+key,
																x:0,
															});

														sel.append('tspan')
															.attrs({
																class:'summary-asof asof-'+key,
																x:0,
																dy:'1em',
															});


													});

											});


									});





							});

			})
		.merge(p)
			.call(sel=>{

				sel.select('.value-'+key)
					.text(d=>{
						return d3.max( d.data, d=>d[key] ) ? comma( d3.max( d.data, d=>d[key] ) ) : ''
					});


				sel.select('.asof-'+key)
					.text(d=>{
						var max=d3.max( d.data, d=>d[key] );
						var rows=d.data.filter(d=>d[key]==max);
						rows.sort(d3.comparator().order(d3.descending,d=>d.updated));
						return moment(rows[0].updated+' +0000','YYYY-MM-DD HH:mm:ss Z').format('D MMM HH:mm');
					});

				sel.select('.source-'+key)
					.text(d=>{
						var max=d3.max( d.data, d=>d[key] );
						var rows=d.data.filter(d=>d[key]==max);
						rows.sort(d3.comparator().order(d3.descending,d=>d.updated));
						return 'source: '+rows[0].source.split(/\W+/)[0].toUpperCase();
					});

			});


	fEnd();

}


