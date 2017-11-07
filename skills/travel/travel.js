/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');

const skill = new Skills();

/**
 * @api {get} /travel/nextbus Get next bus information
 * @apiName nextbus
 * @apiGroup Travel
 *
 * @apiParam {String} bus_route Bus route i.e. 380
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
 *     data: "The next 380 to Blackheath Village will arrive in ........"
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
  logger.info('Next Bus API called');

  const tflapiKey = process.env.tflapikey;
  const busroute = req.query.bus_route;
  let url;
  let textResponse;

  if (typeof busroute !== 'undefined' && busroute !== null) {
    switch (busroute) {
      case '380':
        url = `https://api.tfl.gov.uk/StopPoint/490013012S/Arrivals?mode=bus&line=380&${tflapiKey}`;
        break;
      default:
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, false, 'Bus route not supported'); // Send response back to caller
        }
        logger.info('nextbus: Bus route not supported');
        next();
        return 'Bus route not supported';
    }
  } else {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, false, 'Missing route param'); // Send response back to caller
    }
    logger.info('nextbus: Missing route param');
    next();
    return 'nextbus: Missing route param';
  }

  try {
    // Get the bus data
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
          textResponse = `The next ${busData[0].lineName} to ${busData[0].towards} will arrive ${alfredHelper.minutesToStop(busData[0].timeToStation)
          }. The second bus to arrive will be ${alfredHelper.minutesToStop(busData[1].timeToStation)}`;
          break;
        default:
          textResponse = `The next ${busData[0].lineName} to ${busData[0].towards} will arrive ${alfredHelper.minutesToStop(busData[0].timeToStation)}`;
          break;
      }
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, true, textResponse); // Send response back to caller
      }
      next();
      return textResponse;
    }
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, false, err); // Send response back to caller
    }
    logger.error(`nextbus: ${err}`);
    return err;
  }
  return null;
}
skill.get('/nextbus', nextbus);

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
 *     sucess: 'true'
 *     data: {
 *       "disruptions": false,
 *       "message": "There are no disruptions currently reported on the 380 bus"
 *     }
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
  logger.info('Bus & Tube Status API called');

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
 * @api {get} /travel/nexttrain Get next train information
 * @apiName nexttrain
 * @apiGroup Travel
 *
 * @apiParam {String} train_destination Destination station i.e. CHX
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
 *     data: "The first train to London Cannon Street will arrive in ......"
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function nexttrain(req, res, next) {
  logger.info('Next Train API called');

  const { transportapiKey } = process.env;
  let trainroute = req.query.train_destination;
  let url = `https://transportapi.com/v3/uk/train/station/CTN/live.json?${transportapiKey}&darwin=false&train_status=passenger&destination=`;
  let returnJSON;
  let disruptions = 'false';
  let firstDestination;
  let firstTrainTime;
  let firstTrainNotes;
  let secondDestination;
  let secondTrainTime;
  let secondTrainNotes;

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
                firstDestination = trainData[0].destination_name;
                firstTrainTime = alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60);
                firstTrainNotes = 'Cancelled';
              } else {
                firstDestination = trainData[0].destination_name;
                firstTrainTime = alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60);
                firstTrainNotes = trainData[0].status.toLowerCase();
              }
              if (trainData[1].status.toLowerCase() === 'it is currently off route' || trainData[1].status.toLowerCase() === 'cancelled') {
                secondDestination = trainData[1].destination_name;
                secondTrainTime = alfredHelper.minutesToStop(trainData[1].best_arrival_estimate_mins * 60);
                secondTrainNotes = 'Cancelled';
              } else {
                secondDestination = trainData[1].destination_name;
                secondTrainTime = alfredHelper.minutesToStop(trainData[1].best_arrival_estimate_mins * 60);
                secondTrainNotes = trainData[1].status.toLowerCase();
              }
              break;
            default:
              firstDestination = trainData[0].destination_name;
              firstTrainTime = alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60);
              firstTrainNotes = trainData[0].status.toLowerCase();
          }
        }

        returnJSON = {
          disruptions,
          firstDestination,
          firstTrainTime,
          firstTrainNotes,
          secondDestination,
          secondTrainTime,
          secondTrainNotes,
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
 *     data: "The first train to London Cannon Street will arrive in ......"
 *   }
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
  let trainDestination;
  let tubeLine;
  let backupTubeLine
  let trainJSON;
  let tubeJSON;
  let backupTubeJSON;
  let returnJSON;

  if (typeof user !== 'undefined' && user !== null) {
    switch (user.toUpperCase()) {
      case 'FRAN':
        trainDestination = { query: { train_destination: 'CST' } };
        tubeLine = { query: { route: 'district' } };
        backupTubeLine = { query: { route: 'hammersmith-city' } };
        break;
      case 'JP':
        trainDestination = { query: { train_destination: 'CHX' } };
        tubeLine = { query: { route: 'bakerloo' } };
        backupTubeLine = { query: { route: 'jubilee' } };
        break;
      default:
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, false, 'User not supported');
        }
        logger.info('getCommute: User not supported.');
        next();
        return 'User not supported';
    }

    // Get next train
    trainJSON = await nexttrain(trainDestination, null, next);

    // Get tube status
    tubeJSON = await bustubestatus(tubeLine, null, next);

    // Get backup tube route
    backupTubeJSON = await bustubestatus(backupTubeLine, null, next);
    
    returnJSON = {
      train: trainJSON,
      tube: tubeJSON,
      backup: backupTubeJSON
    };


    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, returnJSON);
    }
    next();
    return returnJSON;
  } else {
    logger.error('getCommute: No user was supplied.');
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, false, 'No user was supplied.');
      next();
    }
    return 'No user was supplied';
  }
}
skill.get('/getcommute', getCommute);

module.exports = skill;
