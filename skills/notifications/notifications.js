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
 * @api {get} /register Register for push notifications
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
  logger.info('Register new device api called ');

  const client = new Client({
    user: process.env.alfred_datastore_un,
    host: process.env.alfred_datastore,
    database: process.env.alfred_datastore_db,
    password: process.env.alfred_datastore_pwd,
    port: 5432,
  });

  const deviceToken = req.query.device_token;
  if (typeof deviceToken === 'undefined' || deviceToken === null) {
    alfredHelper.sendResponse(res, false, null); // Send response back to caller
    next();
    return;
  }

  try {
    client.connect();
  } catch (connectErr) {
    logger.error(`Register: ${connectErr}`);
    alfredHelper.sendResponse(res, false, null); // Send response back to caller
    next();
    return;
  }

  try {
    const dataInsert = 'INSERT INTO push_notifications("time", device_token) VALUES ($1, $2)';
    const dataValues = [
      new Date(),
      deviceToken,
    ];

    const results = await client.query(dataInsert, dataValues);
    client.end();

    if (results.rowCount !== 1) {
      logger.error(`Register: Failed to insert data for device: ${dataValues[1]}`);
      alfredHelper.sendResponse(res, false, null); // Send response back to caller
      next();
      return;
    }
    logger.info(`Saved data for device: ${dataValues[1]}`);
    alfredHelper.sendResponse(res, true, null); // Send response back to caller
    next();
  } catch (saveErr) {
    logger.error(`Register: ${saveErr}`);
    alfredHelper.sendResponse(res, false, null); // Send response back to caller
    next();
  }
}
skill.get('/register', register);

module.exports = skill;
