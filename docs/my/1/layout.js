
//------------------------------------------------------------------
//
//------------------------------------------------------------------
function layout(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	d3.select('body')
		.call(sel=>{

			sel.call(layoutNav);

			sel.append('div').attr('class','container-fluid')
				.append('div').attr('class','content')

		});


}



//------------------------------------------------------------------
//
//------------------------------------------------------------------
function layoutNav(sel, cb)	{

	sel
		.append('nav').attr('class','navbar navbar-expand-lg navbar-light bg-dark')
			.styles({
				margin:0,
				padding:0,
				height: (innerHeight*.05)+'px',
				background:'#000',
			})
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
								padding:'0 0 0 24px',
								'white-space':'nowrap',
								overflow:'hidden',
//								'text-shadow': '#000 1px 0 10px',

							})
							.append('a')
								.attrs({
									href:'../',
								})
								.styles({
									color:M.theme.hud[2],
									'font-weight':700,
									'font-size':'14px',
								})
								.html('COVID-19 / Novel Coronavirus Pneumonia (NCP)');


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

//						sel
//							.append('div')
//								.attr('class','display-date')
//								.styles({
//									flex:'1 1 auto',
//									'text-align':'right',
//									color:'lime',
//									'text-shadow': '#000 1px 0 10px',
//									'font-weight':700,
//									padding:'0 24px 0 0',
//								})
////								.on('click', mainCluster)
//								.html('Clusters');
//
//
//						sel
//							.append('div')
//								.attr('class','display-date')
//								.styles({
//									flex:'1 1 auto',
//									'text-align':'right',
//									color:'lime',
//									'text-shadow': '#000 1px 0 10px',
//									'font-weight':700,
//									padding:'0 24px 0 0',
//								})
////								.on('click', mainTimeline)
//								.html('Timeline');

				});

}
