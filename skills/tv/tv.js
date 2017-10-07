/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const harmony = require('harmonyhubjs-client');

const skill = new Skills();

/**
 * @api {get} /tv/watchfiretv Turn on Fire TV
 * @apiName watchfiretv
 * @apiGroup TV
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
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
  logger.info('Watch Fire TV API called');
  try {
    const harmonyClient = await harmony(process.env.harmonyip);
    harmonyClient.startActivity(25026204); // Fire TV ID
    harmonyClient.end();
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, 'Turned on Fire TV');
    }
    next();
    return 'Turned on Fire TV';
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    }
    logger.error(`watchFireTv: ${err}`);
    next();
    return err;
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
 *     sucess: 'true'
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
  logger.info('Watch Virgin TV API called');
  try {
    const harmonyClient = await harmony(process.env.harmonyip);
    harmonyClient.startActivity(22797599); // Virgin TV ID
    harmonyClient.end();
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, 'Turned on Virgin TV');
    }
    next();
    return 'Turned on Virgin TV';
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    }
    logger.error(`watchVirginTv: ${err}`);
    next();
    return err;
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
 *     sucess: 'true'
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
async function playps4(req, res, next) {
  logger.info('Play PS4 API called');
  try {
    const harmonyClient = await harmony(process.env.harmonyip);
    harmonyClient.startActivity(23898791); // PS4 ID
    harmonyClient.end();
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, 'Turned on Play station');
    }
    next();
    return 'Turned on Play station';
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    }
    logger.error(`playps4: ${err}`);
    next();
    return err;
  }
}
skill.get('/playps4', playps4);

/**
 * @api {get} /tv/turnoff Turn off TV
 * @apiName turnoff
 * @apiGroup TV
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
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
async function turnofftv(req, res, next) {
  logger.info('Turn off TV API called');
  try {
    const harmonyClient = await harmony(process.env.harmonyip);
    harmonyClient.startActivity(-1); // All off ID
    harmonyClient.end();
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, 'Turned off TV');
    }
    next();
    return 'Turned off TV';
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    }
    logger.error(`turnofftv: ${err}`);
    next();
    return err;
  }
}
skill.get('/turnoff', turnofftv);

/**
 * @api {get} /tv/watchappletv Turn on Apple TV
 * @apiName watchappletv
 * @apiGroup TV
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
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
  logger.info('Watch Apple TV API called');
  try {
    const harmonyClient = await harmony(process.env.harmonyip);
    harmonyClient.startActivity(22797639); // Apple TV ID
    harmonyClient.end();
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, 'Turned on Apple TV');
    }
    next();
    return 'Turned on Apple TV';
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    }
    logger.error(`watchAppleTV: ${err}`);
    next();
    return err;
  }
}
skill.get('/watchappletv', watchAppleTV);

module.exports = skill;
