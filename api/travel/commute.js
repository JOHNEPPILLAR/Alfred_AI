/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;

/**
 * Import helper libraries
 */
const serviceHelper = require('../../lib/helper.js');
const travelHelper = require('./travel.js');

const skill = new Skills();

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
  serviceHelper.log('trace', 'getCommuteStatus API called');

  const { user } = req.query;
  let anyDisruptions = false;

  serviceHelper.log('trace', 'Checking for params');
  if (typeof user === 'undefined' || user === null || user === '') {
    serviceHelper.log('info', 'Missing param: user');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: user');
      next();
    }
    return false;
  }

  let apiData;
  switch (user.toUpperCase()) {
    case 'FRAN':
      serviceHelper.log('trace', 'User is Fran');
      try {
        serviceHelper.log('trace', 'Get train status');
        apiData = await travelHelper.trainStatus({ body: { fromStation: 'CTN', toStation: 'CHX' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        apiData = await travelHelper.trainStatus({ body: { fromStation: 'CHX', toStation: 'CTN' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        apiData = await travelHelper.tubeStatus({ body: { line: 'Piccadilly' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        const returnJSON = { anyDisruptions };
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
    case 'JP':
      serviceHelper.log('trace', 'User is JP');
      try {
        serviceHelper.log('trace', 'Get train status');
        apiData = await travelHelper.trainStatus({ body: { fromStation: 'CTN', toStation: 'LBG' } }, null, next);
        if (apiData instanceof Error === false) {
          if (apiData.disruptions === 'true') anyDisruptions = true;
        } else {
          anyDisruptions = true;
        }
        apiData = await travelHelper.trainStatus({ body: { fromStation: 'LBG', toStation: 'CTN' } }, null, next);
        if (apiData instanceof Error === false) {
          if (apiData.disruptions === 'true') anyDisruptions = true;
        } else {
          anyDisruptions = true;
        }
        const returnJSON = { anyDisruptions };
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
    default:
      break;
  }
  return true;
}
skill.get('/getcommutestatus', getCommuteStatus);

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
function returnCommuteError(message, req, res, next) {
  const legs = [];
  const journeys = [];
  legs.push({
    mode: 'error',
    disruptions: 'true',
    status: message,
  });
  serviceHelper.log('trace', message);
  journeys.push({ legs });
  const returnJSON = { journeys };
  if (typeof res !== 'undefined' && res !== null) {
    serviceHelper.sendResponse(res, true, returnJSON);
    next();
  }
}

async function getCommute(req, res, next) {
  serviceHelper.log('trace', 'getCommute API called');

  const {
    user, lat, long,
  } = req.query;
  const journeys = [];

  let apiData;
  let atHome = true;
  const atJPWork = false;
  const busLeg = {};
  const walkLeg = {};
  const walkToUndergroundLeg = {};
  const tubeLeg = {};

  serviceHelper.log('trace', 'Checking for params');
  if (typeof user === 'undefined' || user === null || user === '') {
    serviceHelper.log('info', 'Missing param: user');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: user');
      next();
    }
    return false;
  }

  if ((typeof lat === 'undefined' && lat === null && lat === '')
        || (typeof long === 'undefined' && long === null && long === '')) {
    serviceHelper.log('info', 'Missing param: lat/long');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: lat/long');
      next();
    }
    return false;
  }

  serviceHelper.log('trace', 'Find out if caller is at home location');
  atHome = serviceHelper.inHomeGeoFence(lat, long);

  switch (user.toUpperCase()) {
    case 'FRAN':
      serviceHelper.log('trace', 'User is Fran');
      //
      // *** TO DO ***
      //
      break;
    case 'JP':
      serviceHelper.log('trace', 'User is JP');
      if (atHome) {
        serviceHelper.log('trace', 'Current location is close to home');

        serviceHelper.log('trace', 'Checking train and tube status');
        const trainData = await travelHelper.trainStatus({ body: { fromStation: 'CTN', toStation: 'LBG' } }, null, next);

        // trainData.disruptions = 'true' // Force to debug and see what tube would look like 

        // Work out main commute
        if (trainData.disruptions === 'false') {
          // Add train leg
          apiData = await travelHelper.nextTrain({
            body: {
              fromStation: 'CTN', toStation: 'LBG', departureTimeOffSet: '00:05',
            },
          }, null, next);
          if (apiData instanceof Error || apiData === false) {
            returnCommuteError('Error occured working out commute', req, res, next);
            return false;
          }

          const legs = [];
          legs.push(apiData[0]);
          serviceHelper.log('trace', 'Add train leg');

          // Add walking leg
          walkLeg.mode = 'walk';
          walkLeg.line = 'Person';
          walkLeg.disruptions = 'false';
          walkLeg.duration = '25';
          walkLeg.departureTime = apiData[0].arrivalTime;
          walkLeg.departureStation = 'London Bridge';
          walkLeg.arrivalTime = serviceHelper.addTime(walkLeg.departureTime, walkLeg.duration);
          walkLeg.arrivalStation = 'WeWork';
          serviceHelper.log('trace', 'Add walking leg');
          legs.push(walkLeg);

          journeys.push({ legs });
        } else {
          const tubeData = await travelHelper.tubeStatus({ body: { line: 'Jubilee' } }, null, next);

          if (tubeData.disruptions === 'true') {
            returnCommuteError('There are distriptions on both the trains and Jubilee line', req, res, next);
            return false;
          }

          // Add bus leg
          const legs = [];
          busLeg.mode = 'bus';
          busLeg.line = '486';
          busLeg.disruptions = 'false';
          busLeg.duration = '30';
          busLeg.departureTime = serviceHelper.addTime(null, '00:10');
          busLeg.departureStation = 'Home';
          busLeg.arrivalTime = serviceHelper.addTime(busLeg.departureTime, busLeg.duration);
          busLeg.arrivalStation = 'North Greenwich';
          serviceHelper.log('trace', 'Add bus leg');
          legs.push(busLeg);

          // Add walk to underground leg
          walkToUndergroundLeg.mode = 'walk';
          walkToUndergroundLeg.line = 'Person';
          walkToUndergroundLeg.disruptions = 'false';
          walkToUndergroundLeg.duration = '10';
          walkToUndergroundLeg.departureTime = busLeg.arrivalTime;
          walkToUndergroundLeg.departureStation = 'Change';
          walkToUndergroundLeg.arrivalTime = serviceHelper.addTime(walkToUndergroundLeg.departureTime, walkToUndergroundLeg.duration);
          walkToUndergroundLeg.arrivalStation = 'Underground';
          serviceHelper.log('trace', 'Add walking leg');
          legs.push(walkToUndergroundLeg);

          // Add tube leg
          apiData = await travelHelper.nextTube({
            body: {
              line: 'Jubilee', startID: '940GZZLUNGW', endID: '940GZZLULNB',
            },
          }, null, next);

          tubeLeg.mode = apiData.mode;
          tubeLeg.line = apiData.line;
          tubeLeg.disruptions = apiData.disruptions;
          tubeLeg.duration = apiData.duration;
          tubeLeg.departureTime = walkToUndergroundLeg.arrivalTime;
          tubeLeg.departureStation = busLeg.arrivalStation;
          tubeLeg.arrivalTime = serviceHelper.addTime(walkToUndergroundLeg.arrivalTime, tubeLeg.duration);
          tubeLeg.arrivalStation = apiData.arrivalStation;
          legs.push(tubeLeg);

          // Add walking leg
          walkLeg.mode = 'walk';
          walkLeg.line = 'Person';
          walkLeg.disruptions = 'false';
          walkLeg.duration = '25';
          walkLeg.departureTime = tubeLeg.arrivalTime;
          walkLeg.departureStation = 'London Bridge';
          walkLeg.arrivalTime = serviceHelper.addTime(walkLeg.departureTime, walkLeg.duration);
          walkLeg.arrivalStation = 'WeWork';
          serviceHelper.log('trace', 'Add walking leg');
          legs.push(walkLeg);

          journeys.push({ legs });
        }
      }

      if (atJPWork) {
        serviceHelper.log('trace', 'Current location is close to work');
        const legs = [];

        // Add walking leg
        walkLeg.mode = 'walk';
        walkLeg.line = 'Person';
        walkLeg.disruptions = 'false';
        walkLeg.duration = '25';
        walkLeg.departureTime = serviceHelper.addTime(null, '00:05');
        walkLeg.departureStation = 'WeWork';
        walkLeg.arrivalTime = serviceHelper.addTime(walkLeg.departureTime, walkLeg.duration);
        walkLeg.arrivalStation = 'London Bridge';
        serviceHelper.log('trace', 'Add walking leg');
        legs.push(walkLeg);

        // Add train leg
        serviceHelper.log('trace', 'Check train status');
        const trainData = await travelHelper.trainStatus({ body: { fromStation: 'LBG', toStation: 'CTN' } }, null, next);
        if (trainData.disruptions === 'false') {
          const timeOffset = serviceHelper.timeDiff(null, walkLeg.arrivalTime, null, true);
          apiData = await travelHelper.nextTrain({
            body: {
              fromStation: 'LBG', toStation: 'CTN', departureTimeOffSet: timeOffset,
            },
          }, null, next);

          if (apiData instanceof Error || apiData === false) {
            returnCommuteError('Error occured working out commute', req, res, next);
            return false;
          }

          legs.push(apiData[0]);
          serviceHelper.log('trace', 'Add train leg');
          journeys.push({ legs });
        } else {
          serviceHelper.log('trace', 'Calc backup journey, check train status');
          const tubeData = await travelHelper.tubeStatus({ body: { line: 'Jubilee' } }, null, next);

          if (tubeData.disruptions === 'true') {
            returnCommuteError('There are distriptions on both the trains and Jubilee line', req, res, next);
            return false;
          }

          // Add tube leg
          apiData = await travelHelper.nextTube({
            body: {
              line: 'Jubilee', startID: '940GZZLULNB', endID: '940GZZLUNGW',
            },
          }, null, next);

          tubeLeg.mode = apiData.mode;
          tubeLeg.line = apiData.line;
          tubeLeg.disruptions = apiData.disruptions;
          tubeLeg.duration = apiData.duration;
          tubeLeg.departureTime = walkLeg.arrivalTime;
          tubeLeg.departureStation = walkLeg.arrivalStation;
          tubeLeg.arrivalTime = serviceHelper.addTime(tubeLeg.departureTime, tubeLeg.duration);
          tubeLeg.arrivalStation = apiData.arrivalStation;
          legs.push(tubeLeg);

          // Add bus leg
          busLeg.mode = 'bus';
          busLeg.line = '486';
          busLeg.disruptions = 'false';
          busLeg.duration = '30';
          busLeg.departureTime = serviceHelper.addTime(tubeLeg.arrivalTime, '00:10');
          busLeg.departureStation = 'North Greenwich';
          busLeg.arrivalTime = serviceHelper.addTime(busLeg.departureTime, busLeg.duration);
          busLeg.arrivalStation = 'Home';
          serviceHelper.log('trace', 'Add bus leg');
          legs.push(busLeg);

          journeys.push({ legs });
        }
      }

      if (!atHome && !atJPWork) {
        serviceHelper.log('trace', 'Add not at home or work');
        if (typeof res !== 'undefined' && res !== null) {
          returnCommuteError('Unable to calculate commute due to starting location', req, res, next);
        }
        return false;
      }
      break;
    default:
      serviceHelper.log('error', `User ${user} is not supported`);
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, 400, `User ${user} is not supported`);
        next();
      }
      return false;
  }

  serviceHelper.log('trace', 'Send data back to caller');
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
skill.get('/getcommute', getCommute);

module.exports = {
  skill,
  getCommuteStatus,
  getCommute,
};
