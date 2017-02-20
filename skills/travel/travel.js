//=========================================================
// Setup travel skills
//=========================================================
const Skills = require('restify-router').Router;  
      skill  = new Skills();

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
                // Construct the returning message
                var returnJSON = {
                    code : 'error',
                    data : 'Bus route not supported.'
                }
                // Send response back to caller
                res.send(returnJSON);
                validbusroute = false;
        };

        if (validbusroute) {
            alfredHelper.requestAPIdata(url)
            .then(function(apiData){

                // Get the bus data
                apiData = apiData.body;
                if (alfredHelper.isEmptyObject(apiData)) {
                    console.log('nextbus - Failure, no data was returned from the TFL API call');
                    // Construct the returning message
                    const jsonDataObj = {
                        code : 'error',
                        data : 'No data was returned from the call to the TFL API.'
                    };

                    // Send response back to caller
                    res.send(jsonDataObj);
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

                    // Construct the returning message
                    const jsonDataObj = {
                        code : 'sucess',
                        data : textResponse
                    };

                    // Send response back to caller
                    res.send(jsonDataObj);
                };
            })
            .catch(function (err) {
                // Construct the returning message
                var returnJSON = {
                    code : 'error',
                    data : err.message
                }
                // Send response back to caller
                console.log('nextbus: ' + err);
                res.send(returnJSON);
            });
        };
    } else {
        // Construct the returning message
        const jsonDataObj = {
            code : 'error',
            data : 'No bus route was supplied.'
        };

        // Send response back to caller
        res.send(jsonDataObj);
    };
    next();
};

//=========================================================
// Skill: busstatus
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
                console.log('busstatus - Failure, no data was returned from the TFL API call');
                // Construct the returning message
                const jsonDataObj = {
                    code : 'error',
                    data : 'No data was returned from the call to the TFL API.'
                };

                // Send response back to caller
                res.send(jsonDataObj);
            } else { 

                if (alfredHelper.isEmptyObject(apiData[0].disruptions)) {
                    var textResponse = 'There are no disruptions currently reported for the number ' + busroute + ' bus.';
                } else {
                    var textResponse = '';
                    for (index = 0, len = apiData[0].disruptions.length; index < len; ++index) {
                        textResponse = textResponse + apiData[0].disruptions[index];
                    }
                }

                // Construct the returning message
                const jsonDataObj = {
                    code : 'sucess',
                    data : textResponse
                };

                // Send response back to caller
                res.send(jsonDataObj);
            };
        })
        .catch(function (err) {
            // Construct the returning message
            var returnJSON = {
                code : 'error',
                data : err.message
            }
            // Send response back to caller
            console.log('busstatus: ' + err);
            res.send(returnJSON);
        });
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

    trainroute = trainroute.toUpperCase();
    if (typeof trainroute !== 'undefined' && trainroute !== null) {
        switch (trainroute) {
            case 'CST':
                var url = url + trainroute;
                break;
            case 'CHX':
                var url = url + trainroute;
                break;
            default:
                // Construct the returning message
                var returnJSON = {
                    code : 'error',
                    data : 'Train route not supported.'
                }
                // Send response back to caller
                res.send(returnJSON);
                validtrainroute = false;
        };

        if (validtrainroute) {
            alfredHelper.requestAPIdata(url)
            .then(function(apiData){

                // Get the bus data
                apiData = apiData.body;
                if (alfredHelper.isEmptyObject(apiData)) {
                    console.log('nexttrain - Failure, no data was returned from the train API call');
                    // Construct the returning message
                    const jsonDataObj = {
                        code : 'error',
                        data : 'No data was returned from the call to the train API.'
                    };

                    // Send response back to caller
                    res.send(jsonDataObj);
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
                    // Construct the returning message
                    const jsonDataObj = {
                        code : 'sucess',
                        data : textResponse
                    };

                    // Send response back to caller
                    res.send(jsonDataObj);
                };
            })
            .catch(function (err) {
                // Construct the returning message
                var returnJSON = {
                    code : 'error',
                    data : err.message
                }
                // Send response back to caller
                console.log('nexttrain: ' + err);
                res.send(returnJSON);
            });
        };
    } else {
        // Construct the returning message
        const jsonDataObj = {
            code : 'error',
            data : 'No train route was supplied.'
        };

        // Send response back to caller
        res.send(jsonDataObj);
    };
    next();
};


//=========================================================
// Add skills to server
//=========================================================
skill.get('/nextbus', nextbus)
skill.get('/busstatus', busstatus)
skill.get('/nexttrain', nexttrain)

module.exports = skill;