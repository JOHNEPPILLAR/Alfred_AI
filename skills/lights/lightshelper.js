//=========================================================
// Setup lights skills
//=========================================================
const HueLights        = require("node-hue-api"),
      HueApi           = require("node-hue-api").HueApi,
      lightState       = HueLights.lightState;
      scheduleSettings = require('../../scheduleSettings.json'),
      dotenv           = require('dotenv');

dotenv.load() // Load env vars

const HueBridgeIP   = process.env.HueBridgeIP,
      HueBridgeUser = process.env.HueBridgeUser,
      Hue           = new HueApi(HueBridgeIP, HueBridgeUser);

//=========================================================
// Skill: registerDevice
//=========================================================
exports.registerDevice = function(res){
    // Send the register command to the Hue bridge
    Hue.config()
    .then(function(obj){
        // Send response back to caller
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, 'sucess', obj);
        } else {
            return obj;
        };
    })
    .fail(function(err){
        // Send response back to caller
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, 'error', err.message);
        } else {
            return err.message;
        };
        logger.error('registerDevice: ' + err);
    });
};

exports.lightOnOff = function(res, lightNumber, lightAction, brightness, x, y){
    // Validate input params and set state
    if (typeof brightness == 'undefined' || brightness == null){
        brightness = 100;
    };

    var state = lightState.create().off(); // Default off
    if (lightAction=='on'){
        if (typeof x == 'undefined' || x == null){
            state = lightState.create().on().brightness(brightness);
        } else {
            state = lightState.create().on().brightness(brightness).xy(x, y);
        };
    };
    // Change the light state
    Hue.setLightState(lightNumber, state)
    .then(function(obj){
        logger.info('Turned ' + lightAction + ' light ' + lightNumber);
        if (obj=true){
            var returnMessage = 'The light was turned ' + lightAction + '.',
                status = 'sucess';
        }else{
            var returnMessage = 'There was an error turning the light ' + lightAction + '.',
                status = 'error';
        };
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, status, returnMessage); // Send response back to caller
        } else {
            return returnMessage;
        };
    })
    .fail(function(err){
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, 'error', err); // Send response back to caller
        } else {
            return err;
        };
        logger.error('lightOnOff: ' + err);
    })
};

exports.dimLight = function(res, lightNumber, percentage){
    var state = lightState.create().on().brightness(percentage);
    // Dim the light
    Hue.setLightState(lightNumber, state)
    .then(function(obj){
        if (obj=true){
            var returnMessage = 'The light was dimmed.',
                status = 'sucess';
        }else{
            var returnMessage = 'There was an error dimming the light.',
                status = 'error';
                logger.error('dimLight: ' + returnMessage);
        };
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, status, returnMessage); // Send response back to caller
        } else {
            return returnMessage;
        };
    })
    .fail(function(err){
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, 'error', err); // Send response back to caller
        } else {
            return err;
        };
        logger.error('dimLight: ' + err);
    });
};

exports.brightenLight = function(res, lightNumber, percentage){
    var state = lightState.create().on().brightness(percentage);
    // Brightern the light
    Hue.setLightState(lightNumber, state)
    .then(function(obj){
        if (obj=true){
            var returnMessage = 'The light was brightened.',
                status = 'sucess';
        }else{
            var returnMessage = 'There was an error increasing the brightness.',
                status = 'error';
                logger.error('brightenLight: ' + returnMessage);
        };
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, status, returnMessage); // Send response back to caller
        } else {
            return returnMessage;
        };
    })
    .fail(function(err){
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, 'error', err); // Send response back to caller
        } else {
            return err;
        };
        logger.error('brightenLight: ' + err);
    });
};

exports.listLights = function(res){            
    Hue.lights()
    .then(function(obj){
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, 'sucess', obj); // Send response back to caller
        } else {
            return obj;  
        };
    })
    .fail(function(err){
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, 'error', err); // Send response back to caller
        } else {
            return err;
        };
        logger.info('listLights: ' + err);
    });
};

exports.tvLights = function(res){
    // Set the lights for watching TV
    var promises = [],
        lights   = scheduleSettings.tvLights,
        state;

    lights.forEach(function(value){
        state = lightState.create().on().brightness(value.brightness).xy(value.x, value.y);
        promises.push(Hue.setLightState(value.lightID, state));
    });
    Promise.all(promises)
    .then(function(resolved){
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, 'sucess', 'Turned on TV lights.'); // Send response back to caller
        } else {
            return 'Turned on TV lights.';
        };
    })
    .catch(function (err){
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, 'error', err);
        } else {
            return err;
        };
        logger.error('tvLights: ' + err);
    });
};

exports.allOff = function(res){
    // Set the lights for watching TV
    var state    = lightState.create().off(),
        promises = [];
               
    // Get a list of all the lights
    Hue.lights()
    .then (function(lights){            
        lights.lights.forEach(function(value){
            promises.push(Hue.setLightState(value.id, state)); // push the Promises to the array
        });
        Promise.all(promises)
        .then(function(resolved){
            if (typeof res !== 'undefined' && res !== null){
                alfredHelper.sendResponse(res, 'sucess', 'Turned off all lights.'); // Send response back to caller
            } else {
                return 'Turned off all lights.';
            };
            logger.info('Turned off lights');
        })
        .catch(function(err){
            if (typeof res !== 'undefined' && res !== null){
                alfredHelper.sendResponse(res, 'error', 'There was a problem turning off all the lights.');
            } else {
                return err;
            };
            logger.error('allOff Error: ' + err);
        });
    })
    .catch(function(err){
        if (typeof res !== 'undefined' && res !== null){
            alfredHelper.sendResponse(res, 'error', err);
        } else {
            return err;
        };
        logger.error('allOff Error: ' + err);
    });
};
