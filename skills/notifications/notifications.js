/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const { Client } = require('pg');
const alfredHelper = require('../../lib/helper.js');
const logger = require('winston');

const skill = new Skills();
const auth = {
  client_id: process.env.NetatmoClientKey,
  client_secret: process.env.NetatmoClientSecret,
  username: process.env.NetatmpUserName,
  password: process.env.NetatmoPassword,
};

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
  logger.info('Register device api called ');

  const client = new Client({
    user: process.env.alfred_datastore_un,
    host: process.env.alfred_datastore,
    database: process.env.alfred_datastore_db,
    password: process.env.alfred_datastore_pwd,
    port: 5432,
  });

  const deviceToken = req.body.device;
  const deviceUser = req.body.user;

  let SQL;
  let dataValues;
  let results;

  if (typeof deviceToken === 'undefined' || deviceToken === null) {
    alfredHelper.sendResponse(res, false, null); // Send response back to caller
    next();
    return;
  }

  try {
    client.connect();
  } catch (err) {
    logger.error(`Register: ${err}`);
    alfredHelper.sendResponse(res, false, null); // Send response back to caller
    next();
    return;
  }

  // Check if device is already registered
  try {
    SQL = `SELECT * FROM push_notifications WHERE device_token = '${deviceToken}'`;
    results = await client.query(SQL);
  } catch (err) {
    client.end();
    logger.error(`Register: ${err}`);
    alfredHelper.sendResponse(res, false, null); // Send response back to caller
    next();
    return;
  }

  if (results.rowCount > 0) {
    SQL = `UPDATE push_notifications SET main_user=$1 WHERE device_token='${deviceToken}'`;
    dataValues = [deviceUser];
  } else {
    SQL = 'INSERT INTO push_notifications("time", device_token, main_user) VALUES ($1, $2, $3)';
    dataValues = [
      new Date(),
      deviceToken,
      deviceUser,
    ];
  }

  results = null; // Clear results

  try {
    results = await client.query(SQL, dataValues);
    client.end();

    if (results.rowCount !== 1) {
      logger.error(`Register: Failed to insert/update data for device: ${deviceToken}`);
      alfredHelper.sendResponse(res, false, null); // Send response back to caller
      next();
      return;
    }
    logger.info(`Saved data for device: ${deviceToken}`);
    alfredHelper.sendResponse(res, true, null); // Send response back to caller
    next();
  } catch (err) {
    client.end();
    logger.error(`Register: ${err}`);
    alfredHelper.sendResponse(res, false, err); // Send response back to caller
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
  logger.info('List push notifications api called');

  const client = new Client({
    user: process.env.alfred_datastore_un,
    host: process.env.alfred_datastore,
    database: process.env.alfred_datastore_db,
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
    const dataSelect = 'SELECT * FROM push_notifications GROUP BY device';

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
