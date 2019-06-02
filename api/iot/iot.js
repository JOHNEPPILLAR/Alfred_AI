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
      case 'G': // Garden / Netatmo
        serviceHelper.log(
          'trace',
          'Getting chart data for kids room/living room, kitchen and Garden',
        );
        apiURL = `${
          process.env.AlfredNetatmoService
        }/display/all?durationSpan=${durationSpan}&roomID=${roomID}`;
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

/**
 * @api {get} /displaycureentgardendata
 * @apiName displayCureentGardenData
 * @apiGroup IoT
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     "data": [
 *       {
 *         "address": "c4:7c:8d:66:27:96",
 *         "sensor_label": "A",
 *         "plant_name": "Strawberry basket by window",
 *         "moisture": 28,
 *         "threshold_moisture": 25,
 *         "fertiliser": 268,
 *         "threshold_fertilizer": 3
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
async function displayCureentGardenData(req, res, next) {
  serviceHelper.log('trace', 'Display current garden sensor data API called');

  try {
    serviceHelper.log('trace', 'Getting current chart data');
    const apiURL = `${process.env.AlfredFlowerCareService}/display/current`;
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);
    if (returnData instanceof Error) {
      serviceHelper.log('error', returnData.message);
      serviceHelper.sendResponse(res, false, 'Unable to return data from Alfred');
      next();
      return;
    }
    serviceHelper.log('trace', 'Sending data back to caller');
    serviceHelper.sendResponse(res, true, returnData.data);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, false, err.message);
    next();
  }
}
skill.get('/displaycureentgardendata', displayCureentGardenData);

module.exports = skill;
