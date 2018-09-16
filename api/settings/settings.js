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
  serviceHelper.log('trace', 'listSchedules', 'listSchedules API called');

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
    serviceHelper.log('error', 'sensorSettings', err);
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
  serviceHelper.log('trace', 'saveSchedule', 'saveSchedule API called');
  try {
    const apiURL = `${process.env.AlfredScheduleService}/schedule/save`;
    serviceHelper.log('info', 'saveSchedule', `Saving schedule data: ${JSON.stringify(req.body)}`);
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
    serviceHelper.log('error', 'sensorSettings', err);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.put('/saveSchedule', saveSchedule);

/**
 * @api {get} /lighttimers
 * @apiName lighttimers
 * @apiGroup Settings
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: [
 *       {
 *           "id": 1,
 *           "type": 4,
 *           "light_group_number": 8,
 *           "brightness": 200,
 *           "ct": null,
 *           "x": null,
 *           "y": null,
 *           "color_loop": false,
 *           "active": true
 *       }
 *     ]
 * }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 400 Bad Request
 *   {
 *     data: Error message
 *   }
 *
 */
async function lightTimersSettings(req, res, next) {
  serviceHelper.log('trace', 'lightTimersSettings', 'lightTimersSettings API called');

  try {
    const SQL = 'SELECT * FROM light_timers';
    serviceHelper.log('trace', 'lightTimersSettings', 'Connect to data store connection pool');
    const dbClient = await global.schedulesDataClient.connect(); // Connect to data store
    serviceHelper.log('trace', 'lightTimersSettings', 'Get light sensor settings data');
    const results = await dbClient.query(SQL);
    serviceHelper.log('trace', 'lightTimersSettings', 'Release the data store connection back to the pool');
    await dbClient.release(); // Return data store connection back to pool

    if (results.rowCount === 0) {
      serviceHelper.log('error', 'lightTimersSettings', 'Failed to get lights sensor settings data');
      serviceHelper.sendResponse(res, false, 'Failed to get lights sensor settings data');
      next();
      return;
    }
    serviceHelper.log('trace', 'lightTimersSettings', 'Sending data back to client');
    const returnData = results.rows.sort(serviceHelper.GetSortOrder('id'));
    serviceHelper.sendResponse(res, true, returnData);
    next();
  } catch (err) {
    serviceHelper.log('error', 'lightTimersSettings', err);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.get('/lighttimers', lightTimersSettings);

module.exports = skill;
