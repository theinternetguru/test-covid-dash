

//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadArchive(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	loadArchive_first41();
	loadArchive_ncovinfo();

	fEnd();
}





//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadArchive_first41(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	//----------
	// archive
	//----------
	var key = 'first41';

	loadLatest(key,  fEnd);

	//-----------------------------
	// loadLatest
	//-----------------------------
	function loadLatest(key, cb)	{

		var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
		dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };

		dbg&&console.log('key', key);

		var reqs = [
			d3.tsv(M.config.data.cold.find(d=>d.key==key).url),
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
			  "Date": "Dec 12",
			  "Infections": "-",
			  "Market-Yes": "-",
			  "Market-No": "-"
			}
			*/

			var rows=[];
			raw[0]
				.filter(d=>!d['Date'].match(/total/i))
				.forEach((d,i)=>{

					d['Infections'] = d['Infections'].replace(/\D+/g,'');
					d['Market-Yes'] = d['Market-Yes'].replace(/\D+/g,'');
					d['Market-No'] = d['Market-No'].replace(/\D+/g,'');

					var date = moment( (d['Date'].match(/nov|dec/i) ? '2019 ' : '2020 ')+d['Date'],'YYYY MMM D');

					var k = {
						date: +date,
						date_str: date.format('YYYY-MM-DD'),
						diff_confirmed: +d['Infections'],
						diff_wetmarket_yes: +d['Market-Yes'],
						diff_wetmarket_no: +d['Market-No'],
					};

					rows.push(k);

				});

			rows.sort(d3.comparator().order(d3.ascending, d=>d.date));
			dbg&&console.log('rows',rows);

			// prevent skipped/missing dates
			var extent = d3.extent(rows, d=>d.date_str);
			dbg&&console.log('extent',extent);

			var dates = d3.timeDays( moment(extent[0]), moment(extent[1]).add(1,'days'), 1)
										.map(d=>rows.find(k=>+d==k.date));

			dbg&&console.log('missing dates',dates.filter(d=>!d.date_str));

			dates.forEach((d,i)=>{
				if (i==0)	{
					d.confirmed 		= d.diff_confirmed;
					d.wetmarket_yes = d.diff_wetmarket_yes;
					d.wetmarket_no 	= d.diff_wetmarket_no;
				}else {
					d.confirmed 		= d.diff_confirmed + dates[i-1].confirmed;
					d.wetmarket_yes = d.diff_wetmarket_yes + dates[i-1].wetmarket_yes;
					d.wetmarket_no 	= d.diff_wetmarket_no + dates[i-1].wetmarket_no;
				}


			});


			/*
			{
			  "date": 1575129600000,
			  "date_str": "2019-12-01",
			  "confirmed": 1,
			  "wetmarket_yes": 0,
			  "wetmarket_no": 1,
			  "diff_confirmed": 1,
			  "diff_wetmarket_yes": 0,
			  "diff_wetmarket_no": 1,
			  "_id": "2019-12-01",
			  "_rev": "1-df46df4db9f6e3755c4c5a817c4645e9"
			}
			*/

			dbg&&console.log('dates',dates);

			M.data[key]=dates;


			dbg&&console.groupEnd('loaded:'+key);

 			loadCheck(fEnd);

		}

	}

}



//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadArchive_ncovinfo(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	//----------
	// archive
	//----------
	var key = 'ncovinfo';

	loadLatest(key,  fEnd);

	//-----------------------------
	// loadLatest
	//-----------------------------
	function loadLatest(key, cb)	{

		var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
		dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };

		dbg&&console.log('key', key);

		var reqs = [];
		var datasource = M.config.data.cold.find(d=>d.key==key);

		switch(datasource.type) {
		  case 'tsv':
		    reqs.push(d3.tsv(datasource.url));
		    break;
		  case 'csv':
		    reqs.push(d3.csv(datasource.url));
		    break;
		  case 'json':
		    reqs.push(d3.json(datasource.url));
		    break;
		  default:
		    reqs.push(d3.text(datasource.url));
		}


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
				  "nCov-date": "13/01/2020",
				  "nCov-days": "4",
				  "nCov-sincefirst": "43",
				  "nCov-suspected": "",
				  "nCov-infected": "41",
				  "nCov-growthpercent": "",
				  "nCov-allcases": "41",
				  "nCov-serious": "",
				  "nCov-seriouspercent": "",
				  "nCov-dead": "1",
				  "nCov-deadpercentall": "2.44",
				  "nCov-deadpercent": "2.44",
				  "nCov-recovered": "",
				  "nCov-recoveredpercent": "",
				  "nCov-deadrecov": "1",
				  "nCov-deadcasepercent": "",
				  "nCov-quarantine": "576",
				  "nCov-releaseday": "",
				  "nCov-release": "187",
				  "nCov-quarantinetotal": "763"
				}
			*/
			raw[0].forEach(d=>{
				d.date = +moment(d['nCov-date'],'DD/MM/YYYY');
			});

			var now = moment();
			var numerics = 'nCov-suspected,nCov-infected,nCov-dead,nCov-recovered'.split(',');

			var rows=[];
			raw[0]
				.filter(d=>d.date && d.date <= +now)
				.forEach((d,i)=>{

					numerics.forEach(k=>{
						d[k] 	= d[k].replace(/\D+/g,'');
					});

					var k = {
						date					: d.date,
						date_str			: moment(d.date).format('YYYY-MM-DD'),
						confirmed			: +d['nCov-infected'],
						deaths				: +d['nCov-dead'],
						recovered			: +d['nCov-recovered'],
						suspected			: +d['nCov-suspected'],
					};

					rows.push(k);

				});

			rows.sort(d3.comparator().order(d3.ascending, d=>d.date));
			dbg&&console.log('rows',rows);

			// prevent skipped/missing dates
			var extent = d3.extent(rows, d=>d.date_str);
			dbg&&console.log('extent',extent);

			var dates = d3.timeDays( moment(extent[0]), moment(extent[1]).add(1,'days'), 1)
										.map(d=>rows.find(k=>+d==k.date)||{date_str:moment(d).format('YYYY-MM-DD')});

			dbg&&console.log('dates',dates);

			dbg&&console.warn('missing dates',dates.filter(d=>!d||(d&&!d.date)));

			dates.forEach((d,i)=>{
				if (i==0)	{
//					d.confirmed 		= d.confirmed;
//					d.deaths 				= d.deaths;
//					d.suspected 		= d.suspected;
//					d.recovered 		= d.recovered;
				}else {
					d.confirmed 		= dates[i-1].confirmed;
					d.deaths 				= dates[i-1].deaths;
					d.suspected 		= dates[i-1].suspected;
					d.recovered 		= dates[i-1].recovered;
				}

//				d._id = [d.date_str].join('_');
//				M.db[key].put(d).catch(err=>{});

			});


			/*
				{
				  "date": 1578585600000,
				  "date_str": "2020-01-10",
				  "confirmed": 41,
				  "deaths": 1,
				  "recovered": 0,
				  "suspected": 0,
				  "_id": "2020-01-10"
				}
			*/

			dbg&&console.log('dates',JSON.stringify(dates[0],null,2));
			dbg&&console.log('dates',dates);

			M.data[key]=dates;


			dbg&&console.groupEnd('loaded:'+key);
			fEnd();

		}

	}

}




