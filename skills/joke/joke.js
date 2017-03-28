//=========================================================
// Setup joke skill
//=========================================================
const Skills       = require('restify-router').Router;  
      skill        = new Skills(),
      alfredHelper = require('../../helper.js'),
      Speech       = require('ssml-builder');

//=========================================================
// Skill: joke
//=========================================================
function joke (req, res, next) {

    const url = 'http://tambal.azurewebsites.net/joke/random';
        
    alfredHelper.requestAPIdata(url)
    .then(function(apiData){

        // Get the joke data
        apiData = apiData.body;

apiData = {"joke":"Two fish swim down a river, and hit a wall. One says: 'Dam!'"}

        // Construct ssml response
        var speachText = apiData.joke.split("."),
            speech = new Speech();  

        speachText.forEach(function(value){
console.log (value);
            speech.say("<p>" + value + "</p>");
            speech.pause('500ms');
        });
        var speechOutput = speech.ssml(true);

        // Send response back to caller
        alfredHelper.sendResponse(res, 'sucess', apiData.joke, speechOutput);

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
skill.get('/joke', joke);

module.exports = skill;