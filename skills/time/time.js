/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const dateFormat = require('dateformat');
const NodeGeocoder = require('node-geocoder');
const logger = require('winston');

const skill = new Skills();
const options = {
  provider: 'google',
  httpAdapter: 'https',
  formatter: null,
};
const geocoder = NodeGeocoder(options);

/**
 * @api {get} /time/whatisthetime Delete log file contents
 * @apiName whatisthetime
 * @apiGroup Time
 *
 * @apiParam {String} location Location i.e. London
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
 *     data: 'cleared'
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal server error
 *   {
 *     data: Error message
 *   }
 *
 */
async function whatisthetime(req, res, next) {
  logger.info('Time API called');

  // Get the location
  let { location } = req.query;
  if (typeof location === 'undefined' || location == null) {
    location = 'london';
  }

  try {
    const Data = await geocoder.geocode(location);
    const lat = Data[0].latitude;
    const lng = Data[0].longitude;
    const url = `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=${process.env.geonames}`;
    const apiData = await alfredHelper.requestAPIdata(url);
    const returnMessage = `The time in ${location} is currently ${dateFormat(apiData.body.time, 'h:MM TT')}`;
    alfredHelper.sendResponse(res, true, returnMessage);
    next();
  } catch (err) {
    logger.error(`whatisthetime: ${err}`);
    alfredHelper.sendResponse(res, false, err); // Send response back to caller
    next();
  }
}
skill.get('/whatisthetime', whatisthetime);

module.exports = skill;
