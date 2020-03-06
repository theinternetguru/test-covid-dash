
var comma = d3.format(','),
		f1 = d3.format(',.1f'),
		f2 = d3.format(',.2f'),
		f3 = d3.format(',.3f'),
		z2 = d3.format('02d'),
		fc = 0;

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
		reqs='config,layout,load,viz'.split(/\s*,\s*/);

var required = reqs.map(function(d){
	return version+'/'+d+'.js?_t='+ _t||parseInt(Math.random()*1e6)
});

requirejs(required, function() {
	main();
});



//------------------------------------------------------------------
//
//------------------------------------------------------------------
function main(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	layout();
	load(function(){
		viz(fEnd)
	});

}




