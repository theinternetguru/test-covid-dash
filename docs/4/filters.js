

function filterCountry(ctry)	{

	if (!ctry||ctry=='')	{
		M.filters.country=null;
	}else if (M.filters.country && M.filters.country==ctry) {
		M.filters.country=null;
	}else	{
		M.filters.country = ctry;
	}


//
//	M.nest.daily = filtersTimeline(M.nest.daily);
//	vizTimeline('daily', M.nest.daily);
//	map();

}


//------------------------------------------------------------------
//
//------------------------------------------------------------------
function filtersTimeline(data)	{


		var prev={};
		data.forEach(d=>{
			d.values.forEach(k=>{

				k.valuesFiltered = k.values.filter(d=>M.filters.country ? d.country==M.filters.country : !!d.country);

				k.confirmed = d3.sum(k.valuesFiltered, d=>d.confirmed);
				k.deaths 		= d3.sum(k.valuesFiltered, d=>d.deaths);
				k.recovered = d3.sum(k.valuesFiltered, d=>d.recovered);

				k.countries	= d3.nest()
												.key(k=>k.country.replace(/Mainland China/i,'China')
													.replace(/United Arab Emirates/i,'UAE')
													.replace(/United States of America/i,'USA')
													.replace(/\bUS\b/i,'USA')
													.replace(/\bOthers\b/i,'Japan')
													.replace(/\bUnited Kingdom\b/i,'UK')
												)
												//.key(k=>k.country.replace(/United Arab Emirates/i,'UAE').toUpperCase())
												.entries(k.valuesFiltered);

				k.countries.forEach(k=>{
					k.confirmed = d3.sum(k.values, d=>d.confirmed);
					k.deaths 		= d3.sum(k.values, d=>d.deaths);
					k.recovered = d3.sum(k.values, d=>d.recovered);
				});

			});

			var filteredData = d.values;
			if (d.key>'2020-02-10')	{
				filteredData = filteredData.filter(d=>d.key.match(/first41|jhu|bno|martine/i));
			}
			d.confirmed = d3.max([prev.confirmed||0, 	d3.max(filteredData, d=>d.confirmed) ]);
			d.deaths 		= d3.max([prev.deaths||0, 		d3.max(filteredData, d=>d.deaths) ]);
			d.recovered = d3.max([prev.recovered||0, 	d3.max(filteredData, d=>d.recovered) ]);
			d.countries	= d3.max([prev.countries||0,	d3.max(filteredData, d=>d.countries.length) ]);

			prev = d;

		});


	return data;

}

