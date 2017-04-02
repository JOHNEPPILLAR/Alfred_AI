//=========================================================
// Setup joke skill
//=========================================================
const Skills       = require('restify-router').Router;  
      skill        = new Skills(),
      alfredHelper = require('../../helper.js'),
      logger       = require('winston');

//=========================================================
// Skill: joke
//=========================================================
function joke (req, res, next){
    
    logger.info ('Joke API called');

    const url = 'http://tambal.azurewebsites.net/joke/random';
        
    alfredHelper.requestAPIdata(url)
    .then(function(apiData){
        // Get the joke data
        apiData = apiData.body;
        // Send response back to caller
        alfredHelper.sendResponse(res, 'sucess', apiData.joke);
    })
    .catch(function(err){
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', err.message);
        logger.error('joke: ' + err);
    });
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/joke', joke);

module.exports = skill;