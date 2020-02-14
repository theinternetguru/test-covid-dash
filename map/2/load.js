

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
	loadMartine();

	loadGeneric('hot', 'bnoregion');
	loadGeneric('hot', 'bnoplace');
	loadGeneric('hot', 'casetracking');

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
		&& M.data['bnoplace']
		&& M.data['casetracking']
	){
		prep(function(){

			vizTimeline('daily', M.nest.daily, fEnd);
			map();


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

		all = all.concat(M.data.first41);
		all.forEach(d=>{
			d.vicinity = 'Hubei',
			d.location = 'Wuhan';
			d.region = 'Mainland China';
			d.country = 'China';
			d.latitude = 31.118;
			d.longitude = 112.293;
			d._source = 'first41';
		});

		all.sort(d3.comparator().order(d3.ascending,d=>d.date));

	}



	//-----------------------------
	// martine
	//-----------------------------


/*
{
  "country": "Germany",
  "location_id": "1309",
  "location": "Bavaria",
  "latitude": 48.81,
  "longitude": 11.6,
  "date_str": "2020-01-19",
  "date": 1579392000000,
  "date_tz": null,
  "confirmed": 0,
  "deaths": 0,
  "_id": "1309_2020-01-19",
  "_rev": "1-a9327a51822fc26eb41f7627c48a7b08"
}

d3.nest().key(d=>d.country).entries(M.data.martine).map(d=>d.key).join(',')
"Finland,France,Germany,India,Italy,Japan,Macau,Malaysia,Nepal,Phillipines,South Korea,Russia,Singapore,Spain,Sri Lanka,Sweden,Thailand,United Arab Emirates,United Kingdom,United States of America,Vietnam,Australia,Belgium,Cambodia,Canada,China,Hong-Kong,Taiwan"

d3.nest().key(d=>d.location).entries(M.data.martine.filter(d=>d.country=='China')).map(d=>d.key).join(',')
Anhui,Beijing,Chongqing,Fujian,Gansu,Guangdong,Guangxi,Guizhou,Hainan,Hebei,Heilongjiang,Henan,Hubei,Hunan,Jiangsu,Jiangxi,Jilin,Liaoning,Nei Mongol,Ningxia,Qinghai,Shaanxi,Shandong,Shanghai,Shanxi,Sichuan,Tianjin,Xinjiang,Tibet,Yunnan,Zhejiang"


*/



	all = all.concat(M.data['martine']);
	all = all.concat(M.data['bnoregion']);
	all = all.concat(M.data['bnoplace']);
	all = all.concat(M.data['casetracking']);

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
			k.countries	= d3.nest().key(k=>k.country).entries(k.values);
		});


		//-----------------------------
		// custom filter
		//-----------------------------
		var filteredData = d.values;

//		if (d.key>'2020-02-10')	{
//			filteredData = filteredData.filter(d=>d.key!='martine');
//		}

		d.confirmed = d3.max([prev.confirmed||0, 	d3.max(filteredData, d=>d.confirmed) ]);
		d.deaths 		= d3.max([prev.deaths||0, 		d3.max(filteredData, d=>d.deaths) ]);
		d.recovered = d3.max([prev.recovered||0, 	d3.max(filteredData, d=>d.recovered) ]);
		d.countries	= d3.max([prev.countries||0,	d3.max(filteredData, d=>d.countries.length) ]);

		prev = d;

	});


	dbg&&console.log('M.nest.daily', M.nest.daily);

	dbg&&console.log('confirmed', M.nest.daily.map(d=>d.confirmed));
	dbg&&console.log('deaths', M.nest.daily.map(d=>d.deaths));
	dbg&&console.log('recovered', M.nest.daily.map(d=>d.recovered));


//
//		// populate missing days
//		if (M.data.martine)	{
//
//			var last = all[all.length-1];
//			var minDate = d3.min(M.data.martine, d=>d.date_str);
//
//			dbg&&console.log( 'minDate', minDate, last.date_str );
//
//			var missingDays = d3.timeDays( moment(last.date).add(1,'days'), moment(minDate), 1).map(d=>+d);
//			dbg&&console.log('missingDays',missingDays);
//
//			missingDays.forEach(d=>{
//
//				var j = {...last};
//				j.date = +moment(d);
//				j.date_str = moment(d).format('YYYY-MM-DD');
//				j._source = 'missing';
//				all.push(j);
//
//			});
//
//			dbg&&console.log('all',[...all]);
//
//		}

	fEnd();
}
