/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('alfred_helper');

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
 *   HTTPS/1.1 400 Bad Request
 *   {
 *     data: Error message
 *   }
 *
 */
async function list(req, res, next) {
  serviceHelper.log('trace', 'list Schedules API called');

  const { roomNumber } = req.query;

  try {
    const apiURL = `${process.env.AlfredScheduleService}/schedule/list?roomNumber=${roomNumber}`;
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);
    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(
        res,
        false,
        'Unable to return data from Alfred',
      );
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
skill.get('/list', list);

/**
 * @api {get} /get
 * @apiName get
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
async function get(req, res, next) {
  serviceHelper.log('trace', 'get Schedule API called');

  const { scheduleID } = req.query;

  try {
    const apiURL = `${process.env.AlfredScheduleService}/schedule/get?scheduleID=${scheduleID}`;
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);

    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(
        res,
        false,
        'Unable to return data from Alfred',
      );
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
skill.get('/get', get);

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
