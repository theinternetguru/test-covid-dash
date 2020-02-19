

//==================================================================
//
//==================================================================
function vizEvents(date, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	if (!date) {
		d3.select('.annotations').selectAll('.viz-events').data([]).exit().remove();
		return;
	}

	if (!M.prev) M.prev={}

	var cbb = d3.select('.content-map').node().getBoundingClientRect();

	var rows=[];

	d3.selectAll('.modes-points .bubble.key-confirmed')
		.filter(d=>d.events.length>0)
		.each(function(d,i){

			var bb = d3.select(this).node().getBoundingClientRect();

			var j = {...d};
			j.bb = bb;
			j.x = bb.x+(bb.width/2) - cbb.x;
			j.y = bb.y+(bb.height/2) - cbb.y;

			j.dx = 0;
			j.dy = j.y < ((cbb.height/2)-10) ? -50 : 50;
			if (j.y+j.dy < 100) j.dy = 200 - j.y;
			if (j.y+j.dy > cbb.height-100) j.dy = cbb.height-100 - j.y;

			j.note = {
				title: d3.nest()
								.key(d=>d).entries([
									d.events[0].location.region||d.events[0].location.location,
									d.events[0].location.country_code||d.events[0].location.country
								])
								.map(d=>d.key).join(', '),
				label: [
					moment(d.events[0].date).format('D MMM')+' - ',
					d.events[0].description
				].join(' '),
			};

			rows.push(j);
		});


	if (rows.length==0 && M.prev.events) {
		rows = M.prev.events;
	}


	rows.sort(d3.comparator().order(d3.descending, d=>d.note.label.length));
	rows = rows.slice(0,3);


	//-----------------------------
	// simple positioning of annotation, need to improve this
	//-----------------------------
	var scaleX = d3.scaleLinear().domain([0,rows.length]).range([
		-((rows.length*120)/2),
		((rows.length*120)/2)
	]);

	var scaleY = d3.scaleLinear().domain([0,rows.length]).range([
		-((rows.length*80)/2),
		((rows.length*80)/2)
	]);

	rows.sort(d3.comparator().order(d3.ascending, d=>d.x));

	rows.forEach((d,i)=>{
		d.dx = (cbb.width/2) - d.x + scaleX(i);
		d.px = d.x + d.dx;
	});

	rows.sort(d3.comparator().order(d3.descending, d=>d.y));

	rows.forEach((d,i)=>{
		d.dy = (cbb.height/2) - d.y + scaleY(i);
		d.py = d.y + d.dy;
		if (d.py < 30) d.dy = d.dy + 30;
	});




	dbg&&console.log('rows', rows);

	M.prev.events = rows;

  var makeAnnotations = d3.annotation()
    //.type(d3.annotationLabel)
    //.type(d3.annotationCalloutElbow)
    //.type(d3.annotationCalloutCurve)
    .type(d3.annotationCalloutCircle)

    .annotations(rows);


	var v = d3.select('.annotations').selectAll('.viz-events').data([1]);
	v.exit().remove();
	v.enter()
		.append('div')
			.attr('class','viz-events')
			.styles({
				position:'absolute',
				'z-index':6666,
				'pointer-events':'none',
			})
			.call(sel=>{

				sel.append('svg')
					.attrs({
						class:'svg-events',
						width	:'100%',
						height:'100%',
						overflow:'visible',
						'pointer-events':'none',
					})
					.append('g')
						.attr('class','g-events');

			})
		.merge(v)
			.styles({
				width	:cbb.width+'px',
				height:cbb.height+'px',
				left	:cbb.x+'px',
				top		:cbb.y+'px',
			})
			.call(sel=>{

				sel.select('.svg-events')
					.attrs({
						viewBox:[0,0,cbb.width,cbb.height].join(' '),
						overflow:'hidden',
					})
					.select('.g-events')
						.call(makeAnnotations);

			});

	fEnd();
}

