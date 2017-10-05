/**
 * Setup generic skill
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const bedhelper = require('./bedhelper.js');

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
 * Skill: setHeatingLevel
 */
async function setHeatingLevel(req, res, next) {
  logger.info('Set heating level API called');
  try {
    const side = req.query.side;
    let temp = req.query.temp;
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
      alfredHelper.sendResponse(res, 'false', 'Missing temp or side param'); // Send response back to caller
      next();
    } else {
      temp *= 10;
      bedhelper.setHeatingLevel(res, side, temp);
      next();
    }
  } catch (err) {
    alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
  }
}

/**
 * Skill: setHeatingTimer
 */
async function setHeatingTimer(req, res, next) {
  logger.info('Set heating timer API called');
  try {
    const side = req.query.side;
    let temp = req.query.temp;
    let duration = req.query.duration;
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

    if (tempParamError || sideParamError || sideParamError) {
      alfredHelper.sendResponse(res, 'false', 'Missing temp, side or duration param'); // Send response back to caller
      next();
    } else {
      temp *= 10;
      bedhelper.setHeatingTimer(res, side, temp, duration);
      next();
    }
  } catch (err) {
    alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
  }
}

/**
 * Skill: getBedData
 */
async function getBedData(req, res, next) {
  try {
    logger.info('Get bed data API called');
    bedhelper.getBedData(res);
    next();
  } catch (err) {
    alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    next();
  }
}

/**
 * Skill: turnOffBed
 */
async function turnOffBed(req, res, next) {
  logger.info('Turn off bed warming API called');
  try {
    const side = req.query.side;
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
      alfredHelper.sendResponse(res, 'false', 'Missing side param'); // Send response back to caller
      next();
    } else {
      const bedOn = await checkWarmingStatus(side);
      if (bedOn) {
        bedhelper.turnOffBed(res, side);
      } else {
        alfredHelper.sendResponse(res, 'false', 'Bed already off'); // Send response back to caller
      }
      next();
    }
  } catch (err) {
    alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    return err;
  }
}

/**
 * Add skills to server
 */
skill.get('/setheatinglevel', setHeatingLevel);
skill.get('/setheatingtimer', setHeatingTimer);
skill.get('/getbeddata', getBedData);
skill.get('/turnoffbed', turnOffBed);

module.exports = skill;
