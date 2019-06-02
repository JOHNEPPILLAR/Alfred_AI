/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;

/**
 * Import helper libraries
 */
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
  serviceHelper.log('trace', 'tubeStatus API called');

  const { TFLAPIKey } = process.env;

  let { line } = req.body;
  let disruptions = 'false';
  let returnJSON;

  if (typeof line === 'undefined' || line === null || line === '') {
    serviceHelper.log('info', 'Missing param: line');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: line');
      next();
    }
    return false;
  }

  try {
    serviceHelper.log('trace', 'Getting data from TFL');
    const url = `https://api.tfl.gov.uk/Line/${line}/Disruption?${TFLAPIKey}`;
    serviceHelper.log('trace', url);
    let apiData = await serviceHelper.callAPIService(url);
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
    serviceHelper.log('error', err.message);
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
  serviceHelper.log('trace', 'nextTube API called');

  const { TFLAPIKey } = process.env;
  const { startID, endID } = req.body;

  let { line } = req.body;
  let duration = 0;
  let disruptions = 'false';
  let departureStation;
  let arrivalStation;
  let returnJSON;

  if (typeof line === 'undefined' || line === null || line === '') {
    serviceHelper.log('info', 'Missing param: line');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: line');
      next();
    }
    return false;
  }

  if (typeof startID === 'undefined' || startID === null || startID === '') {
    serviceHelper.log('info', 'Missing param: startID');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: startID');
      next();
    }
    return false;
  }

  if (typeof endID === 'undefined' || endID === null || endID === '') {
    serviceHelper.log('info', 'Missing param: endID');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: endID');
      next();
    }
    return false;
  }

  try {
    serviceHelper.log('trace', 'Getting data from TFL');
    let url = `https://api.tfl.gov.uk/Line/${line}/Timetable/${startID}/to/${endID}?${TFLAPIKey}`;
    serviceHelper.log('trace', url);
    let apiData = await serviceHelper.callAPIService(url);

    if (!serviceHelper.isEmptyObject(apiData)) {
      line = apiData.lineName;
      let tempRoute = apiData.timetable.routes[0].stationIntervals[0].intervals;
      tempRoute = tempRoute.filter(a => a.stopId === endID);
      let { timeToArrival } = tempRoute[0];
      if (typeof timeToArrival === 'undefined') timeToArrival = 0;
      duration = `${timeToArrival}`;
      serviceHelper.log('trace', 'Get departure station');
      tempRoute = apiData.stops;
      tempRoute = tempRoute.filter(a => a.stationId === startID);
      departureStation = tempRoute[0].name.replace(' Underground Station', '');
      serviceHelper.log('trace', 'Get arrival station');
      tempRoute = apiData.stops;
      tempRoute = tempRoute.filter(a => a.stationId === endID);
      arrivalStation = tempRoute[0].name.replace(' Underground Station', '');
    }

    serviceHelper.log('trace', 'Get distruptions');
    url = `https://api.tfl.gov.uk/Line/${line}/Disruption?${TFLAPIKey}`;
    serviceHelper.log('trace', url);
    apiData = await serviceHelper.callAPIService(url);

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
    serviceHelper.log('error', err.message);
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
  serviceHelper.log('trace', 'busStatus API called');

  const { TFLAPIKey } = process.env;

  let { route } = req.body;
  let disruptions = 'false';
  let returnJSON;

  if (typeof route === 'undefined' || route === null || route === '') {
    serviceHelper.log('info', 'Missing param: route');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: route');
      next();
    }
    return false;
  }

  try {
    serviceHelper.log('trace', 'Getting data from TFL');
    const url = `https://api.tfl.gov.uk/Line/${route}/Status?detail=true&${TFLAPIKey}`;
    serviceHelper.log('trace', url);
    let apiData = await serviceHelper.callAPIService(url);
    apiData = apiData.body;

    if (!serviceHelper.isEmptyObject(apiData)) {
      route = apiData[0].name;
      if (!serviceHelper.isEmptyObject(apiData[0].disruptions)) {
        ({ disruptions } = apiData[0].disruptions);
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
    serviceHelper.log('error', err.message);
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
  serviceHelper.log('trace', 'nextbus API called');

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
    serviceHelper.log('info', 'Missing param: route');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: route');
      next();
    }
    return false;
  }

  switch (busroute) {
    case '9':
      serviceHelper.log('trace', 'Using Bus no. 9');
      stopPoint = '490013766H'; // Default going to work stop point
      if (!atHome) {
        stopPoint = '490013766H';
      } // Override to coming home stop point - TODO
      url = `https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals?mode=bus&line=9&${TFLAPIKey}`;
      break;
    case '380':
      serviceHelper.log('trace', 'Using Bus no. 380');
      url = `https://api.tfl.gov.uk/StopPoint/490013012S/Arrivals?mode=bus&line=380&${TFLAPIKey}`;
      break;
    case '486':
      serviceHelper.log('trace', 'Using Bus no. 486');
      stopPoint = '490001058H'; // Default going to work stop point
      if (!atHome) {
        stopPoint = '490010374B';
      } // Override to coming home stop point
      url = `https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals?mode=bus&line=486&${TFLAPIKey}`;
      break;
    case '161':
      serviceHelper.log('trace', 'Using Bus no. 161');
      stopPoint = '490010374A'; // Default coming home stop point
      url = `https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals?mode=bus&line=161&${TFLAPIKey}`;
      break;
    default:
      serviceHelper.log('trace', `Bus no.${busroute} is not supported`);
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

    serviceHelper.log('trace', 'Get data from TFL');
    serviceHelper.log('trace', url);
    let apiData = await serviceHelper.callAPIService(url);
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
      serviceHelper.log('error', 'No data was returned from the call to the TFL API');
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, false, returnJSON);
        next();
      }
    } else {
      serviceHelper.log('trace', 'Filter bus stop for only desired route and direction');
      let busData = apiData.filter(a => a.lineId === busroute);
      serviceHelper.log('trace', 'Sort by time to arrive at staton');
      busData = busData.sort(serviceHelper.GetSortOrder('timeToStation'));

      let numberOfElements = busData.length;
      if (numberOfElements > 2) {
        numberOfElements = 2;
      }

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
    serviceHelper.log('error', err.message);
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
  serviceHelper.log('trace', 'trainStatus API called');

  const { transportapiKey } = process.env;
  const { fromStation, toStation } = req.body;
  let disruptions = 'false';

  if (typeof fromStation === 'undefined' || fromStation === null || fromStation === '') {
    serviceHelper.log('info', 'Missing param: fromStation');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: fromStation');
      next();
    }
    return false;
  }

  if (typeof toStation === 'undefined' || toStation === null || toStation === '') {
    serviceHelper.log('info', 'Missing param: toStation');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: toStation');
      next();
    }
    return false;
  }

  let line = '';
  let apiData;

  try {
    serviceHelper.log('trace', 'Getting data from TFL');
    const url = `https://transportapi.com/v3/uk/train/station/${fromStation}/live.json?${transportapiKey}&train_status=passenger&calling_at=${toStation}`;
    serviceHelper.log('trace', url);
    apiData = await serviceHelper.callAPIService(url);
  } catch (err) {
    serviceHelper.log('error', err.message);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, false, err);
      next();
    }
    return err;
  }

  let trainData;
  try {
    trainData = apiData.departures.all;
    if (trainData instanceof Error === false) {
      if (typeof trainData !== 'undefined') {
        if (serviceHelper.isEmptyObject(trainData)) disruptions = 'true';
      } else disruptions = 'true';
    } else disruptions = 'true';
  } catch (err) {
    disruptions = 'true';
  }

  if (disruptions === 'false') {
    line = trainData[0].operator_name;
    let maxJourneyCounter = 5;
    if (maxJourneyCounter > trainData.length) maxJourneyCounter = trainData.length;
    for (let index = 0; index < maxJourneyCounter; index += 1) {
      serviceHelper.log('trace', 'Check for cancelled train');
      if (
        trainData[index].status.toLowerCase() === 'it is currently off route'
        || trainData[index].status.toLowerCase() === 'cancelled'
      ) {
        serviceHelper.log('trace', 'Found cancelled train');
        disruptions = 'true';
      }
    }
  }

  const returnJSON = {
    mode: 'train',
    line,
    disruptions,
  };

  if (typeof res !== 'undefined' && res !== null) {
    serviceHelper.sendResponse(res, true, returnJSON);
    next();
  }
  return returnJSON;
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
  serviceHelper.log('trace', 'nextTrain API called');

  const { transportapiKey } = process.env;
  const { nextTrainOnly } = req.body;

  let { fromStation, toStation, departureTimeOffSet } = req.body;

  if (typeof fromStation === 'undefined' || fromStation === null || fromStation === '') {
    serviceHelper.log('info', 'Missing param: fromStation');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: fromStation');
      next();
    }
    return false;
  }
  fromStation = fromStation.toUpperCase();

  if (typeof toStation === 'undefined' || toStation === null || toStation === '') {
    serviceHelper.log('info', 'Missing param: toStation');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: toStation');
      next();
    }
    return false;
  }
  toStation = toStation.toUpperCase();

  if (
    typeof departureTimeOffSet !== 'undefined'
    && departureTimeOffSet !== null
    && departureTimeOffSet !== ''
  ) {
    departureTimeOffSet = `PT${departureTimeOffSet}:00`;
  } else {
    departureTimeOffSet = '';
  }

  let url = `https://transportapi.com/v3/uk/train/station/${fromStation}/live.json?${transportapiKey}&train_status=passenger&from_offset=${departureTimeOffSet}&calling_at=${toStation}`;
  serviceHelper.log('trace', url);

  try {
    serviceHelper.log('trace', 'Get data from API');
    const apiData = await serviceHelper.callAPIService(url);

    if (serviceHelper.isEmptyObject(apiData)) {
      serviceHelper.log('error', 'No data was returned from the call to the API');
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, false, 'No data was returned from the call to the API');
        next();
      }
      return false;
    }

    let trainData = apiData.departures.all;
    if (serviceHelper.isEmptyObject(trainData)) {
      serviceHelper.log('info', 'No trains running');
      const returnJSON = [
        {
          mode: 'train',
          disruptions: 'true',
          status: 'No trains running',
        },
      ];
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, true, returnJSON);
        next();
      }
      return returnJSON;
    }

    serviceHelper.log('trace', 'Remove results that start and end at same station');
    const cleanData = trainData.filter(a => a.origin_name !== a.destination_name);

    serviceHelper.log('trace', 'Sort by departure time');
    trainData = cleanData.sort(serviceHelper.GetSortOrder('aimed_departure_time'));

    serviceHelper.log('trace', 'Construct JSON');
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

      serviceHelper.log('trace', 'Check for cancelled train');
      if (
        trainData[index].status.toLowerCase() === 'it is currently off route'
        || trainData[index].status.toLowerCase() === 'cancelled'
      ) {
        serviceHelper.log('trace', 'Found cancelled train');
        disruptions = 'true';
      }

      serviceHelper.log('trace', 'Get stops info');
      url = trainData[index].service_timetable.id;
      // eslint-disable-next-line no-await-in-loop
      trainStations = await serviceHelper.callAPIService(url);
      trainStations = trainStations.stops;
      serviceHelper.log('trace', 'Get arrival time at destination station');
      trainStations = trainStations.filter(a => a.station_code === toStation);
      arrivalTime = trainStations[0].aimed_arrival_time;
      arrivalStation = trainStations[0].station_name;

      serviceHelper.log('trace', 'Work out duration');
      duration = serviceHelper.timeDiff(departureTime, arrivalTime);

      serviceHelper.log('trace', 'Construct journey JSON');
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

      if (index + 1 === maxJourneyCounter) {
        serviceHelper.log('trace', 'Send data back to caller');
        if (typeof res !== 'undefined' && res !== null) {
          serviceHelper.sendResponse(res, true, returnJSON);
          next();
        }
        return returnJSON;
      }
    }
  } catch (err) {
    serviceHelper.log('error', err.message);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, false, err);
      next();
    }
    return err;
  }
  return true;
}
skill.put('/nexttrain', nextTrain);

module.exports = {
  skill,
  tubeStatus,
  nextTube,
  trainStatus,
  nextTrain,
};
