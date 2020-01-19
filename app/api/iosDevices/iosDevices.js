/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('alfred-helper');

const skill = new Skills();

/**
 * @api {put} /iosDevices/:{device} Log iOS device for push notifications
 * @apiName iosDevices
 * @apiGroup Notifications
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     data: Registered device: xxx
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function iosDevices(req, res, next) {
  serviceHelper.log('trace', 'iosDevices API called');

  const { deviceToken } = req.params;

  if (typeof deviceToken === 'undefined' || deviceToken === null) {
    serviceHelper.log('trace', 'Missing param: deviceToken');
    serviceHelper.sendResponse(res, 400, 'Missing param: deviceToken');
    next();
    return;
  }

  try {
    const SQL = 'INSERT INTO ios_devices("time", device_token) VALUES ($1, $2)';
    const SQLValues = [new Date(), deviceToken];

    serviceHelper.log('trace', 'Connect to data store connection pool');
    const dbConnection = await serviceHelper.connectToDB('devices');
    serviceHelper.log('trace', 'Save device data');
    const results = await dbConnection.query(SQL, SQLValues);
    serviceHelper.log(
      'trace',
      'Release the data store connection back to the pool',
    );
    await dbConnection.end(); // Close data store connection

    if (results.rowCount !== 1) {
      serviceHelper.log(
        'error',
        `Failed to insert/update data for device: ${deviceToken}`,
      );
      serviceHelper.sendResponse(
        res,
        false,
        `Failed to insert/update data for device: ${deviceToken}`,
      );
      next();
      return;
    }
    serviceHelper.log('info', `Logged device : ${deviceToken}`);
    serviceHelper.sendResponse(res, 200, `Logged device : ${deviceToken}`);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, 500, err);
    next();
  }
}
skill.put('/iosDevices/:deviceToken', iosDevices);

module.exports = skill;
