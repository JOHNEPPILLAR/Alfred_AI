//=========================================================
// Setup travel skills
//=========================================================
const Skills       = require('restify-router').Router;  
      skill        = new Skills(),
      alfredHelper = require('../../helper.js');

//=========================================================
// Skill: next bus
// Params: bus_route: String
//=========================================================
function nextbus (req, res, next) {

    var tflapiKey     = process.env.tflapikey,
        busroute      = req.query.bus_route,
        validbusroute = true;

    if (typeof busroute !== 'undefined' && busroute !== null) {
        switch (busroute) {
            case '380':
                var url = 'https://api.tfl.gov.uk/StopPoint/490013012S/Arrivals?mode=bus&line=380&' + tflapiKey;
                break;
            default:

                // Send response back to caller
                alfredHelper.sendResponse(res, 'error', 'Bus route not supported.');
                console.log('nextbus: Bus route not supported.');

                validbusroute = false;
        };

        if (validbusroute) {
            alfredHelper.requestAPIdata(url)
            .then(function(apiData){

                // Get the bus data
                apiData = apiData.body;
                if (alfredHelper.isEmptyObject(apiData)) {

                    // Send response back to caller
                    alfredHelper.sendResponse(res, 'error', 'No data was returned from the call to the TFL API.');
                    console.log('nextbus: No data was returned from the TFL API call');

                } else { 
                    const numberOfElements = apiData.length;
                    if (numberOfElements > 2) { numberOfElements = 2 };
                    var busData = apiData.sort(alfredHelper.GetSortOrder("timeToStation"));

                    switch (numberOfElements) {
                    case 2:
                        var textResponse = 'The next ' + busData[0].lineName + ' to ' + busData[0].towards + ' will arrive ' + alfredHelper.minutesToStop(busData[0].timeToStation) + 
                            '. The second bus to arrive will be ' + alfredHelper.minutesToStop(busData[1].timeToStation) + '.';
                            break;
                        default:
                            var textResponse = 'The next ' + busData[0].lineName + ' to ' + busData[0].towards + ' will arrive ' + alfredHelper.minutesToStop(busData[0].timeToStation);
                    };

                    // Send response back to caller
                    alfredHelper.sendResponse(res, 'sucess', textResponse);
                };
            })
            .catch(function (err) {

                // Send response back to caller
                alfredHelper.sendResponse(res, 'error', err.message);
                console.log('nextbus: ' + err);
            });
        };
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'No bus route was supplied.');
        console.log('nextbus: No bus route was supplied.');
    };
    next();
};

//=========================================================
// Skill: bus status
// Params: bus_route: String
//=========================================================
function busstatus (req, res, next) {

    var busroute = req.query.bus_route;

    if (typeof busroute !== 'undefined' && busroute !== null) {
        
        const tflapiKey = process.env.tflapikey,
              url = 'https://api.tfl.gov.uk/Line/' + busroute;
        
        alfredHelper.requestAPIdata(url)
        .then(function(apiData){

            // Get the bus data
            apiData = apiData.body;
            if (alfredHelper.isEmptyObject(apiData)) {

                // Send response back to caller
                alfredHelper.sendResponse(res, 'error', 'No data was returned from the TFL API call.');
                console.log('busstatus - Failure, no data was returned from the TFL API call');
            } else { 

                if (alfredHelper.isEmptyObject(apiData[0].disruptions)) {
                    var textResponse = 'There are no disruptions currently reported for the number ' + busroute + ' bus.';
                } else {
                    var textResponse = '';
                    for (index = 0, len = apiData[0].disruptions.length; index < len; ++index) {
                        textResponse = textResponse + apiData[0].disruptions[index];
                    }
                }

                // Send response back to caller
                alfredHelper.sendResponse(res, 'sucess', textResponse);
            };
        })
        .catch(function (err) {
            // Send response back to caller
            alfredHelper.sendResponse(res, 'error', err.message);
            console.log('busstatus: ' + err);
        });
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'Param bus_route was not supplied.');
        console.log('Busstatus: Param bus_route was not supplied.');
    };
    next();
};

//=========================================================
// Skill: next train
// Params: train destination: String
//=========================================================
function nexttrain (req, res, next) {

    var transportapiKey = process.env.transportapiKey,
        trainroute      = req.query.train_destination,
        validtrainroute = true,
        url             = 'https://transportapi.com/v3/uk/train/station/CTN/live.json?' + transportapiKey + '&darwin=false&train_status=passenger&destination=';

    if (typeof trainroute !== 'undefined' && trainroute !== null) {
        trainroute = trainroute.toUpperCase();
        switch (trainroute) {
            case 'CST':
                var url = url + trainroute;
                break;
            case 'CHX':
                var url = url + trainroute;
                break;
            default:
                // Send response back to caller
                alfredHelper.sendResponse(res, 'error', 'Train route not supported.');
                console.log('Nexttrain: Train destination not supported.');

                validtrainroute = false;
        };

        if (validtrainroute) {
            alfredHelper.requestAPIdata(url)
            .then(function(apiData){

                // Get the bus data
                apiData = apiData.body;
                if (alfredHelper.isEmptyObject(apiData)) {
        
                    alfredHelper.sendResponse(res, 'error', 'No data was returned from the train API call.');
                    console.log('nexttrain: No data was returned from the train API call.');
                } else { 
                    if (apiData.departures.all[0].mode == 'bus') {
                        var textResponse = 'Sorry, there are no trains today! There is a bus replacement serverice in operation.'
                    } else {
                        var trainData = apiData.departures.all,
                            numberOfElements = trainData.length;
                        if (numberOfElements > 2) { numberOfElements = 2 };
                        trainData = trainData.filter(function (a) {
                            return a.platform === '1';
                        });
                        trainData = trainData.sort(alfredHelper.GetSortOrder("best_arrival_estimate_mins"));
                        switch (numberOfElements) {
                            case 2:
                                var textResponse = 'The first train from ' + apiData.station_name + ' is to ' + trainData[0].destination_name + ' and will arrive ' + alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60) + '. It is currently ' + trainData[0].status.toLowerCase() + '.' + ' The second train is to ' + trainData[1].destination_name + ' and will arrive ' + alfredHelper.minutesToStop(trainData[1].best_arrival_estimate_mins * 60) + '.';
                                break;
                            default:
                                var textResponse = 'The next train from ' + trainrouteData.station_name + ' is to ' + trainData[0].destination_name + ' and will arrive ' + alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60) + '. It is currently ' + trainData[0].status.toLowerCase() + '.';
                         };
                    };
                    // Send response back to caller
                    alfredHelper.sendResponse(res, 'sucess', textResponse);
                };
            })
            .catch(function (err) {
                // Send response back to caller
                alfredHelper.sendResponse(res, 'error', err.message);
                console.log('nexttrain: ' + err);
            });
        };
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'No train route was supplied.');
        console.log('nexttrain: No train route was supplied.');
    };
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/nextbus', nextbus);
skill.get('/busstatus', busstatus);
skill.get('/nexttrain', nexttrain);

module.exports = skill;