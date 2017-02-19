//=========================================================
// Setup joke skill
//=========================================================
const Skills = require('restify-router').Router;  
      skill = new Skills();

//=========================================================
// Skill: joke
//=========================================================
function joke (req, res, next) {

    const url = 'http://tambal.azurewebsites.net/joke/random'
    alfredHelper.requestAPIdata(url)
    .then(function(apiData){

        // Get the joke data
        apiData = apiData.body;

        // Construct the returning message
        const jsonDataObj = {
              code : 'sucess',
              data : apiData.joke
        };

        // Send response back to caller
        res.send(jsonDataObj);
    })
    .catch(function (err) {

        // Construct the returning message
        var returnJSON = {
            code : 'error',
            data : err.message
        }

        // Send response back to caller
        console.log('joke: ' + err);
        res.send(returnJSON);
    });
    next();
};


//=========================================================
// Add skills to server
//=========================================================
skill.get('/joke', joke)

module.exports = skill;