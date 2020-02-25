

//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadBNOEvents(grp, key, cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var reqs = M.config.data[grp].find(d=>d.key==key).urls.map(d=>d3.tsv(d));
	Promise.all(reqs).then(loaded);


	//-----------------------------
	//
	//-----------------------------
	function loaded(raw)	{

//		dbg&&console.log('key', key);

//	location_id	latitude	longitude	confirmed	deaths	status	location	region	country_code
//	1	30.592849	114.305539	37914				Hubei	CHN
//	2	39.9041999	116.4073963	366				Beijing municipality (capital)	CHN

//	location_id	date	description
//	1	2019-12-30	Urgent notice on the treatment of pneumonia of unknown cause - Wuhan
//	1	2019-12-31	27 people with pneumonia of unknown cause reported to the WHO.


		var keys = ['confirmed','deaths','recovered'];

		var locations = raw[0].map(d=>{
			d.location_id 	= +d['location_id'];
			d.latitude 			= +d['latitude'];
			d.longitude 		= +d['longitude'];
			d._source				= key;
			return d;
		});

		if (M.data.martine)	{
			var loc = M.data.martine.find(d=>d.location=='Hubei');
			if (loc)	{
				locations.filter(d=>d.location_id==1).forEach(d=>{
					d.latitude = loc.latitude;
					d.longitude = loc.longitude;
				});
			}
		}

		dbg&&console.log('locations',locations);


		//-----------------------------
		//  add extra cases in december
		//-----------------------------
		var xtra=[];
		if (M.data.first41)	{
			xtra = M.data.first41.filter(d=>d.diff_confirmed!=0 && d.date_str <= '2019-12-30')
							.map(d=>{
								return {
									_source:'first41',
									location_id:1,
									date:d.date_str,
									description: d.date_str=='2019-12-01' ? 'First patient showing symptoms of a "pneumonia of unknown cause"'
															: d.date_str=='2019-12-10' ? d.diff_confirmed+' new cases. First patient associated with the wet market'
															: d.diff_confirmed+' new cases. '+(d.diff_wetmarket_yes ? d.diff_wetmarket_yes+' related to wet market' : '')
								};
							});

		}

		M.data[key] = raw[1].concat(xtra).map(d=>{
			try {
				if (!d._source) d._source=key;
				d.location_id 	= +d['location_id'];
				d.date_str 			= d.date;
				d.date					= +moment(d.date,'YYYY-MM-DD');
				d.location 			= locations.find(k=>k.location_id==d.location_id);
			}catch(e){
				console.warn(e);
				console.log(d);
			};
			return d;
		});


//		dbg&&console.log('M.data['+key+']',M.data[key]);

		loadCheck(fEnd);


	}


}

