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
        apiURL = `${process.env.ALFRED_LIGHTS_SERVICE}/schedules/rooms/${roomNumber}`;
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
        apiURL = `${process.env.ALFRED_LIGHTS_SERVICE}/schedules/rooms/${roomNumber}`;
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
        apiURL = `${process.env.ALFRED_LIGHTS_SERVICE}/schedules/rooms/${roomNumber}`;
        serviceHelper.log('trace', `Calling: ${apiURL}`);
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', returnData.message);
          serviceHelper.sendResponse(res, false, returnData.message);
          next();
          return;
        }
        break;
      case '9': // Kitchen
        apiURL = `${process.env.ALFRED_LIGHTS_SERVICE}/schedules/rooms/${roomNumber}`;
        serviceHelper.log('trace', `Calling: ${apiURL}`);
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', returnData.message);
          serviceHelper.sendResponse(res, false, returnData.message);
          next();
          return;
        }
        break;
      case 'G': // Garden / Flowercare
        apiURL = `${process.env.ALFRED_FLOWERCARE_SERVICE}/schedules`;
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
 * @api {get} /schedules/:scheduleID
 * @apiName getSchedule
 * @apiGroup Schedules
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *       "data": [
 *       {
 *           "id": 8,
 *           "type": 1,
 *           "name": "Living room evening light",
 *           "hour": 20,
 *           "minute": 0,
 *           "ai_override": true,
 *           "active": true,
 *           "light_group_number": 8,
 *           "brightness": 120,
 *           "scene": 4,
 *           "color_loop": false
 *       },
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
async function getSchedule(req, res, next) {
  serviceHelper.log('trace', 'get schedule API called');
  serviceHelper.log('trace', `Params: ${JSON.stringify(req.params)}`);

  const { ScheduleID } = req.params;

  try {
    const apiURL = `${process.env.ALFRED_LIGHTS_SERVICE}/schedules/${ScheduleID}`;
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
skill.get('/schedules/:ScheduleID', getSchedule);

/**
 * @api {put} /schedules/:scheduleID
 * @apiName saveSchedule
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
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function saveSchedule(req, res, next) {
  serviceHelper.log('trace', 'save schedule API called');
  serviceHelper.log('trace', `Params: ${JSON.stringify(req.params)}`);
  serviceHelper.log('trace', `Body: ${JSON.stringify(req.body)}`);

  const { ScheduleID } = req.params;

  try {
    const apiURL = `${process.env.ALFRED_LIGHTS_SERVICE}/schedules/${ScheduleID}`;
    serviceHelper.log('trace', 'Saving schedule data');
    const returnData = await serviceHelper.callAlfredServicePut(apiURL, req.body);
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
skill.put('/schedules/:ScheduleID', saveSchedule);

module.exports = skill;
