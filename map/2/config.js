

//-----------------
// data
//-----------------

M.config = {

	theme:{

		colors:[
			['purple','crimson','green','#5C3292'],
			['darkcyan','cyan','darkcyan','darkcyan'],
			['green','lime','green','green'],
			['maroon','crimson','maroon','maroon'],
			['steelblue','crimson','steelblue','steelblue'],
			['purple','magenta','purple','purple'],
			[
				'#5C3292',
				'#D3362D',
				'#4374E0',
				'#43459D',
			],
			[
				'#666','#f00','#999','#ccc'
			],
			['#666','#1C91C0','#999','#333'],
			['#666','#E7711B','#999','#333'],
			['teal','orangered','darkseagreen','slategray'],
			['slategray','orangered','#703593','slategray'],

		],

	},

	datapath: document.location.host.match(/github|coronavirus\.analitik\.my|flu\.analitik\.my/i)
								? 'https://raw.githubusercontent.com/nyem69/coronavirus_dashboard/master/_data'
								: (typeof _v=='number'?'../':'')+'_data',

	cvdata: document.location.host.match(/diablo/i)
						? '//cron.diablo.aga.my/coronavirus_data'
						: 'https://raw.githubusercontent.com/nyem69/coronavirus_data/master',

};



//-----------------
// M.themeColors
//-----------------

if (!M.current.theme) M.current.theme = 11;
//if (!M.current.theme) M.current.theme = d3.shuffle(M.config.theme.colors)[0];
if (!M.config.theme.colors[+M.current.theme]) M.current.theme = 0;
M.theme={
	colors: M.config.theme.colors[+M.current.theme],
};





//------------------------------------------------------------------
// M.config.data
//------------------------------------------------------------------

M.config.data = {

	ref:[

		{
			key:'countries',
			type:'tsv',
			url: M.config.datapath+'/dd_countries2.txt',
		},

		{
			key:'airports',
			type:'csv',
			url: M.config.datapath+'/airports.txt',
			source:{
				url:'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat',
			},
		},

	],

	cold: [

		{
			key:'first41',
			type:'tsv',
			url: M.config.cvdata+'/archive/lancet-first41.tsv',
			source:{
				url:'https://www.thelancet.com/coronavirus',
				label:'The Lancet: 2019-nCoV Resource Centre',
				source:{
					url:'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)30183-5/fulltext?utm_source=share&utm_medium=ios_app&utm_name=iossmf',
					label:'Clinical features of patients infected with 2019 novel coronavirus in Wuhan, China',
				}
			},
		},

		{
			key:'ncovinfo',
			type:'csv',
			url: M.config.cvdata+'/archive/ncovinfo.org-daily.csv',
			source:{
				url:'//ncovinfo.org',
				label:'ncovinfo.org',
				source:{
					url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxiQZEKXlGbmeUf9E532-Arw3Hn6EwrscJg7RuM1MwDPQZzTks97ILThDnLjwiQDt_ndcO6PZkMvuQ/pubhtml?gid=699204758&widget=true&headers=false',
					label:'Google Sheet',
				}
			},
		},

	],

	hot: [

		{
			key:'summary',
			type:'tsv',
			url: M.config.cvdata+'/data/summary.tsv'
		},

		{
			key:'bnoregion',
			type:'tsv',
			url: M.config.cvdata+'/daily/bnonews-daily_region.tsv',
			source:{
				url:'https://bnonews.com/index.php/2020/02/the-latest-coronavirus-cases/',
				label:'BNO News',
			}
		},

		{
			key:'bnoplace',
			type:'tsv',
			url: M.config.cvdata+'/daily/bnonews-daily_place.tsv',
			source:{
				url:'https://bnonews.com/index.php/2020/02/the-latest-coronavirus-cases/',
				label:'BNO News',
			}
		},


		{
			key:'casetracking',
			type:'tsv',
			url: M.config.cvdata+'/daily/casetracking-daily.tsv',
			source:{
				url:'https://bnonews.com/index.php/2020/02/the-latest-coronavirus-cases/',
				label:'BNO News',
			}
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

};

