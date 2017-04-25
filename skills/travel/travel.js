//=========================================================
/*  To Do
If trains are canceled the response from tfl is 
The first train from Charlton is to London Charing Cross and will arrive in -13 minutes. <break time='500ms'/>  It is currently off route. 

add a commute flag or raw flag so that the text can be custom
*/
//=========================================================



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

    logger.info ('Next Bus API called');

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
                logger.info('nextbus: Bus route not supported.');

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
                    logger.info('nextbus: No data was returned from the TFL API call');

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
                logger.error('nextbus: ' + err);
            });
        };
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'No bus route was supplied.');
        logger.info('nextbus: No bus route was supplied.');
    };
    next();
};

//=========================================================
// Skill: bus & tube status
// Params: route: String
// Params: raw: bool
//=========================================================
function bustubestatus (req, res, next) {

    logger.info ('Bus & Tube Status API called');

    var route = req.query.route,
        raw   = false;

    if (typeof req.query.raw !== 'undefined' && req.query.raw !== null) {
        switch (req.query.raw) {
            case 'true':
                raw = true;
                break;
            case 'false':
                raw = false;
                break;
        };
    };

    if (typeof route !== 'undefined' && route !== null) {
        const url = 'https://api.tfl.gov.uk/Line/' + route;
        
        alfredHelper.requestAPIdata(url)
        .then(function(apiData){
            // Get the bus data
            apiData = apiData.body;
            if (alfredHelper.isEmptyObject(apiData)) {
                // Send response back to caller
                alfredHelper.sendResponse(res, 'error', 'No data was returned from the TFL API call.');
                logger.info('bustubestatus - Failure, no data was returned from the TFL API call');
            } else { 
                if (alfredHelper.isEmptyObject(apiData[0].disruptions)) {
                    if (raw) {
                        var textResponse = 'false';
                    } else {
                        if (apiData[0].modeName == 'tube') {
                            var textResponse = 'There are no disruptions currently reported on the ' + apiData[0].name + ' line.';
                        } else {
                            var textResponse = 'There are no disruptions currently reported for the nuber ' + apiData[0].name + ' bus.';
                        };
                    };
                } else {
                    if (raw) {
                        var textResponse = 'true';
                    } else {
                        var textResponse = '';
                        for (index = 0, len = apiData[0].disruptions.length; index < len; ++index) {
                            textResponse = textResponse + apiData[0].disruptions[index];
                        };
                    };
                };

                // Send response back to caller
                alfredHelper.sendResponse(res, 'sucess', textResponse);
            };
        })
        .catch(function (err) {
            // Send response back to caller
            alfredHelper.sendResponse(res, 'error', err.message);
            logger.error('bustubestatus: ' + err);
        });
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'Param route was not supplied.');
        logger.info('bustubestatus: Param route was not supplied.');
    };
    next();
};

//=========================================================
// Skill: next train
// Params: train destination: String
//=========================================================
function nexttrain (req, res, next) {

    logger.info ('Next Train API called');

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
                logger.info('Nexttrain: Train destination not supported.');
                validtrainroute = false;
        };

        if (validtrainroute) {
            alfredHelper.requestAPIdata(url)
            .then(function(apiData){

                // Get the bus data
                apiData = apiData.body;
                if (alfredHelper.isEmptyObject(apiData)) {
                    alfredHelper.sendResponse(res, 'error', 'No data was returned from the train API call.');
                    logger.info('nexttrain: No data was returned from the train API call.');
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
                                var textResponse = '';
                                if (trainData[0].status.toLowerCase() == 'it is currently off route' || trainData[0].status.toLowerCase() == 'cancelled'){
                                    textResponse = 'The next train due ' + alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60) + ' to ' + trainData[0].destination_name + ' has been cancelled. '
                                } else {
                                    textResponse = textResponse + 'The first train to ' + trainData[0].destination_name + ' will arrive ' + alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60) + ' and is currently ' + trainData[0].status.toLowerCase() + '. ';
                                };
                                if (trainData[1].status.toLowerCase() == 'it is currently off route' || trainData[0].status.toLowerCase() == 'cancelled'){
                                    textResponse = textResponse + 'The second train due ' + alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60) + ' to ' + trainData[0].destination_name + ' has been cancelled. '
                                } else {
                                    textResponse = textResponse + ' The second train to ' + trainData[1].destination_name + ' will arrive ' + alfredHelper.minutesToStop(trainData[1].best_arrival_estimate_mins * 60) + ' and is currently ' + trainData[1].status.toLowerCase() + '. ';
                                };
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
                logger.error('nexttrain: ' + err);
            });
        };
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'No train route was supplied.');
        logger.error('nexttrain: No train route was supplied.');
    };
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/nextbus', nextbus);
skill.get('/bustubestatus', bustubestatus);
skill.get('/nexttrain', nexttrain);

module.exports = skill;