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
        logger.info('Turned ' + lightAction + ' light ' + alfredHelper.getLightName(lightNumber));
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

exports.lightGroupOnOff = function(res, lightNumber, lightAction, brightness, x, y){
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

    // Change the light group state
    Hue.setGroupLightState(lightNumber, state)
    .then(function(obj){
        logger.info('Turned ' + lightAction + ' light group: ' + alfredHelper.getLightGroupName(lightNumber));
        if (obj=true){
            var returnMessage = 'The light group was turned ' + lightAction + '.',
                status = 'sucess';
        }else{
            var returnMessage = 'There was an error turning the light group ' + lightAction + '.',
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
        logger.error('lightGroupOnOff: ' + err);
    })
};

exports.dimLight = function(res, lightNumber, percentage){
    var state = lightState.create().on().brightness(percentage);
    // Dim the light
    Hue.setLightState(lightNumber, state)
    .then(function(obj){
        if (obj=true){
            var returnMessage = 'The ' + alfredHelper.getLightName(lightNumber) + ' was dimmed.',
                status = 'sucess';
        }else{
            var returnMessage = 'There was an error dimming the ' + alfredHelper.getLightName(lightNumber) + '.',
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
            var returnMessage = 'The ' + alfredHelper.getLightName(lightNumber) + ' was brightened.',
                status = 'sucess';
        }else{
            var returnMessage = 'There was an error increasing the brightness for ' + alfredHelper.getLightName(lightNumber) + '.',
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

exports.brightenLightGroup = function(res, lightNumber, percentage){
    var state = lightState.create().brightness(percentage);
    // Brightern the light
    Hue.setGroupLightState(lightNumber, state)
    .then(function(obj){
        if (obj=true){
            var returnMessage = 'The ' + alfredHelper.getLightName(lightNumber) + ' was brightened.',
                status = 'sucess';
        }else{
            var returnMessage = 'There was an error increasing the brightness for ' + alfredHelper.getLightName(lightNumber) + '.',
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

exports.listLights = function listLights(res) {
    return getLights(res)

    async function getLights(res) {
        try {
            var lights = await Hue.lights()
            if (typeof res !== 'undefined' && res !== null) {
                alfredHelper.sendResponse(res, 'sucess', lights); // Send response back to caller
            };
            return lights;
        } catch(err) {
            if (typeof res !== 'undefined' && res !== null) {
                alfredHelper.sendResponse(res, 'error', err); // Send response back to caller
            };
            logger.error('listLights: ' + err);
            return err;
        };
    };
};

exports.listLightGroups = function listLightGroups(res) {
    return getLightGroups(res)

    async function getLightGroups(res) {
        try {
            var lights = await Hue.groups()

            // Remove unwanted light groups from json
            var tidyLights = lights.filter(function(light){
                return light.type == "Room";
            });

            if (typeof res !== 'undefined' && res !== null) {
                alfredHelper.sendResponse(res, 'sucess', tidyLights); // Send response back to caller
            };
            return lights;
        } catch(err) {
            if (typeof res !== 'undefined' && res !== null) {
                alfredHelper.sendResponse(res, 'error', err); // Send response back to caller
            };
            logger.error('listLightGroups: ' + err);
            return err;
        };
    };
};

exports.tvLights = function(res){
    // Set the lights for watching TV
    var promises = [],
        lights   = scheduleSettings.tvLights,
        state;

    logger.info ("lights helper tvLights TODO")
    
    lights.forEach(function(value){
        state = lightState.create().on().brightness(value.brightness);
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

exports.scenes = function scenes(res) {
    return getLightScenes(res)

    async function getLightScenes(res) {
        try {
            var lights = await Hue.scenes()

            if (typeof res !== 'undefined' && res !== null) {
                alfredHelper.sendResponse(res, 'sucess', lights); // Send response back to caller
            };
            return lights;
        } catch(err) {
            if (typeof res !== 'undefined' && res !== null) {
                alfredHelper.sendResponse(res, 'error', err); // Send response back to caller
            };
            logger.error('scenes: ' + err);
            return err;
        };
    };
};

/*
exports.xy_to_rgb = function (x, y, brightness) {
    
    // Set to maximum brightness if no custom value was given (Not the slick ECMAScript 6 way for compatibility reasons)
	if (brightness === undefined) {
		brightness = 254;
	}

	var z = 1.0 - x - y;
	var Y = (brightness / 254).toFixed(2);
	var X = (Y / y) * x;
	var Z = (Y / y) * z;

	// Convert to RGB using Wide RGB D65 conversion
	var red   =  X * 1.656492 - Y * 0.354851 - Z * 0.255038;
	var green = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
	var blue  =  X * 0.051713 - Y * 0.121364 + Z * 1.011530;

	// If red, green or blue is larger than 1.0 set it back to the maximum of 1.0
	if (red > blue && red > green && red > 1.0) {
		green = green / red;
		blue  = blue / red;
		red   = 1.0;
	}
	else if (green > blue && green > red && green > 1.0) {
		red   = red / green;
		blue  = blue / green;
		green = 1.0;
	}
	else if (blue > red && blue > green && blue > 1.0) {
		red   = red / blue;
		green = green / blue;
		blue  = 1.0;
	}

	// Reverse gamma correction
	red   = red <= 0.0031308 ? 12.92 * red : (1.0 + 0.055) * Math.pow(red, (1.0 / 2.4)) - 0.055;
	green = green <= 0.0031308 ? 12.92 * green : (1.0 + 0.055) * Math.pow(green, (1.0 / 2.4)) - 0.055;
	blue  = blue <= 0.0031308 ? 12.92 * blue : (1.0 + 0.055) * Math.pow(blue, (1.0 / 2.4)) - 0.055;

	//Convert normalized decimal to decimal
	red   = Math.round(red * 255);
	green = Math.round(green * 255);
	blue  = Math.round(blue * 255);

	if (isNaN(red)) red = 0;

	if (isNaN(green)) green = 0;

	if (isNaN(blue)) blue = 0;

    var rgbJSON = {
        red : red,
        green : green,
        blue: blue
    };

	return rgbJSON;
}
*/
/*
exports.rgb_to_xy = function (red, green, blue) {

    //Apply a gamma correction to the RGB values, which makes the color more vivid and more the like the color displayed on the screen of your device
	var red   = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
	var green = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
	var blue  = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92); 

	//RGB values to XYZ using the Wide RGB D65 conversion formula
	var X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
	var Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
	var Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;

	//Calculate the xy values from the XYZ values
	var x = (X / (X + Y + Z)).toFixed(4);
	var y = (Y / (X + Y + Z)).toFixed(4);

	if (isNaN(x)) x = 0;

	if (isNaN(y)) y = 0;	 

    var xyJSON = {
        x : x,
        y : y
    };

	return xyJSON;
}
*/