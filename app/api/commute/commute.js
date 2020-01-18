/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('alfred-helper');

const skill = new Skills();

/**
 * @api {get} /commute/Status Get commute status
 * @apiName getCommuteStatus
 * @apiGroup Travel
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: {
 *       "anyDisruptions": false,
 *    }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function getCommuteStatus(req, res, next) {
  serviceHelper.log('trace', 'getCommuteStatus API called');
  try {
    serviceHelper.log('trace', 'Call commute service');
    const apiURL = `${process.env.ALFRED_COMMUTE_SERVICE}/getcommutestatus`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const apiData = await serviceHelper.callAlfredServiceGet(apiURL);
    if (apiData instanceof Error) {
      serviceHelper.log('error', apiData.message);
      serviceHelper.sendResponse(res, 500, apiData);
      next();
      return;
    }

    serviceHelper.sendResponse(res, 200, apiData.data);
    next();
    return;
  } catch (err) {
    serviceHelper.log('error', err.message);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 500, err);
      next();
    }
  }
}
skill.get('/getcommutestatus', getCommuteStatus);

/**
 * @api {get} /commute Get commute information
 * @apiName commute
 * @apiGroup Travel
 *
 * @apiParam {String} lat
 * @apiParam {String} long
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: {
 *       "anyDisruptions": false,
 *       "commuteResults": [
 *           ...
 *       ]
 *    }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */

async function getCommute(req, res, next) {
  serviceHelper.log('trace', 'getCommute API called');
  serviceHelper.log('trace', `Params: ${JSON.stringify(req.params)}`);

  const { lat, long } = req.params;

  serviceHelper.log('trace', 'Checking for params');
  if (
    (typeof lat === 'undefined' && lat === null && lat === '')
    || (typeof long === 'undefined' && long === null && long === '')
  ) {
    serviceHelper.log('info', 'Missing param: lat/long');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing param: lat/long');
      next();
    }
    return false;
  }

  try {
    serviceHelper.log('trace', 'Call commute service');
    const apiURL = `${process.env.ALFRED_COMMUTE_SERVICE}/commute/${lat}/${long}`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const apiData = await serviceHelper.callAlfredServiceGet(apiURL);
    if (apiData instanceof Error) {
      serviceHelper.log('error', apiData.message);
      serviceHelper.sendResponse(res, 500, apiData);
      next();
      return false;
    }

    serviceHelper.sendResponse(res, 200, apiData.data);
    next();
    return true;
  } catch (err) {
    serviceHelper.log('error', err.message);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 500, err);
      next();
    }
  }
  return true;
}
skill.get('/commute/:lat/:long', getCommute);

module.exports = {
  skill,
  getCommuteStatus,
  getCommute,
};
