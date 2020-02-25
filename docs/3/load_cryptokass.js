
// https://raw.githubusercontent.com/CryptoKass/ncov-data/master/china.patients.dxy.csv


//------------------------------------------------------------------
//
//------------------------------------------------------------------
function loadCK(grp,key,cb)	{

	var f = '['+(fc++)+'] '+arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
	dbg=0, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	var reqs = M.config.data[grp].find(d=>d.key==key).urls.map(d=>d3.text(d));


	Promise.all(reqs).then(loaded);


	//-----------------------------
	//
	//-----------------------------
	function loaded(str)	{

		dbg&&console.log('key', key);
		dbg&&console.log('str', typeof str, str);

		str[0] = str[0].replace(/\\/g,'');

		var raw=[];
		str[0].split(/\n/)
			.filter(d=>d.match(/\w+/))
			.forEach(d=>{
				raw.push( d3.csvParse(d) );
			});


		//dbg&&console.log('raw', raw);

		var hdr = [];
		var hash={};

		var rows=[];

		raw
			.filter((d,i)=>i>0) // remove meta in header
			.forEach((d,i)=>{
				if (i==0)	{
					d.columns.forEach((k,r)=>{
						if (k=='')	{
							hdr.push('col-'+r);
						}else {
							if (!hash[k]) {
								hash[k]=0;
								hdr.push('col-'+k);
							}else	{
								hdr.push('col-'+k+'-'+hash[k]);
							}
							hash[k]++;
						}
					});
				}else	{
					var j = {};
					d.columns.forEach((k,r)=>{
						j[hdr[r]] = k;
					});

					rows.push(j);

				}
			});

		dbg&&console.log('hdr', hdr);
		dbg&&console.log('rows', rows);

		/*
			{
			  "col-1": "14",
			  "col-1-1": "14",
			  "col-2.0": "14.0",
			  "col-id": "12",
			  "col-case_in_country": "",
			  "col-reporting date": "1/21/2020",
			  "col-6": "",
			  "col-summary": "new confirmed imported nCov pneumonia patient in Beijing: female, 32, visited Wuhan on 01/13/2020, return to Beijing on 01/17/2020, symptoms onset while in Wuhan, hospitalized on 01/20/2020.",
			  "col-location": "Beijing",
			  "col-country": "China",
			  "col-gender": "female",
			  "col-age": "32",
			  "col-symptom_onset": "01/15/2020",
			  "col-If_onset_approximated": "0",
			  "col-hosp_visit_date": "1/20/2020",
			  "col-type_of_visit": "hospital",
			  "col-exposure_start": "1/13/2020",
			  "col-exposure_end": "1/17/2020",
			  "col-visiting Wuhan": "1",
			  "col-from Wuhan": "0",
			  "col-death": "0",
			  "col-recovered": "0",
			  "col-symptom": "",
			  "col-source": "Beijing Municipal Health Commission",
			  "col-link": "http://wjw.beijing.gov.cn/xwzx_20031/wnxw/202001/t20200121_1620353.html",
			  "col-25": "",
			  "col-26": "",
			  "col-27": ""
			}




		dbg&&console.log(
			hdr.map(k=>k+':\n'+d3.nest()
				.key(d=>d[k])
				.rollup(d=>d.length)
				.entries(rows)
				.sort(d3.comparator().order(d3.descending,d=>d.value))
				.slice(0,10)
				.map(d=>d.key+' ('+d.value+')')
				.join('\n')
			).join('\n\n')
		);


col-1:
2 (1)
3 (1)
4 (1)
5 (1)
6 (1)
7 (1)
8 (1)
9 (1)
10 (1)
11 (1)

col-1-1:
2 (1)
3 (1)
4 (1)
5 (1)
6 (1)
7 (1)
8 (1)
9 (1)
10 (1)
11 (1)

col-2.0:
 (1)
3.0 (1)
4.0 (1)
5.0 (1)
6.0 (1)
7.0 (1)
8.0 (1)
9.0 (1)
10.0 (1)
11.0 (1)

col-id:
 (22)
198 (2)
199 (2)
200 (2)
359 (2)
1 (1)
2 (1)
3 (1)
4 (1)
5 (1)

col-case_in_country:
 (198)
1 (25)
2 (19)
3 (18)
4 (15)
5 (14)
6 (14)
7 (14)
8 (14)
9 (13)

col-reporting date:
1/22/2020 (61)
1/25/2020 (52)
1/24/2020 (41)
1/27/2020 (28)
1/31/2020 (28)
2/8/2020 (26)
1/23/2020 (24)
1/26/2020 (24)
1/30/2020 (23)
2/4/2020 (23)

col-6:
 (525)
undefined (1)

col-summary:
 (5)
new confirmed nCov patient in Thailand: Chinese national, part of a family aged 6-60, traveling from Hubei province, one passenger taken to hospital after showing symptoms on arrival and other four members quarantined after showing symptoms following monitoring (5)
new confirmed nCov patient in Thailand: Chinese national (5)
new confirmed nCov patient in France: in contact with Briton who had been in Singapore and was positive (4)
new confirmed nCov patient in Thailand: Chinese, related to someone who was previously confirmed (3)
new confirmed nCov patient in Vietnam: same flight from Wuhan to Vietnam as three patients detected on 1/30 (3)
new confirmed imported nCov pneumonia patient in Yunnan: female, 68, Wuhan resident, left Wuhan on 01/20/2020, arrived in Ruili, Yunnan on 01/23/2020, hospitalized on 01/24/2020 (2)
new confirmed nCov patient in Singapore: female, 47, Singaporean, evacuated from Wuhan on 1/30/2020, found to have a fever on arrival at Changi airport, tested positive 1/31/2020, now in isolation (2)
new confirmed nCov patient in Singapore: Singaporeans, evacuated from Wuhan 1/30/2020, no symptoms on boarding, tested positive 2/3/2020 despite having no symptoms (2)
new confirmed nCov patient in Taiwan: female, 70, Wuhan resident, arrived in Taiwan 1/22/2020, symptom onset 1/25/2020 (fever), hospitalized 1/25/2020, confirmed 1/28/2020 (2)

col-location:
Singapore (47)
Hong Kong (36)
Thailand (33)
Wuhan, Hubei (32)
Shaanxi (31)
South Korea (27)
Tianjin (22)
Yunnan (19)
Beijing (18)
Taiwan (18)

col-country:
China (197)
Hong Kong (50)
Singapore (47)
Thailand (33)
South Korea (28)
Japan (25)
Malaysia (18)
Taiwan (18)
Germany (16)
Vietnam (15)

col-gender:
male (269)
female (191)
 (64)
emale (1)
undefined (1)

col-age:
 (89)
55 (25)
45 (18)
37 (16)
56 (14)
25 (14)
28 (12)
35 (12)
42 (11)
66 (10)

col-symptom_onset:
 (200)
1/23/2020 (26)
1/24/2020 (21)
1/25/2020 (21)
1/21/2020 (17)
1/30/2020 (17)
1/19/2020 (16)
1/14/2020 (14)
1/20/2020 (14)
1/26/2020 (13)

col-If_onset_approximated:
0 (299)
 (201)
1 (25)
undefined (1)

col-hosp_visit_date:
 (227)
1/23/2020 (32)
1/24/2020 (30)
1/20/2020 (19)
1/21/2020 (19)
1/25/2020 (18)
1/22/2020 (16)
1/19/2020 (15)
1/30/2020 (13)
2/3/2020 (12)

col-type_of_visit:
hospital (219)
 (218)
clinic (88)
undefined (1)

col-exposure_start:
 (429)
1/24/2020 (11)
1/26/2020 (11)
1/20/2020 (8)
1/12/2020 (6)
1/23/2020 (6)
1/10/2020 (5)
1/19/2020 (5)
1/22/2020 (5)
1/13/2020 (4)

col-exposure_end:
 (235)
1/22/2020 (33)
1/23/2020 (27)
1/20/2020 (25)
1/21/2020 (25)
1/19/2020 (19)
1/18/2020 (16)
1/17/2020 (15)
1/28/2020 (14)
1/15/2020 (12)

col-visiting Wuhan:
0 (337)
1 (186)
 (2)
undefined (1)

col-from Wuhan:
0 (367)
1 (152)
 (6)
undefined (1)

col-death:
0 (482)
1 (41)
 (2)
undefined (1)

col-recovered:
0 (501)
1 (22)
 (2)
undefined (1)

col-symptom:
 (428)
fever (32)
fever, cough (14)
cough (8)
fever, cough, sore throat (3)
feaver, cough, difficult in breathing (2)
fever, runny nose (2)
fever, sore throat (2)
cough, chills, joint pain (1)
throat pain, fever (1)

col-source:
央视新闻 (133)
Channel News Asia (49)
Government HK (27)
人民日报 (23)
Straits Times (21)
Ministry of Health Singapore (21)
KCDC (20)
Reuters (19)
National Health Commission (17)
Health Commission of Shanxi (12)

col-link:
http://www.nhc.gov.cn/yjb/s3578/202001/5d19a4f6d3154b9fae328918ed2e3c8a.shtml (17)
https://m.weibo.cn/status/4464497211305006? (15)
https://m.weibo.cn/status/4464630291922122? (12)
http://sxwjw.shaanxi.gov.cn/art/2020/1/27/art_9_67483.html (12)
https://www.info.gov.hk/gia/general/202002/11/P2020021100773.htm (12)
https://www.shine.cn/news/nation/2001290843/ (8)
https://m.weibo.cn/status/4464187650423052? (7)
https://m.weibo.cn/status/4464954491480577? (7)
https://www.moh.gov.sg/news-highlights/details/seven-more-confirmed-cases-of-novel-coronavirus-infection-in-singapore (7)
https://vietnamnews.vn/society/591803/viet-nam-confirms-9th-coronavirus-case-hong-kong-reports-first-death-from-infection.html (7)

col-25:
 (525)
undefined (1)

col-26:
 (525)
undefined (1)

col-27:
 (525)
undefined (1)


		*/



		M.data[key]=[];

		rows.forEach(d=>{

			var j={};

			j.row = +d['col-1']
			j.row2 = +d['col-1-1'];
			j.id = +d['col-id'];

			if (j.id||j.row||j.row2)	{

				var dt = moment(d['col-reporting date'],'M/D/YYYY');
				if (dt && dt.isValid)	{
					j.date = +dt;
					j.date_str = dt.format('YYYY-MM-DD');
				}

				var so = moment(d['col-symptom_onset'],'M/D/YYYY');
				if (so.isValid) j.symptom_onset = so.format('YYYY-MM-DD');

				var hp = moment(d['col-hosp_visit_date'],'M/D/YYYY');
				if (hp.isValid) j.hosp_visit = hp.format('YYYY-MM-DD');

				var es = moment(d['col-exposure_start'],'M/D/YYYY');
				if (es.isValid) j.exposure_start = es.format('YYYY-MM-DD');

				var ee = moment(d['col-exposure_end'],'M/D/YYYY');
				if (ee.isValid) j.exposure_end = ee.format('YYYY-MM-DD');

				if (so.isValid)	{

					if (ee.isValid)	{
						j.exposure_end_days = Math.abs(so.diff(ee,'days'));
					}

					if (es.isValid)	{
						j.exposure_start_days = Math.abs(so.diff(es,'days'));

						if (ee.isValid)	{
							j.exposure_days = Math.abs(ee.diff(es,'days'));
						}
					}

					j.onset_days = j.exposure_start_days || j.exposure_end_days || null;

				}

				/*
					aching muscles,
					chest pain, chills,
					cough, coughing, diarrhea,
					difficult in breathing,
					feaver, feve\, fever,
					flu, flu symptoms,
					headache, high fever,
					joint pain,
					malaise,
					mild fever,
					muscle aches,
					muscle cramps,
					muscle pain,
					myalgia, myalgias,
					runny nose,
					shortness of breath,
					sore body,

					throat pain,sore throat,
				*/

				j.symptoms 		= d['col-symptom'].split(',').map(d=>d.replace(/^\s+|\s$/g,'')).filter(d=>d!='')
												.map(d=>{
													d = d.replace(/\W+/g,' ');
													d = d.replace(/\bfeve\b/,'fever');
													d = d.replace(/feaver/,'fever');
													d = d.replace(/myalgias/,'myalgia');
													if (d=='feve') d='fever';

													if (d.match(/flu/)) d='flu';
													if (d.match(/cough/)) d='coughs';
													if (d.match(/throat/)) d='throat pain/sore';
													if (d.match(/fever/)) d='fever';
													if (d.match(/muscle/)) d='muscle pain/cramps';
													if (d.match(/breath/)) d='difficulty breathing';
													return d;
												});

				j.age 				= d['col-age'];
				j.gender			= d['col-gender'];
				if (j.gender=='emale') j.gender='female';
//				if (j.gender=='') j.gender='?';

				j.visit_wuhan = +d['col-visiting Wuhan'];
				j.from_wuhan 	= +d['col-from Wuhan'];

				j.death 			= +d['col-death'];
				j.recovered 	= +d['col-recovered'];

				j.status 			= j.death==1 ? 'death' : j.recovered==1 ? 'recovered' : 'active';

				j.country		 	= d['col-country'];
				j.region		 	= d['col-location'];




				M.data[key].push(j);

			}

		});


		dbg&&console.log('M.data['+key+']',M.data[key]);

		dbg&&console.log('symptoms', M.data.cryptokass.filter(d=>d.symptoms.length) );


		loadCheck(fEnd);


	}


}

