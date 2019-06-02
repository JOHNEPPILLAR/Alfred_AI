/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;

/**
 * Import helper libraries
 */
const serviceHelper = require('../../lib/helper.js');

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
  serviceHelper.log('trace', 'listLights API called');
  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/listlights`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);

    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.log('trace', 'Sending data back to caller');
    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
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
    const apiURL = `${process.env.AlfredLightsService}/lights/listlightgroups`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);
    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.log('trace', 'Sending data back to caller');
    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
    next();
  }
}
skill.get('/listlightgroups', listLightGroups);

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
    const apiURL = `${process.env.AlfredLightsService}/lights/alloff`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);

    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.log('trace', 'Sending data back to caller');
    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
    next();
  }
}
skill.get('/alloff', allOff);

/**
 * @api {put} /lights/lightonoff Turn lights on or off
 * @apiName lightonoff
 * @apiGroup Lights
 *
 * @apiParam {Number} lightNumber Hue bridge light number
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
async function lightOnOff(req, res, next) {
  serviceHelper.log('trace', 'lightOnOff API called');
  serviceHelper.log('trace', JSON.stringify(req.body));

  const { lightNumber, lightAction } = req.body;

  // Check key params are valid
  if (typeof lightNumber === 'undefined' || lightNumber === null || lightNumber === '') {
    serviceHelper.sendResponse(res, 400, 'Missing param: lightNumber');
    next();
    return false;
  }
  if (typeof lightAction === 'undefined' || lightAction === null || lightAction === '') {
    serviceHelper.sendResponse(res, 400, 'Missing param: lightAction');
    next();
    return false;
  }

  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/lightonoff`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServicePut(apiURL, req.body);

    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return false;
    }
    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
    next();
  }
  return true;
}
skill.put('/lightonoff', lightOnOff);

/**
 * @api {put} /lights/lightgrouponoff Turn light group on or off
 * @apiName lightgrouponoff
 * @apiGroup Lights
 *
 * @apiParam {Number} lightGroupNumber Hue bridge light group number
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
async function lightGroupOnOff(req, res, next) {
  serviceHelper.log('trace', 'lightGroupOnOff API called');
  serviceHelper.log('trace', JSON.stringify(req.body));

  const { lightGroupNumber, lightAction } = req.body;

  // Check key params are valid
  if (
    typeof lightGroupNumber === 'undefined'
    || lightGroupNumber === null
    || lightGroupNumber === ''
  ) {
    serviceHelper.sendResponse(res, 400, 'Missing param: lightGroupNumber');
    next();
    return false;
  }
  if (typeof lightAction === 'undefined' || lightAction === null || lightAction === '') {
    serviceHelper.sendResponse(res, 400, 'Missing param: lightAction');
    next();
    return false;
  }

  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/lightgrouponoff`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServicePut(apiURL, req.body);

    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return false;
    }

    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
    next();
  }
  return true;
}
skill.put('/lightgrouponoff', lightGroupOnOff);

/**
 * @api {put} /lights/lightbrightness Update light brightness
 * @apiName lightbrightness
 * @apiGroup Lights
 *
 * @apiParam {Number} lightNumber Hue bridge light group number
 * @apiParam {Number} brightness Brighness [ 0..255 ]
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     data: "The light group was updated."
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function lightBrightness(req, res, next) {
  serviceHelper.log('trace', 'lightBrightness API called');
  serviceHelper.log('trace', JSON.stringify(req.body));

  const { lightNumber, brightness } = req.body;

  // Check key params are valid
  if (typeof lightNumber === 'undefined' || lightNumber === null || lightNumber === '') {
    serviceHelper.sendResponse(res, 400, 'Missing param: lightNumber');
    next();
    return false;
  }
  if (typeof brightness === 'undefined' || brightness === null || brightness === '') {
    serviceHelper.sendResponse(res, 400, 'Missing param: brightness');
    next();
    return false;
  }

  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/lightbrightness`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServicePut(apiURL, req.body);

    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return false;
    }

    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
    next();
  }
  return true;
}
skill.put('/lightbrightness', lightBrightness);

/**
 * @api {put} /lights/lightgroupbrightness Update light group brightness
 * @apiName lightgroupbrightness
 * @apiGroup Lights
 *
 * @apiParam {Number} lightGroupNumber Hue bridge light group number
 * @apiParam {Number} brightness Brighness [ 0..255 ]
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     data: "The light group was updated."
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function lightGroupBrightness(req, res, next) {
  serviceHelper.log('trace', 'lightGroupBrightness API called');
  serviceHelper.log('trace', JSON.stringify(req.body));

  const { lightGroupNumber, brightness } = req.body;

  // Check key params are valid
  if (
    typeof lightGroupNumber === 'undefined'
    || lightGroupNumber === null
    || lightGroupNumber === ''
  ) {
    serviceHelper.sendResponse(res, 400, 'Missing param: lightGroupNumber');
    next();
    return false;
  }
  if (typeof brightness === 'undefined' || brightness === null || brightness === '') {
    serviceHelper.sendResponse(res, 400, 'Missing param: brightness');
    next();
    return false;
  }

  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/lightgroupbrightness`;
    serviceHelper.log('trace', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServicePut(apiURL, req.body);

    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return false;
    }

    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
    next();
  }
  return true;
}
skill.put('/lightgroupbrightness', lightGroupBrightness);

module.exports = skill;
