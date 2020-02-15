
//console.log('document.location.host', document.location.host);

//-----------------
// data
//-----------------

M.config = {

	theme:{

		colors:[
			['purple','crimson','green','#5C3292'],
			['darkcyan','#249196','darkcyan','darkcyan'],

			['orange','#D3362D','teal','slategray'],
			['teal','#D3362D','orange','slategray'],

			['steelblue','#D3362D','darkcyan','slategray'],
			['darkcyan','orangered','steelblue','darkcyan'],

			['darkcyan','cyan','darkcyan','darkcyan'],
			['maroon','crimson','maroon','maroon'],
			['steelblue','crimson','steelblue','steelblue'],
			['purple','magenta','purple','purple'],
			['#5C3292','#D3362D','#4374E0','#43459D',],
			['#666','#f00','#999','#ccc'],
			['#666','#1C91C0','#999','#333'],
			['#666','#E7711B','#999','#333'],
			['teal','orangered','darkseagreen','slategray'],
			['slategray','orangered','#703593','slategray'],
			['slategray','crimson','purple','slategray'],

		],

		hud:[
			['#17323B','#249196','#33E9E0'],
			['#999','#ccc','#ddd'],
		],

	},

	path:{

		refdata	: document.location.host.match(/github|analitik/i)
									? 'https://raw.githubusercontent.com/nyem69/coronavirus_dashboard/master/_data'
									: (typeof _v=='number'?'../':'')+'_data',

		cvdata: document.location.host.match(/diablo/i)
							? '//cron.diablo.aga.my/coronavirus_data'
							: 'https://raw.githubusercontent.com/nyem69/coronavirus_data/master',

		jhudata: document.location.host.match(/diablo/i)
							? '//github.diablo.aga.my/COVID-19'
							: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master',

		ckdata: document.location.host.match(/diablo/i)
							? '//github.diablo.aga.my/ncov-data'
							: 'https://raw.githubusercontent.com/CryptoKass/ncov-data/master',

	}
};


//console.log('M.config.path',M.config.path);


//-----------------------------
//  user timezone
//-----------------------------

try {
  M.config.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  //console.log('timezone',M.config.tz);
}catch(error) {
  console.error(error);
}


//-----------------
// M.themeColors
//-----------------

if (!M.current.theme) M.current.theme = 2;
//if (!M.current.theme) M.current.theme = d3.shuffle(M.config.theme.colors)[0];
if (!M.config.theme.colors[+M.current.theme]) M.current.theme = 0;
M.theme={
	colors: M.config.theme.colors[+M.current.theme],
};

M.theme.hud = M.config.theme.hud[0];




//------------------------------------------------------------------
// M.config.data
//------------------------------------------------------------------

M.config.data = {

	ref:[

		{
			key:'countries',
			type:'tsv',
			url: M.config.path.refdata+'/dd_countries2.txt',
		},

		{
			key:'airports',
			type:'csv',
			url: M.config.path.refdata+'/airports.txt',
			source:{
				url:'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat',
			},
		},

	],

	cold: [

		{
			key:'first41',
			type:'tsv',
			url: M.config.path.cvdata+'/archive/lancet-first41.tsv',
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
			url: M.config.path.cvdata+'/archive/ncovinfo.org-daily.csv',
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
			url: M.config.path.cvdata+'/data/summary.tsv'
		},


		{
			key:'jhu',
			type:'csv',
			urls:[
				M.config.path.jhudata+'/archived_data/time_series/time_series_2019-ncov-Confirmed.csv',
				M.config.path.jhudata+'/archived_data/time_series/time_series_2019-ncov-Deaths.csv',
				M.config.path.jhudata+'/archived_data/time_series/time_series_2019-ncov-Recovered.csv',
			],
			source:{
				url:'https://github.com/CSSEGISandData/COVID-19',
				label:'Johns Hopkins University',
			}
		},


		{
			key:'bnoregion',
			type:'tsv',
			url: M.config.path.cvdata+'/daily/bnonews-daily_region.tsv',
			source:{
				url:'https://bnonews.com/index.php/2020/02/the-latest-coronavirus-cases/',
				label:'BNO News',
			}
		},

		{
			key:'bnoplace',
			type:'tsv',
			url: M.config.path.cvdata+'/daily/bnonews-daily_place.tsv',
			source:{
				url:'https://bnonews.com/index.php/2020/02/the-latest-coronavirus-cases/',
				label:'BNO News',
			}
		},


		{
			key:'casetracking',
			type:'text',
			url: M.config.path.cvdata+'/daily/casetracking-daily.tsv',
			source:{
				url:'https://bnonews.com/index.php/2020/02/the-latest-coronavirus-cases/',
				label:'BNO News',
			}
		},

		{
			key:'cryptokass',
			type:'csv',
			urls:[
				M.config.path.ckdata+'/china.patients.dxy.csv',
			],
			source:{
				url:'https://github.com/CryptoKass/ncov-data',
				label:'CryptoKass',
			},
		},

		{
			key:'martine',
			type:'tsv',
			urls:[
				M.config.path.cvdata+'/data/martine_places.tsv',
				M.config.path.cvdata+'/data/martine_timeseries.tsv',
			],
			source:{
				url:'https://martinedoesgis.github.io/novel-coronavirus/map.html',
				label:'Martine Does GIS',
				source:{
					url:'https://docs.google.com/spreadsheets/d/18X1VM1671d99V_yd-cnUI1j8oSG2ZgfU_q1HfOizErA/edit#gid=0',
					label:'Worksheet',
				}
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


//console.log('M.config.data',M.config.data);


/*


https://www.reddit.com/r/datasets/comments/exnzrd/coronavirus_datasets/

https://www.nejm.org/doi/full/10.1056/NEJMoa2001316

https://github.com/CSSEGISandData/COVID-19/tree/master/archived_data/time_series



*/