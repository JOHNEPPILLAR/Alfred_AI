/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const logger = require('winston');

const skill = new Skills();

/**
 * @api {get} /news Display latest news
 * @apiName news
 * @apiGroup News
 *
 * @apiParam {String} news_type News type [news, sport, science, tech, business]
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
 *     data: [
 *      {
 *         "author": "BBC News",
 *         "title": "Spain set for pro-unity rallies",
 *         "description": "Thousands are expected to rally in Spain.",
 *         "url": "http://www.bbc.co.uk/news/world-europe-41533587",
 *         "urlToImage": "https://ichef.bbci.co.uk/images/ic/1024x576/p05j8tqr.jpg",
 *         "publishedAt": "2017-10-07T06:57:30Z"
 *       }
 *     ]
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal server error
 *   {
 *     data: Error message
 *   }
 *
 */
async function news(req, res, next) {
  logger.info('NEWS API called');
  try {
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
      alfredHelper.sendResponse(res, false, 'Unsupported type of news.'); // Send response back to caller
      global.logger.info('news: Unsupported type of news.');
      next();
    }
    if (!newsTypeError) {
      // Get news data
      const url = `https://newsapi.org/v1/articles?source=${newsType}&sortBy=top&apiKey=${process.env.NEWSAPI}`;
      const apiData = await alfredHelper.requestAPIdata(url);
      alfredHelper.sendResponse(res, true, apiData.body.articles); // Send response back to caller
      next();
    }
  } catch (err) {
    logger.error(`news: ${err}`);
    alfredHelper.sendResponse(res, null, err); // Send response back to caller
    next();
  }
  return null;
}
skill.get('/news', news);

module.exports = skill;
