/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('alfred-helper');

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
 *          "timeofday": "2019-05-16T20:26:00.000Z",
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
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function displayRoomCharts(req, res, next) {
  serviceHelper.log('trace', 'Display room temp data API called');
  serviceHelper.log('trace', `Params: ${JSON.stringify(req.params)}`);

  const { roomID } = req.params;
  const { durationSpan } = req.query;
  let durationSpanVaule;

  try {
    // Check key params are valid
    if (typeof roomID === 'undefined' || roomID === null || roomID === '') {
      serviceHelper.sendResponse(res, 400, 'Missing param: roomID');
      next();
      return;
    }

    if (typeof durationSpan === 'undefined' || durationSpan === null) durationSpanVaule = '';
    else durationSpanVaule = durationSpan;

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
        apiURL = `${process.env.ALFRED_NETATMO_SERVICE}/sensors/${roomID}?durationSpan=${durationSpanVaule}`;
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', returnData.message);
          serviceHelper.sendResponse(res, 500, returnData);
          next();
          return;
        }
        serviceHelper.log('trace', 'Sending data back to caller');
        serviceHelper.sendResponse(res, 200, returnData.data);
        next();
        break;
      case '5': // Main bed room / Dyson
        serviceHelper.log('trace', 'Getting chart data for main bed room');
        apiURL = `${process.env.ALFRED_DYSON_SERVICE}/sensors?durationSpan=${durationSpanVaule}`;
        returnData = await serviceHelper.callAlfredServiceGet(apiURL);
        if (returnData instanceof Error) {
          serviceHelper.log('error', returnData.message);
          serviceHelper.sendResponse(res, 500, returnData);
          next();
          return;
        }
        serviceHelper.log('trace', 'Sending data back to caller');
        serviceHelper.sendResponse(res, 200, returnData.data);
        next();
        break;
      default:
        serviceHelper.log('trace', 'Sending data back to caller');
        serviceHelper.sendResponse(res, 400, 'No room selected');
        next();
        break;
    }
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, 500, err);
    next();
  }
}
skill.get('/displayroomcharts/:roomID', displayRoomCharts);

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
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function displayCurrentGardenData(req, res, next) {
  serviceHelper.log('trace', 'Display current garden sensor data API called');

  try {
    serviceHelper.log('trace', 'Getting current chart data');
    const apiURL = `${process.env.ALFRED_FLOWERCARE_SERVICE}/sensors/current`;
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
skill.get('/displaycureentgardendata', displayCurrentGardenData);

module.exports = skill;
