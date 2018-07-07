/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const harmony = require('harmonyhubjs-client');
const serviceHelper = require('../../lib/helper.js');

const skill = new Skills();

/**
 * @api {get} /tv/watchfiretv Turn on Fire TV
 * @apiName watchfiretv
 * @apiGroup TV
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: 'Turned on Fire TV'
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function watchFireTv(req, res, next) {
  serviceHelper.log('trace', 'watchFireTv', 'watchFireTv API called');
  try {
    const harmonyClient = await harmony(process.env.HarmonyIP);
    serviceHelper.log('trace', 'watchFireTv', 'Performing harmony task');
    harmonyClient.startActivity(25026204); // Fire TV ID
    harmonyClient.end();
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.log('trace', 'watchFireTv', 'Turned on Fire TV');
      serviceHelper.sendResponse(res, true, 'Turned on Fire TV');
      next();
    } else {
      return 'Turned on Fire TV';
    }
  } catch (err) {
    serviceHelper.log('trace', 'watchFireTv', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, null, err);
      next();
    } else {
      return err;
    }
  }
}
skill.get('/watchfiretv', watchFireTv);

/**
 * @api {get} /tv/watchvirgintv Turn on Virgin TV
 * @apiName watchvirgintv
 * @apiGroup TV
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: 'Turned on Virgin TV'
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function watchVirginTv(req, res, next) {
  serviceHelper.log('trace', 'watchVirginTv', 'watchVirginTv API called');
  try {
    const harmonyClient = await harmony(process.env.HarmonyIP);
    serviceHelper.log('trace', 'watchVirginTv', 'Performing harmony task');
    harmonyClient.startActivity(22797599); // Virgin TV ID
    harmonyClient.end();
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.log('trace', 'watchVirginTv', 'Turned on Virgin TV');
      serviceHelper.sendResponse(res, true, 'Turned on Virgin TV');
      next();
    } else {
      return 'Turned on Virgin TV';
    }
  } catch (err) {
    serviceHelper.log('trace', 'watchVirginTv', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, null, err);
      next();
    } else {
      return err;
    }
  }
}
skill.get('/watchvirgintv', watchVirginTv);

/**
 * @api {get} /tv/playps4 Turn on Play station 4
 * @apiName playps4
 * @apiGroup TV
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: 'Turned on Plat station'
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function playPS4(req, res, next) {
  serviceHelper.log('trace', 'playPS4', 'playPS4 API called');
  try {
    const harmonyClient = await harmony(process.env.HarmonyIP);
    serviceHelper.log('trace', 'playPS4', 'Performing harmony task');
    harmonyClient.startActivity(23898791); // PS4 ID
    harmonyClient.end();
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.log('trace', 'playPS4', 'Turned on PS4');
      serviceHelper.sendResponse(res, true, 'Turned on PS4');
      next();
    } else {
      return 'Turned on PS4';
    }
  } catch (err) {
    serviceHelper.log('trace', 'playPS4', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, null, err);
      next();
    } else {
      return err;
    }
  }
}
skill.get('/playps4', playPS4);

/**
 * @api {get} /tv/turnoff Turn off TV
 * @apiName turnoff
 * @apiGroup TV
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: 'Turned off TV'
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function turnOffTV(req, res, next) {
  serviceHelper.log('trace', 'turnOffTV', 'turnOffTV API called');
  try {
    const harmonyClient = await harmony(process.env.HarmonyIP);
    serviceHelper.log('trace', 'turnOffTV', 'Performing harmony task');
    harmonyClient.startActivity(-1); // All off ID
    harmonyClient.end();
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.log('trace', 'turnOffTV', 'Turned off living room TV');
      serviceHelper.sendResponse(res, true, 'Turned off living room TV');
      next();
    } else {
      return 'Turned off living room TV';
    }
  } catch (err) {
    serviceHelper.log('trace', 'turnOffTV', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, null, err);
      next();
    } else {
      return err;
    }
  }
}
skill.get('/turnoff', turnOffTV);

/**
 * @api {get} /tv/watchappletv Turn on Apple TV
 * @apiName watchappletv
 * @apiGroup TV
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: 'Turned on Apple TV'
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function watchAppleTV(req, res, next) {
  serviceHelper.log('trace', 'watchAppleTV', 'watchAppleTV API called');
  try {
    const harmonyClient = await harmony(process.env.HarmonyIP);
    serviceHelper.log('trace', 'watchAppleTV', 'Performing harmony task');
    harmonyClient.startActivity(22797639); // Apple TV ID
    harmonyClient.end();
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.log('trace', 'watchAppleTV', 'Turned on Apple TV');
      serviceHelper.sendResponse(res, true, 'Turned on Apple TV');
      next();
    } else {
      return 'Turned on Apple TV';
    }
  } catch (err) {
    serviceHelper.log('trace', 'watchAppleTV', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, null, err);
      next();
    } else {
      return err;
    }
  }
}
skill.get('/watchappletv', watchAppleTV);

module.exports = skill;
