
//-----------------
// data
//-----------------

M.config = {
	data: {

		live:0,

		ref:[
			{ key:'countries', 			type:'tsv', 	url:'../_data/dd_countries.tsv'},
		],

		cold: [
			{ key:'bno', 						type:'text', 	url:'../_data/bno/20200125-bno.txt'},
			{ key:'jhu', 						type:'csv', 	url:'../_data/jhu/jhu-20200125.csv'},
			{ key:'martinedoesgis', type:'csv', 	url:'../_data/martinedoesgis/martinedoesgis-20200125.csv'},
		],

		hot: [
			{ key:'bno', 						type:'text', 	url:'https://raw.githubusercontent.com/globalcitizen/2019-wuhan-coronavirus-data/master/data-sources/bno/data/20200125-055800-bno-2019ncov-data.csv'},
		],

	}
};

