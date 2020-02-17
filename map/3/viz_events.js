

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
				title: [
					'['+moment(d.events[0].date).format('D MMM')+']',
					[
						d.events[0].location.region||d.events[0].location.location,
						d.events[0].location.country_code||d.events[0].location.country
					].join(', '),
				].join(' '),
				label: d.events[0].description,
			};

			rows.push(j);
		});


	if (rows.length==0 && M.prev.events) {
		rows = M.prev.events;
	}


	rows.sort(d3.comparator().order(d3.descending, d=>d.note.label.length));
	rows = rows.slice(0,3);
	rows.sort(d3.comparator().order(d3.ascending, d=>d.x));

	//-----------------------------
	// simplistic annotation position calculation, need to improve this
	//-----------------------------
	var scale = d3.scaleLinear().domain([0,rows.length]).range([
		-((rows.length*120)/2),
		((rows.length*120)/2)
	]);

	rows.forEach((d,i)=>{
		d.dx = (cbb.width/2) - d.x + scale(i);
		d.px = d.x + d.dx;
		d.py = d.y + d.dy;
	});

	if (rows.length>1)	{
		rows.forEach((d,i)=>{
			if (i>0)	{
				if (d.px - rows[i-1].px < 150)	{
					if (i==2)	{
						d.dx = d.dx + 120;
					}else	{
						rows[i-1].dx = rows[i-1].dx - 120;
					}
				}
			}
		});
	}


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

