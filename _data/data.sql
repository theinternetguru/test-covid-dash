

create or replace table cases_jhu (
	ID int,
	Province_State varchar(100),
	Country_Region varchar(100),
	Last_Update  varchar(100),
	latitute float,
	longitude float,
	Confirmed double,
	Suspected double,
	Recovered double,
	Deaths double,
	ConfnSusp double,
	Collected double
);




LOAD DATA LOCAL INFILE 'gisanddata.maps.arcgis.com_2020_1_25.csv'
INTO TABLE cases_jhu
	FIELDS TERMINATED BY ','
	OPTIONALLY ENCLOSED BY '"'
	ESCAPED BY '\\'
	LINES TERMINATED BY '\r\n'
	STARTING BY ''
	IGNORE 1 LINES
;


create or replace view v_cases_jhu as
select
	ID,
	Province_State,
	Country_Region,
	Last_Update,
	latitute,
	longitude,
	format(Confirmed,3) Confirmed,
	format(Suspected,3) Suspected,
	format(Recovered,3) Recovered,
	format(Deaths,3) Deaths
from
	cases_jhu;


