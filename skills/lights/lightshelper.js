/**
 * Setup lights skills
 */
const HueLights = require('node-hue-api');
const HueApi = require('node-hue-api').HueApi;
const scheduleSettings = require('../../scheduleSettings.json');
const dotenv = require('dotenv');
const alfredHelper = require('../../helper.js');

dotenv.load(); // Load env vars

const lightState = HueLights.lightState;
const HueBridgeIP = process.env.HueBridgeIP;
const HueBridgeUser = process.env.HueBridgeUser;
const Hue = new HueApi(HueBridgeIP, HueBridgeUser);

/**
 * Skill: registerDevice
 */
exports.registerDevice = function FnRegisterDevice(res) {
  // Send the register command to the Hue bridge
  Hue.config()
    .then((obj) => {
      // Send response back to caller
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'true', obj);
      }
      return obj;
    })
    .fail((err) => {
      // Send response back to caller
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err.message);
      }
      logger.error(`registerDevice: ${err}`);
      return err.message;
    });
};

exports.lightOnOff = function FnLightOnOff(res, lightNumber, lightAction, brightness, x, y, ct) {
  let returnMessage;
  let status;

  // Validate input params and set state
  if (typeof brightness === 'undefined' || brightness == null) { brightness = 100; }

  let state = lightState.create().off(); // Default off
  if (lightAction === 'on') {
    if (typeof ct !== 'undefined' && ct != null) {
      state = lightState.create().on().brightness(brightness).ct(ct);
    } else if ((typeof x !== 'undefined' && x != null) &&
                (typeof y !== 'undefined' && y != null)) {
      state = lightState.create().on().brightness(brightness).xy(x, y);
    } else {
      state = lightState.create().on().brightness(brightness);
    }
  }

  // Change the light state
  Hue.setLightState(lightNumber, state)
    .then((obj) => {
      logger.info(`Turned ${lightAction} light ${alfredHelper.getLightName(lightNumber)}`);
      if (obj) {
        returnMessage = `The light was turned ${lightAction}.`;
        status = 'true';
      } else {
        returnMessage = `There was an error turning the light ${lightAction}.`;
        status = 'false';
      }
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, status, returnMessage); // Send response back to caller
      }
      return returnMessage;
    })
    .fail((err) => {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`lightOnOff: ${err}`);
      return err;
    });
};

exports.lightGroupOnOff = function FnLightGroupOnOff(res, lightNumber, lightAction, brightness, x, y, ct) {

  let returnMessage;
  let status;

  // Validate input params and set state
  if (typeof brightness === 'undefined' || brightness == null) {
    brightness = 100;
  }

  let state = lightState.create().off(); // Default off
  if (lightAction === 'on') {
    if (typeof ct !== 'undefined' && ct != null) {
      state = lightState.create().on().brightness(brightness).ct(ct);
    } else if ((typeof x !== 'undefined' && x != null) &&
                (typeof y !== 'undefined' && y != null)) {
      state = lightState.create().on().brightness(brightness).xy(x, y);
    } else {
      state = lightState.create().on().brightness(brightness);
    }
  }

  // Change the light group state
  Hue.setGroupLightState(lightNumber, state)
    .then((obj) => {
      logger.info(`Turned ${lightAction} light group: ${alfredHelper.getLightGroupName(lightNumber)}`);
      if (obj) {
        returnMessage = `The light group was turned ${lightAction}.`;
        status = 'true';
      } else {
        returnMessage = `There was an error turning the light group ${lightAction}.`;
        status = 'false';
      }
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, status, returnMessage); // Send response back to caller
      } 
      return returnMessage;
    })
    .fail((err) => {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`lightGroupOnOff: ${err}`);
      return err;
    });
};

exports.dimLight = function FnDimLight(res, lightNumber, percentage) {
  const state = lightState.create().on().brightness(percentage);
  let returnMessage;
  let status;

  // Dim the light
  Hue.setLightState(lightNumber, state)
    .then((obj) => {
      if (obj) {
        returnMessage = `The ${alfredHelper.getLightName(lightNumber)} was dimmed.`;
        status = 'true';
      } else {
        returnMessage = `There was an error dimming the ${alfredHelper.getLightName(lightNumber)}.`;
        status = 'false';
        logger.error(`dimLight: ${returnMessage}`);
      }
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, status, returnMessage); // Send response back to caller
      }
      return returnMessage;
    })
    .fail((err) => {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`dimLight: ${err}`);
      return err;
    });
};

