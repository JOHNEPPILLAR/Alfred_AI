//=========================================================
// Setup lights skills
//=========================================================
const Skills = require('restify-router').Router;  
      skill  = new Skills(),
      HueApi = require("node-hue-api").HueApi;

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
    } else {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'Parameter light_number was not supplied.');
    };

    if (typeof req.query.light_status !== 'undefined' && req.query.light_status !== null) {
        paramsOK = true;
        switch (req.query.light_status.toLowerCase()) {
        case 'on':
            lightStatus = true;
            break;
        case 'off':
            lightStatus = false;
            break;
        default:
            paramsOK = false;

            // Send response back to caller
            alfredHelper.sendResponse(res, 'error', 'Parameter light_status was invalid, please use on|off.');
        };
    } else {
        paramsOK = false;

        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'Parameter light_status was not supplied.');
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
    };
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/lightsonoff', lightOnOff)

module.exports = skill;