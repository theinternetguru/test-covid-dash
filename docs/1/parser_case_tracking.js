


//==================================================================
//
//==================================================================

function load_case_tracking(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var key = 'case_tracking';
	db[key]= new PouchDB(key);
  db[key].allDocs({include_docs: true, descending: true}, function(err, doc) {

		var key = 'case_tracking';
  	console.warn('db.'+key, err, doc.total_rows);

		// load from cache
    M.data[key] = doc.rows.map(d=>d.doc);

		// get latest
		d3.csv( M.config.data.cold.find(d=>d.key==key).url )
			.then(function(raw){

				// insert/update cache
				M.data[key] = parser_case_tracking(key,raw);

				M.data[key].forEach(d=>{
					d._id = [d.location_id,d.date_str].join('_');
					//db[key].put(d).then(r=>console.log(r)).catch(e=>console.warn(e));
					db[key].put(d).then().catch(e=>{});
				});

				// reload cache
				db[key].allDocs({include_docs: true, descending: true}, function(err, doc) {
					var key = 'case_tracking';
					 M.data[key] = doc.rows.map(d=>d.doc);
				});


		    dbg&&console.log('M.data['+key+']',M.data[key]);
				fEnd();
			});

  });


}



//==================================================================
//
//==================================================================

function parser_case_tracking(key,raw,cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log(key, raw);

/*
{
  "COUNTRY": "Germany",
  "Confirmed": "1",
  "Investigations": "2",
  "Positive": "0",
  "Deaths": "",
  "Cured": "",
  "Negative": "1",
  "Notes": "new",
  "https://docs.google.com/spreadsheets/d/1VErleZLi0pa7dHXgvwZgJPJUw-qO61a8IpLevUMHRj4/edit#gid=1994702177": "https://www.morgenpost.de/berlin/article228243765/Verdacht-Coronavirus-Berlin-nicht-bestaetigt.html",
  "": ""
}
*/


	M.meta[key] = {
		loaded:moment().format('YYYY-MM-DD HH:mm:ss'),
		updated:null,
	};


	//-------------------   
	// by dates
	//-------------------  
	raw
		.filter(d=>!d.COUNTRY && d.Notes)
		.forEach(d=>{


			var k = d.Notes.match(/(\d+)\/(\d+)\/(\d+) (\d+)\:(\d+)\:(\d+)/);
			if (k) {
				dbg&&console.log('Notes', '"'+d.Notes+'"', k);
				//M.meta[key].updated = [k[3],z2(k[2]),z2(k[1])].join('-')+' '+[z2(k[4]),z2(k[5]),z2(k[6])].join(':');
				M.meta[key].updated = moment(d.Notes,'M/D/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');

			}
		});

	dbg&&console.log('M.meta['+key+']', M.meta[key]);

	var list = [];


	var martineCountries = d3.nest().key(d=>d.country.toLowerCase())
													.entries(M.data.martine)
													.map(d=>{
														d.values.sort(d3.comparator().order(d3.descending,d=>d.confirmed))
														return d.values[0];
													});

	dbg&&console.log('martineCountries',martineCountries);

	raw
		.filter(d=>d.COUNTRY)
		.filter(d=>d.COUNTRY!='Totals')
		.forEach((d,i)=>{


			var k = {
				location_id : i+1,
				country			: d['COUNTRY'] 			|| null,
				/*
				location_id	: d['location_id'] 	|| null,
				location		: d['location'] 		|| null,
				latitude		: +d['latitude'] 		|| null,
				longitude		: +d['longitude'] 	|| null,
				*/
				date_str		: moment(M.meta[key].updated).format('YYYY-MM-DD'),
				date				: +moment(M.meta[key].updated),

				confirmed		:	d['Confirmed'] && +d['Confirmed'].replace(/\D+/g,'') || null,
				suspect			: d['Investigations'] && +d['Investigations'].replace(/\D+/g,'') || null,
				positive		: d['Positive'] && +d['Positive'].replace(/\D+/g,'') || null,
				deaths			: d['Deaths'] && +d['Deaths'].replace(/\D+/g,'') || null,
				cured				: d['Cured'] && +d['Cured'].replace(/\D+/g,'') || null,
				negative		: d['Negative'] && +d['Negative'].replace(/\D+/g,'') || null,
				notes				: d['Notes'],
				source			: d['https://docs.google.com/spreadsheets/d/1VErleZLi0pa7dHXgvwZgJPJUw-qO61a8IpLevUMHRj4/edit#gid=1994702177'],

			};


			// get coordinates from martine
//			var j = M.data.martine.filter(l=>l.country.toLowerCase()==k.country.toLowerCase());
//			if (j && j.length)	{
//				k.longitude = j[0].longitude;
//				k.latitude = j[0].latitude;
//			}

			var j = martineCountries.find(l=>l.country.toLowerCase()==k.country.toLowerCase());
			if (j)	{
				k.longitude = j.longitude;
				k.latitude = j.latitude;
			}

			if (!k.longitude)	{
				var j = M.data.countries.find(j=>k.country.toLowerCase()==j.name.toLowerCase()||k.country.toLowerCase()==j.name2.toLowerCase());
				if (j)	{
					var c = martineCountries.find(l=>l.country.toLowerCase()==j.name.toLowerCase()||l.country.toLowerCase()==j.name2.toLowerCase());
					if (c)	{
						k.longitude = c.longitude;
						k.latitude = c.latitude;
					}else	{
						k.longitude = j.longitude;
						k.latitude = j.latitude;
					}
				}
			}


			list.push(k);


		});

	/*
	0: {country: "Czech Rep.", confirmed: null, suspect: 4, positive: null, deaths: null, }
1: {country: "Russia", confirmed: null, suspect: 100, positive: null, deaths: null, }
2: {country: "South Korea", confirmed: 4, suspect: 28, positive: null, deaths: null, }
3: {country: "Taiwan", confirmed: 8, suspect: 402, positive: null, deaths: null, }
4: {country: "UAE", confirmed: 1, suspect: null, positive: null, deaths: null, }
5: {country: "Vietnam", confirmed: 2, suspect: null, positive: null, deaths: null, }
*/


	raw
		.filter(d=>d.COUNTRY=='Totals')
		.forEach(d=>{

				dbg&&console.log('d',d);

		});

	'confirmed,suspect,positive,deaths,cured,negative'.split(',').forEach(k=>{
		dbg&&console.log(k, d3.sum(list, d=>d[k]));
	});

	dbg&&console.log('!longitude,latitude', list.filter(d=>!d.longitude||!d.latitude));





	dbg&&console.log(key, list);

	fEnd();

	return list;

}