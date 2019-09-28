/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('alfred_helper');

const skill = new Skills();

/**
 * @api {put} /register Register for push notifications
 * @apiName register
 * @apiGroup Notifications
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     data: Registered device: xxx
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 400 Bad Request
 *   {
 *     data: Error message
 *   }
 *
 */
async function register(req, res, next) {
  serviceHelper.log('trace', 'register API called');

  const deviceToken = req.body.device;

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
    const dbClient = await global.devicesDataClient.connect(); // Connect to data store
    serviceHelper.log('trace', 'Save device data');
    const results = await dbClient.query(SQL, SQLValues);
    serviceHelper.log(
      'trace',
      'Release the data store connection back to the pool',
    );
    await dbClient.release(); // Return data store connection back to pool

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
    serviceHelper.log('info', `Registered/updated device : ${deviceToken}`);
    serviceHelper.sendResponse(res, true, `Registered device : ${deviceToken}`);
    next();
  } catch (err) {
    serviceHelper.log('error', err.message);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.put('/register', register);

module.exports = skill;
