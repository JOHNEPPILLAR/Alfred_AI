/**
 * Setup generic skill
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const bedhelper = require('./bedhelper.js');

const skill = new Skills();

/**
 * Skill: turnOnBed
 */
async function turnOnBed(req, res, next) {
  logger.info('Turn on bed API called');

  const temp = req.query.temp;
  const side = req.query.side;
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
    bedhelper.turnOnBed(res, side, temp);
    next();
  }
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
skill.get('/turnonbed', turnOnBed);
skill.get('/turnoffbed', turnOffBed);

module.exports = skill;
