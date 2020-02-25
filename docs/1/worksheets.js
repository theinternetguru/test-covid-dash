
function worksheets(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	M.config.data.worksheets.forEach(d=>{

		dbg&&console.log('url', d.url);

//
//		Promise.all([d3.xml(d.url)]).then(function(k){
//
//			dbg&&console.log('d',d);
//			dbg&&console.log('k',k);
//
//		});


//		d3.xml(d.url, function(xml) {
//			//xml.documentElement.getElementsByTagName("value")
//			console.log('xml',xml);
//		});

		Promise.all([d3.text(d.url)]).then(function(k){
			dbg&&console.log('k',k);
		});

	});




}
