

//==================================================================
//
//==================================================================
function load(cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	loadCached(fEnd);

   var timer = d3.timer(function(t) {
      console.log('timer', t);
//      if (t > 1000*60)
      timer.stop();
   }, 1000 * 10);

}




//==================================================================
//
//==================================================================
function loadCached(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	var datasets = M.config.data.ref.concat(
									M.config.data.live ? M.config.data.hot : M.config.data.cold
								);

	datasets = datasets.filter(d=>!d.cors);

	datasets.forEach(d=>{
		if (!d.type)	{
			var m = d.url.match(/\.(\w+)$/i);
			if (m && m[1])	{
				d.type = m[1];
			}
		}
	});

	let reqs = 	datasets.map(
									d =>	d.type=='json' 	? d3.json(d.url)
											: d.type=='tsv' 	? d3.tsv(d.url)
											: d.type=='csv'		? d3.csv(d.url)
											: 									d3.text(d.url)

							);

	dbg&&console.log('reqs', reqs);

	Promise.all(reqs).then(loaded);


	//----------
	//
	//----------
	function loaded(data)	{

		dbg&&console.log({data});

		if (!M.raw) M.raw={};

		datasets.forEach((d,i)=>{

			var k = data[i];

			M.raw[d.key]	= d.type=='json'
				? k.hits && k.hits.hits ? k.hits.hits : k
				: k;

		});

		dbg&&console.log('M.raw',{...M.raw});


		prep(fEnd);

	}




}




//----------
//
//----------
function prep(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	//----------
	// countries
	//----------

	M.data.countries = M.raw.countries.filter(d=>d.name&&d.name!='');
	M.data.countries.forEach(d=>{
											d.latitude = +d.latitude;
											d.longitude = +d.longitude;
										});


	//----------
	// BNO
	//----------
	if (M.raw.bno)	{

		M.data.bno = parse_bno(M.raw.bno);

		M.data.bno.forEach(d=>{

		});

	}

	//----------
	// JHU
	//----------
	if (M.raw.jhu)	{
		M.data.jhu = [];
		M.raw.jhu
			.filter(d=>!!(d['Province/State']||d['Country/Region']))
			.forEach(d=>{

				var k = {
					country		: d['Country/Region'],
					region		: d['Province/State'],
					confirmed	: +d['Confirmed']||null,
					suspected	: +d['Suspected']||null,
					recovered	: +d['Recovered']||null,
					deaths		: +d['Deaths']||null,

					// : "1/25/2020 12:00 AM"
					date_str 	: d['Last Update'],
					date			: Date.parse( d['Last Update'] ),
					date_tz		: null,
				};

				M.data.jhu.push(k);

			});
	}

	//----------
	// martinedoesgis
	//----------
	/*

{
  "country": "China",
  "location_id": "911",
  "location": "Hubei",
  "latitude": 30.657,
  "longitude": 114.093,
  "confirmedcases_10-01-2020": "44",
  "deaths_10-01-2020": "1",
  "confirmedcases_11-01-2020": "44",
  "deaths_11-01-2020": "1",
  "confirmedcases_12-01-2020": "44",
  "deaths_12-01-2020": "1",
  "confirmedcases_13-01-2020": "44",
  "deaths_13-01-2020": "1",
  "confirmedcases_14-01-2020": "44",
  "deaths_14-01-2020": "1",
  "confirmedcases_15-01-2020": "44",
  "deaths_15-01-2020": "2",
  "confirmedcases_16-01-2020": "45",
  "deaths_16-01-2020": "2",
  "confirmedcases_17-01-2020": "62",
  "deaths_17-01-2020": "2",
  "confirmedcases_18-01-2020": "121",
  "deaths_18-01-2020": "2",
  "confirmedcases_19-01-2020": "198",
  "deaths_19-01-2020": "3",
  "confirmedcases_20-01-2020": "270",
  "deaths_20-01-2020": "3",
  "confirmedcases_21-01-2020": "375",
  "deaths_21-01-2020": "9",
  "confirmedcases_22-01-2020": "444",
  "deaths_22-01-2020": "17",
  "confirmedcases_23-01-2020": "549",
  "deaths_23-01-2020": "24",
  "confirmedcases_24-01-2020": "729",
  "deaths_24-01-2020": "39",
  "confirmedcases_25-01-2020": "730",
  "deaths_25-01-2020": "39"
}
	*/

	if (M.raw.martine)	{
		var list = [];
		M.raw.martine
			.filter(d=>!!d.country)
			.forEach(d=>{

				var k = {
					country			: d['country'] 			|| null,
					location_id	: d['location_id'] 	|| null,
					location		: d['location'] 		|| null,
					latitude		: +d['latitude'] 		|| null,
					longitude		: +d['longitude'] 	|| null,
				};


				// -------------------   
				// by dates
				// -------------------  

				var dates = [];

				d3.entries(d).forEach(j=>{
					var p = j.key.match(/^\s*(\w+?)_(\d+)-(\d+)-(\d+)\s*$/);
					if (p && p.length==5)	{

						var l={};
						l.date_str = [p[4],p[3],p[2]].join('-');

						if (p[1].match(/confirm/i))	{
							l.confirmed = +j.value;
							dates.push(l);
						}else if (p[1].match(/death/i))	{
							l.deaths = +j.value;
							dates.push(l);
						}else	{
							l[p[1]] = +j.value;
							dates.push(l);
						}
					}
				});

				d3.nest().key(d=>d.date_str).entries(dates)
					.forEach(j=>{

						var l={...k};
						l.date_str = j.key;
						l.date = Date.parse(l.date_str);
						l.date_tz = null;

						j.values.forEach(t=>{
							for (var i in t)	{
								if (i!='date_str')	{
									l[i] = t[i];
								}
							}
						});

						list.push(l);

					});


			});

		// check for missing fields

		'location_id,location,country,date_str'.split(',').forEach(k=>{
			dbg&&console.log( 'missing fields for '+k, list.filter(d=>!d[k]||d[k]=='') );
		});

	//	var nest = d3.nest().key(d=>[d.country,d.location_id,d.location,d.date_str].join('-'))
	//		.entries(list);

	//	nest.forEach(d=>{
	//		d.m = d3.merge(d.values);
	//	});

	//	dbg&&console.log('nest', nest);

		M.data.martine = list;

	}

	dbg&&console.log('M.data',{...M.data});


	fEnd();


	//-----------------------------------
	// BNO data parser
	//-----------------------------------
	function parse_bno(txt)	{

		var metadata={};

		// collect metadata
	  var raw = txt.split(/\n/);
	  raw.filter(d=>d.match(/^#/) && !d.match(/\|/))
	  		.forEach(d=>{
	  			var k=d.match(/^#\s*(.*?)\s*\:\s*(.*?)\s*$/);
	  			if (k && k.length)	{
						metadata[k[1]] = k[2];
	  			}
			  });


		// parse csv
		var csv = raw.filter(d=>!d.match(/^#/) || (d.match(/^#/) && d.match(/\|/)) )
								.join('\n')
								.replace(/^#\s*/,'');

		var psv = d3.dsvFormat("|");
		var data = psv.parse(csv);



		var updated_at = moment(Date.parse(metadata['update'].replace(/ET/,'-5')));

		data.forEach(d=>{
			d['updated_at'] = updated_at;
		});

		return data;

	}


}

