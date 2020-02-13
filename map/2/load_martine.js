
//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadMartine(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	//----------
	// martine
	//----------
	var key = 'martine';

	var reqs = [
		d3.tsv(M.config.cvdata+'/data/martine_places.tsv'),
		d3.tsv(M.config.cvdata+'/data/martine_timeseries.tsv'),
	];

	Promise.all(reqs).then(loaded);


	//-----------------------------
	//
	//-----------------------------
	function loaded(raw)	{

		dbg&&console.log('key', key);

		M.data[key]=[];

		// martine
		/*
			{
			  "country": "Japan",
			  "location_id": "1661",
			  "location": "Hokkaido",
			  "latitude": 43.02,
			  "longitude": 142.88,
			  "date_str": "2020-01-10",
			  "date": 1578614400000,
			  "date_tz": null,
			  "confirmed": 0,
			  "deaths": 0,
			  "_id": "1661_2020-01-10",
			  "_rev": "1-68b055f5611c280b479231ead7549987"
			}

		*/

		// locationid	location	country	latitude	longitude	updated
		raw[0].forEach(d=>{
			d.locationid = +d.locationid;
			d.latitude = +d.latitude;
			d.longitude = +d.longitude;
		});

		// locationid	date	confirmed	deaths
		raw[1].forEach(d=>{
			d.locationid = +d.locationid;
			d.location_id = +d.locationid;

			d.confirmed = +d.confirmed;
			d.deaths = +d.deaths;
			d.date_str = d.date;
			d.date = +moment(d.date_str);
			d.date_tz = null;

			var place = raw[0].find(k=>k.locationid==d.locationid);

			if (place)	{

				d.country = place.country;
				d.location = place.location;
				d.latitude = place.latitude;
				d.longitude = place.longitude;

				//d._id = [d.location_id,d.date_str].join('_');
				//M.db[key].put(d).catch(err=>{});

				d._source=key;
				delete(d.locationid);
				delete(d.location_id);

				M.data[key].push(d);

			}else	{
				console.warn('place not found!', d);
			}


		});



		dbg&&console.log('M.data['+key+']',M.data[key]);

		loadCheck(fEnd);


	}


}

