/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('../../lib/helper.js');
const dateFormat = require('dateformat');

const skill = new Skills();

/**
 * @api {put} /travel/tubestatus Get tube status
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

  const { TFLAPIKey } = process.env;

  let { route } = req.body;
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
    const url = `https://api.tfl.gov.uk/Line/${route}/Disruption?${TFLAPIKey}`;
    serviceHelper.log('trace', 'tubeStatus', url);
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
skill.put('/tubestatus', tubeStatus);

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
 * @api {put} /travel/nexttrain Get next train information
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
  serviceHelper.log('trace', 'nextTrain', 'nextTrain API called');

  const { transportapiKey } = process.env;

  let trainroute = req.body.route;
  let url = `https://transportapi.com/v3/uk/train/station/CTN/live.json?${transportapiKey}&darwin=false&train_status=passenger&destination=`;
  let returnJSON;
  let disruptions = 'false';
  let destination = '';
  let firstTime = 'N/A';
  let firstNotes;
  let secondTime = 'N/A';
  let secondNotes;

  if (typeof trainroute === 'undefined' || trainroute === null || trainroute === '') {
    serviceHelper.log('info', 'nextTrain', 'Missing param: route');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: route');
      next();
    }
    return false;
  }

  serviceHelper.log('trace', 'nextTrain', `Check is ${trainroute} is a valid route`);
  trainroute = trainroute.toUpperCase();
  switch (trainroute.toUpperCase()) {
    case 'CST':
      url += trainroute;
      break;
    case 'CHX':
      url += trainroute;
      break;
    default:
      serviceHelper.log('trace', 'nextTrain', `Train route ${trainroute} is not supported`);
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, false, `Train route ${trainroute} is not currently supported`);
        next();
      }
      return false;
  }

  try {
    serviceHelper.log('trace', 'nextTrain', 'Get data from TFL');
    serviceHelper.log('trace', 'nextTrain', url);
    let apiData = await serviceHelper.requestAPIdata(url);
    apiData = apiData.body;
    if (serviceHelper.isEmptyObject(apiData)) {
      serviceHelper.log('error', 'nextTrain', 'No data was returned from the call to the TFL API');
      serviceHelper.sendResponse(res, false, 'No data was returned from the call to the TFL API');
      next();
      return false;
    }
    const trainsWorking = apiData.departures.all;
    if (serviceHelper.isEmptyObject(trainsWorking)) {
      serviceHelper.log('error', 'nextTrain', 'No train departure data was returned from the call to the TFL API');
      disruptions = 'true';
    } else {
      let trainData = apiData.departures.all;
      serviceHelper.log('trace', 'nextTrain', 'Filter to only have London bound trains');
      trainData = trainData.filter(a => a.platform === '1');
      serviceHelper.log('trace', 'nextTrain', 'Sort by arrival time');
      trainData = trainData.sort(serviceHelper.GetSortOrder('best_arrival_estimate_mins'));
      let numberOfElements = trainData.length;
      if (numberOfElements > 2) { numberOfElements = 2; }
      switch (numberOfElements) {
        case 2:
          if (trainData[0].status.toLowerCase() === 'it is currently off route' || trainData[0].status.toLowerCase() === 'cancelled') {
            serviceHelper.log('trace', 'nextTrain', '1st train cancelled');
            disruptions = 'true';
            destination = trainData[0].destination_name;
            firstTime = serviceHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60);
            firstNotes = 'Cancelled';
          } else {
            serviceHelper.log('trace', 'nextTrain', '1st train ok');
            destination = trainData[0].destination_name;
            firstTime = serviceHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60);
            firstNotes = trainData[0].status.toLowerCase();
          }
          if (trainData[1].status.toLowerCase() === 'it is currently off route' || trainData[1].status.toLowerCase() === 'cancelled') {
            serviceHelper.log('trace', 'nextTrain', '2nd train cancelled');
            secondTime = serviceHelper.minutesToStop(trainData[1].best_arrival_estimate_mins * 60);
            secondNotes = 'Cancelled';
          } else {
            serviceHelper.log('trace', 'nextTrain', '2nd train ok');
            secondTime = serviceHelper.minutesToStop(trainData[1].best_arrival_estimate_mins * 60);
            secondNotes = trainData[1].status.toLowerCase();
          }
          break;
        default:
          serviceHelper.log('trace', 'nextTrain', 'Only one train came back in data');
          destination = trainData[0].destination_name;
          firstTime = serviceHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60);
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
      serviceHelper.sendResponse(res, true, returnJSON);
      next();
    } else {
      return returnJSON;
    }
  } catch (err) {
    serviceHelper.log('error', 'nextTrain', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, false, err);
      next();
    } else {
      return err;
    }
    return false;
  }
  return true;
}
skill.put('/nexttrain', nextTrain);


/**
 * @api {put} /travel/planJourney Plan journey from A to B
 * @apiName planJourney
 * @apiGroup Travel
 *
 * @apiParam {String} startPoint Where journey will start from
 * @apiParam {String} stopPoint Where journey will end
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *   "sucess": "true",
 *   "data": {
 *      "$type": "Tfl.Api.Presentation.Entities.JourneyPlanner.....",
 *      "journeys": [
 *        {
 *           .....
 *        }
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
async function planJourney(req, res, next) {
  serviceHelper.log('trace', 'planJourney', 'planJourney API called');

  const { TFLAPIKey } = process.env;
  const {
    startPoint, stopPoint, trainBusOverride, trainTubeOverride, trainWalkOverride,
  } = req.body;

  serviceHelper.log('trace', 'planJourney', 'Check params are ok');
  if (typeof startPoint === 'undefined' || startPoint === null || startPoint === '') {
    serviceHelper.log('info', 'planJourney', 'Missing param: startPoint');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: startPoint');
      next();
    }
    return false;
  }

  if (typeof stopPoint === 'undefined' || stopPoint === null || stopPoint === '') {
    serviceHelper.log('info', 'planJourney', 'Missing param: stopPoint');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: stopPoint');
      next();
    }
    return false;
  }

  serviceHelper.log('trace', 'planJourney', 'Add any default overrides');
  let url = `https://api.tfl.gov.uk/journey/journeyresults/${startPoint}/to/${stopPoint}?${TFLAPIKey}`;
  if (trainBusOverride) url += '&mode=national-rail,bus';
  if (trainTubeOverride) url += '&mode=national-rail,tube';
  if (trainWalkOverride) url += '&mode=national-rail,walking';
  // Param to think about - journeyPreference=LeastTime&

  // Add a 5 minute delay so that results fro TFL are not shown in the past
  let newTime = new Date();
  newTime.setMinutes(newTime.getMinutes() + 5);
  newTime = dateFormat(newTime, 'HHMM');
  url += `&time=${newTime}`;

  try {
    serviceHelper.log('trace', 'planJourney', 'Get data from TFL');
    serviceHelper.log('trace', 'planJourney', url);
    let apiData = await serviceHelper.requestAPIdata(url);
    apiData = apiData.body;
    if (serviceHelper.isEmptyObject(apiData)) {
      serviceHelper.log('error', 'planJourney', 'No data was returned from the call to the TFL API');
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, false, 'No data was returned from the call to the TFL API');
        next();
      }
      return false;
    }
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, true, apiData);
      next();
    }
    return apiData;
  } catch (err) {
    serviceHelper.log('error', 'planJourney', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, false, err);
      next();
    }
    return err;
  }
}
skill.put('/planjourney', planJourney);

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
 *     sucess: 'true'
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
async function getCommute(req, res, next) {
  serviceHelper.log('trace', 'getCommute', 'getCommute API called');

  const commuteOptions = [];
  const commuteResults = [];
  const {
    user, lat, long, walk,
  } = req.body;

  let anyDisruptions = false;
  let tmpResults = [];
  let atHome = true;

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
      if (atHome) {
        serviceHelper.log('trace', 'getCommute', 'Current location is close to home');
        commuteOptions.push({ order: 0, type: 'journey', query: { body: { startPoint: `${lat},${long}`, stopPoint: process.env.FranWorkPostCode, trainWalkOverride: true } } });
      } else {
        serviceHelper.log('trace', 'getCommute', 'Current location is not at home');
        commuteOptions.push({ order: 0, type: 'journey', query: { body: { startPoint: `${lat},${long}`, stopPoint: process.env.HomePostCode, tubeTrainOverride: true } } });
      }
      break;
    case 'JP':
      serviceHelper.log('trace', 'getCommute', 'User is JP');
      if (atHome) {
        serviceHelper.log('trace', 'getCommute', 'Current location is close to home');
        if (walk === 'true') {
          serviceHelper.log('trace', 'getCommute', 'Walk option selected');
          commuteOptions.push({ order: 0, type: 'journey', query: { body: { startPoint: `${lat},${long}`, stopPoint: 1001276 } } });
        } else {
          commuteOptions.push({ order: 0, type: 'journey', query: { body: { startPoint: `${lat},${long}`, stopPoint: process.env.JPWorkPostCode } } });
        }
      } else {
        serviceHelper.log('trace', 'getCommute', 'Current location is not at home');
        const atJPWork = serviceHelper.inJPWorkGeoFence(lat, long);
        if (walk === 'true' && atJPWork) {
          serviceHelper.log('trace', 'getCommute', 'Walk from work option selected');
          commuteOptions.push({ order: 0, type: 'journey', query: { body: { startPoint: process.env.JPWalkHomeStart, stopPoint: process.env.HomePostCode } } });
        } else {
          commuteOptions.push({ order: 0, type: 'journey', query: { body: { startPoint: `${lat},${long}`, stopPoint: process.env.HomePostCode } } });
        }
      }
      serviceHelper.log('trace', 'getCommute', JSON.stringify(commuteOptions));
      break;
    default:
      serviceHelper.log('trace', 'getCommute', `User ${user} is not supported`);
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, false, `User ${user} is not supported`);
        next();
      }
      return false;
  }

  await Promise.all(commuteOptions.map(async (commuteOption) => {
    switch (commuteOption.type) {
      case 'journey':
        tmpResults = await planJourney(commuteOption.query, null, next);
        let j = 0;
        tmpResults.journeys.forEach((journey) => {
          let l = 0;
          journey.legs.forEach((leg) => {
            let d = 0;
            leg.disruptions.forEach((disruption) => {
              if (disruption.type === 'routeInfo') {
                delete tmpResults.journeys[j].legs[l].disruptions[d];
              } else anyDisruptions = 'true';
              d += 1;
            });
            l += 1;
          });
          j += 1;
        });
        tmpResults.order = commuteOption.order;
        commuteResults.push(tmpResults);
        break;
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
  serviceHelper.log('trace', 'getCommute', 'Order commute options');
  commuteResults.sort((a, b) => a.order - b.order);

  const returnJSON = {
    anyDisruptions,
    commuteResults,
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
