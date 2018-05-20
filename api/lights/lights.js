/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
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
 *     sucess: 'true'
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
  serviceHelper.log('trace', 'listLights', 'listLights API called');
  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/listlights`;
    serviceHelper.log('trace', 'listLights', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);

    if (returnData instanceof Error) {
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.sendResponse(res, true, returnData.body.data);
    next();
  } catch (err) {
    serviceHelper.log('error', 'listLights', err);
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
 *     sucess: 'true'
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
  serviceHelper.log('trace', 'listLightGroups', 'listLightGroups API called');
  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/listlightgroups`;
    serviceHelper.log('trace', 'listLightGroups', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);

    if (returnData instanceof Error) {
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.sendResponse(res, true, returnData.body.data);
    next();
  } catch (err) {
    serviceHelper.log('error', 'listLightGroups', err);
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
 *     sucess: 'true'
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
  serviceHelper.log('trace', 'allOff', 'allOff API called');
  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/alloff`;
    serviceHelper.log('trace', 'allOff', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);

    if (returnData instanceof Error) {
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.sendResponse(res, true, returnData.body.data);
    next();
  } catch (err) {
    serviceHelper.log('error', 'allOff', err);
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
 *     sucess: 'true'
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
  serviceHelper.log('trace', 'lightOnOff', 'lightOnOff API called');
  serviceHelper.log('trace', 'lightOnOff', JSON.stringify(req.body));

  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/lightonoff`;
    serviceHelper.log('trace', 'lightOnOff', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServicePut(apiURL, req.body);

    if (returnData instanceof Error) {
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.sendResponse(res, true, returnData.body.data);
    next();
  } catch (err) {
    serviceHelper.log('error', 'lightOnOff', err);
    serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
    next();
  }
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
 *     sucess: 'true'
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
  serviceHelper.log('trace', 'lightGroupOnOff', 'lightGroupOnOff API called');
  serviceHelper.log('trace', 'lightGroupOnOff', JSON.stringify(req.body));

  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/lightgrouponoff`;
    serviceHelper.log('trace', 'lightGroupOnOff', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServicePut(apiURL, req.body);

    if (returnData instanceof Error) {
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.sendResponse(res, true, returnData.body.data);
    next();
  } catch (err) {
    serviceHelper.log('error', 'lightGroupOnOff', err);
    serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
    next();
  }
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
 *     sucess: 'true'
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
  serviceHelper.log('trace', 'lightBrightness', 'lightBrightness API called');
  serviceHelper.log('trace', 'lightBrightness', JSON.stringify(req.body));

  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/lightbrightness`;
    serviceHelper.log('trace', 'lightBrightness', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServicePut(apiURL, req.body);

    if (returnData instanceof Error) {
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.sendResponse(res, true, returnData.body.data);
    next();
  } catch (err) {
    serviceHelper.log('error', 'lightBrightness', err);
    serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
    next();
  }
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
 *     sucess: 'true'
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
  serviceHelper.log('trace', 'lightGroupBrightness', 'lightGroupBrightness API called');
  serviceHelper.log('trace', 'lightGroupBrightness', JSON.stringify(req.body));

  try {
    const apiURL = `${process.env.AlfredLightsService}/lights/lightgroupbrightness`;
    serviceHelper.log('trace', 'lightGroupBrightness', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServicePut(apiURL, req.body);

    if (returnData instanceof Error) {
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.sendResponse(res, true, returnData.body.data);
    next();
  } catch (err) {
    serviceHelper.log('error', 'lightGroupBrightness', err);
    serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
    next();
  }
}
skill.put('/lightgroupbrightness', lightGroupBrightness);

module.exports = skill;
