//=========================================================
// Setup schedule skill
//=========================================================
const Skills         = require('restify-router').Router;  
      skill          = new Skills(),
      scheduleHelper = require('../../schedules/schedules.js');

//=========================================================
// Skill: reset schedules
//=========================================================
function resetSchedule (req, res, next) {
    logger.info ('Reset Schedule API called');
    if (scheduleHelper.setSchedule()) {
        alfredHelper.sendResponse(res, 'sucess', 'Reset scheduler'); // Send response back to caller
    } else {
        alfredHelper.sendResponse(res, 'error', 'Reset scheduler error'); // Send response back to caller
    };
    next();
};

//=========================================================
// Skill: Get sunset times
//=========================================================
function sunSet (req, res, next) {
    
    logger.info ('Sunset info API called');
    const url = 'http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=' + process.env.OPENWEATHERMAPAPIKEY;

    alfredHelper.requestAPIdata(url)
    .then(function(apiData){

        var sunSet = new Date(apiData.body.sys.sunset);
        sunSet.setHours(sunSet.getHours() + 12); // Add 12 hrs as for some resion the api returnes it as am!
        sunSet.setHours(sunSet.getHours() - scheduleSettings.evening[0].offset_hr); // Adjust hr
        sunSet.setMinutes(sunSet.getMinutes() - scheduleSettings.evening[0].offset_min); // Adjust min 

        var rtnJSON = {
            sunSet : dateFormat(sunSet, "HH:MM"),
            offSetHR : scheduleSettings.evening[0].offset_hr,
            offSetMin : scheduleSettings.evening[0].offset_min            
        };
        alfredHelper.sendResponse(res, 'sucess', rtnJSON); // Send response back to caller
    })
    .catch(function(err){
        alfredHelper.sendResponse(res, 'error', err.message); // Send response back to caller
        logger.error('Schedule get data Error: ' + err);
    });
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/reset', resetSchedule);
skill.get('/sunset', sunSet);

module.exports = skill;