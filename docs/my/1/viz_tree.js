


//==================================================================
// tree
// - https://blockbuilder.org/d3noob/3baa7023d4d1661536a491b51460cfe9
//==================================================================
function viz_tree(sel, cb)	{
	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	var data = M.raw.malaysia.map(d=>{ return {...d}});

	dbg&&console.log('data', data);

	// custom when link is unknown
	data.filter(d=>d.related_case_no==33 && d.cluster=='Gen-2').forEach(d=>{
		d.related_case_no = 62;
		d.related_case_no_original = 33;
	});


	var stratify = d3.stratify()
	    .id(function (d) {
	        return +d.case_no;
	    })
	    .parentId(function (d) {
	    		return +d.related_case_no > 0 ? +d.related_case_no
	    						: d.case_no==0 ? '' : 0
	    });

	// root
	data.unshift({
		case_no:0,
		related_case_no:'',
	});

	dbg&&console.log('stratify', stratify(data))

	var treeData = stratify(data);
	dbg&&console.log('treeData',treeData);


	// assign the name to each node
	treeData.each(function(d) {
	    d.name = d.id;
	  });

	// set the dimensions and margins of the diagram
	var margin = {top: 20, right: 90, bottom: 30, left: 0},
	    width = (innerWidth-200) - margin.left - margin.right,
	    height = 700 - margin.top - margin.bottom;

	// declares a tree layout and assigns the size
	var treemap = d3.tree()
	    .size([height, width]);

	//  assigns the data to a hierarchy using parent-child relationships
	var nodes = d3.hierarchy(treeData, function(d) {
	    return d.children;
	  });

	// maps the node data to the tree layout
	nodes = treemap(nodes);

	dbg&&console.log('nodes', nodes);
	dbg&&console.log('nodes', nodes);
	dbg&&console.log('nodes.descendants()', nodes.descendants());



	//----------------------------
	// title/legends positions
	//----------------------------

	var depth3 = nodes.descendants().filter(d=>d.depth==3),
			x3 = d3.extent(depth3, d=>d.x),
			y3 = d3.extent(depth3, d=>d.y);

	dbg&&console.log('depth3 x3', x3);
	dbg&&console.log('depth3 y3', y3);

	var depth4 = nodes.descendants().filter(d=>d.depth==4),
			x4 = d3.extent(depth4, d=>d.x),
			y4 = d3.extent(depth4, d=>d.y);

	dbg&&console.log('depth4 x4', x4);
	dbg&&console.log('depth4 y4', y4);


	var depthWidth = y4[0] - y3[0];
	dbg&&console.log('depthWidth', depthWidth);

	//----------------------------
	// svg
	//----------------------------

	var svg = sel.append("svg")
	      .attr("width", width + margin.left + margin.right)
	      .attr("height", height + margin.top + margin.bottom),

			bg = svg.append('g')
						.attrs({
							transform:"translate(" + margin.left + "," + margin.top + ")",
						}),

	    g = svg.append("g")
	      .attr("transform",
	            "translate(" + margin.left + "," + margin.top + ")");



	bg.append('g')
		.call(sel=>{

//			sel
//				.append('rect')
//				.attrs({
//					fill:'#fff',
//					width:'100%',
//					height:'100%',
//					stroke:'#999',
//					'stroke-dasharray':'1 4',
//				});

			//----------------------------
			// 2nd-Generation to Case #33
			//----------------------------


			sel.append('g')
//				.attr('transform','translate(700,320)')
				.attr('transform','translate('+(y4[0]-(depthWidth-30))+','+(x4[0]-30)+')')
				.call(sel=>{

//					sel.append('rect')
//						.attrs({
//							width:(depthWidth-30),
//							height:30,
//							fill:'#ddd',
//						});

					sel.append('text')
						.attrs({
							transform:'translate('+((depthWidth-30)/2)+',0)',
							'text-anchor':'middle',
							'font-size':'12px',
						})
						.text('2nd-Generation to Case #33')
						.append('tspan')
							.attrs({
								x:0,
								dy:'1em',
								'font-size':'12px',
							})
						.text('without link information')


				});


			//----------------------------
			// title/legend
			//----------------------------


			sel.append('g')
				.attr('transform','translate('+(y3[0]-depthWidth+30)+',30)')
				.call(sel=>{

					sel
						.append('rect')
						.attrs({
							fill:'#f2f2f2',
							y:-40,
							width:400,
							height:190,
							stroke:'#ccc',
							'stroke-width':4,
							//'stroke-dasharray':'2 4',
						});

					sel.append('text')
						.attrs({
							transform:'translate(20,0)',
							'text-anchor':'begin',
							fill:'#000',
							'font-size':'24px',
						})
						.text('Coronavirus Infections in Malaysia')
						.call(sel=>{


							sel
								.append('tspan')
									.attrs({
										x:0,
										dy:'1.2em',
										'font-size':'18px',
										fill:'#999',
									})
									.text('As of '+ moment(d3.max(data, d=>d3.max([d.date_confirmed, d.date_recovered]) )).format('D MMM YYYY') )
							sel
								.append('tspan')
									.attrs({
										x:0,
										dy:'2em',
										'font-size':'16px',
										fill:'#000',
									})
									.text('Types of Transmission')

						});



					sel
						.append('g')
							.attr('transform','translate(30,80)')
						.selectAll('.g-legend').data([
							{
								key:'imported',
								label:'Imported cases',
							},
							{
								key:'local',
								label:'Local transmission',
							},
							{
								key:'',
								label:'Under investigation',
							},
						])
							.enter()
								.append('g')
									.attrs({
										class:'g-legend',
										transform:(d,i)=>'translate('+[0,(i*24)]+')',
									})
									.call(sel=>{

										sel
											.append('circle')
												.attrs({
													r:8,
													fill:d=>{return {imported:'#E2431E','local':'#4374E0','':'#F1CA3A'}[d.key]},
													stroke:'#000',
												});

										sel.append('text')
											.attrs({
												x:15,
												y:5,
												'font-size':'14px',
											})
											.text(d=>d.label+' ('+data.filter(k=>k.case_no>0 && k.transmission_type==d.key).length+' cases)');

									});

				});

		});




	// adds the links between the nodes
	var link = g.selectAll(".link")
	    .data( nodes.descendants().slice(1))
	  .enter()
		  .append("path")
		    .attr("class", "link")
		    .attrs({
		    	stroke:'#f00',
		    	fill:'none',
		    	display:d=>d.parent.parent ? null : 'none',
		    	'stroke-dasharray':d=>d.data.data.related_case_no_original ? '2 4':null,
		    	'shape-rendering':'geometricPrecision',
		    })
//		    .attr("d", function(d) {
//		       return "M" + d.y + "," + d.x
//		         + "C" + (d.y + d.parent.y) / 2 + "," + d.x
//		         + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
//		         + " " + d.parent.y + "," + d.parent.x;
//		       });

//		    .attr("d", function(d) {
//		       return "M" + (d.y-25) + "," + d.x
//		         + "C" + ((d.y-25) + (d.parent.y+25)) / 2 + "," + d.x
//		         + " " + ((d.y-25) + (d.parent.y+25)) / 2 + "," + d.parent.x
//		         + " " + (d.parent.y+25) + "," + d.parent.x;
//		       });

		    .attr("d", function(d) {
					if (d.data.data.related_case_no_original)	{
						return "M" + (d.y-25) + "," + d.x
							+ " " + (d.y-(depthWidth-30)) + "," + d.x;
					}else	{
						return "M" + (d.y-25) + "," + d.x
							+ "C" + ((d.y-25) + (d.parent.y+25)) / 2 + "," + d.x
							+ " " + ((d.y-25) + (d.parent.y+25)) / 2 + "," + d.parent.x
							+ " " + (d.parent.y+25) + "," + d.parent.x;
					}
				});


	// adds each node as a group
	var node = g.selectAll(".node")
	    .data(nodes.descendants())
	  .enter().append("g")
	    .attr("class", function(d) {
	      return "node" +
	        (d.children ? " node--internal" : " node--leaf"); })
	    .attr("transform", function(d) {
	      return "translate(" + d.y + "," + d.x + ")"; })
	    .attr('display', d=> d.parent ? null : 'none')

	// adds the circle to the node
	node.append("circle")
		.attr('fill',d=>{
//			if (d.data.data.related_case_no_original && d.data.data.cluster=='Gen-2')	{
//				return '#4374E0';
//			}else	{
				return {imported:'#E2431E','local':'#4374E0','':'#F1CA3A'}[d.data.data.transmission_type]
//			}
		})
		//.attr('fill-opacity',.5)
		.attr('stroke','#000')
	  .attr("r", 5);

	// adds the text to the node
	node.append("text")
		.attrs({
			dy:".3em",
		})
	  .call(sel=>{

	  	sel.append('tspan')
	  		.attrs({
	  			x: -8,
	  			'text-anchor':'end',
	  			//fill:d=>d.data.data.transmission_type=='imported'?'blue':'#000',
	  			//fill: d=>{ return {imported:'#E2431E','local':'#4374E0','':'orangered'}[d.data.data.transmission_type] },
	  			fill:'#000',
	  			'font-size':'12px',
	  		})
	  		.text(d=>d.data.name)

	  	sel.append('tspan')
	  		.attrs({
	  			x: 8,
	  			'text-anchor':'begin',
	  			fill:'#f00',
	  			'font-size':'12px',
	  		})
	  		.text(d=>d.children && d.children.length && d.children[0].data.data.related_case_no_original!=33 ? '('+d.children.length+')': null )

	  })







	fEnd();
}


