//=========================================================
// Setup news skills
//=========================================================
const Skills = require('restify-router').Router;  
      skill = new Skills();

//=========================================================
// Skill: latest
// Params: news_type: String
//=========================================================
function latest (req, res, next) {

    // Get the source
    var newsType      = 'sky-news',
        newsTypeError = false,
        newsParam     = req.query.news_type; 
    if (typeof newsParam !== 'undefined' && newsParam !== null) {
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
        
        // Construct the returning message
        var errorMessage = 'That type of news is not currently supported', 
            returnJSON = {
                code : 'error',
                data : errorMessage
            };
        
        // Send response back to caller
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

            // Construct the returning message
            var returnJSON = {
                code : 'error',
                data : err.message
            }

            // Send response back to caller
            console.log('news-latest: ' + err);
            res.send(returnJSON);
        });
    };
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/latest', latest)

module.exports = skill;