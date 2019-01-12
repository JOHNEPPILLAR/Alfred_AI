/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('../../lib/helper.js');

const skill = new Skills();

/**
 * @api {get} /listSchedules
 * @apiName listSchedules
 * @apiGroup Settings
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     "data": {
 *       "command": "SELECT",
 *       "rowCount": 7,
 *       "oid": null,
 *       "rows": [
 *           {
 *               "id": 1,
 *               "name": "Morning lights off",
 *               "hour": 8,
 *               "minute": 30,
 *               "ai_override": false,
 *               "active": true
 *           },
 *           ...
 *         }
 *     ]
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 400 Bad Request
 *   {
 *     data: Error message
 *   }
 *
 */
async function listSchedules(req, res, next) {
  serviceHelper.log('trace', 'listSchedules', 'list Schedules API called');

  try {
    const apiURL = `${process.env.AlfredScheduleService}/schedule/list`;
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);

    if (returnData instanceof Error) {
      serviceHelper.log('error', 'listSchedules', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.log('trace', 'listSchedules', 'Sending data back to caller');
    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', 'sensorSettings', err.message);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.get('/listSchedules', listSchedules);

/**
 * @api {put} /saveSchedule
 * @apiName saveSchedule
 * @apiGroup Settings
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
async function saveSchedule(req, res, next) {
  serviceHelper.log('trace', 'saveSchedule', 'save Schedule API called');
  try {
    const apiURL = `${process.env.AlfredScheduleService}/schedule/save`;
    serviceHelper.log('trace', 'saveSchedule', `Saving schedule data: ${JSON.stringify(req.body)}`);
    const returnData = await serviceHelper.callAlfredServicePut(apiURL, req.body);

    if (returnData instanceof Error) {
      serviceHelper.log('error', 'saveSchedule', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to save data to Alfred');
      next();
      return;
    }

    serviceHelper.log('trace', 'saveSchedule', 'Sending data back to caller');
    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', 'sensorSettings', err.message);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.put('/saveSchedule', saveSchedule);

/**
 * @api {get} /listSensors
 * @apiName listSensors
 * @apiGroup Settings
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     "data": {
 *       "command": "SELECT",
 *       "rowCount": 7,
 *       "oid": null,
 *       "rows": [
 *           {
 *               "id": 1,
 *               "name": "Morning lights off",
 *               "hour": 8,
 *               "minute": 30,
 *               "ai_override": false,
 *               "active": true
 *           },
 *           ...
 *         }
 *     ]
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 400 Bad Request
 *   {
 *     data: Error message
 *   }
 *
 */
async function listSensors(req, res, next) {
  serviceHelper.log('trace', 'listSensors', 'list Sensors API called');

  try {
    const apiURL = `${process.env.AlfredLightsService}/sensors/list`;
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);

    if (returnData instanceof Error) {
      serviceHelper.log('error', 'listSensors', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.log('trace', 'listSensors', 'Sending data back to caller');
    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', 'listSensors', err.message);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.get('/listSensors', listSensors);

/**
 * @api {put} /saveSensor
 * @apiName saveSensor
 * @apiGroup Settings
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
async function saveSensor(req, res, next) {
  serviceHelper.log('trace', 'saveSensor', 'save Sensor API called');
  try {
    const apiURL = `${process.env.AlfredLightsService}/sensors/save`;
    serviceHelper.log('trace', 'saveSensor', `Saving schedule data: ${JSON.stringify(req.body)}`);
    const returnData = await serviceHelper.callAlfredServicePut(apiURL, req.body);

    if (returnData instanceof Error) {
      serviceHelper.log('error', 'saveSensor', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to save data to Alfred');
      next();
      return;
    }

    serviceHelper.log('trace', 'saveSensor', 'Sending data back to caller');
    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', 'saveSensor', err.message);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.put('/saveSensor', saveSensor);

module.exports = skill;
