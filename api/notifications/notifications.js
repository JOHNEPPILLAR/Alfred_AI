/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const serviceHelper = require('../../lib/helper.js');

const skill = new Skills();

/**
 * @api {put} /register Register for push notifications
 * @apiName register
 * @apiGroup Notifications
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
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
  serviceHelper.log('trace', 'register', 'register API called');

  const deviceToken = req.body.device;
  const deviceUser = req.body.user;

  if (typeof deviceToken === 'undefined' || deviceToken === null) {
    serviceHelper.log('trace', 'register', 'Missing param: deviceToken');
    serviceHelper.sendResponse(res, 400, 'Missing param: deviceToken');
    next();
    return;
  }

  if (typeof deviceUser === 'undefined' || deviceUser === null) {
    serviceHelper.log('trace', 'register', 'Missing param: deviceUser');
    serviceHelper.sendResponse(res, 400, 'Missing param: deviceUser');
    next();
    return;
  }

  try {
    const SQL = 'INSERT INTO ios_devices("time", device_token, app_user) VALUES ($1, $2, $3)';
    const SQLValues = [
      new Date(),
      deviceToken,
      deviceUser,
    ];

    serviceHelper.log('trace', 'register', 'Connect to data store connection pool');
    const dbClient = await global.devicesDataClient.connect(); // Connect to data store
    serviceHelper.log('trace', 'register', 'Save device data');
    const results = await dbClient.query(SQL, SQLValues);
    serviceHelper.log('trace', 'register', 'Release the data store connection back to the pool');
    await dbClient.release(); // Return data store connection back to pool

    if (results.rowCount !== 1) {
      serviceHelper.log('error', 'register', `Failed to insert/update data for device: ${deviceToken}`);
      serviceHelper.sendResponse(res, false, `Failed to insert/update data for device: ${deviceToken}`);
      next();
      return;
    }
    serviceHelper.log('info', 'register', `Registered/updated device : ${deviceToken}`);
    serviceHelper.sendResponse(res, true, `Registered device : ${deviceToken}`);
    next();
  } catch (err) {
    serviceHelper.log('error', 'register', err);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.put('/register', register);

module.exports = skill;
