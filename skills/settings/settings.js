/**
 * Setup schedule skill
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const lightshelper = require('../../skills/lights/lightshelper.js');
const fs = require('fs');
const dateFormat = require('dateformat');

const skill = new Skills();

/**
 * Skill: Delete log file contents
 */
function delLog(req, res, next) {
  logger.info('Delete log file API called');

  // Remove the logger
  logger.remove(logger.transports.File);

  // Delete the log file
  const filePath = './Alfred.log';
  fs.unlinkSync(filePath);

  // re-setup the log file
  logger.add(logger.transports.File, {
    JSON: true, filename: 'Alfred.log', colorize: true, timestamp() { return dateFormat(new Date(), 'dd mmm yyyy HH:MM') }
  });

  logger.info('Cleared log file');
  alfredHelper.sendResponse(res, 'true', 'cleared');
  next();
}

/**
 * Skill: restart Alfred
 */
function reStart(req, res, next) {
  logger.info('Restart Alfred API called');

  alfredHelper.sendResponse(res, 'true', 'restarting');

  setTimeout(() => {
    logger.info('Restarting Alfred');
    server.close(); // Stop API responses
    process.exit(); // Kill the app and let nodemon restart it
  }, 1000);
  next();
}

/**
 * Add skills to server
 */
skill.get('/restart', reStart);
skill.get('/dellog', delLog);

module.exports = skill;
