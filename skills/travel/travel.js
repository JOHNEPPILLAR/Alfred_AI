/**
 * Setup schedule skill
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');

const skill = new Skills();

/**
 * Skill: next bus
 * Params: bus_route: String
 */
async function nextbus(req, res, next) {
  logger.info('Next Bus API called');

  const tflapiKey = process.env.tflapikey;
  const busroute = req.query.bus_route;
  let validbusroute = true;
  let url;
  let textResponse;

  if (typeof busroute !== 'undefined' && busroute !== null) {
    switch (busroute) {
      case '380':
        url = `https://api.tfl.gov.uk/StopPoint/490013012S/Arrivals?mode=bus&line=380&${tflapiKey}`;
        break;
      default:
        alfredHelper.sendResponse(res, 'false', 'Bus route not supported'); // Send response back to caller
        logger.info('nextbus: Bus route not supported');
        validbusroute = false;
    }
  } else {
    alfredHelper.sendResponse(res, 'false', 'Missing route param'); // Send response back to caller
    logger.info('nextbus: Missing route param');
    validbusroute = false;
  }

  if (validbusroute) {
    try {
      // Get the bus data
      let apiData = await alfredHelper.requestAPIdata(url);
      apiData = apiData.body;
      if (alfredHelper.isEmptyObject(apiData)) {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'false', 'No data was returned from the call to the TFL API');
        logger.info('nextbus: No data was returned from the TFL API call');
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

        // Send response back to caller
        alfredHelper.sendResponse(res, 'true', textResponse);
      }
    } catch (err) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`nextbus: ${err}`);
    }
  }
  next();
}

/**
 * Skill: bus & tube status
 * Params: route: String
 * Params: raw: bool
 */
async function bustubestatus(req, res, next) {
  logger.info('Bus & Tube Status API called');

  const route = req.query.route;
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
        raw = true;
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
        // Send response back to caller
        alfredHelper.sendResponse(res, 'false', 'No data was returned from the TFL API call');
        logger.info('bustubestatus - Failure, no data was returned from the TFL API call');
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
        // Send response back to caller
        alfredHelper.sendResponse(res, 'true', textResponse);
      }
    } catch (err) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`bustubestatus: ${err}`);
    }
  } else {
    alfredHelper.sendResponse(res, 'false', 'Missing route param'); // Send response back to caller
    logger.info('bustubestatus: Missing route param');
  }
  next();
}

/**
 * Skill: next train
 * Params: train destination: String
 */
async function nexttrain(req, res, next) {
  logger.info('Next Train API called');

  const transportapiKey = process.env.transportapiKey;
  let trainroute = req.query.train_destination;
  let validtrainroute = true;
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
        break;
    }
  }

  if (typeof trainroute !== 'undefined' && trainroute !== null) {
    trainroute = trainroute.toUpperCase();
    switch (trainroute) {
      case 'CST':
        url += trainroute;
        break;
      case 'CHX':
        url += trainroute;
        break;
      default:
        // Send response back to caller
        alfredHelper.sendResponse(res, 'false', 'Train route not supported');
        logger.info('Nexttrain: Train destination not supported.');
        validtrainroute = false;
    }

    if (validtrainroute) {
      let apiData = await alfredHelper.requestAPIdata(url);
      apiData = apiData.body;
      if (alfredHelper.isEmptyObject(apiData)) {
        alfredHelper.sendResponse(res, 'false', 'No data was returned from the train API call');
        logger.info('nexttrain: No data was returned from the train API call.');
      } else {
        if (apiData.departures.all[0].mode === 'bus') {
          textResponse = 'Sorry, there are no trains today! There is a bus replacement serverice in operation';
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
                textResponse = `${textResponse}The second train due ${alfredHelper.minutesToStop(trainData[1].best_arrival_estimate_mins * 60)} to ${trainData[1].destination_name} has been cancelled. `;
              } else {
                textResponse = `${textResponse}The second train to ${trainData[1].destination_name} will arrive ${alfredHelper.minutesToStop(trainData[1].best_arrival_estimate_mins * 60)} and is currently ${trainData[1].status.toLowerCase()}.`;
              }
              break;
            default:
              textResponse = `The next train is to ${trainData[0].destination_name} and will arrive ${alfredHelper.minutesToStop(trainData[0].best_arrival_estimate_mins * 60)}. It is currently ${trainData[0].status.toLowerCase()}.`;
          }
        }
        if (raw) { // Overright output for Alexa Skill
          textResponse = { disruptions, message: textResponse };
        }
        // Send response back to caller
        alfredHelper.sendResponse(res, 'true', textResponse);
      }
    }
  } else {
    // Send response back to caller
    alfredHelper.sendResponse(res, 'false', 'No train route was supplied.');
    logger.error('nexttrain: No train route was supplied.');
  }
  next();
}

/**
 * Add skills to server
 */
skill.get('/nextbus', nextbus);
skill.get('/bustubestatus', bustubestatus);
skill.get('/nexttrain', nexttrain);

module.exports = skill;
