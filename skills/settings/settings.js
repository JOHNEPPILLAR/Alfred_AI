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
                "x": 0.264,
                "y": 0.3297,
                "type": "color"
            },
            {
                "lightID": 2,
                "onoff": "off",
                "brightness": 65,
                "x": 0.264,
                "y": 0.3297,
                "type": "color"
            },
            {
                "lightID": 3,
                "onoff": "off",
                "brightness": 65,
                "x": 0.264,
                "y": 0.3297,
                "type": "color"
            },
            {
                "lightID": 12,
                "onoff": "on",
                "brightness": 135,
                "x": 0,
                "y": 0,
                "type": "white"
            },
            {
                "lightID": 5,
                "onoff": "on",
                "brightness": 135,
                "x": 0,
                "y": 0,
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
                "x": 0.3633,
                "lightID": 1,
                "brightness": 120,
                "onoff": "on",
                "y": 0.3851,
                "type": "color"
            },
            {
                "x": 0.3633,
                "lightID": 2,
                "brightness": 120,
                "onoff": "off",
                "y": 0.3851,
                "type": "color"
            },
            {
                "x": 0.3633,
                "lightID": 3,
                "brightness": 120,
                "onoff": "off",
                "y": 0.3851,
                "type": "color"
            },
            {
                "x": 0,
                "lightID": 12,
                "brightness": 120,
                "onoff": "on",
                "y": 0,
                "type": "white"
            },
            {
                "x": 0,
                "lightID": 5,
                "brightness": 120,
                "onoff": "off",
                "y": 0,
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
                "x": 0.3633,
                "y": 0.3851,
                "type": "color"
            },
            {
                "lightID": 3,
                "onoff": "on",
                "brightness": 50,
                "x": 0.3633,
                "y": 0.3851,
                "type": "color"
            },
            {
                "lightID": 12,
                "onoff": "on",
                "brightness": 50,
                "x": 0,
                "y": 0,
                "type": "white"
            }
        ]
    },
    "motionSensorLights": [
        {
            "lightID": 1,
            "brightness": 120,
            "x": 0.3633,
            "y": 0.3851,
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

        // Caculate and add rgb to json
        rgb = lightshelper.xy_to_rgb(scheduleSettings.evening.lights[i]["x"], scheduleSettings.evening.lights[i]["y"], scheduleSettings.morning.lights[i]["brightness"])

        scheduleSettings.morning.lights[i]["red"] = rgb.red;
        scheduleSettings.morning.lights[i]["green"] = rgb.green;
        scheduleSettings.morning.lights[i]["blue"] = rgb.blue;

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

        // Caculate and add rgb to json
        rgb = lightshelper.xy_to_rgb(scheduleSettings.evening.lights[i]["x"], scheduleSettings.evening.lights[i]["y"], scheduleSettings.eveningtv.lights[i]["brightness"])

        scheduleSettings.eveningtv.lights[i]["red"] = rgb.red;
        scheduleSettings.eveningtv.lights[i]["green"] = rgb.green;
        scheduleSettings.eveningtv.lights[i]["blue"] = rgb.blue;

        i++;
    })

    alfredHelper.sendResponse(res, 'sucess', scheduleSettings);
    next();
};

//=========================================================
// Skill: save morning settings
//=========================================================
function saveMorningSettings (req, res, next) {  
    logger.info ('Save evening settings API called');

    // Load settings json file
    var scheduleSettings = JSON.parse(require('fs').readFileSync('scheduleSettings.json', 'utf8'));

    // Update with data from api post
    scheduleSettings.morning = req.body;

    // Tidy up json by removing light name and RGB
    var i = 0
    scheduleSettings.morning.lights.forEach(function(value) {
        
        // Convert RGB to XY
        xy = lightshelper.rgb_to_xy(scheduleSettings.morning.lights[i]["red"], scheduleSettings.morning.lights[i]["green"], scheduleSettings.morning.lights[i]["blue"])

        scheduleSettings.morning.lights[i]["x"] = parseFloat(xy.x);
        scheduleSettings.morning.lights[i]["y"] = parseFloat(xy.y);

        // Remove light name & RGB data
        delete scheduleSettings.morning.lights[i]["lightName"];
        delete scheduleSettings.morning.lights[i]["red"];
        delete scheduleSettings.morning.lights[i]["green"];
        delete scheduleSettings.morning.lights[i]["blue"];

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
        
        // Convert RGB to XY
        xy = lightshelper.rgb_to_xy(scheduleSettings.evening.lights[i]["red"], scheduleSettings.evening.lights[i]["green"], scheduleSettings.evening.lights[i]["blue"])

        scheduleSettings.evening.lights[i]["x"] = parseFloat(xy.x);
        scheduleSettings.evening.lights[i]["y"] = parseFloat(xy.y);

        // Remove light name & RGB data
        delete scheduleSettings.evening.lights[i]["lightName"];
        delete scheduleSettings.evening.lights[i]["red"];
        delete scheduleSettings.evening.lights[i]["green"];
        delete scheduleSettings.evening.lights[i]["blue"];

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
        
        // Convert RGB to XY
        xy = lightshelper.rgb_to_xy(scheduleSettings.eveningtv.lights[i]["red"], scheduleSettings.eveningtv.lights[i]["green"], scheduleSettings.eveningtv.lights[i]["blue"])

        scheduleSettings.eveningtv.lights[i]["x"] = parseFloat(xy.x);
        scheduleSettings.eveningtv.lights[i]["y"] = parseFloat(xy.y);

        // Remove light name & RGB data
        delete scheduleSettings.eveningtv.lights[i]["lightName"];
        delete scheduleSettings.eveningtv.lights[i]["red"];
        delete scheduleSettings.eveningtv.lights[i]["green"];
        delete scheduleSettings.eveningtv.lights[i]["blue"];

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
// Add skills to server
//=========================================================
skill.get('/restore', restoreSettings);
skill.get('/view', viewSettings);
skill.post('/savemorning', saveMorningSettings);
skill.post('/saveevening', saveEveningSettings);
skill.post('/saveeveningtv', saveEveningTVSettings);

module.exports = skill;