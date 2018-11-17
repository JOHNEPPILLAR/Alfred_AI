/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('../../lib/helper.js');

const skill = new Skills();

/**
 * @api {get} /listDysonPureCool
 * @apiName listDysonPureCool
 * @apiGroup IoT
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
async function displayDysonPureCoolData(req, res, next) {
  serviceHelper.log('trace', 'displayDysonPureCoolData', 'Display Dyson PureCool data API called');

  const { body } = req;

  try {
    const apiURL = `${process.env.AlfredIoTService}/display/displaydysonpurecooldata`;
    serviceHelper.log('trace', 'displayDysonPureCoolData', JSON.stringify(body));
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL, body);

    if (returnData instanceof Error) {
      serviceHelper.log('error', 'displayDysonPureCoolData', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }

    serviceHelper.log('trace', 'displayDysonPureCoolData', 'Sending data back to caller');
    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', 'displayDysonPureCoolData', err);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.get('/displaydysonpurecooldata', displayDysonPureCoolData);

module.exports = skill;
