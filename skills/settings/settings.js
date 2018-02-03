/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const fs = require('fs');
const dateFormat = require('dateformat');
const logger = require('winston');

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
    logger.remove(logger.transports.File); // Remove the logger transport

    // Delete the log file
    const filePath = './Alfred.log';
    fs.unlinkSync(filePath);

    // re-setup the log file
    logger.add(logger.transports.File, {
      JSON: true, filename: 'Alfred.log', colorize: true, timestamp() { return dateFormat(new Date(), 'dd mmm yyyy HH:MM'); },
    });

    logger.info('Cleared log file');
    alfredHelper.sendResponse(res, true, 'cleared');
    next();
  } catch (err) {
    logger.error(`dellog: ${err}`);
    alfredHelper.sendResponse(res, null, err); // Send response back to caller
    next();
  }
  return null;
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
  next();

  setTimeout(() => {
    logger.info('Restarting Alfred_DI');
    process.exit(); // Kill the app and let PM2 restart it
  }, 1000);
}
skill.get('/restart', reStart);

module.exports = skill;
