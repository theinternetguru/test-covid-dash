

//------------------------------------------------------------------
//
//------------------------------------------------------------------
function layout(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	d3.select('body')
		.call(layoutBoostrap,function(){
			vizLayout(fEnd);
		});

	window.addEventListener('resize', function(event){
	  eventLayoutResize();
	});

}


//------------------------------------------------------------------
//
//------------------------------------------------------------------
function layoutBoostrap(sel, cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	//-----------------
	// main layout
	//-----------------

	sel
		.call(function(sel)	{

			//-----------------
			// heights
			//-----------------
			sel
				.append('nav').attr('class','navbar navbar-expand-lg navbar-light bg-dark')
					.styles({
						margin:0,
						padding:0,
						height: (innerHeight*.05)+'px',
						background:'#000',
					});

			sel
				.append('div').attr('class','container-fluid')
					.styles({
						padding:0,
						margin:0,
					})
					.append('div').attr('class','content')
						.styles({
							padding:0,
							margin:0,
						})
						.call(sel=>{

							sel.append('div').attr('class','content-summary')
								.styles({
									margin:0,
									padding:0,
									//height: (innerHeight*.2)+'px',
									//background:'#000',
									color:'#fff',
									border:'1px solid #000',
								});

							sel.append('div').attr('class','content-map')
								.styles({
									margin:0,
									padding:0,
									//height:(innerHeight*(.2+.2+.05))+'px',
									//background:'#3F448E',
								});

							sel.append('div').attr('class','content-timeline')
								.styles({
									margin:0,
									padding:0,
									height:(innerHeight*.2)+'px',
									background:'#000',
									color:'#fff',
								});

						});


			//---------------------------
			// date-info
			//---------------------------
			sel.append('div').attr('class','date-info')
				.styles({
					//background:'#000',
					//color:'#fff',
					position:'absolute',
					bottom: ((innerHeight * .2)-10) +'px',
					left: '0px',
					//padding:'12px',
					width:'100px',
					cursor:'grab',
					display:'none',
					'z-index':99999,
				})
				.append('svg')
					.attrs({
						viewBox:'0 0 100 50',
					})
					.call(sel=>{

//						sel.append('rect')
//							.attrs({
//								width:100,
//								height:40,
//								fill:chroma(M.theme.colors[0]).hex(),
//							});

//						sel.append('path')
//							.attrs({
//								fill:chroma(M.theme.colors[0]).hex(),
//								d:'M25 40 L75 40 L50 50 L25 40z'
//							});

						sel.append('path')
							.attrs({
								fill:chroma(M.theme.colors[0]).hex(),
								stroke:'#333',
								'stroke-width':1,
								d:'M0 0 L100 0 L100 40 L75 40 L50 50 L25 40 L0 40 L0 0Z',
							});


						sel.append('text')
							.attrs({
								class:'date-info-text',
								x:'50%',
								y:'50%',
								fill:'#fff',
								'text-anchor':'middle',
								'font-weight':700,
								'font-size':'12px',
								'pointer-events':'none',
							})
							;
					});

					;




		});


	eventLayoutResize();


	//-----------------------------------
	// drag
	//-----------------------------------
	d3.select(".date-info").call(
		d3.drag()
			.on("start", function(){

			  var div = d3.select(this)
			  						.classed("dragging", true)
			  						.style('cursor','ew-resize');

			  d3.event.on("drag", dragged).on("end", ended);

			  function dragged(d) {
			    //circle.raise().attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
			    //dbg&&console.log('drag',d3.event.x);
					div.style('left', d3.min([d3.max([(d3.event.x - 50), 50]), innerWidth-100]) +'px' );

					vizTimeline_drag();

			  }

			  function ended() {
			    div.classed("dragging", false)
			    			.style('cursor','grab');
			  }

			})
	);



	//-----------------------------------
	// nav content
	//-----------------------------------

	sel.select('nav')
		.append('div')
		.styles({
			display:'flex',
			width:'100%',
		})
		.call(sel=>{


			sel
				.append('div')
					.styles({
						flex:'1 1 auto',
						'text-align':'left',
						color:M.theme.colors[1],
						'text-shadow': '#000 1px 0 10px',
						'font-weight':700,
						padding:'0 0 0 24px',
						'font-size':'14px',
					})
					.html('COVID-19 / 2019-nCov / Novel Coronavirus Pneumonia (NCP)');


//			sel
//				.append('div')
//					.attr('class','today-date')
//					.styles({
//						flex:'1 1 auto',
//						'text-align':'left',
//						color:'#fff',
//						'text-shadow': '#000 1px 0 10px',
//						'font-weight':700,
//						padding:'0 24px 0 24px',
//					})
//					.append('select')
//						.attr('class','form-control form-control-sm select-dataset');

			sel
				.append('div')
					.attr('class','display-date')
					.styles({
						flex:'1 1 auto',
						'text-align':'right',
						color:'lime',
						'text-shadow': '#000 1px 0 10px',
						'font-weight':700,
						padding:'0 24px 0 0',
					})
					.html('');

		});




	fEnd();

}


