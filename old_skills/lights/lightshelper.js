/**
 * Setup includes
 */
require('dotenv').config();

const alfredHelper = require('../../lib/helper.js');
const _ = require('underscore');
const logger = require('winston');
const huejay = require('huejay');

const { HueBridgeIP, HueBridgeUser } = process.env;
const hue = new huejay.Client({
  host:     HueBridgeIP,
  username: HueBridgeUser, 
  timeout:  15000, // Optional, timeout in milliseconds (15000 is the default)
});

/**
 * Skill: lights on/off
 */
exports.lightOnOff = async function FnLightOnOff(res, lightNumber, lightAction, brightness, x, y, ct) {
  let returnMessage;
  let returnState;

  try {
    let light = await hue.lights.getById(lightNumber);
  
    // Configure light state
    light.on = false;
    if (lightAction === 'on') {
      light.on = true;
      if (typeof brightness !== 'undefined' && brightness != null) {
        light.brightness = brightness;
      }
      if ((typeof x !== 'undefined' && x != null) &&
          (typeof y !== 'undefined' && y != null)) {
        light.xy = [x, y];
      }
      if (typeof ct !== 'undefined' && ct != null) {
        light.ct = ct;
      }
    }

    // Save light state
    const saved = await hue.lights.save(light);
    if (saved) {
      returnState = true;
      returnMessage = `Light ${alfredHelper.getLightName(lightNumber)} was turned ${lightAction}.`;
      logger.info(`Light ${alfredHelper.getLightName(lightNumber)} was turned ${lightAction}.`);
    } else {
      returnState = false;
      returnMessage = `There was an error turning light ${alfredHelper.getLightName(lightNumber)} ${lightAction}.`;
      logger.error(`There was an error turning light ${alfredHelper.getLightName(lightNumber)} ${lightAction}.`);
    }
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, returnState, returnMessage); // Send response back to caller
    } else {
      return returnMessage;
    }
  } catch (err) {
    logger.error(`lightOnOff: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};

/**
 * Skill: light group on/off
 */
exports.lightGroupOnOff = async function FnLightGroupOnOff(res, groupNumber, lightAction, brightness, x, y, ct) {
  let returnMessage;
  let returnState;
  try {
    let lights = await hue.groups.getById(groupNumber);
  
    // Configure light state
    lights.on = false;
    if (lightAction === 'on') {
      lights.on = true;
      if (typeof brightness !== 'undefined' && brightness != null) {
        lights.brightness = brightness;
      }
      if ((typeof x !== 'undefined' && x != null) &&
          (typeof y !== 'undefined' && y != null)) {
        lights.xy = [x, y];
      }
      if (typeof ct !== 'undefined' && ct != null) {
        lights.ct = ct;
      }
    }

    // Save light state
    const saved = await hue.groups.save(lights);
    if (saved) {
      returnState = true;
      returnMessage = `Light group ${alfredHelper.getLightGroupName(groupNumber)} was turned ${lightAction}.`;
      logger.info(`Light group ${alfredHelper.getLightGroupName(groupNumber)} was turned ${lightAction}.`);
    } else {
      returnState = false;
      returnMessage = `There was an error turning light group ${alfredHelper.getLightGroupName(groupNumber)} ${lightAction}.`;
      logger.error(`There was an error turning light group ${alfredHelper.getLightGroupName(groupNumber)} ${lightAction}.`);
    }
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, returnState, returnMessage); // Send response back to caller
    } else {
      return returnMessage;
    }
  } catch (err) {
    logger.error(`lightGroupOnOff: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};

/**
 * Skill: light group brightness
 */
exports.lightGroupBrightness = async function FnlightGroupBrightness(res, groupNumber, brightness) {
  let returnMessage;
  let returnState;

  try {
    let lights = await hue.groups.getById(groupNumber);
    lights.brightness = brightness;
    const saved = await hue.groups.save(lights);
    if (saved) {
      returnState = true;
      returnMessage = `Light group ${alfredHelper.getLightGroupName(groupNumber)} brightness was set to ${brightness}.`;
      logger.info(`Light group ${alfredHelper.getLightGroupName(groupNumber)} brightness was set to ${brightness}.`);
    } else {
      returnState = false;
      returnMessage = `There was an error updating light group ${groupNumber} brighness to ${brightness}.`;
      logger.error(`There was an error updating light group ${groupNumber} brighness to ${brightness}.`);
    }
    lights = null; // DeAllocate state object
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, returnState, returnMessage); // Send response back to caller
    } else {
      return returnMessage;
    }
  } catch (err) {
    logger.error(`lightGroupBrightness: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};

/**
 * Skill: list lights
 */
exports.listLights = async function FnListLights(res) {
  try {
    const lights = await hue.lights.getAll();
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, lights); // Send response back to caller
    } else {
      return lights;
    }
  } catch (err) {
    logger.error(`listLights: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};

/**
 * Skill: list light groups
 */
exports.listLightGroups = async function FnListLightGroups(res) {
  try {
    const lights = await hue.groups.getAll();

    // Remove unwanted light groups from json
    const tidyLights = lights.filter(light => light.type === 'Room');

    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, tidyLights); // Send response back to caller
    } else {
      return lights;
    }
  } catch (err) {
    logger.error(`listLightGroups: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};

/**
 * Skill: turn off all lights
 */
exports.allOff = async function FnAllOff(res) {
  try {
    const lights = await hue.groups.getById(0);
    lights.on = false;
    hue.groups.save(lights);
    alfredHelper.sendResponse(res, true, 'Turned off all lights.'); // Send response back to caller
  } catch (err) {
    state = null; // DeAllocate state object
    global.logger.error(`allOff Error: ${err}`);
    alfredHelper.sendResponse(res, null, 'There was a problem turning off all the lights.');
    return err;
  }
};

/**
 * Skill: get scenes
 */
exports.scenes = async function FnScenes(res) {
  try {
    const lights = await hue.scenes.getAll();

    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, lights); // Send response back to caller
    } else {
      return lights;
    }
  } catch (err) {
    logger.error(`scenes: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};

/**
 * Skill: get sensor light and motion details
 */
exports.lightMotion = async function FNlightMotion(res) {
  try {
    let sensorData = await hue.sensors.getAll();
    sensorData = sensorData.filter(o => (o.type === 'ZLLPresence' || o.type === 'ZLLLightLevel'));
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, sensorData); // Send response back to caller
    } else {
      return sensorData;
    }
  } catch (err) {
    logger.error(`lightMotion: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};

/**
 * Skill: get sensor details
 */
exports.sensor = async function FnSensor(res) {
  try {
    const sensors = await hue.sensors.getAll();

    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, sensors); // Send response back to caller
    } else {
      return sensors;
    }
  } catch (err) {
    logger.error(`scenes: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};

/**
 * Skill: get light details
 */
exports.lightstate = async function FnLightstate(res, lightNumber) {
  try {
    const lights = await hue.lights.getById(lightNumber);

    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, lights.state.attributes); // Send response back to caller
    } else {
      return state;
    }
  } catch (err) {
    logger.error(`lightstate: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};
