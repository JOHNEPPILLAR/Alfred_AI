/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('alfred-helper');

const skill = new Skills();

/**
 * @api {get} /list
 * @apiName list
 * @apiGroup Schedules
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *      "data": [
 *       {
 *           "id": 1,
 *           "type": 0,
 *           "name": "Morning all lights off",
 *           "hour": 8,
 *           "minute": 30,
 *           "ai_override": false,
 *           "active": true,
 *           "light_group_number": 0,
 *           "brightness": null,
 *           "scene": null,
 *           "color_loop": false
 *       },
 *       ...
 *     ]
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function list(req, res, next) {
  serviceHelper.log('trace', 'list Schedules API called');

  const { roomNumber } = req.params;

  let apiURL;
  let returnData;

  try {
    switch (roomNumber) {
      case '8': // Living room / lights
        apiURL = `${process.env.AlfredLightsService}/schedules/rooms/${roomNumber}`;
        serviceHelper.log('trace', `Calling: ${apiURL}`);
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', returnData.message);
          serviceHelper.sendResponse(res, false, returnData.message);
          next();
          return;
        }
        break;
      case '4': // Kids bedroom / lights
        apiURL = `${process.env.AlfredLightsService}/schedules/rooms/${roomNumber}`;
        serviceHelper.log('trace', `Calling: ${apiURL}`);
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', returnData.message);
          serviceHelper.sendResponse(res, false, returnData.message);
          next();
          return;
        }
        break;
      case '5': // Main bed room / lights
        apiURL = `${process.env.AlfredLightsService}/schedules/rooms/${roomNumber}`;
        serviceHelper.log('trace', `Calling: ${apiURL}`);
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', returnData.message);
          serviceHelper.sendResponse(res, false, returnData.message);
          next();
          return;
        }
        break;
      // case '9': // Kitchen
      case 'G': // Garden / Flowercare
        apiURL = `${process.env.AlfredFlowerCareService}/schedules`;
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', returnData.message);
          serviceHelper.sendResponse(res, false, returnData.message);
          next();
          return;
        }
        break;
      default:
        serviceHelper.log('trace', 'Sending data back to caller');
        serviceHelper.sendResponse(res, 400, 'No room selected');
        next();
        break;
    }

    serviceHelper.log('trace', 'Sending data back to caller');
    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.get('/schedules/rooms/:roomNumber', list);

/**
 * @api {put} /save
 * @apiName save
 * @apiGroup Schedules
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     "data": {
 *       "saved": "true"
 *     }
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 400 Bad Request
 *   {
 *     data: Error message
 *   }
 *
 */
async function save(req, res, next) {
  serviceHelper.log('trace', 'save Schedule API called');
  try {
    const apiURL = `${process.env.AlfredScheduleService}/schedule/save`;
    serviceHelper.log(
      'trace',
      'save',
      `Saving schedule data: ${JSON.stringify(req.body)}`,
    );
    const returnData = await serviceHelper.callAlfredServicePut(
      apiURL,
      req.body,
    );

    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to save data to Alfred');
      next();
      return;
    }

    serviceHelper.log('trace', 'Sending data back to caller');
    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.put('/save', save);

module.exports = skill;
