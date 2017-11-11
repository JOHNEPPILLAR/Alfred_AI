/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');

const skill = new Skills();

/**
 * @api {get} /travel/bustubestatus Get bus or tube status
 * @apiName bustubestatus
 * @apiGroup Travel
 *
 * @apiParam {String} route Train line or bus number i.e. Circle line or 380
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
async function bustubestatus(req, res, next) {
  if (typeof res !== 'undefined' && res !== null) {
    logger.info('Bus & Tube Status API called');
  }

  const { route } = req.query;
  let disruptions = 'false';
  let returnJSON;

  if (typeof route !== 'undefined' && route !== null) {
    const url = `https://api.tfl.gov.uk/Line/${route}`;
    try {
      let apiData = await alfredHelper.requestAPIdata(url);
      apiData = apiData.body;
      if (alfredHelper.isEmptyObject(apiData)) {
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, false, 'No data was returned from the TFL API call');
          next();
        }
        logger.info('bustubestatus - Failure, no data was returned from the TFL API call');
      } else {
        if (alfredHelper.isEmptyObject(apiData[0].disruptions)) {
          disruptions = 'false';
        } else {
          disruptions = apiData[0].disruptions;
        }
        returnJSON = {
          mode: apiData[0].modeName,
          line: apiData[0].name,
          disruptions,
        };
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, true, returnJSON); // Send response back to caller
          next();
        }
        return returnJSON;
      }
    } catch (err) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, null, err); // Send response back to caller
        next();
      }
      logger.error(`bustubestatus: ${err}`);
      return err;
    }
  } else {
    logger.info('bustubestatus: Missing route param');
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, false, 'Missing route param'); // Send response back to caller
      next();
    }
  }
  return null;
}
skill.get('/bustubestatus', bustubestatus);


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
  if (typeof res !== 'undefined' && res !== null) {
    logger.info('Next Bus API called');
  }

  const tflapiKey = process.env.tflapikey;
  const busroute = req.query.route;
  let url;
  let returnJSON;

  if (typeof busroute !== 'undefined' && busroute !== null) {
    switch (busroute) {
      case '380':
        url = `https://api.tfl.gov.uk/StopPoint/490013012S/Arrivals?mode=bus&line=380&${tflapiKey}`;
        break;
      case '486':
        url = `https://api.tfl.gov.uk/StopPoint/490001058H/Arrivals?mode=bus&line=486&${tflapiKey}`;
        break;
      default:
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, false, 'Bus route not supported'); // Send response back to caller
          next();
        }
        logger.info('nextbus: Bus route not supported');
        return null;
        break;
    }
  } else {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, false, 'Missing route param'); // Send response back to caller
      next();
    }
    logger.info('nextbus: Missing route param');
  }

  try {
    // Get the bus data
    const params = { query: { route: busroute } };
    const distruptionsJSON = await bustubestatus(params, null, next);

    let apiData = await alfredHelper.requestAPIdata(url);
    apiData = apiData.body;
    if (alfredHelper.isEmptyObject(apiData)) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', 'No data was returned from the call to the TFL API');
      }
      logger.info('nextbus: No data was returned from the TFL API call');
      next();
    } else {
      let numberOfElements = apiData.length;
      if (numberOfElements > 2) { numberOfElements = 2; }
      const busData = apiData.sort(alfredHelper.GetSortOrder('timeToStation'));

      switch (numberOfElements) {
        case 2:
          returnJSON = {
            mode: 'bus',
            line: busData[0].lineName,
            destination: busData[0].towards,
            firstTime: alfredHelper.minutesToStop(busData[0].timeToStation),
            secondTime: alfredHelper.minutesToStop(busData[1].timeToStation),
            disruptions: distruptionsJSON.disruptions,
          };
          break;
        default:
          returnJSON = {
            mode: 'bus',
            line: busData[0].lineName,
            destination: busData[0].towards,
            firstTime: alfredHelper.minutesToStop(busData[0].timeToStation),
            disruptions: distruptionsJSON.disruptions,
          };
          break;
      }
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, true, returnJSON); // Send response back to caller
        next();
      }
      return returnJSON;
    }
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, false, err); // Send response back to caller
      next();
    }
    logger.error(`nextbus: ${err}`);
    return err;
  }
  return null;
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
async function nexttrain(req, res, next) {
  if (typeof res !== 'undefined' && res !== null) {
    logger.info('Next Train API called');
  }

  const { transportapiKey } = process.env;
  let trainroute = req.query.route;
  let url = `https://transportapi.com/v3/uk/train/station/CTN/live.json?${transportapiKey}&darwin=false&train_status=passenger&destination=`;
  let returnJSON;
  let disruptions = 'false';
  let destination;
  let firstTime;
  let firstNotes;
  let secondTime;
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
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, false, 'Train route not supported');
        }
        logger.info('Nexttrain: Train destination not supported.');
        next();
        return 'Train route not supported';
    }

    try {
      let apiData = await alfredHelper.requestAPIdata(url);
      apiData = apiData.body;
      if (alfredHelper.isEmptyObject(apiData)) {
        alfredHelper.sendResponse(res, false, 'No data was returned from the train API call');
        logger.info('nexttrain: No data was returned from the train API call.');
        next();
      } else {
        const trainsWorking = apiData.departures.all;
        if (alfredHelper.isEmptyObject(trainsWorking)) {
          disruptions = 'true';
        } else {
          let trainData = apiData.departures.all;
          let numberOfElements = trainData.length;
          if (numberOfElements > 2) { numberOfElements = 2; }
          trainData = trainData.filter(a => a.platform === '1');
          trainData = trainData.sort(alfredHelper.GetSortOrder('best_arrival_estimate_mins'));
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
        }
        return returnJSON;
      }
    } catch (err) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, null, err); // Send response back to caller
        next();
      }
      logger.error(`nexttrain: ${err}`);
      return err;
    }
  } else {
    logger.error('nexttrain: No train route was supplied.');
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, false, 'No train route was supplied.');
      next();
    }
    return 'No train route was supplied';
  }
  return null;
}
skill.get('/nexttrain', nexttrain);

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
 *       "part1": {
 *           "mode": "train",
 *           "disruptions": "false",
 *           "firstDestination": "London Charing Cross",
 *           "firstTime": "7:47 PM",
 *           "firstNotes": "late",
 *           "secondDestination": "London Charing Cross",
 *           "secondTime": "8:16 PM",
 *           "secondNotes": "on time"
 *       },
 *       "part2": {
 *           "mode": "tube",
 *           "line": "Bakerloo",
 *           "disruptions": "false"
 *       },
 *       "part3": {
 *           "mode": "bus",
 *           "line": "486",
 *           "destination": "North Greenwich",
 *           "firstTime": "7:52 PM",
 *           "secondTime": "8:03 PM",
 *           "disruptions": "false"
 *       },
 *       "part4": {
 *           "mode": "tube",
 *           "line": "Jubilee",
 *           "disruptions": "false"
 *       }
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

  const { user } = req.query;
  let part1;
  let part2;
  let part3;
  let part4;
  let part1JSON;
  let part2JSON;
  let part3JSON;
  let part4JSON;
  let returnJSON;

  if (typeof user !== 'undefined' && user !== null) {
    switch (user.toUpperCase()) {
      case 'FRAN':
        part1 = { query: { route: 'CST' } };
        part1JSON = await nexttrain(part1, null, next);
        part2 = { query: { route: 'district' } };
        part2JSON = await bustubestatus(part2, null, next);
        part3 = { query: { route: 'hammersmith-city' } };
        part3JSON = await bustubestatus(part3, null, next);
        break;
      case 'JP':
        part1 = { query: { route: 'CHX' } };
        part1JSON = await nexttrain(part1, null, next);
        part2 = { query: { route: 'bakerloo' } };
        part2JSON = await bustubestatus(part2, null, next);
        part3 = { query: { route: '486' } };
        part3JSON = await nextbus(part3, null, next);
        part4 = { query: { route: 'jubilee' } };
        part4JSON = await bustubestatus(part4, null, next);
        break;
      default:
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, false, 'User not supported');
        }
        logger.info('getCommute: User not supported.');
        next();
        return 'User not supported';
    }

    returnJSON = {
      part1: part1JSON,
      part2: part2JSON,
      part3: part3JSON,
      part4: part4JSON,
    };


    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, returnJSON);
    }
    next();
    return returnJSON;
  }
  logger.error('getCommute: No user was supplied.');
  if (typeof res !== 'undefined' && res !== null) {
    alfredHelper.sendResponse(res, false, 'No user was supplied.');
    next();
  }
  return 'No user was supplied';
}
skill.get('/getcommute', getCommute);

module.exports = skill;
