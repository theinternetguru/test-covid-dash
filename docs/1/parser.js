

//==================================================================
// countries
//==================================================================

function load_countries(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var key = 'countries';
	db[key]=new PouchDB(key);
  db['countries'].allDocs({include_docs: true, descending: true}, function(err, doc) {
		var key = 'countries';
  	console.warn('db.'+key, err, doc.total_rows);
    if (err || doc.total_rows==0) {
			d3.tsv( M.config.data.ref.find(d=>d.key==key).url )
				.then(function(raw){
					M.data[key] = parser_countries(raw);
					M.data[key].forEach(d=>{
						d._id = d.id.toString();
						db[key].put(d);
					});
					fEnd();
				});
    }else	{
	    M.data[key] = doc.rows.map(d=>d.doc);
	    dbg&&console.log('M.data['+key+']',M.data[key]);
	    fEnd();
	  }
  });




}


//==================================================================
//
//==================================================================

function parser_countries(raw)	{

	console.log('raw',raw);
	return raw
					.filter(d=>d.name&&d.name!='')
					.map(d=>{
						d.latitude = +d.latitude;
						d.longitude = +d.longitude;
						return d;
					});


	return data;
}



//==================================================================
// airports
//==================================================================

function load_airports(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var key = 'airports';
	db[key]=new PouchDB(key);
  db[key].allDocs({include_docs: true, descending: true}, function(err, doc) {
		var key = 'airports';
  	console.warn('db.'+key, err, doc.total_rows);
    if (err || doc.total_rows==0) {
			d3.csv( M.config.data.ref.find(d=>d.key==key).url )
				.then(function(raw){
					M.data[key] = parser_airports(raw);
					M.data[key].forEach(d=>{
						d._id = d.airport_id.toString();
						db[key].put(d);
					});
					fEnd();
				});

    }else	{
	    M.data[key] = doc.rows.map(d=>d.doc);
	    dbg&&console.log('M.data['+key+']',M.data[key]);
	    fEnd();
	  }
  });

}


//==================================================================
//
//==================================================================

function parser_airports(raw)	{

	raw.forEach(d=>{
		for (var i in d)	{
			if (typeof d[i]=='string' && (d[i]=='NULL'||d[i]=='N/A'||d[i]=='')) d[i]=null;
		}
	});

	var data = raw
					.filter(d=>d.name&&d.name!=''&&d.iata&&d.icao)
					.filter(d=>d.name.match(/international/i))
					.map(d=>{
						d.latitude = +d.latitude;
						d.longitude = +d.longitude;
						d.altitude = +d.altitude;
						d.timezone = +d.timezone;
						return d;
					});

	dbg=1;
	dbg&&console.log('airports type', d3.nest().key(d=>d.type).entries(data));
	dbg&&console.log('airports country', d3.nest().key(d=>d.country).entries(data));
	dbg&&console.log('airports malaysia', data.filter(d=>d.country.toLowerCase()=='malaysia'));

	return data;

}

//==================================================================
//
//==================================================================
