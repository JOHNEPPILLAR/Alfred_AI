/**
 * Setup joke skill
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');

const skill = new Skills();

/**
 * Skill: joke
 */
async function joke(req, res, next) {
  logger.info('Joke API called');
  const url = 'http://ron-swanson-quotes.herokuapp.com/v2/quotes';
  try {
    const apiData = await alfredHelper.requestAPIdata(url);
    apiData = apiData.body;
    alfredHelper.sendResponse(res, 'true', apiData); // Send response back to caller
    next();
    return apiData;
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`joke: ${err}`);
    next();
    return err;
  }
}

/**
 * Add skills to server
 */
skill.get('/joke', joke);

module.exports = skill;
