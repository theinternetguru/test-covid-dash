
//------------------------------------------------------------------
//
//------------------------------------------------------------------
function load(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	loadMalaysia('hot','malaysia',fEnd);

}


//------------------------------------------------------------------
//
//------------------------------------------------------------------

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

		if (!M.raw) M.raw={};

		var hsb= raw[0].filter(d=>d.hospital=='HSB');
		raw[0].forEach(d=>{
			if (!d.latitude){
				d.hospital = hsb[0].hospital;
				d.latitude = hsb[0].latitude;
				d.longitude = hsb[0].longitude;
			}

			if (d.travel_date)	{
				let t1 = d.travel_date.match(/(\d+?)-(\d+?)-(\d+?)$/);
				let t2 = d.travel_date.match(/(\d+?)-(\d+?)-(\d+?)\/(\d+?)$/);
				let t3 = d.travel_date.match(/(\d+?)-(\d+?)-(\d+?)\/(\d+?)-(\d+?)$/);
				let t4 = d.travel_date.match(/(\d+?)-(\d+?)-(\d+?)\/(\d+?)-(\d+?)-(\d+?)$/);
				if (t4&&t4.length==7)	{
					d.travel_date_from 	= [t4[1],t4[2],t4[3]].join('-');
					d.travel_date_to 		= [t4[4],t4[5],t4[6]].join('-');
				}else if (t3&&t3.length==6)	{
					d.travel_date_from 	= [t3[1],t3[2],t3[3]].join('-');
					d.travel_date_to 		= [t3[1],t3[4],t3[5]].join('-');
				}else if (t2&&t2.length==5)	{
					d.travel_date_from 	= [t2[1],t2[2],t2[3]].join('-');
					d.travel_date_to 		= [t2[1],t2[2],t2[4]].join('-');
				}else if (t1&&t1.length==4)	{
					d.travel_date_from 	= [t1[1],t1[2],t1[3]].join('-');
					d.travel_date_to 		= [t1[1],t1[2],t1[3]].join('-');
				}
			}

			d.contact_events=[];
			d3.range(1,8).forEach(k=>{
				if (d['contact_date'+k])	{
					d.contact_events.push({
						date: d['contact_date'+k],
						event: d['contact_event'+k],
					});
				}
			});


		});

		M.raw.malaysia = raw[0];

		var dates = d3.extent(raw[0], d=>d.date_confirmed);
		dbg&&console.log('dates', dates);

		var daily=[];
		var nest = d3.nest().key(d=>[f3(d.latitude),f3(d.longitude)].join('-')).entries(raw[0]);

		dbg&&console.log('nest', nest);

		nest.forEach(l=>{

				d3.timeDays(moment(dates[0]), moment(dates[1]).add(1,'days'))
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

		if (!M.data) M.data={};
		M.data.malaysia = daily;


		fEnd();

	}

}

