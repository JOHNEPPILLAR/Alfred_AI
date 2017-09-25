/**
 * Setup schedule skill
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const harmony = require('harmonyhubjs-client');

const skill = new Skills();

/**
 * Skill: watch Amazon Fire TV
 */
async function watchFireTv(req, res, next) {
  logger.info('Watch Fire TV API called');
  try {
    const harmonyClient = await harmony(process.env.harmonyip);
    harmonyClient.startActivity(25026204); // Fire TV ID
    harmonyClient.end();
    alfredHelper.sendResponse(res, 'true', 'Turned on Fire TV');
    next();
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`watchFireTv: ${err}`);
    next();
  }
}

/**
 * Skill: watch Virgin TV
 */
async function watchVirginTv(req, res, next) {
  logger.info('Watch Virgin TV API called');
  try {
    const harmonyClient = await harmony(process.env.harmonyip);
    harmonyClient.startActivity(22797599); // Virgin TV ID
    harmonyClient.end();
    alfredHelper.sendResponse(res, 'true', 'Turned on Virgin TV');
    next();
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`watchVirginTv: ${err}`);
    next();
  }
}

/**
 * Skill: play PS4
 */
async function playps4(req, res, next) {
  logger.info('Play PS4 API called');
  try {
    const harmonyClient = await harmony(process.env.harmonyip);
    harmonyClient.startActivity(23898791); // PS4 ID
    harmonyClient.end();
    alfredHelper.sendResponse(res, 'true', 'Turned on Play station');
    next();
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`playps4: ${err}`);
    next();
  }
}

/**
 * Skill: turn everythig off
 */
async function turnofftv(req, res, next) {
  logger.info('Turn off TV API called');
  try {
    const harmonyClient = await harmony(process.env.harmonyip);
    harmonyClient.startActivity(-1); // All off ID
    // return harmonyClient.turnOff()
    harmonyClient.end();
    alfredHelper.sendResponse(res, 'true', 'Turned off TV');
    next();
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`turnofftv: ${err}`);
    next();
  }
}

/**
 * Skill: watch Apple TV
 */
async function watchAppleTV(req, res, next) {
  logger.info('Watch Apple TV API called');
  try {
    const harmonyClient = await harmony(process.env.harmonyip);
    harmonyClient.startActivity(22797639); // Apple TV ID
    // return harmonyClient.turnOff()
    harmonyClient.end();
    alfredHelper.sendResponse(res, 'true', 'Turned on Apple TV');
    next();
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`watchAppleTV: ${err}`);
    next();
  }
}

/**
 * Add skills to server
 */
skill.get('/watchfiretv', watchFireTv);
skill.get('/watchvirgintv', watchVirginTv);
skill.get('/playps4', playps4);
skill.get('/turnoff', turnofftv);
skill.get('/watchappletv', watchAppleTV);

module.exports = skill;
