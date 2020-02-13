
//==================================================================
//
//==================================================================
function eventLayoutResize()	{

	d3.select('nav').style('height',(innerHeight*.05)+'px');
	//d3.select('.content-summary').style('height',(innerHeight*.2)+'px');
	d3.select('.content-timeline').style('height',(innerHeight*.2)+'px');


	d3.select('.content-map').style('height',(

		innerHeight - (
			+d3.select('nav').style('height').replace(/\D+$/,'') +
			+d3.select('.content-summary').style('height').replace(/\D+$/,'') +
			+d3.select('.content-timeline').style('height').replace(/\D+$/,'')
		)

	)+'px');


	if (typeof vizTimeline_resetScale=='function') vizTimeline_resetScale();

	d3.select('.date-info').style('bottom',((innerHeight * .2)-10)+'px');
//	timeline_annotations(M.current.date);


}


