

//------------------------------------------------------------------
//
//------------------------------------------------------------------
function load(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	loadCache(fEnd);

}




//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadCache(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	loadSummary();
	loadArchive();

	loadJHU('hot', 'jhu');

	loadMartine('hot','martine');
	loadGeneric('hot', 'bnoregion');
//	loadGeneric('hot', 'bnoplace');
//	loadGeneric('hot', 'casetracking');



	loadCheck(fEnd);


}


//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadCheck(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	if (
		M.data['first41']
		&& M.data['martine']
		&& M.data['bnoregion']
//		&& M.data['bnoplace']
//		&& M.data['casetracking']
		&& M.data['jhu']
	){
		prep(function(){

			vizTimeline('daily', M.nest.daily);
			map(fEnd);


		});
	}

}

//------------------------------------------------------------------
//
//------------------------------------------------------------------
function prep(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var all=[];



	//-----------------------------
	// first41
	//-----------------------------

/*
{
  "date": 1577808000000,
  "date_str": "2020-01-01",
  "diff_confirmed": 1,
  "diff_wetmarket_yes": 0,
  "diff_wetmarket_no": 1,
  "confirmed": 41,
  "wetmarket_yes": 27,
  "wetmarket_no": 14,
  "_id": "2020-01-01",
  "_rev": "1-cac1e68a107e1a812969efee3e33bbc7"
}
*/

	if (M.data.first41)	{

		var k = M.data.jhu.find(d=>d.region.match(/hubei/i));

		all = all.concat(M.data.first41);
		all.forEach(d=>{
			d.region = 'Hubei';
			d.country = 'Mainland China';
			d.latitude = k.latitude;
			d.longitude = k.longitude;
			d._source = 'first41';
		});

		all.sort(d3.comparator().order(d3.ascending,d=>d.date));

	}



	all = all.concat(M.data['martine']);
//	all = all.concat(M.data['bnoregion']);
//	all = all.concat(M.data['bnoplace']);
//	all = all.concat(M.data['casetracking']);
	all = all.concat(M.data['jhu']);

	//-----------------------------
	//
	//-----------------------------

	all.sort(d3.comparator().order(d3.ascending,d=>d.date));

	dbg&&console.log('all',[...all]);
	//dbg&&console.log('nest', d3.nest().key(d=>d.date_str).entries(all) );

	M.data.all = all;

	prepAll(fEnd);

}





//------------------------------------------------------------------
//
//------------------------------------------------------------------
function prepAll(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };




	M.nest.daily = d3.nest()
								.key(d=>d.date_str)
								.key(d=>d._source)
								.entries(M.data.all);

	var prev = {};

	M.nest.daily.forEach(d=>{

		d.date = +moment(d.key);
		d.date_str = d.key;

		d.values.forEach(k=>{
			k.confirmed = d3.sum(k.values, d=>d.confirmed);
			k.deaths 		= d3.sum(k.values, d=>d.deaths);
			k.recovered = d3.sum(k.values, d=>d.recovered);

			k.countries	= d3.nest()
											.key(k=>k.country.replace(/Mainland China/i,'China')
												.replace(/United Arab Emirates/i,'UAE')
												.replace(/United States of America/i,'USA')
												.replace(/\bUS\b/i,'USA')
												.replace(/\bOthers\b/i,'Japan')
												.replace(/\bUnited Kingdom\b/i,'UK')
											)
											//.key(k=>k.country.replace(/United Arab Emirates/i,'UAE').toUpperCase())
											.entries(k.values);

			k.countries.forEach(k=>{
				k.confirmed = d3.sum(k.values, d=>d.confirmed);
				k.deaths 		= d3.sum(k.values, d=>d.deaths);
				k.recovered = d3.sum(k.values, d=>d.recovered);
			});
		});


		//-----------------------------
		// custom filter
		//-----------------------------
		var filteredData = d.values;

		if (d.key>'2020-02-10')	{
			filteredData = filteredData.filter(d=>d.key.match(/first41|jhu|bno|martine/i));
		}

		d.confirmed = d3.max([prev.confirmed||0, 	d3.max(filteredData, d=>d.confirmed) ]);
		d.deaths 		= d3.max([prev.deaths||0, 		d3.max(filteredData, d=>d.deaths) ]);
		d.recovered = d3.max([prev.recovered||0, 	d3.max(filteredData, d=>d.recovered) ]);
		d.countries	= d3.max([prev.countries||0,	d3.max(filteredData, d=>d.countries.length) ]);

		prev = d;

	});


	dbg&&console.log('M.nest.daily', M.nest.daily);

//	dbg&&console.log('confirmed', M.nest.daily.map(d=>d.confirmed));
//	dbg&&console.log('deaths', M.nest.daily.map(d=>d.deaths));
//	dbg&&console.log('recovered', M.nest.daily.map(d=>d.recovered));



	fEnd();
}
