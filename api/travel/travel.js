/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('../../lib/helper.js');

const skill = new Skills();

/**
 * @api {get} /travel/tubestatus Get tube status
 * @apiName tubestatus
 * @apiGroup Travel
 *
 * @apiParam {String} route Tube line i.e. Circle line
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *   "sucess": "true",
 *   "data": {
 *       "mode:": "tube",
 *       "line": "Victoria",
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
async function tubeStatus(req, res, next) {
  serviceHelper.log('trace', 'tubeStatus', 'tubeStatus API called');

  const tflapiKey = process.env.tflapikey;
  
  let { route } = req.query;
  let disruptions = 'false';
  let returnJSON;

  if (typeof route === 'undefined' || route === null || route === '') {
    serviceHelper.log('info', 'tubeStatus', 'Missing param: route');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: route');
      next();
    }
    return false;
  }

  try {
    serviceHelper.log('trace', 'tubeStatus', 'Getting data from TFL');
    const url = `https://api.tfl.gov.uk/Line/${route}/Disruption?${tflapiKey}`;
    let apiData = await serviceHelper.requestAPIdata(url);
    apiData = apiData.body;

    if (!serviceHelper.isEmptyObject(apiData)) {
      disruptions = apiData[0].description;
      route = apiData[0].name;
    }

    returnJSON = {
      mode: 'tube',
      line: route,
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
    return false;
  }
}
skill.get('/tubestatus', tubeStatus);

/**
 * @api {get} /travel/busstatus Get bus status
 * @apiName busstatus
 * @apiGroup Travel
 *
 * @apiParam {String} route bus number i.e. 486
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *   "sucess": "true",
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

  const tflapiKey = process.env.tflapikey;
  
  let { route } = req.query;
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

    const url = `https://api.tfl.gov.uk/Line/${route}/Status?detail=true&${tflapiKey}`;
    let apiData = await serviceHelper.requestAPIdata(url);
    apiData = apiData.body
    
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
skill.get('/busstatus', busStatus);

/**
 * @api {get} /travel/nextbus Get next bus information
 * @apiName nextbus
 * @apiGroup Travel
 *
 * @apiParam {String} route Bus route i.e. 380
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *   "sucess": "true",
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

  const tflapiKey = process.env.tflapikey;
  const busroute = req.query.route;

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
      serviceHelper.log('trace', 'nextbus', 'Using Bus no.9');
      stopPoint = '490013766H'; // Default going to work stop point
      if (!atHome) { stopPoint = '490013766H'; } // Override to coming home stop point - TODO
      url = `https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals?mode=bus&line=9&${tflapiKey}`;
      break;
    case '380':
      serviceHelper.log('trace', 'nextbus', 'Using Bus no.380');
      url = `https://api.tfl.gov.uk/StopPoint/490013012S/Arrivals?mode=bus&line=380&${tflapiKey}`;
      break;
    case '486':
      serviceHelper.log('trace', 'nextbus', 'Using Bus no.486');
      stopPoint = '490001058H'; // Default going to work stop point
      if (!atHome) { stopPoint = '490010374B'; } // Override to coming home stop point
      url = `https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals?mode=bus&line=486&${tflapiKey}`;
      break;
    case '161':
      serviceHelper.log('trace', 'nextbus', 'Using Bus no.161');
      stopPoint = '490010374A'; // Default coming home stop point
      url = `https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals?mode=bus&line=161&${tflapiKey}`;
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
  return true;
}
skill.get('/nextbus', nextbus);

/**
 * @api {get} /travel/nexttrain Get next train information
 * @apiName nexttrain
 * @apiGroup Travel
 *
 * @apiParam {String} train_destination Destination station i.e. CHX
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *   "sucess": "true",
 *   "data": {
 *       "mode": "train",
 *       "disruptions": "false",
 *       "firstDestination": "London Charing Cross",
 *       "firstTime": "8:16 PM",
 *       "firstNotes": "early",
 *       "secondDestination": "London Charing Cross",
 *       "secondTime": "8:46 PM",
 *       "secondNotes": "on time"
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
  if (typeof res !== 'undefined' && res !== null) {
    logger.info('Next Train API called');
  }

  const { transportapiKey } = process.env;
  let trainroute = req.query.route;
  let url = `https://transportapi.com/v3/uk/train/station/CTN/live.json?${transportapiKey}&darwin=false&train_status=passenger&destination=`;
  let returnJSON;
  let disruptions = 'false';
  let destination = '';
  let firstTime = 'N/A';
  let firstNotes;
  let secondTime = 'N/A';
  let secondNotes;

  if (typeof trainroute !== 'undefined' && trainroute !== null) {
    trainroute = trainroute.toUpperCase();
    switch (trainroute.toUpperCase()) {
      case 'CST':
        url += trainroute;
        break;
      case 'CHX':
        url += trainroute;
        break;
      default:
        logger.info('Nexttrain: Train destination not supported.');
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, false, 'Train route not supported');
          next();
        }
        return 'Train route not supported';
    }

    try {
      let apiData = await alfredHelper.requestAPIdata(url);
      apiData = apiData.body;
      if (alfredHelper.isEmptyObject(apiData)) {
        logger.info('nexttrain: No data was returned from the train API call.');
        alfredHelper.sendResponse(res, false, 'No data was returned from the train API call');
        next();
      } else {
        const trainsWorking = apiData.departures.all;
        if (alfredHelper.isEmptyObject(trainsWorking)) {
          disruptions = 'true';
        } else {
          let trainData = apiData.departures.all;
          trainData = trainData.filter(a => a.platform === '1');
          trainData = trainData.sort(alfredHelper.GetSortOrder('best_arrival_estimate_mins'));
          let numberOfElements = trainData.length;
          if (numberOfElements > 2) { numberOfElements = 2; }
          switch (numberOfElements) {
            case 2:
              if (trainData[0].status.toLowerCase() === 'it is currently off route' || trainData[0].status.toLowerCase() === 'cancelled') {
                disruptions = 'true';
                destination = trainData[0].destination_name;
                firstTime = alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60);
                firstNotes = 'Cancelled';
              } else {
                destination = trainData[0].destination_name;
                firstTime = alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60);
                firstNotes = trainData[0].status.toLowerCase();
              }
              if (trainData[1].status.toLowerCase() === 'it is currently off route' || trainData[1].status.toLowerCase() === 'cancelled') {
                secondTime = alfredHelper.minutesToStop(trainData[1].best_arrival_estimate_mins * 60);
                secondNotes = 'Cancelled';
              } else {
                secondTime = alfredHelper.minutesToStop(trainData[1].best_arrival_estimate_mins * 60);
                secondNotes = trainData[1].status.toLowerCase();
              }
              break;
            default:
              destination = trainData[0].destination_name;
              firstTime = alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60);
              firstNotes = trainData[0].status.toLowerCase();
          }
        }

        returnJSON = {
          mode: 'train',
          disruptions,
          destination,
          firstTime,
          firstNotes,
          secondTime,
          secondNotes,
        };

        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, true, returnJSON); // Send response back to caller
          next();
        } else {
          return returnJSON;
        }
      }
    } catch (err) {
      logger.error(`nexttrain: ${err}`);
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, null, err); // Send response back to caller
        next();
      } else {
        return err;
      }
    }
  } else {
    logger.error('nexttrain: No train route was supplied.');
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, false, 'No train route was supplied.');
      next();
    } else {
      return 'No train route was supplied';
    }
  }
  return null;
}
skill.get('/nexttrain', nextTrain);

/**
 * @api {get} /travel/getcommute Get commute information
 * @apiName getcommute
 * @apiGroup Travel
 *
 * @apiParam {String} user Bring commute information back for specific user
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
 *     data: {
 *       "anyDisruptions": false,
 *       "commuteResults": [
 *           {
 *               "mode": "bus",
 *               "line": "486",
 *               "destination": "North Greenwich",
 *               "firstTime": "11:41 AM",
 *               "secondTime": "11:48 AM",
 *               "disruptions": "false",
 *               "order": 0
 *           },
 *           {
 *               "mode": "tube",
 *               "line": "Jubilee",
 *               "disruptions": "false",
 *               "order": 1
 *           },
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
async function getCommute(req, res, next) {
  logger.info('Get commute API called');

  const commuteOptions = [];
  const commuteResults = [];
  let returnJSON;
  let anyDisruptions = false;
  let tmpResults = [];
  let atHome = true;

  const { user, lat, long } = req.query;

  if ((typeof lat !== 'undefined' && lat !== null) || (typeof long !== 'undefined' && long !== null)) {
    atHome = alfredHelper.inHomeGeoFence(lat, long);
  }

  if (typeof user !== 'undefined' && user !== null) {
    switch (user.toUpperCase()) {
      case 'FRAN':
        if (atHome) {
          commuteOptions.push({ order: 0, type: 'train', query: { query: { route: 'CHX' } } });
          commuteOptions.push({ order: 1, type: 'bus', query: { query: { route: '9' } } });
          commuteOptions.push({ order: 2, type: 'train', query: { query: { route: 'CST' } } });
          commuteOptions.push({ order: 3, type: 'tube', query: { query: { route: 'district' } } });
        }
        break;
      case 'JP':
        commuteOptions.push({ order: 0, type: 'bus', query: { query: { route: '486', atHome } } });
        if (atHome) {
          commuteOptions.push({ order: 1, type: 'tube', query: { query: { route: 'jubilee' } } });
          commuteOptions.push({ order: 2, type: 'train', query: { query: { route: 'CHX' } } });
          commuteOptions.push({ order: 3, type: 'tube', query: { query: { route: 'bakerloo' } } });
        } else {
          commuteOptions.push({ order: 1, type: 'bus', query: { query: { route: '161', atHome } } });
        }
        break;
      default:
        logger.info('getCommute: User not supported.');
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, false, 'User not supported');
          next();
        } else {
          return 'User not supported';
        }
    }

    await Promise.all(commuteOptions.map(async (commuteOption) => {
      switch (commuteOption.type) {
        case 'bus':
          tmpResults = await nextbus(commuteOption.query, null, next);
          if (tmpResults.disruptions === 'true') anyDisruptions = 'true';
          tmpResults.order = commuteOption.order;
          commuteResults.push(tmpResults);
          break;
        case 'tube':
          tmpResults = await tubeStatus(commuteOption.query, null, next);
          if (tmpResults.disruptions === 'true') anyDisruptions = 'true';
          tmpResults.order = commuteOption.order;
          commuteResults.push(tmpResults);
          break;
        case 'train':
          tmpResults = await nextTrain(commuteOption.query, null, next);
          if (tmpResults.disruptions === 'true') anyDisruptions = 'true';
          tmpResults.order = commuteOption.order;
          commuteResults.push(tmpResults);
          break;
        default:
          break;
      }
    }));

    // Order commute options correctly
    commuteResults.sort((a, b) => a.order - b.order);

    returnJSON = {
      anyDisruptions,
      commuteResults,
    };

    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, returnJSON);
      next();
    } else {
      return returnJSON;
    }
  } else {
    logger.error('getCommute: No user was supplied.');
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, false, 'No user was supplied.');
      next();
    } else {
      return 'No user was supplied';
    }
  }
  return null;
}
skill.get('/getcommute', getCommute);

module.exports = skill;
