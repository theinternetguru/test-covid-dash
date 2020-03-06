
function loadMalaysia(grp, key, cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	var reqs = M.config.data[grp].find(d=>d.key==key).urls.map(d=>d3.tsv(d));
	Promise.all(reqs).then(loaded);

	function loaded(raw)	{

		dbg&&console.log('raw[0]', raw[0]);

		raw[0] = raw[0].filter(d=>+d.case_no);

		raw[0].forEach(d=>{
			d.case_no = +d.case_no;
		});

		M.raw.malaysia = raw[0];

		var dates = d3.extent(raw[0], d=>d.date_confirmed);
		dbg&&console.log('dates', dates);

		var daily=[];
		var nest = d3.nest().key(d=>[f3(d.latitude),f3(d.longitude)].join('-')).entries(raw[0]);

		dbg&&console.log('nest', nest);

		nest.forEach(l=>{

				d3.timeDays(moment(dates[0]), moment(dates[1]).add(1,'days'))
//				d3.timeDays(moment(dates[0]), moment())
//				d3.timeDays(moment(dates[0]), moment().add(-1,'days'))
					.forEach(d=>{

						var k = {
							date:+d,
							date_str:moment(d).format('YYYY-MM-DD'),
							latitude: +l.values[0].latitude,
							longitude: +l.values[0].longitude,
							country:'Malaysia',
							region:l.values[0].hospital,
							_source: key,
						};


						k.confirmed = l.values.filter(j=>+moment(j.date_confirmed) <= k.date).length;
						k.recovered = l.values.filter(j=>+moment(j.date_recovered) <= k.date).length;
						k.deaths = l.values.filter(j=>+moment(j.date_death) <= k.date).length;

						if (k.confirmed + k.recovered + k.deaths > 0)	{
							daily.push(k);
						}

					});


			});

		dbg&&console.log('daily', daily);
		M.data.malaysia = daily;

//
//		country: "Mainland China"
//		region: "Anhui"
//		latitude: 31.8257
//		longitude: 117.2264
//		_source: "jhu"
//		date_str: "2020-02-01"
//		date: 1580486400000
//		confirmed: 297



		loadCheck(fEnd);

	}

}

