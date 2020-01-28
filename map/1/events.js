


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


}

