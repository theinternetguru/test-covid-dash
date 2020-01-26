

//==================================================================
//
//==================================================================
function load(cb)	{
	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+'-'+fc++,
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	loadCached(fEnd);

}




//==================================================================
//
//==================================================================
function loadCached(cb)	{

	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+'-'+fc++,
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	var datasets = M.config.data.ref.concat(
									M.config.data.live ? M.config.data.hot : M.config.data.cold
								);


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

		datasets.forEach((d,i)=>{

			var k = data[i];

			M.data[d.key]	= d.type=='json'
				? k.hits && k.hits.hits ? k.hits.hits : k
				: k;

		});

		dbg&&console.log('M.data',{...M.data});

		prep(fEnd);

	}




}




//----------
//
//----------
function prep(cb)	{

	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+'-'+fc++,
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	dbg&&console.log('M.data',{...M.data});


	//----------
	// countries
	//----------

	M.data.countries
		.filter(d=>d.name&&d.name!='')
		.forEach(d=>{
			d.latitude = +d.latitude;
			d.longitude = +d.longitude;
		});


	//----------
	// BNO
	//----------
	M.data.bno = parse_bno(M.data.bno);

	M.data.bno.forEach(d=>{
	});


	//----------
	// JHU
	//----------
	M.data.jhu.forEach(d=>{
//		d.latitude = +d.latitude;
//		d.longitude = +d.longitude;
	});


	//----------
	// martinedoesgis
	//----------
	M.data.martinedoesgis.forEach(d=>{
		d.latitude = +d.latitude;
		d.longitude = +d.longitude;
	});



//	var points = M.data.martinedoesgis
//		.filter(d=>d.latitude&&d.longitude)
//		.map(d=>[d.latitude,d.longitude]);
//
//	dbg&&console.log({points});
////
////	var polygon = turf.polygon([points]);
////	var center = turf.centerOfMass(polygon);
////
////	dbg&&console.log({polygon});
////	dbg&&console.log({center});
//
//
//	leafletMap.flyToBounds(points);



	dbg&&console.log('M.data',{...M.data});


	fEnd();


	//----------
	// BNO data parser
	//----------
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

