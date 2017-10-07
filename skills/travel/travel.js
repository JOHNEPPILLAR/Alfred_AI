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
 * @apiParam {Boolean} raw [ true, false ] Return raw json, not text
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
  let raw = true;
  let textResponse;

  if (typeof req.query.raw !== 'undefined' && req.query.raw !== null) {
    switch (req.query.raw) {
      case 'true':
        raw = true;
        break;
      case 'false':
        raw = false;
        break;
      default:
        raw = false;
        break;
    }
  }

  if (typeof route !== 'undefined' && route !== null) {
    const url = `https://api.tfl.gov.uk/Line/${route}`;
    try {
      // Get the bus data
      let apiData = await alfredHelper.requestAPIdata(url);
      apiData = apiData.body;
      if (alfredHelper.isEmptyObject(apiData)) {
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, false, 'No data was returned from the TFL API call');
        }
        logger.info('bustubestatus - Failure, no data was returned from the TFL API call');
        next();
      } else {
        if (alfredHelper.isEmptyObject(apiData[0].disruptions)) {
          textResponse = `There are no disruptions currently reported on the ${apiData[0].name}`;
          if (apiData[0].modeName === 'tube') {
            textResponse = `${textResponse} line`;
          } else {
            textResponse = `${textResponse} bus`;
          }
          if (raw) {
            textResponse = { disruptions: false, message: textResponse };
          }
        } else {
          textResponse = `There are disruptions reported on the ${apiData[0].name}`;
          if (apiData[0].modeName === 'tube') {
            textResponse = `${textResponse} line`;
          } else {
            textResponse = `${textResponse} bus`;
          }
          if (raw) {
            textResponse = { disruptions: true, message: textResponse, info: apiData[0].disruptions };
          }
        }
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, true, textResponse); // Send response back to caller
        }
        next();
        return textResponse;
      }
    } catch (err) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, null, err); // Send response back to caller
      }
      logger.error(`bustubestatus: ${err}`);
      next();
      return err;
    }
  } else {
    alfredHelper.sendResponse(res, false, 'Missing route param'); // Send response back to caller
    logger.info('bustubestatus: Missing route param');
    next();
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
 * @apiParam {Boolean} raw [ true, false ] Return raw json, not text
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

  const transportapiKey = process.env.transportapiKey;
  let trainroute = req.query.train_destination;
  let url = `https://transportapi.com/v3/uk/train/station/CTN/live.json?${transportapiKey}&darwin=false&train_status=passenger&destination=`;
  let raw = false;
  let disruptions = false;
  let textResponse;

  if (typeof req.query.raw !== 'undefined' && req.query.raw !== null) {
    switch (req.query.raw) {
      case 'true':
        raw = true;
        break;
      case 'false':
        raw = false;
        break;
      default:
        raw = false;
        break;
    }
  }

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
        alfredHelper.sendResponse(res, 'false', 'No data was returned from the train API call');
        logger.info('nexttrain: No data was returned from the train API call.');
        next();
      } else {
        const trainsWorking = apiData.departures.all;
        if (alfredHelper.isEmptyObject(trainsWorking)) {
          textResponse = 'Sorry, there are no trains today! There is a bus replacement serverice in operation';
          disruptions = true;
        } else {
          let trainData = apiData.departures.all;
          let numberOfElements = trainData.length;
          if (numberOfElements > 2) { numberOfElements = 2; }
          trainData = trainData.filter(a => a.platform === '1');
          trainData = trainData.sort(alfredHelper.GetSortOrder('best_arrival_estimate_mins'));
          switch (numberOfElements) {
            case 2:
              textResponse = '';
              if (trainData[0].status.toLowerCase() === 'it is currently off route' || trainData[0].status.toLowerCase() === 'cancelled') {
                disruptions = true;
                textResponse = `The next train due ${alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60)} to ${trainData[0].destination_name} has been cancelled. `;
              } else {
                textResponse = `${textResponse}The first train to ${trainData[0].destination_name} will arrive ${alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60)} and is currently ${trainData[0].status.toLowerCase()}.`;
              }
              if (trainData[1].status.toLowerCase() === 'it is currently off route' || trainData[1].status.toLowerCase() === 'cancelled') {
                disruptions = true;
                textResponse = `${textResponse} The second train due ${alfredHelper.minutesToStop(trainData[1].best_arrival_estimate_mins * 60)} to ${trainData[1].destination_name} has been cancelled. `;
              } else {
                textResponse = `${textResponse} The second train to ${trainData[1].destination_name} will arrive ${alfredHelper.minutesToStop(trainData[1].best_arrival_estimate_mins * 60)} and is currently ${trainData[1].status.toLowerCase()}.`;
              }
              break;
            default:
              textResponse = `The next train is to ${trainData[0].destination_name} and will arrive ${alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60)}. It is currently ${trainData[0].status.toLowerCase()}.`;
          }
        }
        if (raw) { // Overright output for Alexa Skill
          textResponse = { disruptions, message: textResponse };
        }
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, true, textResponse); // Send response back to caller
        }
        next();
        return textResponse;
      }
    } catch (err) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, null, err); // Send response back to caller
      }
      logger.error(`nextbus: ${err}`);
      next();
      return err;
    }
  } else {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, false, 'No train route was supplied.');
    }
    logger.error('nexttrain: No train route was supplied.');
    next();
    return 'No train route was supplied';
  }
  return null;
}
skill.get('/nexttrain', nexttrain);

module.exports = skill;
