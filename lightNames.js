
const schedule = require('node-schedule');
const dotenv = require('dotenv');
const lightshelper = require('./skills/lights/lightshelper.js');

dotenv.load(); // Load env vars

exports.setupLightNames = function FnSetupLightNames() {
  // Setup daily timer function
  const rule = new schedule.RecurrenceRule();
  rule.hour = new Date().getHours();
  rule.minute = new Date().getMinutes() + 1;

  const dailyTimer = new schedule.scheduleJob(rule, (() => {
    logger.info('Setting up light/light group names');

    Promise.all([lightshelper.listLights(), lightshelper.listLightGroups()])
      .then(([listLights, listLightGroups]) => {
        // Setup light names
        if (listLights instanceof Error) {
          logger.error(`schedule setup: ${listLights}`);
        } else {
          listLights.lights.forEach((value) => {
            lightNames.push({ id: value.id, name: value.name });
          });
        }

        // Setup ligh group names
        if (listLightGroups instanceof Error) {
          logger.error(`schedule setup: ${listLightGroups}`);
        } else {
          listLightGroups.forEach((value) => {
            lightGroupNames.push({ id: value.id, name: value.name });
          });
        }
      })
      .catch((err) => {
        logger.error(`Setup light names: ${err}`);
      });
  }));
};
