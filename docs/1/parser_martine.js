

//==================================================================
//
//==================================================================

function load_martine(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	//----------
	// martine
	//----------
	var key = 'martine';
	//db['martine'].destroy();
	db[key]= new PouchDB(key);
  db[key].allDocs({include_docs: true, descending: true}, function(err, doc) {
		var key = 'martine';
  	console.warn('db.'+key, err, doc.total_rows);
    if (err || doc.total_rows==0) {
			d3.csv( M.config.data.cold.find(d=>d.key==key).url )
				.then(function(raw){
					//dbg&&console.log('data',data);
					M.data[key] = parser_martine(key,raw);
					M.data[key].forEach(d=>{
						d._id = [d.location_id,d.date_str].join('_');
						db[key].put(d);
					});

					fEnd();
				});

    }else	{
	    M.data['martine'] = doc.rows.map(d=>d.doc);
	    dbg&&console.log('M.data['+key+']','martine',M.data[key]);

			fEnd();
	  }
  });



}



//==================================================================
//
//==================================================================
function parser_martine(key, data, cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


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






	var list = [];

	data
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


	M.meta[key] = {
		loaded:moment(),
		updated:null,
	};


	dbg&&console.log(key, list);


	fEnd();

	return list.sort(d3.comparator().order(d3.descending,d=>d.confirmed));

}


