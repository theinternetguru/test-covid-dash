

//==================================================================
//
//==================================================================
function vizPatients_render(sel, data, scale, bw, bh, sorter, datatype, title, subtitle, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	var panelData = [];
	if (data.length)	{
		panelData.push(
			{
				key:title||f,
				subtitle: subtitle,
				data:data
			}
		);
	}


	var panel = sel.selectAll('.g-panel').data(panelData, d=>d.key);
	panel.exit().remove();
	panel.enter()
		.append('g').attr('class','g-panel')
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
							.selectAll('.subtitle').data(d=>[d.subtitle])
							.enter()
								.append('text')
									.attrs({
										class:'subtitle',
										transform:'translate(0,'+bh+')',
										x:bw,
										y:bh-2,
										fill:M.theme.hud[1],
										'font-weight':300,
										'font-size':'10px',
										'text-anchor':'middle',
									})
									.text(d=>d);
					});


				sel
						.append('g')
							.attrs({
								class:'bars-holder',
								transform:d=>'translate(0,'+(bh * (d.subtitle?2.5:1.5))+')',
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

					sel.append('rect')
						.attrs({
							transform:'translate('+(bw+5)+',0)',
							width:0,
							height:bh-1,
							fill:M.theme.colors[0],
						});

					sel.append('text')
						.attrs({
							class:'label',
							x:bw,
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
							transform:'translate('+(bw+9)+',0)',
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

}





//==================================================================
//
//==================================================================
function vizPatients_renderSub(sel, data, scale, bw, bh, sorter, datatype, title, subtitle, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	var panelData = [];
	if (data.length)	{
		panelData.push(
			{
				key:title||f,
				subtitle: subtitle,
				data:data
			}
		);
	}


	var panel = sel.selectAll('.g-panel').data(panelData, d=>d.key);
	panel.exit().remove();
	panel.enter()
		.append('g').attr('class','g-panel')
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
							.selectAll('.subtitle').data(d=>[d.subtitle])
							.enter()
								.append('text')
									.attrs({
										class:'subtitle',
										transform:'translate(0,'+bh+')',
										x:bw,
										y:bh-2,
										fill:M.theme.hud[1],
										'font-weight':300,
										'font-size':'10px',
										'text-anchor':'middle',
									})
									.text(d=>d);
					});


				sel
						.append('g')
							.attrs({
								class:'bars-holder',
								transform:d=>'translate(0,'+(bh * (d.subtitle?2.5:1.5))+')',
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

					sel.append('rect')
						.attrs({
							transform:'translate('+(bw+5)+',0)',
							width:0,
							height:bh-1,
							fill:M.theme.colors[0],
						});

					sel.append('text')
						.attrs({
							class:'label',
							x:bw,
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
							transform:'translate('+(bw+9)+',0)',
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

}


