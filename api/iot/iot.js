/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('../../lib/helper.js');

const skill = new Skills();

/**
 * @api {get} /displayRoomCharts
 * @apiName displayRoomCharts
 * @apiGroup IoT
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     "data": [
 *       {
 *         "timeofday": "2019-05-16T20:26:00.000Z",
 *          "battery": "100.0000000000000000",
 *          "temperature": 20.8,
 *          "humidity": 47,
 *          "co2": 569
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
async function displayRoomCharts(req, res, next) {
  serviceHelper.log('trace', 'Display room temp data API called');

  try {
    serviceHelper.log('trace', JSON.stringify(req.query));

    const { durationSpan, roomID } = req.query;

    // Check key params are valid
    if (typeof roomID === 'undefined' || roomID === null || roomID === '') {
      // roomID = '8'; // Living room
      serviceHelper.sendResponse(res, 400, 'Missing param: roomID');
      next();
      return;
    }

    let apiURL;
    let returnData;

    switch (roomID) {
      case '4': // Kids bedroom
      case '8': // Living room / Netatmo
      case '9': // Kitchen / Netatmo
        serviceHelper.log('trace', 'Getting chart data for kids bed room');
        apiURL = `${process.env.AlfredNetatmoService}/display/all?durationSpan=${durationSpan}&roomID=${roomID}`;
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', returnData.message);
          serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
          next();
          return;
        }
        serviceHelper.log('trace', 'Sending data back to caller');
        serviceHelper.sendResponse(res, true, returnData.data);
        next();
        break;
      case '5': // Main bed room / Dyson
        serviceHelper.log('trace', 'Getting chart data for main bed room');
        apiURL = `${process.env.AlfredDysonService}/display/all?durationSpan=${durationSpan}`;
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', returnData.message);
          serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
          next();
          return;
        }
        serviceHelper.log('trace', 'Sending data back to caller');
        serviceHelper.sendResponse(res, true, returnData.data);
        next();
        break;
      default:
        serviceHelper.log('trace', 'Sending data back to caller');
        serviceHelper.sendResponse(res, false, 'No room selected');
        next();
        break;
    }
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, false, err.message);
    next();
  }
}
skill.get('/displayroomcharts', displayRoomCharts);

module.exports = skill;
