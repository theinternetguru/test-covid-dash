

//==================================================================
//
//==================================================================
function bno(cb)	{
	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+'-'+fc++,
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	if (M.data.bno)	{

	}else	{
		bno_load(fEnd);
	}







	//==================================================================
	//
	//==================================================================
	function bno_load(cb)	{
		var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+'-'+fc++,
				dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };


		d3.text(
			'https://raw.githubusercontent.com/globalcitizen/2019-wuhan-coronavirus-data/master/data-sources/bno/data/20200125-055800-bno-2019ncov-data.csv',
			{crossOrigin: "anonymous"}
		).then(function(txt) {

		  dbg&&console.log({txt});

			M.data.bno={};

			// metadata
		  var raw = txt.split(/\n/);
		  raw.filter(d=>d.match(/^#/) && !d.match(/\|/))
		  		.forEach(d=>{
		  			var k=d.match(/^#\s*(.*?)\s*\:\s*(.*?)\s*$/);
		  			if (k && k.length)	{
							M.data.bno[k[1]] = k[2];
		  			}
				  });

			// data
			var csv = raw.filter(d=>!d.match(/^#/) || (d.match(/^#/) && d.match(/\|/)) )
									.join('\n')
									.replace(/^#\s*/,'');

			var psv = d3.dsvFormat("|");
			M.data.bno.data = psv.parse(csv);


		  dbg&&console.log({raw});
		  dbg&&console.log('M.data.bno',M.data.bno);

			bno_prep(fEnd);
		});


	}



	//==================================================================
	//
	//==================================================================
	function bno_prep(cb)	{
		var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+'-'+fc++,
				dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };


		M.data.bno.data.forEach(d=>{

		});


		fEnd();
	}


	//==================================================================
	//
	//==================================================================
	function bno_map(cb)	{
		var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+'-'+fc++,
				dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };



		fEnd();
	}


}

