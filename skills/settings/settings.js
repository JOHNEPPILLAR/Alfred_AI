//=========================================================
// Setup generic skill
//=========================================================
const Skills       = require('restify-router').Router,
      lightshelper = require('../../skills/lights/lightshelper.js'),
      skill        = new Skills();

//=========================================================
// Skill: view settings
//=========================================================
function restoreSettings (req, res, next) {                        

    var scheduleSettings = {
    "morning": {
        "on_hr": 5,
        "on_min": 30,
        "lights": [
            {
                "lightID": 1,
                "onoff": "on",
                "brightness": 135,
                "type": "color",
                "xy": [
                    0.3066,
                    0.316
                ]
            },
            {
                "lightID": 2,
                "onoff": "off",
                "brightness": 65,
                "type": "color",
                "xy": [
                    0.3066,
                    0.316
                ]
            },
            {
                "lightID": 3,
                "onoff": "off",
                "brightness": 65,
                "type": "color",
                "xy": [
                    0.3066,
                    0.316
                ]
            },
            {
                "lightID": 12,
                "onoff": "on",
                "brightness": 135,
                "type": "white"
            },
            {
                "lightID": 5,
                "onoff": "on",
                "brightness": 135,
                "type": "white"
            }
        ],
        "off_hr": 8,
        "off_min": 30
    },
    "evening": {
        "offset_min": 0,
        "off_hr": 22,
        "off_min": 0,
        "lights": [
            {
                "lightID": 1,
                "onoff": "on",
                "brightness": 120,
                "type": "color",
                "xy": [
                    0.3553,
                    0.3677
                ]
            },
            {
                "lightID": 2,
                "onoff": "on",
                "brightness": 120,
                "type": "color",
                "xy": [
                    0.3553,
                    0.3677
                ]
            },
            {
                "lightID": 3,
                "onoff": "on",
                "brightness": 120,
                "type": "color",
                "xy": [
                    0.3553,
                    0.3677
                ]
            },
            {
                "lightID": 12,
                "onoff": "on",
                "brightness": 120,
                "type": "white"
            },
            {
                "lightID": 5,
                "onoff": "on",
                "brightness": 120,
                "type": "white"
            }
        ],
        "offset_hr": 0
    },
    "eveningtv": {
        "on_hr": 19,
        "on_min": 30,
        "lights": [
            {
                "lightID": 2,
                "onoff": "on",
                "brightness": 50,
                "type": "color",
                "xy": [
                    0.4274,
                    0.3926
                ]
            },
            {
                "lightID": 3,
                "onoff": "on",
                "brightness": 50,
                "type": "color",
                "xy": [
                    0.4274,
                    0.3926
                ]
            },
            {
                "lightID": 12,
                "onoff": "on",
                "brightness": 50,
                "type": "white"
            }
        ]
    },
    "motionSensorLights": [
        {
            "lightID": 1,
            "brightness": 120,
            "type": "color"
        }
    ]
    }

    // Restore settings file
    try {
        require('fs').writeFileSync('scheduleSettings.json', JSON.stringify(scheduleSettings));
        alfredHelper.sendResponse(res, 'sucess', 'saved');
    } catch (err) {
        logger.error ('saveSettings: ' + err);
        alfredHelper.sendResponse(res, 'error', err);
    };
}

//=========================================================
// Skill: view settings
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
// Skill: save morning settings
//=========================================================
function saveMorningSettings (req, res, next) {  
    logger.info ('Save morning settings API called');

    // Load settings json file
    var scheduleSettings = JSON.parse(require('fs').readFileSync('scheduleSettings.json', 'utf8'));

    // Update with data from api post
    scheduleSettings.morning = req.body;

    // Tidy up json by removing light name and RGB
    var i = 0
    scheduleSettings.morning.lights.forEach(function(value) {
        
        // Remove light name
        delete scheduleSettings.morning.lights[i]["lightName"];

        i++;
    })

    // Write updates to file
    try {
        require('fs').writeFileSync('scheduleSettings.json', JSON.stringify(scheduleSettings));
        alfredHelper.sendResponse(res, 'sucess', 'saved');
    } catch (err) {
        logger.error ('saveMorningSettings: ' + err);
        alfredHelper.sendResponse(res, 'error', err);
    };
};

//=========================================================
// Skill: save evening settings
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
        
        // Remove light name
        delete scheduleSettings.evening.lights[i]["lightName"];

        i++;
    })

    // Write updates to file
    try {
        require('fs').writeFileSync('scheduleSettings.json', JSON.stringify(scheduleSettings));
        alfredHelper.sendResponse(res, 'sucess', 'saved');
    } catch (err) {
        logger.error ('saveEveningSettings: ' + err);
        alfredHelper.sendResponse(res, 'error', err);
    };
};

//=========================================================
// Skill: save evening settings
//=========================================================
function saveEveningTVSettings (req, res, next) {  
    logger.info ('Save evening tv settings API called');

    // Load settings json file
    var scheduleSettings = JSON.parse(require('fs').readFileSync('scheduleSettings.json', 'utf8'));

    // Update with data from api post
    scheduleSettings.eveningtv = req.body;

    // Tidy up json by removing light name and RGB
    var i = 0
    scheduleSettings.eveningtv.lights.forEach(function(value) {
        
        // Remove light name
        delete scheduleSettings.eveningtv.lights[i]["lightName"];

        i++;
    })

    // Write updates to file
    try {
        require('fs').writeFileSync('scheduleSettings.json', JSON.stringify(scheduleSettings));
        alfredHelper.sendResponse(res, 'sucess', 'saved');
    } catch (err) {
        logger.error ('saveEveningTVSettings: ' + err);
        alfredHelper.sendResponse(res, 'error', err);
    };
};

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
skill.get('/restore', restoreSettings);
skill.get('/view', viewSettings);
skill.post('/savemorning', saveMorningSettings);
skill.post('/saveevening', saveEveningSettings);
skill.post('/saveeveningtv', saveEveningTVSettings);
skill.get('/restart', reStart);
skill.get('/dellog', delLog);

module.exports = skill;