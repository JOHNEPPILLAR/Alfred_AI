/**
 * Setup joke skill
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');

const skill = new Skills();

/**
 * Skill: joke
 */
function joke(req, res, next) {
  logger.info('Joke API called');

  const url = 'http://ron-swanson-quotes.herokuapp.com/v2/quotes';

  alfredHelper.requestAPIdata(url)
    .then((apiData) => {
      // Get the joke data
      apiData = apiData.body;
      // Send response back to caller
      alfredHelper.sendResponse(res, 'true', apiData);
    })
    .catch((err) => {
      // Send response back to caller
      alfredHelper.sendResponse(res, 'false', err.message);
      logger.error(`joke: ${err}`);
    });
  next();
}

/**
 * Add skills to server
 */
skill.get('/joke', joke);

module.exports = skill;
