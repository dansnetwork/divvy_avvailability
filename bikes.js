var http = require('http'),

	stationIds = [88, 80, 91, 77, 75, 192],

	callback = function(response) {
		var body,
			buffer = [];

		if (response.statusCode == 200) {
			//response.setEncoding('utf8');

			response.on('data', function(chunk) {
				buffer.push(chunk);
			});

			response.on('end', function() {

				try{
					body = JSON.parse(buffer.join(''));
				} catch(e){
					console.error(e);
				}

				console.log( '\n' + getMyStations(body.stationBeanList, stationIds) + '\n');
			});
		}
	},

	errCallback = function(resp) {
		console.log('Request failed:', resp);
	},

	formatStation = function(station) {
		var red   = '\033[31m',
			blue  = '\033[34m',
			reset = '\033[0m',
			bikesAlert = '',
			docksAlert = '';

		station.availableBikes < 3 && (bikesAlert = red);
		station.availableDocks < 3 && (docksAlert = red);

		return station.stationName + ': ' + bikesAlert +  station.availableBikes + ' bikes' + reset + ' / ' + docksAlert +  station.availableDocks + ' docks' + reset;
	},

	getMyStations = function(stations, ids) {
		var i = 0,
			k = 0,
			results = [],
			station;

		for(; i < ids.length; i++){
			for(k = 0; k < stations.length; k++){
				station = stations[k];
				station.id === ids[i] && results.push(formatStation(station));
			}
		}

		return results.join('\n');
	};

http.get('http://divvybikes.com/stations/json', callback).on('error', errCallback);
