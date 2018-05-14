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
    user: process.env.alfred_datastore_un,
    host: process.env.alfred_datastore,
    database: 'alfred',
    password: process.env.alfred_datastore_pwd,
    port: 5432,
  });

  const deviceToken = req.body.device;
  const deviceUser = req.body.user;

  if (typeof deviceToken === 'undefined' || deviceToken === null) {
    serviceHelper.log('trace', 'register', 'deviceToken param missing');
    serviceHelper.sendResponse(res, 400, 'deviceToken param missing');
    next();
    return;
  }

  let SQL;
  let dataValues;
  let results;
  
  try {
    client.connect();
    SQL = `SELECT device_token FROM push_notifications WHERE device_token = '${deviceToken}'`;
    results = await client.query(SQL);

    if (results.rowCount > 0) {
      SQL = 'UPDATE push_notifications SET "time"=$1, main_user=$2 WHERE device_token=$3';
      dataValues = [
        new Date(),
        deviceUser,
        deviceToken,
      ];
    } else {
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
      logger.error(`Register: Failed to insert/update data for device: ${deviceToken}`);
      serviceHelper.sendResponse(res, false, `Register: Failed to insert/update data for device: ${deviceToken}`);
      next();
      return;
    }
    logger.info(`Saved data for device: ${deviceToken}`);
    alfredHelper.sendResponse(res, true, null);
    next();

  } catch (err) {
    logger.error(`Register: ${err}`);
    alfredHelper.sendResponse(res, false, err);
    next();
    return;
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
  logger.info('List push notifications api called');

  const client = new Client({
    user: process.env.alfred_datastore_un,
    host: process.env.alfred_datastore,
    database: 'alfred',
    password: process.env.alfred_datastore_pwd,
    port: 5432,
  });

  try {
    client.connect();
  } catch (connectErr) {
    logger.error(`DevicesToUse: ${connectErr}`);
    alfredHelper.sendResponse(res, false, null); // Send response back to caller
    next();
    return;
  }

  try {
    const dataSelect = 'SELECT device_token, last(main_user, time) as device_token, last(push_status, time) as push_status, last(distruptions, time) as distruptions FROM push_notifications GROUP BY device_token';

    const results = await client.query(dataSelect);
    client.end();

    alfredHelper.sendResponse(res, true, results.rows); // Send response back to caller
    next();
  } catch (err) {
    logger.error(`DevicesToUse: ${err}`);
    alfredHelper.sendResponse(res, false, null); // Send response back to caller
    next();
  }
}
skill.get('/devices', devicesToUse);

module.exports = skill;
