




//==================================================================
//
//==================================================================
function viz(cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	vizClusters(fEnd);

}



//==================================================================
//
//==================================================================
function vizClusters(cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	d3.select('.content')
		.call(sel=>{

			sel.append('div')
				.attr('class','container-fluid')
					.styles({
						padding:0,
						margin:0,
					})
					.call(sel=>{

//						var bb = d3.select('nav').node().getBoundingClientRect();
//						sel
//							.style('height', (innerHeight - bb.height) +'px')
//							.style('overflow','auto');


						sel.call(viz_tree);
						sel.call(viz_graph2);

//						sel.call(viz_timeline);

					});


		});



	fEnd();

}

