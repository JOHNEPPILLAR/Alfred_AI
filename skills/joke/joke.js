/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');

const skill = new Skills();

/**
 * @api {get} /joke Tell a joke
 * @apiName joke
 * @apiGroup Joke
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
 *     data: joke
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function joke(req, res, next) {
  logger.info('Joke API called');
  const url = 'http://ron-swanson-quotes.herokuapp.com/v2/quotes';
  try {
    const apiData = await alfredHelper.requestAPIdata(url);
    apiData = apiData.body;
    alfredHelper.sendResponse(res, true, apiData); // Send response back to caller
    next();
    return apiData;
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    }
    logger.error(`joke: ${err}`);
    next();
    return err;
  }
}
skill.get('/joke', joke);

module.exports = skill;
