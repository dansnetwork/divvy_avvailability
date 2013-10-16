(function() {
			
	var http = require('http'),

		callback = function() {},

		stationIds = [88, 80, 91, 77, 75, 192],

		checkMyStations = function(data) {
			console.log( '\n' + getMyStations(data.stationBeanList, stationIds) + '\n');
		},

		_getJSON = function(response, processData) {
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

					processData(body);
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
				idLength = 0,
				k = 0,
				stationsLength = stations.length,
				results = [],
				station;

			for(idsLength = ids.length; i < idsLength; i++){
				for(k = 0; k < stationsLength; k++){
					station = stations[k];
					station.id === ids[i] && results.push(formatStation(station));
				}
			}

			return results.join('\n');
		},

		search = function(term, data) {
			var results = [],
				noSpaces = function(str) {
					return str.split(' ').join('');
				};

			term = RegExp(noSpaces(term), 'i');

			data.forEach(function(v) {
				term.test(v.stationName) && results.push(v);
			});

			return results;
		}

	// if an argument was passed, perform a station search using the argument as the search term
	if(process.argv[2]){
		callback = function(data){
			search(process.argv[2], data.stationBeanList).forEach(function(v) {
				console.log(v.id + ': ' + formatStation(v));
			});
		}
	} else {
		if(stationIds && stationIds.length){
			callback = checkMyStations;
		} else {
			console.error("You must include your station's IDs");
			return false;
		}
	}

	http.get('http://divvybikes.com/stations/json', function(response) {
		_getJSON(response, callback);
	}).on('error', errCallback);

})();
