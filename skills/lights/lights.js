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
function registerDevice(req, res, next) {
    logger.info('Register Device API called');
    lightshelper.registerDevice(res);
    next();
};

//=========================================================
// Skill: lights on/off
// Params: light_number: Number, light_status: String
//=========================================================
function lightOnOff(req, res, next) {
    var paramsOK = false;
    if ((typeof req.query.light_number !== 'undefined' && req.query.light_number !== null) ||
        (typeof req.query.light_status !== 'undefined' && req.query.light_status !== null) ||
        (typeof req.query.percentage !== 'undefined' && req.query.percentage !== null)){    
        paramsOK = true;
    };
    if (paramsOK){
        switch (req.query.light_status.toLowerCase()) {
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
    if(paramsOK) {
        lightshelper.lightOnOff(res, req.query.light_number, req.query.light_status.toLowerCase(), req.query.percentage, req.query.x, req.query.y, req.query.ct);
    } else {
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
        lightshelper.lightGroupOnOff(res, req.query.light_number, req.query.light_status.toLowerCase(), req.query.percentage, req.query.x, req.query.y, req.query.ct);
    } else {
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
// Skill: Turn off al lights
//=========================================================
function allOff (req, res, next){
    logger.info('Turn off all Lights API called');
    lightshelper.allOff(res);
    next();
};

//=========================================================
// Skill: Get scenes
//=========================================================
function scenes (req, res, next){
    logger.info('Get light scenes API called');
    lightshelper.scenes(res);
    next();
};

//=========================================================
// Skill: Get sensor info
//=========================================================
function sensor (req, res, next){
    logger.info('Get sensor API called');
    lightshelper.sensor(res);
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
// Skill: Get the state of a light
//=========================================================
function lightstate (req, res, next){
    logger.info('Light state API called');
    if (typeof req.query.light_number !== 'undefined' && req.query.light_number !== null) {
        lightshelper.lightstate(res, req.query.light_number);
    }else{
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameter light_number was not supplied.');
        logger.error('brightenLightGroup: The parameter light_number was not supplied.');
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
skill.get('/scenes', scenes);
skill.get('/sensor', sensor);
skill.get('/lightstate', lightstate);
skill.get('/turnOnMorningEveningLights', turnOnMorningEveningLights);

module.exports = skill;