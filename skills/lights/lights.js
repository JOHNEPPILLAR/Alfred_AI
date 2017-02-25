//=========================================================
// Setup lights skills
//=========================================================
const Skills = require('restify-router').Router;  
      skill  = new Skills(),
      HueApi = require("node-hue-api").HueApi,
      alfredHelper = require('../../helper.js');

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
        lightStatus = false;

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
        // Turn on or off the lights
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
        })
        .done();
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'The parameters light_status or light_number was either not supplied or invalid.');
    };
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/lightonoff', lightOnOff)

module.exports = skill;