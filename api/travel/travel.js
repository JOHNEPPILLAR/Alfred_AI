/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('../../lib/helper.js');

const skill = new Skills();

/**
 * @api {put} /travel/tubestatus Get tube status
 * @apiName tubestatus
 * @apiGroup Travel
 *
 * @apiParam {String} line Tube line i.e. Circle line
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *      "success": "true",
 *      "data": {
 *        "mode": "tube",
 *        "line": "Northern"
 *        "disruptions": "false"
 *      }
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function tubeStatus(req, res, next) {
  serviceHelper.log('trace', 'tubeStatus', 'tubeStatus API called');

  const { TFLAPIKey } = process.env;

  let { line } = req.body;
  let disruptions = 'false';
  let returnJSON;

  if (typeof line === 'undefined' || line === null || line === '') {
    serviceHelper.log('info', 'tubeStatus', 'Missing param: line');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: line');
      next();
    }
    return false;
  }

  try {
    serviceHelper.log('trace', 'tubeStatus', 'Getting data from TFL');
    const url = `https://api.tfl.gov.uk/Line/${line}/Disruption?${TFLAPIKey}`;
    serviceHelper.log('trace', 'tubeStatus', url);
    let apiData = await serviceHelper.requestAPIdata(url);
    apiData = apiData.body;

    if (!serviceHelper.isEmptyObject(apiData)) {
      disruptions = apiData[0].description;
      line = apiData[0].name;
    }

    returnJSON = {
      mode: 'tube',
      line,
      disruptions,
    };

    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, true, returnJSON);
      next();
    }
    return returnJSON;
  } catch (err) {
    serviceHelper.log('error', 'tubeStatus', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, false, err);
      next();
    }
    return err;
  }
}
skill.put('/tubestatus', tubeStatus);

/**
 * @api {put} /travel/nextTube Get tube info for journey
 * @apiName nextTube
 * @apiGroup Travel
 *
 * @apiParam {String} line Tube line i.e. Circle line
 * @apiParam {String} startID Tube line station i.e. London Bridge
 * @apiParam {String} endID Tube line station i.e. London Bridge
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *      "success": "true",
 *      "data": {
 *         "mode": "tube",
 *         "line": "Northern",
 *         "disruptions": "false",
 *         "duration": "8",
 *         "departureStation": "London Bridge",
 *         "arrivalStation": "Angel"
 *      }
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function nextTube(req, res, next) {
  serviceHelper.log('trace', 'nextTube', 'nextTube API called');

  const { TFLAPIKey } = process.env;
  const { startID, endID } = req.body;

  let { line } = req.body;
  let duration = 0;
  let disruptions = 'false';
  let departureStation;
  let arrivalStation;
  let returnJSON;

  if (typeof line === 'undefined' || line === null || line === '') {
    serviceHelper.log('info', 'tubeStatus', 'Missing param: line');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: line');
      next();
    }
    return false;
  }

  if (typeof startID === 'undefined' || startID === null || startID === '') {
    serviceHelper.log('info', 'tubeStatus', 'Missing param: startID');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: startID');
      next();
    }
    return false;
  }

  if (typeof endID === 'undefined' || endID === null || endID === '') {
    serviceHelper.log('info', 'tubeStatus', 'Missing param: endID');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: endID');
      next();
    }
    return false;
  }

  try {
    serviceHelper.log('trace', 'tubeStatus', 'Getting data from TFL');
    let url = `https://api.tfl.gov.uk/Line/${line}/Timetable/${startID}/to/${endID}?${TFLAPIKey}`;
    serviceHelper.log('trace', 'tubeStatus', url);
    let apiData = await serviceHelper.requestAPIdata(url);
    apiData = apiData.body;

    if (!serviceHelper.isEmptyObject(apiData)) {
      line = apiData.lineName;
      let tempRoute = apiData.timetable.routes[0].stationIntervals[0].intervals;
      tempRoute = tempRoute.filter(a => a.stopId === endID);
      let { timeToArrival } = tempRoute[0];
      if (typeof timeToArrival === 'undefined') timeToArrival = 0;
      duration = `${timeToArrival}`;

      serviceHelper.log('trace', 'tubeStatus', 'Get departure station');
      tempRoute = apiData.stops;
      tempRoute = tempRoute.filter(a => a.stationId === startID);
      departureStation = tempRoute[0].name.replace(' Underground Station', '');

      serviceHelper.log('trace', 'tubeStatus', 'Get arrival station');
      tempRoute = apiData.stations;
      tempRoute = tempRoute.filter(a => a.stationId === endID);
      arrivalStation = tempRoute[0].name.replace(' Underground Station', '');
    }

    serviceHelper.log('trace', 'tubeStatus', 'Get distruptions');
    url = `https://api.tfl.gov.uk/Line/${line}/Disruption?${TFLAPIKey}`;
    serviceHelper.log('trace', 'tubeStatus', url);
    apiData = await serviceHelper.requestAPIdata(url);

    apiData = apiData.body;
    if (!serviceHelper.isEmptyObject(apiData)) {
      disruptions = apiData[0].description;
    }

    returnJSON = {
      mode: 'tube',
      line,
      disruptions,
      duration,
      departureStation,
      arrivalStation,
    };

    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, true, returnJSON);
      next();
    }
    return returnJSON;
  } catch (err) {
    serviceHelper.log('error', 'nextTube', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, false, err);
      next();
    }
    return err;
  }
}
skill.put('/nexttube', nextTube);

/**
 * @api {put} /travel/busstatus Get bus status
 * @apiName busstatus
 * @apiGroup Travel
 *
 * @apiParam {String} route bus number i.e. 486
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *   "success": "true",
 *   "data": {
 *       "mode": "bus",
 *       "line": "486",
 *       "disruptions": "false"
 *   }
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function busStatus(req, res, next) {
  serviceHelper.log('trace', 'busStatus', 'busStatus API called');

  const { TFLAPIKey } = process.env;

  let { route } = req.body;
  let disruptions = 'false';
  let returnJSON;

  if (typeof route === 'undefined' || route === null || route === '') {
    serviceHelper.log('info', 'busStatus', 'Missing param: route');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: route');
      next();
    }
    return false;
  }

  try {
    serviceHelper.log('trace', 'busStatus', 'Getting data from TFL');
    const url = `https://api.tfl.gov.uk/Line/${route}/Status?detail=true&${TFLAPIKey}`;
    serviceHelper.log('trace', 'busStatus', url);
    let apiData = await serviceHelper.requestAPIdata(url);
    apiData = apiData.body;

    if (!serviceHelper.isEmptyObject(apiData)) {
      route = apiData[0].name;
      if (!serviceHelper.isEmptyObject(apiData[0].disruptions)) {
        disruptions = apiData[0].disruptions;
      }
    }

    returnJSON = {
      mode: 'bus',
      line: route,
      disruptions,
    };

    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, true, returnJSON);
      next();
    }
    return returnJSON;
  } catch (err) {
    serviceHelper.log('error', 'busStatus', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, false, err);
      next();
    }
    return false;
  }
}
skill.put('/busstatus', busStatus);

/**
 * @api {put} /travel/nextbus Get next bus information
 * @apiName nextbus
 * @apiGroup Travel
 *
 * @apiParam {String} route Bus route i.e. 380
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *   "success": "true",
 *   "data": {
 *       "mode": "bus",
 *       "line": "486",
 *       "destination": "North Greenwich",
 *       "firstTime": "7:51 PM",
 *       "secondTime": "8:03 PM",
 *       "disruptions": "false"
 *   }
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function nextbus(req, res, next) {
  serviceHelper.log('trace', 'nextbus', 'nextbus API called');

  const { TFLAPIKey } = process.env;
  const busroute = req.body.route;

  let url;
  let returnJSON;
  let atHome;
  let stopPoint = '';

  switch (req.query.atHome) {
    case 'false':
      atHome = false;
      break;
    case 'true':
      atHome = true;
      break;
    default:
      atHome = true;
  }

  if (typeof busroute === 'undefined' || busroute === null || busroute === '') {
    serviceHelper.log('info', 'nextbus', 'Missing param: route');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: route');
      next();
    }
    return false;
  }

  switch (busroute) {
    case '9':
      serviceHelper.log('trace', 'nextbus', 'Using Bus no. 9');
      stopPoint = '490013766H'; // Default going to work stop point
      if (!atHome) { stopPoint = '490013766H'; } // Override to coming home stop point - TODO
      url = `https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals?mode=bus&line=9&${TFLAPIKey}`;
      break;
    case '380':
      serviceHelper.log('trace', 'nextbus', 'Using Bus no. 380');
      url = `https://api.tfl.gov.uk/StopPoint/490013012S/Arrivals?mode=bus&line=380&${TFLAPIKey}`;
      break;
    case '486':
      serviceHelper.log('trace', 'nextbus', 'Using Bus no. 486');
      stopPoint = '490001058H'; // Default going to work stop point
      if (!atHome) { stopPoint = '490010374B'; } // Override to coming home stop point
      url = `https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals?mode=bus&line=486&${TFLAPIKey}`;
      break;
    case '161':
      serviceHelper.log('trace', 'nextbus', 'Using Bus no. 161');
      stopPoint = '490010374A'; // Default coming home stop point
      url = `https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals?mode=bus&line=161&${TFLAPIKey}`;
      break;
    default:
      serviceHelper.log('trace', 'nextbus', `Bus no.${busroute} is not supported`);
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, false, `Bus route ${busroute} is not currently supported`);
        next();
      }
      return false;
  }

  try {
    // Get the bus data
    const params = { query: { route: busroute } };
    const distruptionsJSON = await busStatus(params, null, next);

    serviceHelper.log('trace', 'nextbus', 'Get data from TFL');
    serviceHelper.log('trace', 'nextbus', url);
    let apiData = await serviceHelper.requestAPIdata(url);
    apiData = apiData.body;
    if (serviceHelper.isEmptyObject(apiData)) {
      returnJSON = {
        mode: 'bus',
        line: busroute,
        destination: '',
        firstTime: 'N/A',
        secondTime: 'N/A',
        disruptions: 'N/A',
        error: 'No data was returned from the call to the TFL API',
      };
      serviceHelper.log('error', 'nextbus', 'No data was returned from the call to the TFL API');
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, false, returnJSON);
        next();
      }
    } else {
      serviceHelper.log('trace', 'nextbus', 'Filter bus stop for only desired route and direction');
      let busData = apiData.filter(a => a.lineId === busroute);
      serviceHelper.log('trace', 'nextbus', 'Sort by time to arrive at staton');
      busData = busData.sort(serviceHelper.GetSortOrder('timeToStation'));

      let numberOfElements = busData.length;
      if (numberOfElements > 2) { numberOfElements = 2; }

      switch (numberOfElements) {
        case 2:
          returnJSON = {
            mode: 'bus',
            line: busData[0].lineName,
            destination: busData[0].destinationName,
            firstTime: serviceHelper.minutesToStop(busData[0].timeToStation),
            secondTime: serviceHelper.minutesToStop(busData[1].timeToStation),
            disruptions: distruptionsJSON.disruptions,
          };
          break;
        default:
          returnJSON = {
            mode: 'bus',
            line: busData[0].lineName,
            destination: busData[0].destinationName,
            firstTime: serviceHelper.minutesToStop(busData[0].timeToStation),
            secondTime: 'N/A',
            disruptions: distruptionsJSON.disruptions,
          };
          break;
      }
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, true, returnJSON);
        next();
      }
    }
    return returnJSON;
  } catch (err) {
    serviceHelper.log('error', 'nextbus', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, false, err);
      next();
    }
    return err;
  }
}
skill.put('/nextbus', nextbus);

/**
 * @api {put} /travel/trainstatus Get train status
 * @apiName trainstatus
 * @apiGroup Travel
 *
 * @apiParam {String} fromStation code i.e. CHX
 * @apiParam {String} toStation code i.e. CTN
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *      "success": "true",
 *      "data": {
 *        "mode": "train",
 *        "line": "Southeastern"
 *        "disruptions": "false"
 *      }
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function trainStatus(req, res, next) {
  serviceHelper.log('trace', 'trainStatus', 'trainStatus API called');

  const { transportapiKey } = process.env;
  const { fromStation, toStation } = req.body;
  let disruptions = 'false';
  let returnJSON;

  if (typeof fromStation === 'undefined' || fromStation === null || fromStation === '') {
    serviceHelper.log('info', 'trainStatus', 'Missing param: fromStation');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: fromStation');
      next();
    }
    return false;
  }

  if (typeof toStation === 'undefined' || toStation === null || toStation === '') {
    serviceHelper.log('info', 'trainStatus', 'Missing param: toStation');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: toStation');
      next();
    }
    return false;
  }

  try {
    serviceHelper.log('trace', 'trainStatus', 'Getting data from TFL');
    const url = `https://transportapi.com/v3/uk/train/station/${fromStation}/live.json?${transportapiKey}&train_status=passenger&calling_at=${toStation}`;
    serviceHelper.log('trace', 'trainStatus', url);
    let apiData = await serviceHelper.requestAPIdata(url);
    apiData = apiData.body;
    let line = '';

    if (!serviceHelper.isEmptyObject(apiData)) {
      const trainData = apiData.departures.all;
      line = trainData[0].operator_name;

      let maxJourneyCounter = 5;
      if (maxJourneyCounter > trainData.length) maxJourneyCounter = trainData.length;
      for (let index = 0; index < maxJourneyCounter; index += 1) {
        serviceHelper.log('trace', 'nextTrain', 'Check for cancelled train');
        if (trainData[index].status.toLowerCase() === 'it is currently off route' || trainData[index].status.toLowerCase() === 'cancelled') {
          serviceHelper.log('trace', 'nextTrain', 'Found cancelled train');
          disruptions = 'true';
        }
      }
    } else disruptions = 'true';

    returnJSON = {
      mode: 'train',
      line,
      disruptions,
    };

    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, true, returnJSON);
      next();
    }
    return returnJSON;
  } catch (err) {
    serviceHelper.log('error', 'trainStatus', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, false, err);
      next();
    }
    return err;
  }
}
skill.put('/trainstatus', trainStatus);

/**
 * @api {put} /travel/nexttrain Get next train information
 * @apiName nexttrain
 * @apiGroup Travel
 *
 * @apiParam {String} train_destination Destination station i.e. CHX
 * @apiParam {String} startFrom Starting station i.e. CTN
 * @apiParam {String} departureTimeOffSet Departure time offset in HH:MM
 * @apiParam {Bool} distruptionOverride Ignore distruption
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *   "success": "true",
 *   "data": {
 *       "mode": "train",
 *       "line": "Southeastern",
 *       "disruptions": "false",
 *       "duration": "30",
 *       "departureTime": "08:15",
 *       "departureStation": "Charlton",
 *       "departurePlatform": "1",
 *       "arrivalTime": "08:45",
 *       "arrivalStation": "London Charing Cross",
 *       "status": "on time"
 *   }
 *  }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function nextTrain(req, res, next) {
  serviceHelper.log('trace', 'nextTrain', 'nextTrain API called');

  const { transportapiKey } = process.env;
  const { nextTrainOnly } = req.body;

  let {
    fromStation, toStation, departureTimeOffSet,
  } = req.body;

  if (typeof fromStation === 'undefined' || fromStation === null || fromStation === '') {
    serviceHelper.log('info', 'nextTrain', 'Missing param: fromStation');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: fromStation');
      next();
    }
    return false;
  }
  fromStation = fromStation.toUpperCase();

  if (typeof toStation === 'undefined' || toStation === null || toStation === '') {
    serviceHelper.log('info', 'nextTrain', 'Missing param: toStation');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: toStation');
      next();
    }
    return false;
  }
  toStation = toStation.toUpperCase();

  if (typeof departureTimeOffSet !== 'undefined' && departureTimeOffSet !== null && departureTimeOffSet !== '') {
    departureTimeOffSet = `PT${departureTimeOffSet}:00`;
  } else {
    departureTimeOffSet = '';
  }

  let url = `https://transportapi.com/v3/uk/train/station/${fromStation}/live.json?${transportapiKey}&train_status=passenger&from_offset=${departureTimeOffSet}&calling_at=${toStation}`;
  serviceHelper.log('trace', 'nextTrain', url);

  try {
    serviceHelper.log('trace', 'nextTrain', 'Get data from API');
    let apiData = await serviceHelper.requestAPIdata(url);
    apiData = apiData.body;

    if (serviceHelper.isEmptyObject(apiData)) {
      serviceHelper.log('error', 'nextTrain', 'No data was returned from the call to the API');
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, false, 'No data was returned from the call to the API');
        next();
      }
      return false;
    }

    let trainData = apiData.departures.all;
    if (serviceHelper.isEmptyObject(trainData)) {
      serviceHelper.log('error', 'nextTrain', 'No trains running');
      const returnJSON = [{
        mode: 'train',
        disruptions: 'true',
        status: 'No trains running',
      }];
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, true, returnJSON);
        next();
      }
      return returnJSON;
    }

    serviceHelper.log('trace', 'nextTrain', 'Remove results that start and end at same station');
    const cleanData = trainData.filter(a => a.origin_name !== a.destination_name);

    serviceHelper.log('trace', 'nextTrain', 'Sort by departure time');
    trainData = cleanData.sort(serviceHelper.GetSortOrder('aimed_departure_time'));

    serviceHelper.log('trace', 'nextTrain', 'Construct JSON');
    const returnJSON = [];
    let trainStations;
    let journey;
    let disruptions = 'false';
    let mode;
    let line;
    let duration;
    let departureTime;
    let departureStation;
    let departurePlatform;
    let arrivalTime;
    let arrivalStation;
    let status;

    let maxJourneyCounter = 3;
    if (maxJourneyCounter > trainData.length) maxJourneyCounter = trainData.length;
    if (nextTrainOnly === true) maxJourneyCounter = 1;

    for (let index = 0; index < maxJourneyCounter; index += 1) {
      mode = 'train';
      line = trainData[index].operator_name;
      if (line === null) line = 'Network rail';
      departureTime = trainData[index].aimed_departure_time;
      switch (fromStation) {
        case 'LBG':
          departureStation = 'London Bridge';
          break;
        case 'STP':
          departureStation = 'St Pancras International';
          break;
        case 'CHX':
          departureStation = 'Charing Cross';
          break;
        case 'CST':
          departureStation = 'Cannon Street';
          break;
        default:
          departureStation = 'Charlton';
      }
      departurePlatform = 'N/A';
      if (trainData[index].platform != null) departurePlatform = trainData[index].platform;
      status = trainData[index].status.toLowerCase();

      serviceHelper.log('trace', 'nextTrain', 'Check for cancelled train');
      if (trainData[index].status.toLowerCase() === 'it is currently off route' || trainData[index].status.toLowerCase() === 'cancelled') {
        serviceHelper.log('trace', 'nextTrain', 'Found cancelled train');
        disruptions = 'true';
      }

      serviceHelper.log('trace', 'nextTrain', 'Get stops info');
      url = trainData[index].service_timetable.id;
      trainStations = await serviceHelper.requestAPIdata(url);
      trainStations = trainStations.body.stops;
      serviceHelper.log('trace', 'nextTrain', 'Get arrival time at destination station');
      trainStations = trainStations.filter(a => a.station_code === toStation);
      arrivalTime = trainStations[0].aimed_arrival_time;
      arrivalStation = trainStations[0].station_name;

      serviceHelper.log('trace', 'nextTrain', 'Work out duration');
      duration = serviceHelper.timeDiff(departureTime, arrivalTime);

      serviceHelper.log('trace', 'nextTrain', 'Construct journey JSON');
      journey = {
        mode,
        line,
        disruptions,
        duration,
        departureTime,
        departureStation,
        departurePlatform,
        arrivalTime,
        arrivalStation,
        status,
      };
      returnJSON.push(journey);

      if ((index + 1) === maxJourneyCounter) {
        serviceHelper.log('trace', 'nextTrain', 'Send data back to caller');
        if (typeof res !== 'undefined' && res !== null) {
          serviceHelper.sendResponse(res, true, returnJSON);
          next();
        }
        return returnJSON;
      }
    }
  } catch (err) {
    serviceHelper.log('error', 'nextTrain', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, false, err);
      next();
    }
    return err;
  }
  return true;
}
skill.put('/nexttrain', nextTrain);

/**
 * @api {put} /travel/getCommuteStatus Get commute status
 * @apiName getCommuteStatus
 * @apiGroup Travel
 *
 * @apiParam {String} user
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: {
 *       "anyDisruptions": false,
 *    }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function getCommuteStatus(req, res, next) {
  serviceHelper.log('trace', 'getCommuteStatus', 'getCommuteStatus API called');

  const { user } = req.body;
  let anyDisruptions = false;

  serviceHelper.log('trace', 'getCommuteStatus', 'Checking for params');
  if (typeof user === 'undefined' || user === null || user === '') {
    serviceHelper.log('info', 'getCommuteStatus', 'Missing param: user');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: user');
      next();
    }
    return false;
  }

  let apiData;
  switch (user.toUpperCase()) {
    case 'FRAN':
      serviceHelper.log('trace', 'getCommuteStatus', 'User is Fran');
      try {
        serviceHelper.log('trace', 'getCommuteStatus', 'Get train status');
        apiData = await trainStatus({ body: { fromStation: 'CTN', toStation: 'CHX' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        apiData = await trainStatus({ body: { fromStation: 'CHX', toStation: 'CTN' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        apiData = await tubeStatus({ body: { line: 'Piccadilly' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        const returnJSON = { anyDisruptions };
        if (typeof res !== 'undefined' && res !== null) {
          serviceHelper.sendResponse(res, true, returnJSON);
          next();
        }
        return returnJSON;
      } catch (err) {
        if (typeof res !== 'undefined' && res !== null) {
          serviceHelper.sendResponse(res, false, err);
          next();
        }
        return err;
      }
    case 'JP':
      serviceHelper.log('trace', 'getCommuteStatus', 'User is JP');
      try {
        serviceHelper.log('trace', 'getCommuteStatus', 'Get train status');
        apiData = await trainStatus({ body: { fromStation: 'CTN', toStation: 'STP' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        apiData = await trainStatus({ body: { fromStation: 'STP', toStation: 'CTN' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        apiData = await trainStatus({ body: { fromStation: 'CTN', toStation: 'LBG' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        apiData = await trainStatus({ body: { fromStation: 'LBG', toStation: 'CTN' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        apiData = await tubeStatus({ body: { line: 'Northern' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        const returnJSON = { anyDisruptions };
        if (typeof res !== 'undefined' && res !== null) {
          serviceHelper.sendResponse(res, true, returnJSON);
          next();
        }
        return returnJSON;
      } catch (err) {
        if (typeof res !== 'undefined' && res !== null) {
          serviceHelper.sendResponse(res, false, err);
          next();
        }
        return err;
      }
    default:
      break;
  }
  return true;
}
skill.put('/getcommutestatus', getCommuteStatus);

/**
 * @api {put} /travel/getcommute Get commute information
 * @apiName getcommute
 * @apiGroup Travel
 *
 * @apiParam {String} lat
 * @apiParam {String} long
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: {
 *       "anyDisruptions": false,
 *       "commuteResults": [
 *           ...
 *       ]
 *    }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
function returnCommuteError(req, res, next) {
  const legs = [];
  const journeys = [];
  legs.push({
    mode: 'error',
    disruptions: 'true',
    status: 'Error obtaining commute data',
  });
  serviceHelper.log('trace', 'returnCommuteError', 'Add no data journey');
  journeys.push({ legs });

  const returnJSON = { journeys };

  if (typeof res !== 'undefined' && res !== null) {
    serviceHelper.sendResponse(res, true, returnJSON);
    next();
  }
  return returnJSON;
}

async function getCommute(req, res, next) {
  serviceHelper.log('trace', 'getCommute', 'getCommute API called');

  const {
    user, lat, long, walk, full,
  } = req.body;
  const journeys = [];

  let apiData;
  let atHome = true;
  let atJPWork = false;

  serviceHelper.log('trace', 'getCommute', 'Checking for params');
  if (typeof user === 'undefined' || user === null || user === '') {
    serviceHelper.log('info', 'getCommute', 'Missing param: user');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: user');
      next();
    }
    return false;
  }

  if ((typeof lat === 'undefined' && lat === null && lat === '') ||
      (typeof long === 'undefined' && long === null && long === '')) {
    serviceHelper.log('info', 'getCommute', 'Missing param: lat/long');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: lat/long');
      next();
    }
    return false;
  }

  serviceHelper.log('trace', 'getCommute', 'Find out if caller is at home location');
  atHome = serviceHelper.inHomeGeoFence(lat, long);

  switch (user.toUpperCase()) {
    case 'FRAN':
      serviceHelper.log('trace', 'getCommute', 'User is Fran');
      //
      // *** TO DO ***
      //
      break;
    case 'JP':
      serviceHelper.log('trace', 'getCommute', 'User is JP');
      if (atHome) {
        serviceHelper.log('trace', 'getCommute', 'Current location is close to home');
        if (walk === 'true') {
          serviceHelper.log('trace', 'getCommute', 'Walk option selected');

          let WalkToWorkLeg = {};
          let legs = [];

          serviceHelper.log('trace', 'getCommute', 'Get next direct train');
          apiData = await nextTrain({
            body: {
              fromStation: 'CTN', toStation: 'STP', departureTimeOffSet: '00:10', nextTrainOnly: true,
            },
          }, null, next);
          if (apiData instanceof Error) {
            serviceHelper.log('error', 'getCommute', apiData.message);
            if (typeof res !== 'undefined' && res !== null) {
              returnCommuteError(req, res, next);
            }
            return false;
          }

          serviceHelper.log('trace', 'getCommute', 'Add train leg');
          legs.push(apiData[0]);

          if (apiData[0].status !== 'No trains running') {
            WalkToWorkLeg.mode = 'walk';
            WalkToWorkLeg.line = 'Person';
            WalkToWorkLeg.duration = '40';
            WalkToWorkLeg.departureTime = apiData[0].arrivalTime;
            WalkToWorkLeg.departureStation = 'St Pancras International';
            WalkToWorkLeg.arrivalTime = serviceHelper.addTime(WalkToWorkLeg.departureTime, WalkToWorkLeg.duration);
            WalkToWorkLeg.arrivalStation = 'Work';
            serviceHelper.log('trace', 'getCommute', 'Add walk to work leg');
            legs.push(WalkToWorkLeg);
          }
          serviceHelper.log('trace', 'getCommute', 'Add walk journey');
          journeys.push({ legs });

          serviceHelper.log('trace', 'getCommute', 'Getting Alt journey');

          serviceHelper.log('trace', 'getCommute', 'Get next trains');
          apiData = await nextTrain({
            body: {
              fromStation: 'CTN', toStation: 'LBG', departureTimeOffSet: '00:10',
            },
          }, null, next);
          if (apiData instanceof Error) {
            serviceHelper.log('error', 'getCommute', apiData.message);
            if (typeof res !== 'undefined' && res !== null) {
              returnCommuteError(req, res, next);
            }
            return false;
          }
          for (let index = 0; index < apiData.length; index += 1) {
            legs = [];
            serviceHelper.log('trace', 'getCommute', 'Add train leg');
            legs.push(apiData[index]);

            const WaitAtStationLeg = {};
            WaitAtStationLeg.mode = 'walk';
            WaitAtStationLeg.line = 'Person';
            WaitAtStationLeg.duration = '5';
            WaitAtStationLeg.departureTime = apiData[index].arrivalTime;
            WaitAtStationLeg.departureStation = 'Change';
            WaitAtStationLeg.arrivalTime = serviceHelper.addTime(WaitAtStationLeg.departureTime, WaitAtStationLeg.duration);
            WaitAtStationLeg.arrivalStation = 'next platform';
            serviceHelper.log('trace', 'getCommute', 'Add wait at station leg');
            legs.push(WaitAtStationLeg);

            serviceHelper.log('trace', 'getCommute', 'Work out next departure time');
            const timeOffset = serviceHelper.timeDiff(null, WaitAtStationLeg.arrivalTime, null, true);            
            const backupData = await nextTrain({
              body: {
                fromStation: 'LBG', toStation: 'STP', departureTimeOffSet: timeOffset, nextTrainOnly: true,
              },
            }, null, next);
            if (backupData instanceof Error) {
              serviceHelper.log('error', 'getCommute', backupData.message);
              if (typeof res !== 'undefined' && res !== null) {
                returnCommuteError(req, res, next);
              }
              return false;
            }

            serviceHelper.log('trace', 'getCommute', 'Add train leg');
            legs.push(backupData[0]);

            WalkToWorkLeg = {};
            WalkToWorkLeg.mode = 'walk';
            WalkToWorkLeg.line = 'Person';
            WalkToWorkLeg.duration = '40';
            WalkToWorkLeg.departureTime = backupData[0].arrivalTime;
            WalkToWorkLeg.departureStation = 'St Pancras International';
            WalkToWorkLeg.arrivalTime = serviceHelper.addTime(WalkToWorkLeg.departureTime, WalkToWorkLeg.duration);
            WalkToWorkLeg.arrivalStation = 'Work';
            serviceHelper.log('trace', 'getCommute', 'Add walk to work leg');
            legs.push(WalkToWorkLeg);

            serviceHelper.log('trace', 'getCommute', 'Add journey');
            journeys.push({ legs });
          }
        } else {
          serviceHelper.log('trace', 'getCommute', 'Non walk option selected');
          apiData = await nextTrain({
            body: {
              fromStation: 'CTN', toStation: 'LBG', departureTimeOffSet: '00:10',
            },
          }, null, next);
          if (apiData instanceof Error) {
            serviceHelper.log('error', 'getCommute', apiData.message);
            if (typeof res !== 'undefined' && res !== null) {
              returnCommuteError(req, res, next);
            }
            return false;
          }

          const backupData = await nextTube({
            body: {
              line: 'Northern', startID: '940GZZLULNB', endID: '940GZZLUAGL',
            },
          }, null, next);
          if (backupData instanceof Error) {
            serviceHelper.log('error', 'getCommute', backupData.message);
            if (typeof res !== 'undefined' && res !== null) {
              returnCommuteError(req, res, next);
            }
            return false;
          }

          for (let index = 0; index < apiData.length; index += 1) {
            const legs = [];

            serviceHelper.log('trace', 'getCommute', 'Add train leg');
            legs.push(apiData[index]);

            const WalkToUndergroundLeg = {};
            WalkToUndergroundLeg.mode = 'walk';
            WalkToUndergroundLeg.line = 'Person';
            WalkToUndergroundLeg.disruptions = 'false';
            WalkToUndergroundLeg.duration = '10';
            WalkToUndergroundLeg.departureTime = apiData[index].arrivalTime;
            WalkToUndergroundLeg.departureStation = 'Change';
            WalkToUndergroundLeg.arrivalTime = serviceHelper.addTime(WalkToUndergroundLeg.departureTime, WalkToUndergroundLeg.duration);
            WalkToUndergroundLeg.arrivalStation = 'underground';
            serviceHelper.log('trace', 'getCommute', 'Add walking leg');
            legs.push(WalkToUndergroundLeg);
  
            serviceHelper.log('trace', 'getCommute', 'Add tube departure & arrival times');
            const tmpBackupData = {};
            tmpBackupData.mode = backupData.mode;
            tmpBackupData.line = backupData.line;
            tmpBackupData.disruptions = backupData.disruptions;
            tmpBackupData.duration = backupData.duration;
            tmpBackupData.departureTime = WalkToUndergroundLeg.arrivalTime;
            tmpBackupData.departureStation = backupData.departureStation;
            tmpBackupData.arrivalTime = serviceHelper.addTime(tmpBackupData.departureTime, tmpBackupData.duration);
            tmpBackupData.arrivalStation = backupData.arrivalStation;
            serviceHelper.log('trace', 'getCommute', 'Add tube leg');
            legs.push(tmpBackupData);

            serviceHelper.log('trace', 'getCommute', 'Add journey');
            journeys.push({ legs });
          }
        }
      }

      atJPWork = serviceHelper.inJPWorkGeoFence(lat, long);
      if (atJPWork) {
        serviceHelper.log('trace', 'getCommute', 'Current location is close to work');
        if (walk === 'true') {
          serviceHelper.log('trace', 'getCommute', 'Walk option selected');
          let legs = [];
          apiData = await nextTrain({
            body: {
              fromStation: 'STP', toStation: 'CTN', departureTimeOffSet: '00:45', nextTrainOnly: true,
            },
          }, null, next);
          if (apiData instanceof Error) {
            serviceHelper.log('error', 'getCommute', apiData.message);
            if (typeof res !== 'undefined' && res !== null) {
              returnCommuteError(req, res, next);
            }
            return false;
          }

          serviceHelper.log('trace', 'getCommute', 'Add walking leg');
          const walkToStationLeg = {};
          walkToStationLeg.mode = 'walk';
          walkToStationLeg.line = 'Person';
          walkToStationLeg.disruptions = 'false';
          walkToStationLeg.duration = '00:40';
          walkToStationLeg.departureTime = serviceHelper.addTime(null, '00:05');
          walkToStationLeg.departureStation = 'Work';
          walkToStationLeg.arrivalTime = serviceHelper.addTime(null, '00:40');
          walkToStationLeg.arrivalStation = 'St Pancras International';
          serviceHelper.log('trace', 'getCommute', 'Add walking leg');
          legs.push(walkToStationLeg);

          serviceHelper.log('trace', 'getCommute', 'Add train leg');
          legs.push(apiData[0]);

          serviceHelper.log('trace', 'getCommute', 'Add journey');
          journeys.push({ legs });

          serviceHelper.log('trace', 'getCommute', 'Getting Alt journey');

          serviceHelper.log('trace', 'getCommute', 'Add walking leg');
          legs.push(walkToStationLeg);
          journeys.push({ legs });

          apiData = await nextTrain({
            body: {
              fromStation: 'STP', toStation: 'LBG', departureTimeOffSet: '00:45',
            },
          }, null, next);
          if (apiData instanceof Error) {
            serviceHelper.log('error', 'getCommute', apiData.message);
            if (typeof res !== 'undefined' && res !== null) {
              returnCommuteError(req, res, next);
            }
            return false;
          }

          for (let index = 0; index < apiData.length; index += 1) {
            legs = [];

            serviceHelper.log('trace', 'getCommute', 'Add train leg');
            legs.push(apiData[0]);

            const waitAtStationLeg = {};
            waitAtStationLeg.mode = 'walk';
            waitAtStationLeg.line = 'Person';
            waitAtStationLeg.duration = '00:05';
            waitAtStationLeg.disruptions = 'false';
            waitAtStationLeg.departureTime = apiData[0].arrivalTime;
            waitAtStationLeg.departureStation = 'Change';
            waitAtStationLeg.arrivalTime = serviceHelper.addTime(waitAtStationLeg.departureTime, waitAtStationLeg.duration);
            waitAtStationLeg.arrivalStation = 'next platform';
            serviceHelper.log('trace', 'getCommute', 'Add walking leg');
            legs.push(waitAtStationLeg);

            serviceHelper.log('trace', 'getCommute', 'Work out next departure time');
            const timeOffset = serviceHelper.timeDiff(null, waitAtStationLeg.arrivalTime, null, true);
            let backupData = await nextTrain({
              body: {
                fromStation: 'LBG', toStation: 'CTN', departureTimeOffSet: timeOffset, nextTrainOnly: true,
              },
            }, null, next);
            if (backupData instanceof Error) {
              serviceHelper.log('error', 'getCommute', backupData.message);
              if (typeof res !== 'undefined' && res !== null) {
                returnCommuteError(req, res, next);
              }
              return false;
            }

            serviceHelper.log('trace', 'getCommute', 'Add train leg');
            legs.push(backupData[0]);

            serviceHelper.log('trace', 'getCommute', 'Add journey');
            journeys.push({ legs });
          }
        } else {
          let legs = [];
          serviceHelper.log('trace', 'getCommute', 'Non walk option selected');

          const backupData = await nextTube({
            body: {
              line: 'Northern', startID: '940GZZLUAGL', endID: '940GZZLULNB',
            },
          }, null, next);
          if (backupData instanceof Error) {
            serviceHelper.log('error', 'getCommute', backupData.message);
            if (typeof res !== 'undefined' && res !== null) {
              returnCommuteError(req, res, next);
            }
            return false;
          }
          backupData.departureTime = serviceHelper.addTime(null, '00:05');
          backupData.arrivalTime = serviceHelper.addTime(backupData.departureTime, backupData.duration);

          serviceHelper.log('trace', 'getCommute', 'Add tube leg');
          legs.push(backupData);

          const WalkFromUndergroundLeg = {};
          WalkFromUndergroundLeg.mode = 'walk';
          WalkFromUndergroundLeg.line = 'Person';
          WalkFromUndergroundLeg.disruptions = 'false';
          WalkFromUndergroundLeg.duration = '00:10';
          WalkFromUndergroundLeg.departureTime = backupData.arrivalTime;
          WalkFromUndergroundLeg.departureStation = 'Change';
          WalkFromUndergroundLeg.arrivalTime = serviceHelper.addTime(WalkFromUndergroundLeg.departureTime, WalkFromUndergroundLeg.duration);
          WalkFromUndergroundLeg.arrivalStation = 'train station';
          serviceHelper.log('trace', 'getCommute', 'Add walking leg');
          legs.push(WalkFromUndergroundLeg);

          serviceHelper.log('trace', 'getCommute', 'Add journey');
          journeys.push({ legs });

          serviceHelper.log('trace', 'getCommute', 'Work out next departure time');
          const timeOffset = serviceHelper.timeDiff(null, WalkFromUndergroundLeg.arrivalTime);

          apiData = await nextTrain({
            body: {
              fromStation: 'LBG', toStation: 'CTN', departureTimeOffSet: timeOffset,
            },
          }, null, next);
          if (apiData instanceof Error) {
            serviceHelper.log('error', 'getCommute', apiData.message);
            if (typeof res !== 'undefined' && res !== null) {
              returnCommuteError(req, res, next);
            }
            return false;
          }

          for (let index = 0; index < apiData.length; index += 1) {
            legs = [];

            serviceHelper.log('trace', 'getCommute', 'Add train leg');
            legs.push(apiData[0]);

            serviceHelper.log('trace', 'getCommute', 'Add journey');
            journeys.push({ legs });
          }
        }
      }

      if (!atHome && !atJPWork) {
        serviceHelper.log('trace', 'getCommute', 'Add not at home or work leg');
        if (typeof res !== 'undefined' && res !== null) {
          returnCommuteError(req, res, next);
        }
        return false;
      }
      break;
    default:
      serviceHelper.log('error', 'getCommute', `User ${user} is not supported`);
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, false, `User ${user} is not supported`);
        next();
      }
      return false;
  }

  serviceHelper.log('trace', 'getCommute', 'Send data back to caller');
  const returnJSON = {
    journeys,
  };

  if (typeof res !== 'undefined' && res !== null) {
    serviceHelper.sendResponse(res, true, returnJSON);
    next();
  } else {
    return returnJSON;
  }
  return null;
}
skill.put('/getcommute', getCommute);

module.exports = skill;
