//=========================================================
// Setup lights skills
//=========================================================
const Skills           = require('restify-router').Router;  
      skill            = new Skills(),
      HueApi           = require("node-hue-api").HueApi,
      alfredHelper     = require('../../helper.js'),
      logger           = require('winston'),
      scheduleSettings = require('../../scheduleSettings.json');

//=========================================================
// Skill: registerDevice
//=========================================================
function registerDevice (req, res, next) {

    logger.info ('Register Device API called');

    const HueBridgeIP   = process.env.HueBridgeIP,
          HueBridgeUser = process.env.HueBridgeUser,
          Hue           = new HueApi(HueBridgeIP, HueBridgeUser);

    // Send the register command to the Hue bridge
    Hue.config()
    .then(function(obj) {
        alfredHelper.sendResponse(res, 'sucess', obj);
    })
    .fail(function(err) {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', err);
        logger.error('registerDevice: ' + err);
    })
    next();
};

//=========================================================
// Skill: lights on/off
// Params: light_number: Number, light_status: String
//=========================================================
function lightOnOff (req, res, next) {

    const HueBridgeIP   = process.env.HueBridgeIP,
          HueBridgeUser = process.env.HueBridgeUser,
          Hue           = new HueApi(HueBridgeIP, HueBridgeUser);
    
    var paramsOK    = false,
        lightAction = false,
        lightState  = Hue.lightState;

    logger.info ('Light On / Off API called');

    if (typeof req.query.light_number !== 'undefined' && req.query.light_number !== null) {
        paramsOK = true;
    };

    if (typeof req.query.light_status !== 'undefined' && req.query.light_status !== null) {
        paramsOK = true;
    } else {
       paramsOK = false; 
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
        // Turn on or off the light
        Hue.setLightState(req.query.light_number, {"on": lightAction})
        .then(function(obj) {
            if (obj=true) {
                var returnMessage = 'The light was turned ' + req.query.light_status.toLowerCase() + '.',
                    status = 'sucess';
            } else {
                var returnMessage = 'There was an error turning the light ' + req.query.light_status.toLowerCase() + '.',
                    status = 'error';
            }

            // Send response back to caller
            alfredHelper.sendResponse(res, status, returnMessage);
        })
        .fail(function(err) {

            // Send response back to caller
            alfredHelper.sendResponse(res, 'error', err);
            logger.error('lightOnOff: ' + err);
        })
        .done();
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameters light_status or light_number was either not supplied or invalid.');
        logger.info('lightOnOff: The parameters light_status or light_number was either not supplied or invalid.');
    };
    next();
};

//=========================================================
// Skill: dimlight
// Params: light_number: Number
//=========================================================
function dimLight (req, res, next) {

    const HueBridgeIP   = process.env.HueBridgeIP,
          HueBridgeUser = process.env.HueBridgeUser,
          Hue           = new HueApi(HueBridgeIP, HueBridgeUser),
          lightNumber   = req.query.light_number;

    logger.info ('Dim Light API called');

    if (typeof lightNumber !== 'undefined' && lightNumber !== null) {
        // Dim the light
        Hue.setLightState(lightNumber, {'brightness': '30'})
        .then(function(obj) {
            if (obj=true) {
                var returnMessage = 'The light was dimmed.',
                    status = 'sucess';
            } else {
                var returnMessage = 'There was an error dimming the light.',
                    status = 'error';
                    logger.error('dimLight: ' + returnMessage);
            }

            // Send response back to caller
            alfredHelper.sendResponse(res, status, returnMessage);
        })
        .fail(function(err) {

            // Send response back to caller
            alfredHelper.sendResponse(res, 'error', err);
            logger.error('dimLight: ' + err);
        })
        .done();
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameter light_number was not supplied.');
        logger.error('dimLight: The parameter light_number was not supplied.');
    };
    next();
};

//=========================================================
// Skill: brightenLight
// Params: light_number: Number
//=========================================================
function brightenLight (req, res, next) {

    const HueBridgeIP   = process.env.HueBridgeIP,
          HueBridgeUser = process.env.HueBridgeUser,
          Hue           = new HueApi(HueBridgeIP, HueBridgeUser),
          lightNumber   = req.query.light_number;

    logger.info ('Brighten Light API called');

    if (typeof lightNumber !== 'undefined' && lightNumber !== null) {
        // Brighten the light
        Hue.setLightState(lightNumber, {'brightness': '100'})
        .then(function(obj) {
            if (obj=true) {
                var returnMessage = 'The light was brightened.',
                    status = 'sucess';
            } else {
                var returnMessage = 'There was an error increasing the brightness.',
                    status = 'error';
                    logger.errror('dimLight: ' + returnMessage);
            }

            // Send response back to caller
            alfredHelper.sendResponse(res, status, returnMessage);
        })
        .fail(function(err) {

            // Send response back to caller
            alfredHelper.sendResponse(res, 'error', err);
            logger.error('dimLight: ' + err);
        })
        .done();
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameter light_number was not supplied.');
    };
    next();
};

//=========================================================
// Skill: listLights
//=========================================================
function listLights (req, res, next) {

    const HueBridgeIP   = process.env.HueBridgeIP,
          HueBridgeUser = process.env.HueBridgeUser,
          Hue           = new HueApi(HueBridgeIP, HueBridgeUser);

    logger.info ('List Lights API called');

    Hue.lights()
    .then(function(obj) {

        // Send response back to caller
        alfredHelper.sendResponse(res, 'sucess', obj);

    })
    .fail(function(err) {

        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', err);
        logger.info('listLights: ' + err);
    })
    .done();

    next();
};

//=========================================================
// Skill: tvLights
//=========================================================
function tvLights (req, res, next) {

    const HueBridgeIP   = process.env.HueBridgeIP,
          HueBridgeUser = process.env.HueBridgeUser,
          Hue           = new HueApi(HueBridgeIP, HueBridgeUser),
          lights        = scheduleSettings.tvLights;

    logger.info ('TV Lights API called');

    var promises = [],
        state;

    lights.forEach(function(value){
        state = lightState.create().on().brightness(value.brightness).xy(value.x, value.y);
        promises.push(Hue.setLightState(value.lightID, state));
    });
    Promise.all(promises)
    .then(function(resolved) {

        // Send response back to caller
        alfredHelper.sendResponse(res, 'sucess', 'TV Lights on');

    })
    .catch(function (err) {
        logger.error('TV lights  Error: ' + err);
    });

    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/registerdevice', registerDevice);
skill.get('/lightonoff', lightOnOff);
skill.get('/dimlight', dimLight);
skill.get('/brightenlight', brightenLight);
skill.get('/listlights', listLights);
skill.get('/tvlights', tvLights);

module.exports = skill;