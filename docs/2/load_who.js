
//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadWho(cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	//----------
	// martine
	//----------
	var key = 'who';

	M.db[key]= new PouchDB(key);
  M.db[key].allDocs({include_docs: true}, function(err, doc) {
		var key = 'who';
		//if (err) throw(err);
  	dbg&&console.log('M.db.'+key, doc.total_rows);
    if (err || doc.total_rows==0) {

    	loadSummary_latest(key,  fEnd);

    }else	{

			dbg&&console.group('cache');

	    M.data[key] = doc.rows.map(d=>d.doc);
	    dbg&&console.log('M.data['+key+']',key,M.data[key]);

			dbg&&console.groupEnd('cache');

			loadSummary_latest(key);
			vizSummary_render(fEnd);

	  }
  });


}
