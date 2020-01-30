


//==================================================================
//
//==================================================================
function eventClick(category,action,label,value)	{

	M.current.idle = moment();
	if (category)	{
		//ga('send', 'event', [eventCategory], [eventAction], [eventLabel], [eventValue]);
		ga('send', 'event', category,action,label,value);
	}

}




//==================================================================
//
//==================================================================
function eventLayoutResize()	{

	d3.select('nav').style('height',(innerHeight*.05)+'px');
	d3.select('.content-summary').style('height',(innerHeight*.2)+'px');
	d3.select('.content-timeline').style('height',(innerHeight*.2)+'px');


	d3.select('.content-map').style('height',(

		innerHeight - (
			+d3.select('nav').style('height').replace(/\D+$/,'') +
			+d3.select('.content-summary').style('height').replace(/\D+$/,'') +
			+d3.select('.content-timeline').style('height').replace(/\D+$/,'')
		)

	)+'px');


	d3.select('.date-info').style('bottom',((innerHeight * .2)-10)+'px');
	timeline_annotations(M.current.date);

}





//-----------------------------------
// annotations
//-----------------------------------

function timeline_annotations(dt, cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	dbg&&console.log('dt',dt);
	if (!dt && M.current.date) dt = moment(M.current.date).format('YYYY-MM-DD');

	if (dt)	{

		d3.selectAll('.bar-bg')
			.filter(d=>d.key==dt)
				.attr('fill', function(d){

					var j = d3.select(this).node().getBoundingClientRect();
					dbg&&console.log('j',j);

					d3.select('.date-info')
						.call(sel=>{
							sel.select('.date-info-text').text(moment(dt).format('D MMM YYYY').toUpperCase());
						})
						.transition()
							.duration(M.current.playSpeed/2)
								.styles({
									left: function(d){
										//var k = d3.select(this).node().getBoundingClientRect();
										//return (j.left - k.width/2)+'px'
										return (j.left - 50)+'px'
									},
								})

					return '#171717';
				});
	}



	fEnd();
}


