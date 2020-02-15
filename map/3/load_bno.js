
//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadBNORegion(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	//----------
	// archive
	//----------
	var key = 'bnoregion';

	var reqs = [
		d3.tsv(M.config.data['hot'].find(d=>d.key==key).url),
	];

	Promise.all(reqs).then(loaded);

	//-----------------------------
	// loaded
	//-----------------------------
	function loaded(raw)	{

		dbg&&console.group('loaded:'+key);
		dbg&&console.log('key', key);
		dbg&&console.log('raw', raw);

		M.raw[key]=raw;

		/*
			{
			  "date": "2020-01-24",
			  "place": "CHINA TOTAL",
			  "confirmed": "1",
			  "deaths": "41",
			  "recovered": "",
			  "suspected": "",
			  "serious": ""
			}
		*/

		M.data[key]=raw[0].map(d=>{

				var date = moment(d.date);
				var k = {
					date: +date,
					date_str: date.format('YYYY-MM-DD'),

					countries:d.place,

					confirmed: +d['confirmed']||null,
					deaths: +d['deaths']||null,
					recovered: +d['recovered']||null,
					suspected: +d['suspected']||null,
					serious: +d['serious']||null,
				};
				return k;

		});

//		rows.sort(d3.comparator().order(d3.ascending, d=>d.date));
//		dbg&&console.log('rows',rows);


		dbg&&console.groupEnd('loaded:'+key);
		loadCheck(fEnd);

	}

}



//-----------------------------
//
//-----------------------------


//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadBNOPlace(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	//----------
	// archive
	//----------
	var key = 'bnoplace';

	var reqs = [
		d3.tsv(M.config.data['hot'].find(d=>d.key==key).url),
	];

	Promise.all(reqs).then(loaded);

	//-----------------------------
	// loaded
	//-----------------------------
	function loaded(raw)	{

		dbg&&console.group('loaded:'+key);
		dbg&&console.log('key', key);
		dbg&&console.log('raw', raw);

		M.raw[key]=raw;

		/*
			{
			  "date": "2020-01-24",
			  "place": "CHINA TOTAL",
			  "confirmed": "1",
			  "deaths": "41",
			  "recovered": "",
			  "suspected": "",
			  "serious": ""
			}
		*/

		M.data[key]=raw[0].map(d=>{

				var date = moment(d.date);
				var k = {
					date: +date,
					date_str: date.format('YYYY-MM-DD'),

					country:d.place,

					confirmed: +d['confirmed']||null,
					deaths: +d['deaths']||null,
					recovered: +d['recovered']||null,
					suspected: +d['suspected']||null,
					serious: +d['serious']||null,
				};
				return k;

		});

//		rows.sort(d3.comparator().order(d3.ascending, d=>d.date));
//		dbg&&console.log('rows',rows);


		dbg&&console.groupEnd('loaded:'+key);
		loadCheck(fEnd);

	}

}

