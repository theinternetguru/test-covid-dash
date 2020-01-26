
M.data = {};
M.nest={};
M.hash={};
M.timer = {};
M.filters={};

M.requireds='config,load,map,render'.split(/\s*,\s*/).concat([
	'bno',
]);




//#############################################################################
//
//#############################################################################

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
		{key:'bno', 				label:'BNO',				active:true, disabled:false},
//		{key:'loader', 			fn:loader,			label:'Load', 			disabled:true},
//		{key:'sheetdata', 	fn:sheetdata,		label:'Data', 			disabled:true},
//		{key:'mapping', 		fn:mapping,			label:'Mapping', 		disabled:true},
//		{key:'types', 			fn:types,				label:'Types', 			disabled:true},
//		{key:'fields', 			fn:fields,			label:'Fields', 		disabled:true},
//		{key:'attributes', 	fn:attributes,	label:'Attributes', disabled:true},
//		{key:'importer', 		fn:importer,		label:'Import', 		disabled:true},
	];

	main();


});




//#############################################################################
//
//#############################################################################


//M.current.mode = 'official';

var comma = d3.format(','),
		f1 = d3.format(',.1f'),
		f2 = d3.format(',.2f');

//moment.locale('ms');

var fc = 0;



//==================================================================
//
//==================================================================
function main(cb)	{

	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	layout();
	//viz(fEnd);

	load(function(){
		viz(fEnd)
	});


	map();

}





//==================================================================
//
//==================================================================
function layout(cb)	{

	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	d3.select('body')
		.call(layoutBoostrap,fEnd);

}


//==================================================================
//
//==================================================================
function layoutBoostrap(sel, cb)	{

	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	//==================================================================
	//
	//==================================================================
	function layoutHdrForm(sel, cb)	{

		var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+':'+fCounter++,
				dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
		if (dbg){ console.group(f); console.time(f) };


		/*
		    <form class="form-inline my-2 my-lg-0">
		      <input class="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search">
		      <button class="btn btn-secondary my-2 my-sm-0" type="submit">Search</button>
		    </form>

		*/
		sel
			.append('form').attr('class','form-inline my-2 my-lg-0')
			.call(function(sel)	{

				sel.append('input')
					.attrs({
						class:'form-control mr-sm-2 input-search',
						type:'text',
						//placeholder:'search',
						'aria-label':'search',
					})
					.on('keyup', function(){

						var sel = d3.select(this);
						var q = sel.property('value');


						if (M.timer.search) window.clearTimeout(M.timer.search);
						window.setTimeout(function(){

							d3.select(this.parentNode)
								.select('.btn-search')
								.classed('btn-primary', q.length==0 ? true : false )
								.classed('btn-secondary', q.length==0 ? false : true )

							dbg&&console.log('q',q);
							M.filters[ M.current.tab ] = q;

							search();

						}, 500);

					});


				sel.append('div').attr('class','btn-group')
					.call(function(sel)	{


						sel.append('button')
							.attrs({
								class:'btn btn-secondary my-2 my-sm-0 btn-search',
								type:'button'
							})
							.on('click', function(){

								var q = d3.select(this.parentNode.parentNode)
									.select('input').property('value');

								dbg&&console.log('q',q);
								M.filters[ M.current.tab ] = q;
								search();

							})
							//.html('Cari');
							.append('i').attr('class','fas fa-search btn-search')


						sel.append('button')
							.attrs({
								class:'btn btn-secondary my-2 my-sm-0',
								type:'button'
							})
							.on('click', function(){

								d3.select(this.parentNode.parentNode)
									.select('input').property('value','');

								delete (M.filters[M.current.tab]);
								search();

							})
							.append('i').attr('class','fas fa-times')
							//										.html('Reset');

					});


			});



		fEnd();
	}





	//==================================================================
	//
	//==================================================================

	sel
		.call(function(sel)	{

			sel
				.append('nav').attr('class','navbar navbar-expand-lg navbar-light bg-dark')
					.call(sel=>{


  					sel.append('button')
  						.attrs({
  							class:'navbar-toggler',
  							type:'button',
  							'data-toggle':'collapse',
  							'data-target':'#navbarTogglerDemo02',
  							'aria-controlst':'navbarTogglerDemo02',
  							'aria-expanded':"false",
  							'aria-label':"Toggle navigation"
  						})
							.append('span')
								.attr('class','navbar-toggler-icon');

						sel
							.append('div')
								.attr('class','collapse navbar-collapse navbar-tab-container')
								.attr('id','navbarTogglerDemo02')
							.call(sel=>{

								sel.call(layoutHdrButtons);

								// search form
								//sel.call(layoutHdrForm);

							});

					});


			sel
				.append('div').attr('class','container-fluid')
					.style('padding',0)
					.style('margin',0)
				.append('div').attr('class','content')
					.style('padding',0)
					.style('margin',0);

		});



	fEnd();

}