//------------------------------------------------------------------
//
//------------------------------------------------------------------
function layoutHdrButtons(sel, cb)	{

	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+':'+fc++,
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('M.tabs',M.tabs);

	if (!M.tabs.some(d=>d.active) && !M.current.tab)	{
		M.tabs[0].active = true;
	}

	var tabs = 	M.tabs;

	// default
	dbg&&console.log('M.current.tab', M.current.tab);
	if (!M.current.tab)	{
		tabs.filter(function(d){ return d.active}).forEach(function(d){
			M.current.tab = d.key
		});
	}

	tabs.filter(function(d){ return d.key==M.current.tab })
		.forEach(function(d){
			d.active = true;
		});


	dbg&&console.log('M.current.tab', M.current.tab);




	sel
		.append('ul').attr('class','navbar-nav mr-auto')
		.call(function(sel)	{

			sel.selectAll('li').data(tabs, function(d){ return d.key })
				.enter()
					.append('li').attr('class','nav-item')
						.append('button')
							.attrs({
								type:'button',
								class:function(d){
									return d.disabled ? 'btn btn-light disabled'
												: d.active ? 'btn btn-primary active'
												: 'btn btn-secondary'
								},
								disabled: d=>d.disabled ? 'disabled' : null
							})
							.styles({
								'margin-right':'12px',
								'border-radius':0,
								//background: d=> d.active ? null : '#ddd',
								//border: d=> d.active ? null : '#999',
							})
							.on('click', function(d){

								M.current.idle = moment();
								M.current.tab = d.key;

								d3.select(this.parentNode.parentNode)
									.selectAll('li')
										.each(function(k){
											k.active = k.key==M.current.tab ? true : false;
											d3.select(this).select('.btn')
												.classed('active', 				function(t){ return t.active ? true : false })
												.classed('btn-secondary', function(t){ return t.active ? false : true })
												.classed('btn-primary', 	function(t){ return t.active ? true : false })
												//.style('background',			t=>t.active?null:'#ddd')
												//.style('border',					t=>t.active?null:'#999')
											;
										});

								// reset search
								d3.select('.input-search')
									.property('value', M.filters[M.current.tab] || '');

								viz();

							})
							.html(function(d){ return d.label })

		});

	fEnd();

}


//------------------------------------------------------------------
//
//------------------------------------------------------------------
function layoutTabSwitch(currentTab, cb)	{

	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+':'+fc++,
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	M.current.tab=currentTab;

	M.tabs.filter(d=>d.active).forEach(d=>{
		d.active = false;
	});

	M.tabs.filter(d=>d.key==M.current.tab).forEach(d=>{
		d.active = true;
		d.disabled = false;
	});

	d3.select('.navbar-tab-container')
		.call(sel=>{
			sel.selectAll('*').remove();
			sel.call(layoutHdrButtons, fEnd);
		});



}



//------------------------------------------------------------------
// next tab
//------------------------------------------------------------------


function layoutTabSwitch_Next()	{

	var nextIdx = M.tabs.map(d=>d.key).indexOf(M.current.tab)+1;
	if (typeof window[M.tabs[nextIdx].key]=='function')	{
		layoutTabSwitch(M.tabs[nextIdx].key, window[M.tabs[nextIdx].key]);
	}

}

