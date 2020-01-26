

//==================================================================
//
//==================================================================
function render(cb)	{
	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+'-'+fc++,
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	renderPoints(fEnd);


}




//==================================================================
//
//==================================================================
function renderPoints(cb)	{
	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+'-'+fc++,
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };





	fEnd();
}

