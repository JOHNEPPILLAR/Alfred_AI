//=========================================================
// Setup joke skill
//=========================================================
const Skills = require('restify-router').Router;  
      skill = new Skills(),
      alfredHelper = require('../../helper.js');

//=========================================================
// Skill: joke
//=========================================================
function joke (req, res, next) {

    const url = 'http://tambal.azurewebsites.net/joke/random';
    
    alfredHelper.requestAPIdata(url)
    .then(function(apiData){

        // Get the joke data
        apiData = apiData.body;

        // Send response back to caller
        alfredHelper.sendResponse(res, 'sucess', apiData.joke);

    })
    .catch(function (err) {

        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', err.message);
        console.log('joke: ' + err);
    });
    next();
};


//=========================================================
// Add skills to server
//=========================================================
skill.get('/joke', joke)

module.exports = skill;