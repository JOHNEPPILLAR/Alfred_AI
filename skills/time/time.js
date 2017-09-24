/**
 * Setup schedule skill
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const dateFormat = require('dateformat');
const NodeGeocoder = require('node-geocoder');

const skill = new Skills();
const options = {
  provider: 'google',
  httpAdapter: 'https',
  formatter: null,
};
const geocoder = NodeGeocoder(options);

/**
 * Skill: whatisthetime
 */
async function whatisthetime(req, res, next) {
  logger.info('Time API called');

  // Get the location
  let location = '';
  if (typeof req.query.location !== 'undefined' && req.query.location !== null) {
    location = req.query.location;
  } else {
    location = 'london';
  }

  try {
    const Data = await geocoder.geocode(location);
    const lat = Data[0].latitude;
    const lng = Data[0].longitude;
    const url = `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=${process.env.geonames}`;
    const apiData = await alfredHelper.requestAPIdata(url);
    const returnMessage = `The time in ${location} is currently ${dateFormat(apiData.body.time, 'h:MM TT')}`;
    alfredHelper.sendResponse(res, 'true', returnMessage);
    next();
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`whatisthetime: ${err}`);
    next();
  }
}

/**
 * Add skills to server
 */
skill.get('/whatisthetime', whatisthetime);

module.exports = skill;
