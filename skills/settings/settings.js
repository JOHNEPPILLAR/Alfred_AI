//=========================================================
// Setup generic skill
//=========================================================
const Skills = require('restify-router').Router,
      skill  = new Skills();

//=========================================================
// Skill: settings
//=========================================================
function viewSettings (req, res, next) {                        

    logger.info ('View settings API called');

    var scheduleSettings = JSON.parse(require('fs').readFileSync('scheduleSettings.json', 'utf8'));

    // Update morning lights and add light names
    var i = 0;
    scheduleSettings.morning.lights.forEach(function(value) {
        scheduleSettings.morning.lights[i]["lightName"] = alfredHelper.getLightName(value.lightID);
        i++;
    })

    // Update evening lights and add light names
    i = 0;
    scheduleSettings.evening.lights.forEach(function(value) {
        scheduleSettings.evening.lights[i]["lightName"] = alfredHelper.getLightName(value.lightID);
        i++;
    })

    // Update eveningtv lights and add light names
    i = 0;
    scheduleSettings.eveningtv.lights.forEach(function(value) {
        scheduleSettings.eveningtv.lights[i]["lightName"] = alfredHelper.getLightName(value.lightID);
        i++;
    })

    alfredHelper.sendResponse(res, 'sucess', scheduleSettings);
    next();
};

//=========================================================
// Skill: saveSettings
//=========================================================
function saveEveningSettings (req, res, next) {  
    logger.info ('Save evening settings API called');

    // Load settings json file
    var scheduleSettings = JSON.parse(require('fs').readFileSync('scheduleSettings.json', 'utf8'));

    // Update with data from api post
    scheduleSettings.evening = req.body;

    // Write updates to file
    try {
        require('fs').writeFileSync('scheduleSettings.json', JSON.stringify(scheduleSettings));
        alfredHelper.sendResponse(res, 'sucess', 'saved');
    } catch (err) {
        logger.error ('saveSettings: ' + err);
        alfredHelper.sendResponse(res, 'error', err);
    };
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/view', viewSettings);
skill.post('/saveevening', saveEveningSettings);

module.exports = skill;