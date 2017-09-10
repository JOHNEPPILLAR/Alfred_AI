//=========================================================
// Setup generic skill
//=========================================================
const Skills       = require('restify-router').Router,
      lightshelper = require('../../skills/lights/lightshelper.js'),
      skill        = new Skills();

//=========================================================
// Skill: Delete log file contents
//=========================================================
function delLog (req, res, next) {  

    logger.info ('Delete log file API called');

    // Remove the logger 
    logger.remove(logger.transports.File);

    // Delete the log file
    var fs = require('fs');
    var filePath = './Alfred.log'; 
    fs.unlinkSync(filePath);

    // re-setup the log file
    logger.add(logger.transports.File, { JSON: true, filename: 'Alfred.log', colorize: true, timestamp: function() { return dateFormat(new Date(), "dd mmm yyyy HH:MM")}});

    logger.info ('Cleared log file');
    alfredHelper.sendResponse(res, 'sucess', 'cleared');

};

//=========================================================
// Skill: restart Alfred
//=========================================================
function reStart (req, res, next) {  
    logger.info ('Restart Alfred API called');

    alfredHelper.sendResponse(res, 'sucess', 'restarting');
    
    setTimeout(function() {
        logger.info ("Restarting Alfred")
        server.close() // Stop API responses
        process.exit() // Kill the app and let nodemon restart it
    }, 1000);

}

//=========================================================
// Add skills to server
//=========================================================
skill.get('/restart', reStart);
skill.get('/dellog', delLog);

module.exports = skill;