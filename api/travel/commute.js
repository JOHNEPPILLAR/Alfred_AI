
/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
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
        apiData = await travelHelper.trainStatus({ body: { fromStation: 'CTN', toStation: 'STP' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        apiData = await travelHelper.trainStatus({ body: { fromStation: 'STP', toStation: 'CTN' } }, null, next);
        if (apiData.disruptions === 'true') anyDisruptions = true;

        apiData = await travelHelper.tubeStatus({ body: { line: 'Northern' } }, null, next);
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
  serviceHelper.log('trace', 'returnCommuteError', 'Add no data to journey');
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
    user, lat, long, walk,
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

  if ((typeof lat === 'undefined' && lat === null && lat === '')
        || (typeof long === 'undefined' && long === null && long === '')) {
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
          apiData = await travelHelper.nextTrain({
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
          serviceHelper.log('trace', 'getCommute', 'Add journey');
          journeys.push({ legs });

          serviceHelper.log('trace', 'getCommute', 'Getting Alt journey');

          serviceHelper.log('trace', 'getCommute', 'Get next trains');
          apiData = await travelHelper.nextTrain({
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

          if (apiData[0].status !== 'No trains running') {
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
              const backupData = await travelHelper.nextTrain({
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
            }

            serviceHelper.log('trace', 'getCommute', 'Add journey');
            journeys.push({ legs });
          }
        } else {
          serviceHelper.log('trace', 'getCommute', 'Non walk option selected');
          apiData = await travelHelper.nextTrain({
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

          if (apiData[0].status === 'No trains running') {
            serviceHelper.log('trace', 'getCommute', 'Add train leg');
            const legs = [];
            legs.push(apiData[0]);
            serviceHelper.log('trace', 'getCommute', 'Add journey');
            journeys.push({ legs });
          } else {
            const backupData = await travelHelper.nextTube({
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
      }

      atJPWork = serviceHelper.inJPWorkGeoFence(lat, long);
      if (atJPWork) {
        serviceHelper.log('trace', 'getCommute', 'Current location is close to work');
        if (walk === 'true') {
          serviceHelper.log('trace', 'getCommute', 'Walk option selected');
          let legs = [];
          apiData = await travelHelper.nextTrain({
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

          apiData = await travelHelper.nextTrain({
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
            const backupData = await travelHelper.nextTrain({
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

          const backupData = await travelHelper.nextTube({
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

          apiData = await travelHelper.nextTrain({
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
