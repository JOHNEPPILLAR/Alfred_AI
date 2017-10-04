/**
 * Setup generic skill
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const bedhelper = require('./bedhelper.js');

const skill = new Skills();

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
      duration = duration * 60;
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
  logger.info('Get bed data API called');
  bedhelper.getBedData(res);
  next();
}

/**
 * Skill: turnOffBed
 */
async function turnOffBed(req, res, next) {
  logger.info('Turn off bed API called');

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
    bedhelper.turnOffBed(res, side);
    next();
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
