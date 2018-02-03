/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const bedhelper = require('./bedhelper.js');
const logger = require('winston');

const skill = new Skills();

async function checkWarmingStatus(side) {
  const bedData = await bedhelper.getBedData();
  let warmingStatus;
  if (side === 'JP') {
    warmingStatus = bedData.result.leftNowHeating;
  } else {
    warmingStatus = bedData.result.rightNowHeating;
  }
  return warmingStatus;
}

/**
 * @api {put} /bed/setHeatingLevel Set bed warmer heating level
 * @apiName setheatinglevel
 * @apiGroup Bed
 *
 * @apiParam {Number} temp Bed warming level from 1 to 10.
 * @apiParam {String} side Side of Bed [ JP, Fran ].
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTPS/1.1 200 OK
 *     {
 *       "code": "true",
 *       "data": "Device successfully updated."
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "code": "false",
 *       "data": Error message
 *     }
 *
 */
async function setHeatingLevel(req, res, next) {
  logger.info('Set heating level API called');
  try {
    const { side } = req.body;
    let { temp } = req.body;
    let tempParamError = true;
    let sideParamError = true;

    if (typeof temp !== 'undefined' && temp !== null) {
      switch (temp) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '10':
          tempParamError = false;
          break;
        default:
          tempParamError = true;
          break;
      }
    }

    if (typeof side !== 'undefined' && side !== null) {
      switch (side) {
        case 'JP':
          sideParamError = false;
          break;
        case 'Fran':
          sideParamError = false;
          break;
        default:
          sideParamError = true;
          break;
      }
    }

    if (tempParamError || sideParamError) {
      alfredHelper.sendResponse(res, false, 'Missing temp or side param'); // Send response back to caller
      next();
    } else {
      temp *= 10;
      bedhelper.setHeatingLevel(res, side, temp);
      next();
    }
  } catch (err) {
    logger.error(`setHeatingLevel: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
      next();
    } else {
      return err;
    }
  }
  return null;
}
skill.put('/setheatinglevel', setHeatingLevel);

/**
 * @api {put} /bed/setheatingtimer Set bed warmer heating timer
 * @apiName setheatingtimer
 * @apiGroup Bed
 *
 * @apiParam {Number} temp Bed warming level from 1 to 10.
 * @apiParam {String} side Side of Bed [ JP, Fran ].
 * @apiParam {Number} duration Time in minutes the warmer will be on for.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTPS/1.1 200 OK
 *     {
 *       "code": "true",
 *       "data": "Device successfully updated."
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "code": "false",
 *       "data": Error message
 *     }
 *
 */
async function setHeatingTimer(req, res, next) {
  logger.info('Set heating timer API called');
  try {
    const { side } = req.body;
    let { temp, duration } = req.body;
    let tempParamError = true;
    let sideParamError = true;
    let durationParamError = true;

    if (typeof duration !== 'undefined' && duration !== null) {
      durationParamError = false;
      duration *= 60;
    }

    if (typeof temp !== 'undefined' && temp !== null) {
      switch (temp) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '10':
          tempParamError = false;
          break;
        default:
          tempParamError = true;
          break;
      }
    }

    if (typeof side !== 'undefined' && side !== null) {
      switch (side) {
        case 'JP':
          sideParamError = false;
          break;
        case 'Fran':
          sideParamError = false;
          break;
        default:
          sideParamError = true;
          break;
      }
    }

    if (tempParamError || sideParamError || durationParamError) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, false, 'Missing temp, side or duration param'); // Send response back to caller
        next();
      }
    } else {
      temp *= 10;
      await bedhelper.setHeatingTimer(res, side, temp, duration);
      next();
    }
  } catch (err) {
    logger.error(`setHeatingTimer: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
      next();
    } else {
      return err;
    }
  }
  return null;
}
skill.put('/setheatingtimer', setHeatingTimer);

/**
 * @api {get} /bed/getbeddata Get bed information
 * @apiName getbeddata
 * @apiGroup Bed
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTPS/1.1 200 OK
 *     {
 *       "code": "true",
 *       "data": Eight bed API response
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "code": "false",
 *       "data": Error message
 *     }
 *
 */
async function getBedData(req, res, next) {
  try {
    logger.info('Get bed data API called');
    await bedhelper.getBedData(res);
    next();
  } catch (err) {
    logger.error(`getBedData: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
      next();
    } else {
      return err;
    }
  }
  return null;
}
skill.get('/getbeddata', getBedData);

/**
 * @api {put} /bed/turnoffbed Turn off bed warmer
 * @apiName turnoffbed
 * @apiGroup Bed
 *
 * @apiParam {String} side Side of Bed [ JP, Fran ].
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTPS/1.1 200 OK
 *     {
 *       "code": "true",
 *       "data": "Device successfully updated."
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "code": "false",
 *       "data": Error message
 *     }
 *
 */
async function turnOffBed(req, res, next) {
  logger.info('Turn off bed warming API called');
  try {
    const { side } = req.body;
    let sideParamError = true;

    if (typeof side !== 'undefined' && side !== null) {
      switch (side) {
        case 'JP':
          sideParamError = false;
          break;
        case 'Fran':
          sideParamError = false;
          break;
        default:
          sideParamError = true;
          break;
      }
    }

    if (sideParamError) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, false, 'Missing side param'); // Send response back to caller
        next();
      }
    } else {
      const bedOn = await checkWarmingStatus(side);
      if (bedOn) {
        await bedhelper.turnOffBed(res, side);
        next();
      } else if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, true, 'Bed already off'); // Send response back to caller
        next();
      }
    }
  } catch (err) {
    logger.error(`turnOffBed: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
      next();
    } else {
      return err;
    }
  }
  return null;
}
skill.put('/turnoffbed', turnOffBed);

module.exports = skill;
