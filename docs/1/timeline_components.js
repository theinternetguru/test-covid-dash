


//-----------------------------------
// timeline_axes
//-----------------------------------
function timeline_axes(sel,bw,bh,w,dates,x,y)	{

	//--------------------------
	// axes
	//--------------------------
	sel.append('g').attr('class','axes')
		.call(sel=>{

			sel.append('line')
				.attrs({
					class:'y-axis',
					x1:0,
					y1:0,
					x2:0,
					y2:bh,
					stroke:'#ccc',
					transform:'translate(0,0)',
				});

			sel.append('line')
				.attrs({
					class:'x-axis',
					x1:0,
					y1:bh,
					x2:w,
					y2:bh,
					stroke:'#666',
				});


			sel.append('g')
				.attrs({
					class:'x-axis-label',
				})
				.selectAll('text').data(dates.filter(d=>moment(d.key).date()%7==1),d=>d.key)
					.enter()
						.append('text')
							.attrs({
								x:d=>x(moment(d.key)),
								y:bh+12,
								fill:'#999',
								'font-size':'10px',
							})
							.text(d=>{
								var t = moment(d.key);
								return t.date()==1
									? t.format('MMM')
									: t.format('D')
							});


		});

}


//-----------------------------------
// xTicksConfirmed
//-----------------------------------
function timeline_xTicksConfirmed(sel,bw,bh)	{

	sel.append('g').attr('class','x-tick-confirmed')
		.attr('transform','translate(0,'+bh+')') // animate this along y-axis
		.attr('opacity',1)
		.call(sel=>{

			sel.append('line')
				.attrs({
					class:'x-tick-confirmed-line',
					x1:0,
					y1:0,
					x2:bw*1.5,
					y2:0,
					stroke:'#ccc',
				});

			sel.append('text')
				.attrs({
					class:'x-tick-confirmed-text',
					x:bw*1.5,
					y:7,
					'text-anchor':'begin',
					transform:'translate(0,0)',
				})
				.call(sel=>{

					sel.append('tspan')
						.attrs({
							class:'x-tick-confirmed-text-value-bg',
							x:bw*1.5,
							//dy:'1em',
							fill:'#fff',
							'font-weight':700,
							stroke:'#000',
							'stroke-width':5,
						});

					sel.append('tspan')
						.attrs({
							class:'x-tick-confirmed-text-value',
							x:bw*1.5,
							//dy:'1em',
							fill:'#fff',
							'font-weight':700,
						});


					sel.append('tspan')
						.attrs({
							class:'x-tick-confirmed-text-label',
							x:bw*1.5,
							y:16,
							fill:'#ff0',
							'font-weight':600,
							'font-size':'8px',
							stroke:'#000',
							'stroke-width':5,
						})
						.text('CONFIRMED');

					sel.append('tspan')
						.attrs({
							class:'x-tick-confirmed-text-label',
							x:bw*1.5,
							y:16,
							fill:'magenta',
							'font-weight':600,
							'font-size':'8px',
						})
						.text('CONFIRMED');


				});

		});

}

//-----------------------------------
// xTicksDeaths
//-----------------------------------
function timeline_xTicksDeaths(sel,bw,bh)	{

	sel.append('g').attr('class','x-tick-deaths')
		.attr('transform','translate(0,'+bh+')') // animate this along x-axis
		.attr('opacity',1)
		.call(sel=>{

			sel.append('line')
				.attrs({
					class:'x-tick-confirmed-line',
					x1:0,
					y1:0,
					x2:bw*1.5,
					y2:0,
					stroke:'#ccc',
				});

			sel.append('text')
				.attrs({
					class:'x-tick-deaths-text',
					x:bw*1.5,
					y:7,
					'text-anchor':'begin',
				})
				.call(sel=>{


					sel.append('tspan')
						.attrs({
							class:'x-tick-deaths-text-value-bg',
							x:bw*1.5,
							//dy:'-.5em',
							fill:'#fff',
							'font-weight':700,
							stroke:'#000',
							'stroke-width':5,
						});

					sel.append('tspan')
						.attrs({
							class:'x-tick-deaths-text-value',
							x:bw*1.5,
							//dy:'-.5em',
							fill:'#fff',
							'font-weight':700,
						});

					sel.append('tspan')
						.attrs({
							class:'x-tick-deaths-text-label',
							x:bw*1.5,
							y:16,
							//dy:'1em',
							fill:'crimson',
							'font-weight':600,
							'font-size':'8px',
							stroke:'#000',
							'stroke-width':5,
						})
						.text('DEATHS');

					sel.append('tspan')
						.attrs({
							class:'x-tick-deaths-text-label',
							x:bw*1.5,
							y:16,
							//dy:'1em',
							fill:'crimson',
							'font-weight':600,
							'font-size':'8px',
						})
						.text('DEATHS');

				});

		});

}