//==================================================================
//
//==================================================================
function layoutHdrButtons(sel, cb)	{

	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+':'+fc++,
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	dbg&&console.log('M.tabs',M.tabs);

	if (!M.tabs.some(d=>d.active) && !M.current.tab)	{
		M.tabs[0].active = true;
	}

	var tabs = 	M.tabs;

	// default
	dbg&&console.log('M.current.tab', M.current.tab);
	if (!M.current.tab)	{
		tabs.filter(function(d){ return d.active}).forEach(function(d){
			M.current.tab = d.key
		});
	}

	tabs.filter(function(d){ return d.key==M.current.tab })
		.forEach(function(d){
			d.active = true;
		});


	dbg&&console.log('M.current.tab', M.current.tab);




	sel
		.append('ul').attr('class','navbar-nav mr-auto')
		.call(function(sel)	{

			sel.selectAll('li').data(tabs, function(d){ return d.key })
				.enter()
					.append('li').attr('class','nav-item')
						.append('button')
							.attrs({
								type:'button',
								class:function(d){
									return d.disabled ? 'btn btn-light disabled'
												: d.active ? 'btn btn-primary active'
												: 'btn btn-secondary'
								},
								disabled: d=>d.disabled ? 'disabled' : null
							})
							.styles({
								'margin-right':'12px',
								//background: d=> d.active ? null : '#ddd',
								//border: d=> d.active ? null : '#999',
							})
							.on('click', function(d){

								M.current.tab = d.key;

								d3.select(this.parentNode.parentNode)
									.selectAll('li')
										.each(function(k){
											k.active = k.key==M.current.tab ? true : false;
											d3.select(this).select('.btn')
												.classed('active', 				function(t){ return t.active ? true : false })
												.classed('btn-secondary', function(t){ return t.active ? false : true })
												.classed('btn-primary', 	function(t){ return t.active ? true : false })
												//.style('background',			t=>t.active?null:'#ddd')
												//.style('border',					t=>t.active?null:'#999')
											;
										});

								// reset search
								d3.select('.input-search')
									.property('value', M.filters[M.current.tab] || '');

								viz();

							})
							.html(function(d){ return d.label })

		});

	fEnd();

}


//==================================================================
//
//==================================================================
function layoutTabSwitch(currentTab, cb)	{

	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+':'+fc++,
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	M.current.tab=currentTab;

	M.tabs.filter(d=>d.active).forEach(d=>{
		d.active = false;
	});

	M.tabs.filter(d=>d.key==M.current.tab).forEach(d=>{
		d.active = true;
		d.disabled = false;
	});

	d3.select('.navbar-tab-container')
		.call(sel=>{
			sel.selectAll('*').remove();
			sel.call(layoutHdrButtons, fEnd);
		});



}



//==================================================================
// next tab
//==================================================================
function layoutTabSwitch_Next()	{

	var nextIdx = M.tabs.map(d=>d.key).indexOf(M.current.tab)+1;
	if (typeof window[M.tabs[nextIdx].key]=='function')	{
		layoutTabSwitch(M.tabs[nextIdx].key, window[M.tabs[nextIdx].key]);
	}

}



//==================================================================
//
//==================================================================
function viz(cb)	{

	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0]+':'+fc++,
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	//d3.select('.content').selectAll('*').remove();

	var btn = d3.select('nav')
		.selectAll('li').data();

	var active = btn.filter(function(d){ return d.active });


	if (M.timer.viz) window.clearTimeout(M.timer.viz);
	M.timer.viz = window.setTimeout(function(){

		dbg&&console.log('active', active);

		d3.select('.content')
			.call(function(sel)	{

				dbg&&console.log('active[0].key', active[0].key);
				if (typeof window[ active[0].key ]==='function')	{
					sel.call( window[ active[0].key ], fEnd);
				}else	{
					console.warn('No visualizer to call!');
				}


			});

	}, 500);


}

