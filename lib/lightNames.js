const lightshelper = require('../skills/lights/lightshelper.js');
const logger = require('winston');

exports.setupLightNames = function FnSetupLightNames() {
  logger.info('Setting up light/light group names');

  Promise.all([lightshelper.listLights(), lightshelper.listLightGroups()])
    .then(([listLights, listLightGroups]) => {
      // Setup light names
      if (listLights instanceof Error) {
        logger.error(`schedule setup: ${listLights}`);
      } else {
        listLights.forEach((value) => {
          global.lightNames.push({ id: value.attributes.attributes.id, name: value.attributes.attributes.name });
        });
      }

      // Setup ligh group names
      if (listLightGroups instanceof Error) {
        logger.error(`schedule setup: ${listLightGroups}`);
      } else {
        listLightGroups.forEach((value) => {
          global.lightGroupNames.push({ id: value.attributes.attributes.id, name: value.attributes.attributes.name });
        });
      }
    })
    .catch((err) => {
      logger.error(`Setup light names: ${err}`);
    });
};
