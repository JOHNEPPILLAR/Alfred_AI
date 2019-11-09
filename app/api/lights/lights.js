/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('alfred-helper');

const skill = new Skills();

/**
 * @api {get} /lights/listlights Lists all of the lights
 * @apiName listlights
 * @apiGroup Lights
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     data: Hue bridge API response
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function listLights(req, res, next) {
  serviceHelper.log('trace', 'list lights API called');
  try {
    const apiURL = `${process.env.AlfredLightsService}/lights`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);

    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, 500, returnData);
      next();
      return;
    }

    serviceHelper.log('trace', 'Sending data back to caller');
    serviceHelper.sendResponse(res, 200, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, 500, err);
    next();
  }
}
skill.get('/listlights', listLights);

/**
 * @api {get} /lights/listlightgroups Lists all of the light groups
 * @apiName listlightgroups
 * @apiGroup Lights
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     data: Hue bridge API response
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function listLightGroups(req, res, next) {
  serviceHelper.log('trace', 'listLightGroups API called');
  try {
    const apiURL = `${process.env.AlfredLightsService}/lightgroups`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);
    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, 500, returnData);
      next();
      return;
    }

    serviceHelper.log('trace', 'Sending data back to caller');
    serviceHelper.sendResponse(res, 200, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, 500, err);
    next();
  }
}
skill.get('/lightgroups', listLightGroups);

/**
 * @api {get} /lights/alloff Turns off all lights
 * @apiName alloff
 * @apiGroup Lights
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     data: Hue bridge API response
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function allOff(req, res, next) {
  serviceHelper.log('trace', 'allOff API called');
  try {
    const apiURL = `${process.env.AlfredLightsService}/lightgroups/0`;
    const body = { lightAction: 'off' };
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServicePut(apiURL, body);

    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, 500, returnData);
      next();
      return;
    }

    serviceHelper.log('trace', 'Sending data back to caller');
    serviceHelper.sendResponse(res, 200, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, 500, err);
    next();
  }
}
skill.get('/alloff', allOff);

/**
 * @api {put} /lights Update light
 * @apiName lights
 * @apiGroup Lights
 *
 * @apiParam {String} lightAction [ on, off ]
 * @apiParam {Number} brightness Brighness [ 0..255 ]
 * @apiParam {Number} x Hue xy color [ 0..1 ]
 * @apiParam {Number} y Hue xy color [ 0..1 ]
 * @apiParam {Number} ct Hue ct color [153..500 ]
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     data: "The light was turned on."
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function updateLight(req, res, next) {
  serviceHelper.log('trace', 'Update light state API called');
  serviceHelper.log('trace', `Params: ${JSON.stringify(req.params)}`);
  serviceHelper.log('trace', `Body: ${JSON.stringify(req.body)}`);

  const { lightNumber } = req.params;
  const { lightAction } = req.body;

  // Check key params are valid
  if (typeof lightNumber === 'undefined' || lightNumber === null || lightNumber === '') {
    serviceHelper.sendResponse(res, 400, 'Missing param: lightNumber');
    next();
    return false;
  }
  if (
    typeof lightAction === 'undefined' || lightAction === null || lightAction === '') {
    serviceHelper.sendResponse(res, 400, 'Missing param: lightAction');
    next();
    return false;
  }

  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/${lightNumber}`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServicePut(
      apiURL,
      req.body,
    );

    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, 500, returnData);
      next();
      return false;
    }
    serviceHelper.sendResponse(res, 200, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, 500, err);
    next();
  }
  return true;
}
skill.put('/lights/:lightNumber', updateLight);

/**
 * @api {put} /lightgroups Update light group
 * @apiName lightgroups
 * @apiGroup Lights
 *
 * @apiParam {String} lightAction [ on, off ]
 * @apiParam {Number} brightness Brighness [ 0..255 ]
 * @apiParam {Number} x Hue xy color [ 0..1 ]
 * @apiParam {Number} y Hue xy color [ 0..1 ]
 * @apiParam {Number} ct Hue ct color [153..500 ]
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     data: "The light was turned on."
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function updateLightGroup(req, res, next) {
  serviceHelper.log('trace', 'Update light group state API called');
  serviceHelper.log('trace', `Params: ${JSON.stringify(req.params)}`);
  serviceHelper.log('trace', `Body: ${JSON.stringify(req.body)}`);

  const { lightGroupNumber } = req.params;
  const { lightAction } = req.body;

  // Check key params are valid
  if (typeof lightGroupNumber === 'undefined' || lightGroupNumber === null || lightGroupNumber === '') {
    serviceHelper.sendResponse(res, 400, 'Missing param: lightGroupNumber');
    next();
    return false;
  }
  if (
    typeof lightAction === 'undefined' || lightAction === null || lightAction === '') {
    serviceHelper.sendResponse(res, 400, 'Missing param: lightAction');
    next();
    return false;
  }

  try {
    const apiURL = `${process.env.AlfredLightsService}/lightgroups/${lightGroupNumber}`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServicePut(
      apiURL,
      req.body,
    );

    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, 500, returnData);
      next();
      return false;
    }

    serviceHelper.sendResponse(res, 200, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, 500, err);
    next();
  }
  return true;
}
skill.put('/lightgroups/:lightGroupNumber', updateLightGroup);

module.exports = skill;
