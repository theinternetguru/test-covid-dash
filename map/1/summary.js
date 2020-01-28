



//==================================================================
//
//==================================================================
function summary(data, date, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	d3.select('.content-summary')
		.style('display','flex')
		.call(sel=>{


			sel.call(summaryCases, data, date);


		});


	fEnd();

}



//==================================================================
//
//==================================================================
function summaryCases(sel, data, date, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('date',date);


	d3.select('.display-date').html('Data as of: '+ moment(date,'YYYY-MM-DD').format('D MMM YYYY') );


	var latest = data.filter(d=>d.date_str==date);
	dbg&&console.log('latest', latest);

	var prevdate = moment(date,'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD');
	dbg&&console.log('prevdate', prevdate);

	var prev = data.filter(d=>d.date_str==prevdate);



	var latestCtry = d3.nest().key(d=>d.country).entries(latest.filter(d=>d.confirmed+d.deaths>0));
	var prevCtry = d3.nest().key(d=>d.country).entries(prev.filter(d=>d.confirmed+d.deaths>0));

	dbg&&console.log('latestCtry', latestCtry);



	var cases = [


		{
			key:'Confirmed Cases',
			color:chroma(M.theme.colors[0]).brighten().hex(),
			bgcolor:chroma(M.theme.colors[0]).darken().darken().darken().hex(),
			data:[

				{
					key:'New',
					value: latest.length&&prev.length && d3.sum(latest, d=>d.confirmed) - d3.sum(prev, d=>d.confirmed)||0,
					color:chroma(M.theme.colors[0]).brighten().hex(),
					bgcolor:M.theme.colors[0],
				},

				{
					key:'Total',
					value: d3.sum(latest, d=>d.confirmed),
					color:chroma(M.theme.colors[0]).brighten().hex(),
					bgcolor:chroma(M.theme.colors[0]).darken().hex(),
				},

			],
		},



		{
			key:'Deaths',
			color:M.theme.colors[1],
			bgcolor:chroma(M.theme.colors[1]).darken().darken().darken().hex(),
			data:[

				{
					key:'New',
					value: latest.length&&prev.length && d3.sum(latest, d=>d.deaths) - d3.sum(prev, d=>d.deaths)||0,
					color:M.theme.colors[1],
					bgcolor:M.theme.colors[1],
				},

				{
					key:'Total',
					value: d3.sum(latest, d=>d.deaths),
					color:M.theme.colors[1],
					bgcolor:chroma(M.theme.colors[1]).darken().hex(),
				},

			],

		},
	];



	if (innerWidth > 640)	{

		cases.push(
			{
				key:'Affected Regions/Countries',
				color:chroma(M.theme.colors[2]).brighten().hex(),
				bgcolor:chroma(M.theme.colors[2]).darken().darken().darken().hex(),
				data:[

					{
						key:'New',
						value: latest.length&&prev.length && latestCtry.length - prevCtry.length || 0,
						color:chroma(M.theme.colors[2]).brighten().hex(),
						bgcolor:M.theme.colors[2],
					},

					{
						key:'Total',
						value: latestCtry.length,
						color:chroma(M.theme.colors[2]).brighten().hex(),
						bgcolor:chroma(M.theme.colors[2]).darken().hex(),
					},

				],
			}
		);

	}





	var h = +d3.select('.content-summary').style('height').replace('px','') - 2;


	dbg&&console.log('cases', cases);
//	dbg&&console.log('cases', JSON.stringify(cases,null,2));

	var p = sel.selectAll('.cases').data(cases, d=>d.key);
	p.exit().remove();
	p.enter()
		.append('div')
			.attr('class','cases')
			.styles({
				flex:'1 1 auto',
				height:h+'px',
				'text-align':'center',
				//margin:'1px',
				'border':'1px solid #000',
			})
			.call(sel=>{

				sel.append('div')
					.attr('class','cases-title')
					.styles({
						'font-weight':500,
						'font-size':'14px',
						background:d=>d.bgcolor,
						color:d=>d.color,
						'text-transform':'uppercase',
					})
					.html(d=>d.key);

				sel.append('div')
					.styles('flex','1 1 auto')
					.append('div')
							.attr('class','breakdown')
							.styles({
								display:'flex'
							});



			})
		.merge(p)
			.call(sel=>{

				sel.select('.breakdown')
					.call(sel=>{

						var q = sel.selectAll('.breakdown-cases').data(d=>d.data,d=>d.key);
						q.exit().remove();
						q.enter()
							.append('div')
								.attr('class','breakdown-cases')
								.styles({
									flex:'1 1 '+parseInt(innerWidth/6)+'px',
								})
								.call(sel=>{

									sel.append('div')
										.attr('class','key')
										.styles({
											'font-weight':300,
											'font-size':'12px',
											background:d=>chroma(d.bgcolor).darken().hex(),
											'text-transform':'uppercase',
											color:d=>d.color,
										});

									sel.append('div')
										.attr('class','value')
										.styles({
											'font-weight':700,
											'font-size':'30px',
											background:d=>d.bgcolor,
											'vertical-align':'middle',
											'text-shadow': '#000 1px 0 10px',
										})
										//.html(d=>d.value);


								})
							.merge(q)
								.call(sel=>{

									sel.select('.key')
										.html(d=>d.key);

									//el.node().closest('.breakdown')

									sel.select('.value')
										.styles({
											'line-height':(h - +sel.select('.key').style('height').replace('px','')
																			- +d3.select(sel.select('.key').node().closest('.cases'))
																					.select('.cases-title')
																						.style('height').replace('px','')
																		)+'px',
										})
//										.html(d=>typeof d.value=='number' && d.value!=0
//												? (d.key.toLowerCase()=='new' ? (d.value>0?'+':'-') : '')+ comma(d.value)
//												: '&nbsp;'
//											);

										.transition()
											.duration(M.current.playSpeed-200)
											.tween("html", function(d) {
												var curValue = d3.select(this).node().innerText;
												curValue = curValue.replace(/\D+/g,'');
												curValue = typeof +curValue=='number' ? +curValue : 0;
											  var i = d3.interpolateRound(+curValue,d.value);
											  return function(t) {
											  	var v = i(t);
											  	if (v==0)	{
											  		this.textContent = '-';
											  	}else	{
												  	if (d.key.toLowerCase()=='new')	{
												  		this.textContent = (v>0?'+':'-')+comma(i(t));
												  	}else	{
													  	this.textContent = comma(i(t));
													  }
													}
											  };
											});

								});


					});
			});



	fEnd();
}

