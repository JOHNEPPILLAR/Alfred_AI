//=========================================================
// Setup webcam skill
//=========================================================
const Skills = require('restify-router').Router;  
      dotenv = require('dotenv');
      skill  = new Skills()
      
//=========================================================
// Skill: Display stream
//=========================================================
function displayStream (req, res, next){
    
    logger.info ('Webcam API called');
    const streamUrl = process.env.FOSCAM_STREAM_URL;
    
// TO DO

    alfredHelper.sendResponse(res, 'sucess', 'streaming');
    
    /*
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
    */

    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/', displayStream);

module.exports = skill;