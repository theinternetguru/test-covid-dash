

//==================================================================
//
//==================================================================
function load(cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	loadCache(fEnd);
//	loadLive(fEnd);

//
//   var timer = d3.timer(function(t) {
//      console.log('timer', t);
////      if (t > 1000*60)
//      timer.stop();
//   }, 1000 * 10);



//	window.setTimeout(function(){
//		worksheets();
//	},1000);

}



//==================================================================
//
//==================================================================
function loadCache(cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	function consolidate()	{

		if (M.data['martine'] && M.data['case_tracking'])	{

			// use latest case_tracking
			//M.data.martine

		}

		fEnd();
	}

	load_countries();
	load_airports();
	load_martine(function(){
		load_case_tracking(consolidate);
	});


}




//==================================================================
//
//==================================================================
function loadLive(cb)	{

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
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	//----------
	// countries
	//----------
//	if (!M.data.countries)	{
//		M.data.countries = M.raw.countries.filter(d=>d.name&&d.name!='');
//		M.data.countries.forEach(d=>{
//
//												d._id = d.id.toString();
//												d.latitude = +d.latitude;
//												d.longitude = +d.longitude;
//
//												//db.countries.put(d,function(err,res){
//													//if (err) console.warn('err',err);
//													//dbg&&console.log('res',res);
//												//});
//
//												db.countries.put(d);
//
//											});
//	}

	//----------
	// airports
	//----------
//	M.raw.airports.forEach(d=>{
//		for (var i in d)	{
//			if (typeof d[i]=='string' && (d[i]=='NULL'||d[i]=='N/A'||d[i]=='')) d[i]=null;
//		}
//	});
//
//	M.data.airports = M.raw.airports
//											.filter(d=>d.name&&d.name!=''&&d.iata&&d.icao)
//											.filter(d=>d.name.match(/international/i));
//
//	M.data.airports.forEach(d=>{
//											d.latitude = +d.latitude;
//											d.longitude = +d.longitude;
//											d.altitude = +d.altitude;
//											d.timezone = +d.timezone;
//										});
//
//	dbg&&console.log('airports type', d3.nest().key(d=>d.type).entries(M.data.airports));
//	dbg&&console.log('airports country', d3.nest().key(d=>d.country).entries(M.data.airports));
//	dbg&&console.log('airports malaysia', M.data.airports.filter(d=>d.country.toLowerCase()=='malaysia'));
//



	//----------
	// others
	//----------

	d3.entries(M.raw).forEach(d=>{

		//ignore
		if (d.key=='countries')	{

		}else if (d.key=='martine')	{

			parser_martine(d.key, d.value);


		}else if (d.key=='case_tracking')	{

			parser_case_tracking(d.key, d.value);
		}


	});


	//----------
	// BNO
	//----------
//	if (M.raw.bno)	{
//
//		M.data.bno = parse_bno(M.raw.bno);
//
//		M.data.bno.forEach(d=>{
//
//		});
//
//	}

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

