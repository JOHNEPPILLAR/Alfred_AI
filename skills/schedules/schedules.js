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

    if (scheduleHelper.setSchedule(true)) {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'sucess', 'Reset scheduler');
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'Reset scheduler error');
    };
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/resetschedule', resetSchedule);

module.exports = skill;