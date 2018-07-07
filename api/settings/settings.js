/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('../../lib/helper.js');

const skill = new Skills();

/**
 * @api {get} /lightsensors
 * @apiName lightsensors
 * @apiGroup Settings
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: [
 *       {
 *           "id": 1,
 *           "sensor_id": 1,
 *           "start_time": "00:00",
 *           "end_time": "08:30",
 *           "light_group_number": 7,
 *           "light_action": "on",
 *           "brightness": 60,
 *           "active": true,
 *           "ct": null,
 *           "turn_off": "TRUE"
 *       }
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
async function lightSensorSettings(req, res, next) {
  serviceHelper.log('trace', 'sensorSettings', 'sensorSettings API called');

  try {
    const SQL = 'SELECT * FROM sensor_settings';
    serviceHelper.log('trace', 'sensorSettings', 'Connect to data store connection pool');
    const dbClient = await global.lightsDataClient.connect(); // Connect to data store
    serviceHelper.log('trace', 'sensorSettings', 'Get light sensor settings data');
    const results = await dbClient.query(SQL);
    serviceHelper.log('trace', 'sensorSettings', 'Release the data store connection back to the pool');
    await dbClient.release(); // Return data store connection back to pool

    if (results.rowCount === 0) {
      serviceHelper.log('error', 'sensorSettings', 'Failed to get lights sensor settings data');
      serviceHelper.sendResponse(res, false, 'Failed to get lights sensor settings data');
      next();
      return;
    }
    serviceHelper.log('trace', 'sensorSettings', 'Sending data back to client');
    const returnData = results.rows.sort(serviceHelper.GetSortOrder('id'));
    serviceHelper.sendResponse(res, true, returnData);
    next();
  } catch (err) {
    serviceHelper.log('error', 'sensorSettings', err);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.get('/lightsensors', lightSensorSettings);

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
