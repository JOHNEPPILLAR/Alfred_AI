//=========================================================
// Setup news routes
//=========================================================
const Router = require('restify-router').Router;  
      router = new Router();

//=========================================================
// Route: latest
// Params: type: String
//=========================================================
function latest (req, res, next) {

    // Get the source
    var newsType      = 'sky-news',
        newsTypeError = false,
        newsParam     = req.query.type; 
    if (typeof req.query.type !== 'undefined' && req.query.type !== null){
        switch (newsParam.toLowerCase()) {
        case 'news':
            newsType = 'sky-news';
            break;
        case 'sport':
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
        var errorMessage = 'That type of news is not currently supported', 
            returnJSON = {
                code    : 'error',
                message : errorMessage
            }
        console.log('news-latest: ' + errorMessage);
        res.send(returnJSON);
    } else {

        // Get news data
        const url = 'https://newsapi.org/v1/articles?source=' + newsType + '&sortBy=top&apiKey=' + process.env.NEWSAPI;
        alfredHelper.requestAPIdata(url)
        .then(function(apiData){

            // Construct the returning message
            var returnJSON = {
                code : 'sucess',
                data : apiData.body.articles
            };

            // Send response back to caller
            res.send(returnJSON);
        })
        .catch(function (err) {
            var returnJSON = {
                code    : 'error',
                message : err.message
            }
            console.log('news-latest: ' + err);
            res.send(returnJSON);
        });
    };
    next();
};

//=========================================================
// Add routes to server
//=========================================================
router.get('/latest', latest)

module.exports = router;