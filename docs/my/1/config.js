
M.config = {


	theme:{

		colors:[

			[
				d3.schemeCategory10[1],
				d3.schemeCategory10[3],
				d3.schemeCategory10[4],
				d3.schemeCategory10[0],
			],

		],

		hud:[
			['#17323B','#249196','#33E9E0'],
		],

	},

	path:{
		cvdata: document.location.host.match(/diablo/i)
							? '//cron.diablo.aga.my/coronavirus_data'
							: 'https://raw.githubusercontent.com/nyem69/coronavirus_data/master',

	}
};


M.config.data = {

	hot: [

		{
			key:'malaysia',
			type:'tsv',
			urls:[
				M.config.path.cvdata+'/data/malaysia.tsv'
			],
			source:{
				label:'MOH Malaysia',
				url:'http://www.moh.gov.my/index.php/pages/view/2274',
			}
		},

	],


};




if (!M.current.theme) M.current.theme = 0;
if (!M.config.theme.colors[+M.current.theme]) M.current.theme = 0;
M.theme={colors: M.config.theme.colors[+M.current.theme]};
M.theme.hud = M.config.theme.hud[0];

