//=========================================================
// Setup lights skills
//=========================================================
const Skills           = require('restify-router').Router;  
      skill            = new Skills(),
      scheduleSettings = require('../../scheduleSettings.json'),
      lightshelper     = require('./lightshelper.js');

//=========================================================
// Skill: registerDevice
//=========================================================
function registerDevice(req, res, next){
    logger.info('Register Device API called');
    lightshelper.registerDevice(res);
    next();
};

//=========================================================
// Skill: lights on/off
// Params: light_number: Number, light_status: String
//=========================================================
function lightOnOff(req, res, next){
    var paramsOK = false;
    if ((typeof req.query.light_number !== 'undefined' && req.query.light_number !== null) ||
        (typeof req.query.light_status !== 'undefined' && req.query.light_status !== null) ||
        (typeof req.query.percentage !== 'undefined' && req.query.percentage !== null)){    
        paramsOK = true;
    };
    if (paramsOK){
        switch (req.query.light_status.toLowerCase()){
        case 'on':
            lightAction = true;
            break;
        case 'off':
            lightAction = false;
            break;
        default:
            paramsOK = false;
        };
    } else {
       paramsOK = false; 
    };
    if(paramsOK){
        lightshelper.lightOnOff(res, req.query.light_number, req.query.light_status.toLowerCase(), req.query.percentage, req.query.rgb);
    }else{
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameters light_status, light_number or percentage was either not supplied or invalid.');
        logger.info('lightOnOff: The parameters light_status, light_number or percentage was either not supplied or invalid.');
    };
    next();
};

//=========================================================
// Skill: light group on/off
// Params: light_number: Number, light_status: String
//=========================================================
function lightGroupOnOff(req, res, next){
    var paramsOK = false;
    if ((typeof req.query.light_number !== 'undefined' && req.query.light_number !== null) ||
        (typeof req.query.light_status !== 'undefined' && req.query.light_status !== null) ||
        (typeof req.query.percentage !== 'undefined' && req.query.percentage !== null)){    
        paramsOK = true;
    };
    if (paramsOK){
        switch (req.query.light_status.toLowerCase()){
        case 'on':
            lightAction = true;
            break;
        case 'off':
            lightAction = false;
            break;
        default:
            paramsOK = false;
        };
    } else {
       paramsOK = false; 
    };
    if(paramsOK){
        if (typeof req.query.red !== 'undefined' && req.query.red !== null && 
            typeof req.query.green !== 'undefined' && req.query.green !== null &&
            typeof req.query.blue !== 'undefined' && req.query.blue !== null) {
            
            var xy = lightshelper.rgb_to_xy(parseInt(req.query.red), parseInt(req.query.green), parseInt(req.query.blue))
            lightshelper.lightGroupOnOff(res, req.query.light_number, req.query.light_status.toLowerCase(), req.query.percentage, xy.x, xy.y);
        } else {
            lightshelper.lightGroupOnOff(res, req.query.light_number, req.query.light_status.toLowerCase(), req.query.percentage);
        }
    }else{
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameters light_status, light_number or percentage was either not supplied or invalid.');
        logger.info('lightGroupOnOff: The parameters light_status, light_number or percentage was either not supplied or invalid.');
    };
    next();
};

//=========================================================
// Skill: dimlight
// Params: light_number: Number
// Params: percentage
//=========================================================
function dimLight(req, res, next){
    logger.info('Dim Light API called');
    if ((typeof req.query.light_number !== 'undefined' && req.query.light_number !== null) &&
        (typeof req.query.percentage !== 'undefined' && req.query.percentage !== null)){
        lightshelper.dimLight(res, req.query.light_number, req.query.percentage);
    }else{
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameter light_number or percentage was not supplied.');
        logger.error('dimLight: The parameter light_number or percentage was not supplied.');
    };
    next();
};

