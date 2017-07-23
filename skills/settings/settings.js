//=========================================================
// Setup generic skill
//=========================================================
const Skills       = require('restify-router').Router,
      lightshelper = require('../../skills/lights/lightshelper.js'),
      skill        = new Skills();

//=========================================================
// Skill: settings
//=========================================================
function viewSettings (req, res, next) {                        

    logger.info ('View settings API called');

    var scheduleSettings = JSON.parse(require('fs').readFileSync('scheduleSettings.json', 'utf8')),
        i = 0,
        rgb;

    // Update morning lights and add light names
    scheduleSettings.morning.lights.forEach(function(value) {

        // Add light name to json
        scheduleSettings.morning.lights[i]["lightName"] = alfredHelper.getLightName(value.lightID);

        i++;
    })

    // Update evening lights and add light names
    i = 0;
    scheduleSettings.evening.lights.forEach(function(value) {
        
        // Add light name to json
        scheduleSettings.evening.lights[i]["lightName"] = alfredHelper.getLightName(value.lightID);

        // Caculate and add rgb to json
        rgb = lightshelper.xy_to_rgb(scheduleSettings.evening.lights[i]["x"], scheduleSettings.evening.lights[i]["y"], scheduleSettings.evening.lights[i]["brightness"])

        scheduleSettings.evening.lights[i]["red"] = rgb.red;
        scheduleSettings.evening.lights[i]["green"] = rgb.green;
        scheduleSettings.evening.lights[i]["blue"] = rgb.blue;
        
        i++;
    })

    // Update eveningtv lights and add light names
    i = 0;
    scheduleSettings.eveningtv.lights.forEach(function(value) {

        // Add light name to json
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

    // Tidy up json by removing light name and RGB
    var i = 0
    scheduleSettings.evening.lights.forEach(function(value) {
        
        // Remove light name & RGB data
        delete scheduleSettings.evening.lights[i]["lightName"];
        delete scheduleSettings.evening.lights[i]["red"];
        delete scheduleSettings.evening.lights[i]["green"];
        delete scheduleSettings.evening.lights[i]["blue"];

        i++;
    })

logger.info (scheduleSettings.evening)

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