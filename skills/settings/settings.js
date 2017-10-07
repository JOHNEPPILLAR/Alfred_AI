/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const lightshelper = require('../../skills/lights/lightshelper.js');
const fs = require('fs');
const dateFormat = require('dateformat');

const skill = new Skills();

/**
 * @api {get} /settings/dellog Delete log file contents
 * @apiName dellog
 * @apiGroup Settings
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
 *     data: 'cleared'
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal server error
 *   {
 *     data: Error message
 *   }
 *
 */
function delLog(req, res, next) {
  logger.info('Delete log file API called');
  try {
    logger.remove(logger.transports.File); // Remove the logger

    // Delete the log file
    const filePath = './Alfred.log';
    fs.unlinkSync(filePath);

    // re-setup the log file
    logger.add(logger.transports.File, {
      JSON: true, filename: 'Alfred.log', colorize: true, timestamp() { return dateFormat(new Date(), 'dd mmm yyyy HH:MM') }
    });

    logger.info('Cleared log file');
    alfredHelper.sendResponse(res, true, 'cleared');
    next();
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    }
    logger.error(`dellog: ${err}`);
    next();
    return err;
  }
}
skill.get('/dellog', delLog);

/**
 * @api {get} /settings/restart Restart the API server
 * @apiName restart
 * @apiGroup Settings
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
 *     data: 'restarting'
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal server error
 *   {
 *     data: Error message
 *   }
 *
 */
function reStart(req, res, next) {
  logger.info('Restart Alfred API called');

  alfredHelper.sendResponse(res, true, 'restarting');

  setTimeout(() => {
    logger.info('Restarting Alfred');
    server.close(); // Stop API responses
    process.exit(); // Kill the app and let nodemon restart it
  }, 1000);
  next();
}
skill.get('/restart', reStart);

module.exports = skill;
