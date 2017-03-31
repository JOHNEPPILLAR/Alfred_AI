//=========================================================
// Setup news skills
//=========================================================
const Skills       = require('restify-router').Router;  
      skill        = new Skills(),
      alfredHelper = require('../../helper.js'),
      logger       = require('winston');

alfredHelper.setLogger(logger); // Configure logging

//=========================================================
// Skill: latest
// Params: news_type: String
//=========================================================
function latest (req, res, next) {

    logger.info ('NEWS API called');

    // Get the source
    var newsType      = 'sky-news',
        newsTypeError = false,
        newsParam     = req.query.news_type; 
    if (typeof newsParam !== 'undefined' && newsParam !== null) {
        switch (newsParam.toLowerCase()) {
        case 'news':
            newsType = 'sky-news';
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
        };
    };

    // If news source if not lised return error message
    if (newsTypeError) {
        
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'Unsupported type of news.');
        logging.info('news-latest: Unsupported type of news.');
    } else {

        // Get news data
        const url = 'https://newsapi.org/v1/articles?source=' + newsType + '&sortBy=top&apiKey=' + process.env.NEWSAPI;

        alfredHelper.requestAPIdata(url)
        .then(function(apiData){

            // Send response back to caller
            alfredHelper.sendResponse(res, 'sucess', apiData.body.articles);
        })
        .catch(function (err) {

            // Send response back to caller
            alfredHelper.sendResponse(res, 'error', err.message);
            logger.error('news-latest: ' + err);
        });
    };
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/news', latest);

module.exports = skill;