
//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadJHU(grp, key, cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	var reqs = M.config.data[grp].find(d=>d.key==key).urls.map(d=>d3.csv(d));
	Promise.all(reqs).then(loaded);


	//-----------------------------
	//
	//-----------------------------
	function loaded(raw)	{

		dbg&&console.log('key', key);


//		Province/State
//		Country/Region
//		Lat
//		Long
//		1/21/20 22:00
//		1/22/20 12:00
//		1/23/20 12:00
//		1/24/20 0:00
//		1/24/20 12:00

		var keys = ['confirmed','deaths','recovered'];
		var rows=[]

		raw.forEach((r,t)=>{
			r.forEach(d=>{

				var j={};
				j.country 	= d['Country/Region'];
				j.region		= d['Province/State'];
				j.latitude 	= +d['Lat'];
				j.longitude = +d['Long'];
				j._source=key;

				for (var i in d)	{
					var k = i.match(/(\d+?)\/(\d+?)\/(\d+?) (\d+?):(\d+)/);
					if (k && k.length==6)	{

						var dtstr = [[k[3],k[1],k[2]].join('-'),[k[4],k[5]].join(':')].join(' ');
						var dt = moment(dtstr,'YY-M-D H:mm');

						var l={...j};
						l.date_str = dt.format('YYYY-MM-DD');
						l.date = +moment(l.date_str,'YYYY-MM-DD');
						l.datetime = dt.format('YYYY-MM-DD HH:mm:ss');
						l[keys[t]] = +d[i];

						if (l[keys[t]] > 0) rows.push(l);

					}
				}

			});
		});


		//dbg&&console.log('rows',rows);

		M.data[key]=[];

		//-----------------------------
		//  collect last dataset of the day
		//-----------------------------
		d3.nest()
				.key(d=>d.date_str)
				.key(d=>d.datetime)
				.entries(rows)
					.forEach(d=>{
						d.values.sort(d3.comparator().order(d3.descending, d=>d.key));
						M.data[key] = M.data[key].concat(d.values[0].values);
					});

		dbg&&console.log('M.data['+key+']',M.data[key]);

		loadCheck(fEnd);


	}


}

