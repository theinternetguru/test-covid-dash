
M.data = {};
M.nest={};
M.hash={};
M.timer = {};
M.filters={};
M.meta={};
M.db = {};
M.raw={};
M.map={};

M.requireds='config,layout,events'.split(/\s*,\s*/).concat([

	'load',
	'load_summary',
	'load_martine',
	'load_archive',
	'load_bno',
//	'load_jhudaily',
	'load_jhu',
	'load_generic',
	'load_cryptokass',

	'viz',
	'viz_summary',
	'viz_timeline',
	'viz_countries',
	'viz_patients',
	'viz_patients_renderer',

	'map',
	'map_render',

]);


M.current.playSpeed = 15000;
M.current.barSpeed = 300;

//M.current.loop = !!M.current.loop;
M.current.loop = true;
M.current.idle = moment();



//------------------------------------------------------------------
//
//------------------------------------------------------------------


if (!_v)	{
[].slice.call(document.getElementsByTagName("script"))
	.forEach(function(d){
		var src = d.getAttribute("src");
		if (src.match(/\/app.js/)) _v = src.split('/')[0];
	});
}

var version = _v,
		reqs=M.requireds;

var required = reqs.map(function(d){
	return version+'/'+d+'.js?_t='+ _t||parseInt(Math.random()*1e6)
});

requirejs(required, function() {

	M.tabs = [
		{
			key:'render',
			//label:'Novel Coronavirus (2019-nCoV)',
			label:'(2019-nCoV)',
			active:true, disabled:false
		},
	];

	main();


});


//------------------------------------------------------------------
//
//------------------------------------------------------------------

var comma = d3.format(','),
		f1 = d3.format(',.1f'),
		f2 = d3.format(',.2f'),
		f3 = d3.format(',.3f'),
		z2 = d3.format('02d');

//moment.locale('ms');

var fc = 0;




//------------------------------------------------------------------
//
//------------------------------------------------------------------
function main(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	layout();
	load();

//	map();
//
//	load(function(){
//		viz(fEnd)
//	});
//

	fEnd();

}


