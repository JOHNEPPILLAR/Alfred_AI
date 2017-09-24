/**
 * Setup schedule skill
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const dateFormat = require('dateformat');

const skill = new Skills();

/**
 * Skill: Get sunset times
 */
async function sunSet(req, res, next) {
  logger.info('Sunset info API called');
  const url = `http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=${process.env.OPENWEATHERMAPAPIKEY}`;

  try {
    const apiData = await alfredHelper.requestAPIdata(url);
    const sunSetTime = new Date(apiData.body.sys.sunset);
    sunSetTime.setHours(sunSetTime.getHours() + 12); // Convert from 12h to 24h format
    const rtnJSON = {
      sunSet: dateFormat(sunSetTime, 'HH:MM'),
    };
    alfredHelper.sendResponse(res, 'true', rtnJSON); // Send response back to caller
    next();
    return rtnJSON;
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`Schedule sunSet: ${err}`);
    next();
    return err;
  }
}

/**
 * Add skills to server
 */
skill.get('/sunset', sunSet);

module.exports = skill;
