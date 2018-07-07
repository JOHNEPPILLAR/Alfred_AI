/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('../../lib/helper.js');

const skill = new Skills();

/**
 * @api {get} /ping
 * @apiName ping
 * @apiGroup Root
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: 'pong'
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 400 Bad Request
 *   {
 *     data: Error message
 *   }
 *
 */
function ping(req, res, next) {
  serviceHelper.log('trace', 'ping', 'Ping API called');

  const ackJSON = {
    service: process.env.ServiceName,
    reply: 'pong',
    cpu: serviceHelper.getCpuInfo(),
    mem: serviceHelper.getMemoryInfo(),
    os: serviceHelper.getOsInfo(),
    process: serviceHelper.getProcessInfo(),
  };

  serviceHelper.sendResponse(res, true, ackJSON); // Send response back to caller
  next();
}
skill.get('/ping', ping);

/**
 * @api {get} /reregister
 * @apiName reregister
 * @apiGroup Root
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: {
 *       success or filure return message
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
async function reRegister(req, res, next) {
  serviceHelper.log('trace', 'reRegister', 'reRegister API called');

  let returnMessage = 'Re-registered service';

  if (!serviceHelper.registerService()) returnMessage = 'Unable to re-register service';

  serviceHelper.log('trace', 'reRegister', returnMessage);
  serviceHelper.sendResponse(res, false, returnMessage);
  next();
}
skill.get('/reregister', reRegister);

/**
 * @api {get} /display Display log file content
 * @apiName display
 * @apiGroup Root
 *
 * @apiParam {Number} page Page number to display
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     "data": [
 *       {
 *           "time": "2018-06-27T18:00:00.010Z",
 *           "type": "error",
 *           "service": "ALFRED - Scheduler Service",
 *           "function_name": "gardenWater - checkGardenWater",
 *           "message": "syntax error at or near \"not\""
 *       },
 *        ]
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal server error
 *   {
 *     data: Error message
 *   }
 *
 */
async function display(req, res, next) {
  serviceHelper.log('trace', 'display', 'display log entry API called');
  serviceHelper.log('trace', 'display', JSON.stringify(req.query));

  try {
    let page = 1;
    if (typeof page !== 'undefined' && page !== null && page !== '') {
      page = parseInt(req.query.page || 1, 10);
    }

    const apiURL = `${process.env.LogService}/display`;
    serviceHelper.log('trace', 'display', `Calling: ${apiURL}`);
    const returnData = await serviceHelper.callAlfredServiceGet(apiURL);

    if (returnData.success !== 'true') throw Error(returnData);

    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, true, returnData.data);
      next();
    }
  } catch (err) {
    serviceHelper.log('error', 'display', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, false, err.message);
      next();
    }
  }
}
skill.get('/display', display);

module.exports = skill;
