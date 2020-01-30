

//-----------------
// data
//-----------------

M.datapath = document.location.host.match(/github|coronavirus\.analitik\.my/i)
							? 'https://raw.githubusercontent.com/nyem69/coronavirus_dashboard/master/_data'
							: (typeof _v=='number'?'../':'')+'_data';


M.config = {

	data: {

		live:0,

		ref:[
			//{ key:'countries', 			type:'tsv', 	url: M.datapath+'/dd_countries.tsv'},
			{ key:'countries', 			type:'tsv', 	url: M.datapath+'/dd_countries2.txt'},

			//{	key:'airports', 			type:'csv',		url:'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat'},
			{	key:'airports', 			type:'csv',		url: M.datapath+'/airports.txt'},

		],

		cold: [
//			{ key:'bno', 						type:'text', 	url: M.datapath+'/bno/20200125-bno.txt'},
//			{ key:'jhu', 						type:'csv', 	url: M.datapath+'/jhu/jhu-20200125.csv'},
//			{ key:'martine', 				type:'csv', 	url: M.datapath+'/martinedoesgis/martinedoesgis-20200125.csv'},


			{
				key:'case_tracking',
				description:'latest statistics by country; updated mulutiple times daily',
				label:'Coronavirus - case tracking',
				site:null,
				spreadsheet:'https://docs.google.com/spreadsheets/d/1qbE-UuJYw5V4FkyMZ-LplvUQZlut4oa5Zl3lrSmN_mk/htmlview?utm_source=share&utm_medium=ios_app&utm_name=iossmf#',
				url:'https://docs.google.com/spreadsheets/d/1qbE-UuJYw5V4FkyMZ-LplvUQZlut4oa5Zl3lrSmN_mk/gviz/tq?tqx=out:csv&sheet=international cases',
				type:'csv',
			},

			{
				key:'martine',
				description:'daily data by location; updated once daily',
				label:'MartineDoesGIS',
				site:'https://martinedoesgis.github.io/novel-coronavirus/map.html',
				active:true,
				type:'csv',
				url: 'https://docs.google.com/spreadsheets/d/18X1VM1671d99V_yd-cnUI1j8oSG2ZgfU_q1HfOizErA/gviz/tq?tqx=out:csv&sheet=data_adm1',
			},

			{
				key:'tencent',
				type:'json',
				url:'https://view.inews.qq.com/g2/getOnsInfo?name=wuwei_ww_area_counts&callback=&_=',
				cors:true,
			},

			{
				key:'virological-sheet1',
				site:'http://virological.org/t/epidemiological-data-from-the-ncov-2019-outbreak-early-descriptions-from-publicly-available-data/337',
				label:'http://virological.org/',
				type:'csv',
				filename:'nCoV2019_2020_line_list_open',
				url:'https://docs.google.com/spreadsheets/d/1itaohdPiAeniCXNlntNztZ_oRvjh0HsGuJXUJWET008/gviz/tq?tqx=out:csv&sheet=outside_Hubei',
			},
			{
				key:'virological-sheet2',
				site:'http://virological.org/t/epidemiological-data-from-the-ncov-2019-outbreak-early-descriptions-from-publicly-available-data/337',
				label:'http://virological.org/',
				type:'csv',
				filename:'nCoV2019_2020_line_list_open',
				url:'https://docs.google.com/spreadsheets/d/1itaohdPiAeniCXNlntNztZ_oRvjh0HsGuJXUJWET008/gviz/tq?tqx=out:csv&sheet=Hubei',
			},


		],

		hot: [
			{
				key:'bno',
				type:'text',
				url:'https://raw.githubusercontent.com/globalcitizen/2019-wuhan-coronavirus-data/master/data-sources/bno/data/20200125-055800-bno-2019ncov-data.csv',
			},
			{
				key:'virological-sheet1',
				type:'csv',
				url:'https://docs.google.com/spreadsheets/d/1itaohdPiAeniCXNlntNztZ_oRvjh0HsGuJXUJWET008/gviz/tq?tqx=out:csv&sheet=outside_Hubei',
			},
			{
				key:'virological-sheet2',
				type:'csv',
				url:'https://docs.google.com/spreadsheets/d/1itaohdPiAeniCXNlntNztZ_oRvjh0HsGuJXUJWET008/gviz/tq?tqx=out:csv&sheet=Hubei',
			},
		],


		//https://docs.google.com/spreadsheets/d/18X1VM1671d99V_yd-cnUI1j8oSG2ZgfU_q1HfOizErA/edit#gid=0

		worksheets:[
			{
				key:'virological-worksheet',
				type:'xml',
				url:'https://spreadsheets.google.com/feeds/worksheets/1itaohdPiAeniCXNlntNztZ_oRvjh0HsGuJXUJWET008/private/full',

			},
		],

	},


	theme:{

		colors:[
			['purple','crimson','#5C3292'],
		],

	},


};




//-----------------
// M.themeColors
//-----------------

if (!M.current.theme) M.current.theme = 0;
if (!M.config.theme.colors[+M.current.theme]) M.current.theme = 0;
M.theme={
	colors: M.config.theme.colors[+M.current.theme],
};






/*





*/