/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('../../lib/helper.js');

const skill = new Skills();

/**
 * @api {get} /roomTempChart
 * @apiName roomTempChart
 * @apiGroup IoT
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     "data": {
 *       "command": "SELECT",
 *       "rowCount": 240,
 *       "oid": null,
 *       "DurationTitle": "Last 4 Hours",
 *       "rows": [
 *           {
 *              "time": "2019-02-18T11:30:00.000Z",
                "battery": "0.00000000000000000000",
                "temperature": 21.58,
                "humidity": 47.44
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
async function displayRoomCharts(req, res, next) {
  serviceHelper.log('trace', 'displayRoomCharts', 'Display room temp data API called');

  try {
    serviceHelper.log('trace', 'displayRoomCharts', JSON.stringify(req.query));

    const { durationSpan } = req.query;
    let { roomID } = req.query;

    // Check key params are valid
    if (typeof roomID === 'undefined' || roomID === null || roomID === '') {
      roomID = '8'; // Living room
    }

    let apiURL;
    let returnData;

    switch (roomID) {
      case '4': // Kids room
        serviceHelper.log('trace', 'displayRoomCharts', 'Getting chart data for kids bed room');
        apiURL = `${process.env.AlfredIoTService}/display/displaynetatmodata?durationSpan=${durationSpan}&roomID=${roomID}`;
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', 'displayRoomCharts', returnData.message);
          serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
          next();
          return;
        }
        serviceHelper.log('trace', 'displayRoomCharts', 'Sending data back to caller');
        serviceHelper.sendResponse(res, true, returnData.data);
        next();
        break;
      case '5': // Main bed room
        serviceHelper.log('trace', 'displayRoomCharts', 'Getting chart data for main bed room');
        apiURL = `${process.env.AlfredIoTService}/display/displaydysonpurecooldata?durationSpan=${durationSpan}`;
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', 'displayRoomCharts', returnData.message);
          serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
          next();
          return;
        }
        serviceHelper.log('trace', 'displayRoomCharts', 'Sending data back to caller');
        serviceHelper.sendResponse(res, true, returnData.data);
        next();
        break;
      case '8': // Living area
        serviceHelper.log('trace', 'displayRoomCharts', 'Getting chart data for living area');
        apiURL = `${process.env.AlfredInkBirdService}/display/inkbirddata?durationSpan=${durationSpan}`;
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', 'displayRoomCharts', returnData.message);
          serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
          next();
          return;
        }
        serviceHelper.log('trace', 'displayRoomCharts', 'Sending data back to caller');
        serviceHelper.sendResponse(res, true, returnData.data);
        next();
        break;
      case '9': // Kitchen
        serviceHelper.log('trace', 'displayRoomCharts', 'Getting chart data for kitchen');
        apiURL = `${process.env.AlfredIoTService}/display/displaynetatmodata?durationSpan=${durationSpan}&roomID=${roomID}`;
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', 'displayRoomCharts', returnData.message);
          serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
          next();
          return;
        }
        serviceHelper.log('trace', 'displayRoomCharts', 'Sending data back to caller');
        serviceHelper.sendResponse(res, true, returnData.data);
        next();
        break;
      default:
        serviceHelper.log('trace', 'displayRoomCharts', 'Sending data back to caller');
        serviceHelper.sendResponse(res, false, 'No room selected');
        next();
        break;
    }
  } catch (err) {
    serviceHelper.log('error', 'displayRoomCharts', err);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.get('/displayroomcharts', displayRoomCharts);

module.exports = skill;
