//=========================================================
// Setup lights skills
//=========================================================
const Skills = require('restify-router').Router;  
      skill  = new Skills(),
      HueApi = require("node-hue-api").HueApi,
      alfredHelper = require('../../helper.js');

//=========================================================
// Skill: registerDevice
//=========================================================
function registerDevice (req, res, next) {

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
        console.log('registerDevice: ' + err);
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
          Hue           = new HueApi(HueBridgeIP, HueBridgeUser),
          lightNumber   = req.query.light_number;
    
    var paramsOK    = false,
        lightStatus = false,
        lightState  = hue.lightState;

    if (typeof lightNumber !== 'undefined' && lightNumber !== null) {
        paramsOK = true;
    };

    if (typeof req.query.light_status !== 'undefined' && req.query.light_status !== null) {
        switch (req.query.light_status.toLowerCase()) {
        case 'on':
            paramsOK = true;
            lightStatus = true;
            break;
        case 'off':
            paramsOK = true;
            lightStatus = false;
            break;
        default:
            paramsOK = false;
        };
    } else {
        paramsOK = false;
    };

    if(paramsOK) {
        // Turn on or off the light
        //Hue.lightState.create().on().brightness(100)
        Hue.setLightState(lightNumber, {"on": lightStatus})
        .then(function(obj) {
            if (obj=true) {
                var returnMessage = 'The light state was changed.',
                    status = 'sucess';
            } else {
                var returnMessage = 'There was an error changing the light state.',
                    status = 'error';
            }

            // Send response back to caller
            alfredHelper.sendResponse(res, status, returnMessage);
        })
        .fail(function(err) {

            // Send response back to caller
            alfredHelper.sendResponse(res, 'error', err);
            console.log('lightOnOff: ' + err);
        })
        .done();
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameters light_status or light_number was either not supplied or invalid.');
        console.log('lightOnOff: The parameters light_status or light_number was either not supplied or invalid.');
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
                    console.log('dimLight: ' + returnMessage);
            }

            // Send response back to caller
            alfredHelper.sendResponse(res, status, returnMessage);
        })
        .fail(function(err) {

            // Send response back to caller
            alfredHelper.sendResponse(res, 'error', err);
            console.log('dimLight: ' + err);
        })
        .done();
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameter light_number was not supplied.');
        console.log('dimLight: The parameter light_number was not supplied.');
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
                    console.log('dimLight: ' + returnMessage);
            }

            // Send response back to caller
            alfredHelper.sendResponse(res, status, returnMessage);
        })
        .fail(function(err) {

            // Send response back to caller
            alfredHelper.sendResponse(res, 'error', err);
            console.log('dimLight: ' + err);
        })
        .done();
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameter light_number was not supplied.');
        console.log('dimLight: The parameter light_number was not supplied.');
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

    Hue.lights()
    .then(function(obj) {

        // Send response back to caller
        alfredHelper.sendResponse(res, 'sucess', obj);

    })
    .fail(function(err) {

        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', err);
        console.log('listLights: ' + err);
    })
    .done();

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

module.exports = skill;