//=========================================================
// Skill: brightenLight
// Params: light_number: Number
//=========================================================
function brightenLight(req, res, next){
    logger.info('Brighten Light API called');
    if ((typeof req.query.light_number !== 'undefined' && req.query.light_number !== null) &&
        (typeof req.query.percentage !== 'undefined' && req.query.percentage !== null)){
        // Brighten the light
        lightshelper.brightenLight(res, req.query.light_number, req.query.percentage);
    }else{
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameter light_number or percentage was not supplied.');
        logger.error('brightenLight: The parameter light_number or percentage was not supplied.');
    };
    next();
};

//=========================================================
// Skill: brightenLightGroup
// Params: light_number: Number
//=========================================================
function brightenLightGroup(req, res, next){
    logger.info('Brighten Light Group API called');
    if ((typeof req.query.light_number !== 'undefined' && req.query.light_number !== null) &&
        (typeof req.query.percentage !== 'undefined' && req.query.percentage !== null)){
        // Brighten the light
        lightshelper.brightenLightGroup(res, req.query.light_number, req.query.percentage);
    }else{
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameter light_number or percentage was not supplied.');
        logger.error('brightenLightGroup: The parameter light_number or percentage was not supplied.');
    };
    next();
};

//=========================================================
// Skill: listLights
//=========================================================
function listLights(req, res, next){
    logger.info('List Lights API called');
    lightshelper.listLights(res);
    next();
};

//=========================================================
// Skill: listLightGroups
//=========================================================
function listLightGroups(req, res, next){
    logger.info('List Light Groups API called');
    lightshelper.listLightGroups(res);
    next();
};

//=========================================================
// Skill: tvLights
//=========================================================
function tvLights(req, res, next){
    logger.info('TV Lights API called');
    lightshelper.tvLights(res);
    next();
};

//=========================================================
// Skill: tvLights
//=========================================================
function allOff (req, res, next){
    logger.info('Turn off all Lights API called');
    lightshelper.allOff(res);
    next();
};

//=========================================================
// Skill: Turn On Morning/Evening Lights
//=========================================================
function turnOnMorningEveningLights (req, res, next){
    logger.info('Turn on Morning/Evening lights API called');
    lightshelper.turnOnMorningEveningLights(res);
    next();
};

//=========================================================
// Skill: Convert xy to RGB
//=========================================================
function xyToRGB (req, res, next){
    logger.info('Convert xy to RGB API called');

    if ((typeof req.query.x !== 'undefined' && req.query.x !== null) &&
        (typeof req.query.y !== 'undefined' && req.query.y !== null) &&
        (typeof req.query.brightness !== 'undefined' && req.query.brightness !== null)) {
        var result = lightshelper.xy_to_rgb(req.query.x, req.query.y, req.query.brightness);
        alfredHelper.sendResponse(res, 'sucess', result);
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameter x or y was not supplied.');
        logger.error('xyToRGB: The parameter x or y was not supplied.');
    };
    next();
};

//=========================================================
// Skill: Convert RGB to xy
//=========================================================
function RGBToXY (req, res, next){
    logger.info('Convert RGB to xy API called');

    if ((typeof req.query.r !== 'undefined' && req.query.r !== null) &&
        (typeof req.query.g !== 'undefined' && req.query.g !== null) &&
        (typeof req.query.b !== 'undefined' && req.query.b !== null)) {
        var result = lightshelper.rgb_to_xy(req.query.r, req.query.b, req.query.b);
        alfredHelper.sendResponse(res, 'sucess', result);
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameter red, green or blue was not supplied.');
        logger.error('RGBToXY: The parameter red, green or blue was not supplied.');
    };
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/registerdevice', registerDevice);
skill.get('/lightonoff', lightOnOff);
skill.get('/lightgrouponoff', lightGroupOnOff);
skill.get('/dimlight', dimLight);
skill.get('/brightenlight', brightenLight);
skill.get('/brightenlightgroup', brightenLightGroup);
skill.get('/listlights', listLights);
skill.get('/listlightgroups', listLightGroups);
skill.get('/tvlights', tvLights);
skill.get('/alloff', allOff);
skill.get('/turnOnMorningEveningLights', turnOnMorningEveningLights);
skill.get('/xytorgb', xyToRGB);
skill.get('/rgbtoxy', RGBToXY);

module.exports = skill;