/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const { Client } = require('pg');
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
 *     sucess: 'true'
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

  const client = new Client({
    host: process.env.DataStore,
    user: process.env.DataStoreUser,
    password: process.env.DataStoreUserPassword,
    database: 'alfred',
    port: 5432,
  });

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

  let SQL;
  let dataValues;
  let results;

  try {
    serviceHelper.log('trace', 'register', 'Connect to data store');
    client.connect();
    SQL = `SELECT device_token FROM push_notifications WHERE device_token = '${deviceToken}'`;
    results = await client.query(SQL);

    if (results.rowCount > 0) {
      serviceHelper.log('trace', 'register', 'Device found so updating record');
      SQL = 'UPDATE push_notifications SET "time"=$1, main_user=$2 WHERE device_token=$3';
      dataValues = [
        new Date(),
        deviceUser,
        deviceToken,
      ];
    } else {
      serviceHelper.log('trace', 'register', 'Register new device');
      SQL = 'INSERT INTO push_notifications("time", device_token, main_user) VALUES ($1, $2, $3)';
      dataValues = [
        new Date(),
        deviceToken,
        deviceUser,
      ];
    }
    results = await client.query(SQL, dataValues);
    client.end();
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

/**
 * @api {get} /devices List push notifications api called
 * @apiName devices
 * @apiGroup Notifications
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true',
 *     data: [{
 *               "time": "yyy-mm-ddThh:mm:ss",
 *               "device_token": "xxxxx"
 *           }]
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 400 Bad Request
 *   {
 *     data: Error message
 *   }
 *
 */
async function devicesToUse(req, res, next) {
  serviceHelper.log('trace', 'devicesToUse', 'devicesToUse API called');

  const client = new Client({
    host: process.env.DataStore,
    user: process.env.DataStoreUser,
    password: process.env.DataStoreUserPassword,
    database: 'alfred',
    port: 5432,
  });

  try {
    serviceHelper.log('trace', 'devicesToUse', 'Connect to data store');
    const dataSelect = 'SELECT device_token, last(main_user, time) as device_token, last(push_status, time) as push_status, last(distruptions, time) as distruptions FROM push_notifications GROUP BY device_token';
    client.connect();
    const results = await client.query(dataSelect);
    serviceHelper.log('trace', 'devicesToUse', 'Got data so close data store connection');
    client.end();
    serviceHelper.sendResponse(res, true, results.rows);
    next();
  } catch (err) {
    serviceHelper.log('error', 'devicesToUse', err);
    serviceHelper.sendResponse(res, false, err);
    next();
  }
}
skill.get('/devices', devicesToUse);

module.exports = skill;
