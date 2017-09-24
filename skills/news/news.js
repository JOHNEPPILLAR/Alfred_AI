/**
 * Setup news skills
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');

const skill = new Skills();

/**
 * Skill: latest
 */
async function latest(req, res, next) {
  logger.info('NEWS API called');

  // Get the source
  let newsType = 'bbc-news';
  let newsTypeError = false;
  const newsParam = req.query.news_type;

  if (typeof newsParam !== 'undefined' && newsParam !== null) {
    switch (newsParam.toLowerCase()) {
      case 'news':
        newsType = 'bbc-news';
        break;
      case 'sports':
        newsType = 'bbc-sport';
        break;
      case 'science':
        newsType = 'new-scientist';
        break;
      case 'tech':
        newsType = 'techcrunch';
        break;
      case 'business':
        newsType = 'bloomberg';
        break;
      default:
        newsTypeError = true;
        break;
    }
  }

  // If news source if not lised return error message
  if (newsTypeError) {
    // Send response back to caller
    alfredHelper.sendResponse(res, 'error', 'Unsupported type of news.');
    logger.info('news-latest: Unsupported type of news.');
  } else {
    // Get news data
    const url = `https://newsapi.org/v1/articles?source=${newsType}&sortBy=top&apiKey=${process.env.NEWSAPI}`;
    try {
      const apiData = await alfredHelper.requestAPIdata(url);
      alfredHelper.sendResponse(res, 'true', apiData.body.articles); // Send response back to caller
      next();
      return apiData.body.articles;
    } catch (err) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`news-latest: ${err}`);
      next();
      return err;
    }
  }
}

/**
 * Add skills to server
 */
skill.get('/news', latest);

module.exports = skill;
