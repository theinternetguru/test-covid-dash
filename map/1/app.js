
M.data = {};
M.nest={};
M.hash={};
M.timer = {};
M.filters={};

M.requireds='config,load,map,render'.split(/\s*,\s*/).concat([
	'bno',
	'summary',
	'timeline',
]);


M.current.playSpeed = 1500;
//M.current.loop = !!M.current.loop;
M.current.loop = true;
M.current.idle = moment();


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
		{key:'render', 				label:'Novel Coronavirus (2019-nCoV)',				active:true, disabled:false},
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
	map();

	load(function(){
		viz(fEnd)
	});


	window.setInterval(checkIdle, 1000 * 60);


}



function checkIdle() {

	d3.select('.today-date').html('Today: '+moment().format('DD MMM YYYY'));

	if (!M.current.play)	{
		if (moment().diff(M.current.idle,'minutes') > 1)	{
			$('.btn-play').click();
		}
	}

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



	//-----------------
	// main layout
	//-----------------

	sel
		.call(function(sel)	{

			//-----------------
			// heights
			//-----------------
			sel
				.append('nav').attr('class','navbar navbar-expand-lg navbar-light bg-dark')
					.styles({
						margin:0,
						padding:0,
						height: (innerHeight*.05)+'px'),
						background:'#000',
					});

			sel
				.append('div').attr('class','container-fluid')
					.styles({
						padding:0,
						margin:0,
					})
					.append('div').attr('class','content')
						.styles({
							padding:0,
							margin:0,
						})
						.call(sel=>{

							sel.append('div').attr('class','content-summary')
								.styles({
									margin:0,
									padding:0,
									height: (innerHeight*.2)+'px',
									background:'#000',
									color:'#fff',
									border:'1px solid #000',
								});

							sel.append('div').attr('class','content-map')
								.styles({
									margin:0,
									padding:0,
									height:(innerHeight*(.2+.2+.05)+'px',
								});

							sel.append('div').attr('class','content-timeline')
								.styles({
									margin:0,
									padding:0,
									height:(innerHeight*.2)+'px',
									background:'#000',
									color:'#fff',
								});

						});


		});

	//-----------------------------------
	// nav content
	//-----------------------------------

	sel.select('nav')
		.append('div')
		.styles({
			display:'flex',
			width:'100%',
		})
		.call(sel=>{

			sel
				.append('div')
					.attr('class','today-date')
					.styles({
						flex:'1 1 auto',
						'text-align':'left',
						color:'#fff',
						'text-shadow': '#000 1px 0 10px',
						'font-weight':700,
						padding:'0 0 0 24px',
					})
					.html('Today: '+moment().format('DD MMM YYYY'));

			sel
				.append('div')
					.styles({
						flex:'1 1 auto',
						'text-align':'center',
						color:'crimson',
						'text-shadow': '#000 1px 0 10px',
						'font-weight':700,
						//padding:'0 0 0 24px',
					})
					.html('Novel Coronavirus (2019-nCoV)');


			sel
				.append('div')
					.attr('class','display-date')
					.styles({
						flex:'1 1 auto',
						'text-align':'right',
						color:'lime',
						'text-shadow': '#000 1px 0 10px',
						'font-weight':700,
						padding:'0 24px 0 0',
					})
					.html('');

		});


//
//  					sel.append('button')
//  						.attrs({
//  							class:'navbar-toggler',
//  							type:'button',
//  							'data-toggle':'collapse',
//  							'data-target':'#navbarTogglerDemo02',
//  							'aria-controlst':'navbarTogglerDemo02',
//  							'aria-expanded':"false",
//  							'aria-label':"Toggle navigation"
//  						})
//							.append('span')
//								.attr('class','navbar-toggler-icon');
//
//						sel
//							.append('div')
//								.attr('class','collapse navbar-collapse navbar-tab-container')
//								.attr('id','navbarTogglerDemo02')
//							.call(sel=>{
//
//								sel.call(layoutHdrButtons);
//
//							});




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
								'border-radius':0,
								//background: d=> d.active ? null : '#ddd',
								//border: d=> d.active ? null : '#999',
							})
							.on('click', function(d){

								M.current.idle = moment();
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

	if (btn.length)	{
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

	}else	{

		d3.select('.content')
			.call( window[M.tabs.find(d=>d.active).key] , fEnd);

	}

}

