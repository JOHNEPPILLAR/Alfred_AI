/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('alfred-helper');

const skill = new Skills();

/**
 * @api {get} /sensors/schedules/rooms
 * @apiName sensors
 * @apiGroup Sensors
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *      "data": [
 *       {
 *           "id": 1,
 *           "sensor_id": 1,
 *           "start_time": "00:00",
 *           "end_time": "08:30",
 *           "light_group_number": 7,
 *           "light_action": "on",
 *           "brightness": 40,
 *           "active": true,
 *           "turn_off": "TRUE",
 *           "scene": 3
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
async function listSensorTimersRoom(req, res, next) {
  serviceHelper.log('trace', 'list sensors schedules API called');
  serviceHelper.log('trace', `Params: ${JSON.stringify(req.params)}`);

  const { roomNumber } = req.params;

  try {
    const apiURL = `${process.env.ALFRED_LIGHTS_SERVICE}/sensors/schedules/rooms/${roomNumber}`;
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
skill.get('/sensors/schedules/rooms/:roomNumber', listSensorTimersRoom);

/**
 * @api {get} /sensors/schedules/:sensorID
 * @apiName getSensor
 * @apiGroup sensors
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *       "data": [
 *       {
 *           "id": 1,
 *           "sensor_id": 1,
 *           "start_time": "00:00",
 *           "end_time": "08:30",
 *           "light_group_number": 7,
 *           "light_action": "on",
 *           "brightness": 40,
 *           "active": true,
 *           "turn_off": "TRUE",
 *           "scene": 3
 *       }
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
async function getSensor(req, res, next) {
  serviceHelper.log('trace', 'get sensor schedule API called');
  serviceHelper.log('trace', `Params: ${JSON.stringify(req.params)}`);

  const { sensorID } = req.params;

  try {
    const apiURL = `${process.env.ALFRED_LIGHTS_SERVICE}/sensors/schedules/${sensorID}`;
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
skill.get('/sensors/schedules/:sensorID', getSensor);

/**
 * @api {put} /sensors/timers/:sensorID
 * @apiName saveSensor
 * @apiGroup Sensors
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
async function saveSensor(req, res, next) {
  serviceHelper.log('trace', 'save sensor API called');
  serviceHelper.log('trace', `Params: ${JSON.stringify(req.params)}`);
  serviceHelper.log('trace', `Body: ${JSON.stringify(req.body)}`);

  const { sensorID } = req.params;

  try {
    const apiURL = `${process.env.ALFRED_LIGHTS_SERVICE}/sensors/schedules/${sensorID}`;
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
skill.put('/sensors/schedules/:sensorID', saveSensor);

module.exports = skill;