exports.brightenLight = function FnBrightenLight(res, lightNumber, percentage) {
  const state = lightState.create().on().brightness(percentage);
  let returnMessage;
  let status;

  // Brightern the light
  Hue.setLightState(lightNumber, state)
    .then((obj) => {
      if (obj) {
        returnMessage = `The ${alfredHelper.getLightName(lightNumber)} was brightened.`;
        status = 'true';
      } else {
        returnMessage = `There was an error increasing the brightness for ${alfredHelper.getLightName(lightNumber)}.`;
        status = 'false';
        logger.error(`brightenLight: ${returnMessage}`);
      }
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, status, returnMessage); // Send response back to caller
      }
      return returnMessage;
    })
    .fail((err) => {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`brightenLight: ${err}`);
      return err;
    });
};

exports.brightenLightGroup = function FnBrightenLightGroup(res, lightNumber, percentage) {
  const state = lightState.create().brightness(percentage);
  let returnMessage;
  let status;

  // Brightern the light
  Hue.setGroupLightState(lightNumber, state)
    .then((obj) => {
      if (obj) {
        returnMessage = `The ${alfredHelper.getLightName(lightNumber)} was brightened.`;
        status = 'true';
      } else {
        returnMessage = `There was an error increasing the brightness for ${alfredHelper.getLightName(lightNumber)}.`;
        status = 'false';
        logger.error(`brightenLight: ${returnMessage}`);
      }
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, status, returnMessage); // Send response back to caller
      }
      return returnMessage;
    })
    .fail((err) => {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`brightenLight: ${err}`);
      return err;
    });
};

exports.listLights = function FnListLights(res) {
  async function getLights() {
    try {
      const lights = await Hue.lights();
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'true', lights); // Send response back to caller
      }
      return lights;
    } catch (err) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`listLights: ${err}`);
      return err;
    }
  }
  return getLights();
};

exports.listLightGroups = function FnListLightGroups(res) {
  async function getLightGroups() {
    try {
      const lights = await Hue.groups();

      // Remove unwanted light groups from json
      const tidyLights = lights.filter(light => light.type === 'Room');

      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'true', tidyLights); // Send response back to caller
      }
      return lights;
    } catch (err) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`listLightGroups: ${err}`);
      return err;
    }
  }
  return getLightGroups();
};

exports.allOff = function FnAllOff(res) {
  // Set the lights for watching TV
  const state = lightState.create().off();
  let promises = [];

  // Get a list of all the lights
  Hue.lights()
    .then((lights) => {
      lights.lights.forEach((value) => {
        promises.push(Hue.setLightState(value.id, state)); // push the Promises to the array
      });
      Promise.all(promises)
        .then((resolved) => {
          if (typeof res !== 'undefined' && res !== null) {
            alfredHelper.sendResponse(res, 'true', 'Turned off all lights.'); // Send response back to caller
          }
          logger.info('Turned off lights');
          return 'Turned off all lights.';
        })
        .catch((err) => {
          if (typeof res !== 'undefined' && res !== null) {
            alfredHelper.sendResponse(res, 'false', 'There was a problem turning off all the lights.');
          }
          logger.error(`allOff Error: ${err}`);
          return err;
        });
    })
    .catch((err) => {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err);
      }
      logger.error(`allOff Error: ${err}`);
      return err;
    });
};

exports.scenes = function FnScenes(res) {
  async function getLightScenes() {
    try {
      const lights = await Hue.scenes();

      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'true', lights); // Send response back to caller
      }
      return lights;
    } catch (err) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`scenes: ${err}`);
      return err;
    }
  }
  return getLightScenes();
};

exports.sensor = function FnSensor(res) {
  async function getSensors() {
    try {
      const sensors = await Hue.sensors();

      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'true', sensors); // Send response back to caller
      }
      return sensors;
    } catch (err) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`scenes: ${err}`);
      return err;
    }
  }
  return getSensors();
};

exports.lightstate = function FnLightstate(res, lightNumber) {
  async function getLightState() {
    try {
      const state = await Hue.lightStatus(lightNumber);

      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'true', state); // Send response back to caller
      }
      return state;
    } catch (err) {
      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
      }
      logger.error(`lightstate: ${err}`);
      return err;
    }
  }
  return getLightState();
};
