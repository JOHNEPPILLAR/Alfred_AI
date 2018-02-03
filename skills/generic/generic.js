/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const _ = require('lodash');
const readline = require('readline');
const fs = require('fs');
const alfredHelper = require('../../helper.js');
const logger = require('winston');

const skill = new Skills();

/**
 * @api {get} /sayhello Say hello
 * @apiName sayHello
 * @apiGroup Generic
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
 *     data: Hello message
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 400 Bad Request
 *   {
 *     data: Error message
 *   }
 *
 */
function sayHello() {
  let greeting = '';
  const aiNameText = 'My name is Alfred.';
  const aiDesc = 'I am the Pillar house Digital Assistant.';
  const dt = new Date().getHours();

  // Calc which part of day it is
  if (dt >= 0 && dt <= 11) {
    greeting = 'Good Morning.';
  } else if (dt >= 12 && dt <= 17) {
    greeting = 'Good Afternoon.';
  } else {
    greeting = 'Good Evening.';
  }
  return `${greeting} ${aiNameText} ${aiDesc}`; // construct json response
}

function root(req, res, next) {
  logger.info('Root API called');
  alfredHelper.sendResponse(res, true, sayHello()); // Send response back to caller
  next();
}
skill.get('/', root);

function hello(req, res, next) {
  logger.info('Hello API called');
  alfredHelper.sendResponse(res, true, sayHello()); // Send response back to caller
  next();
}
skill.get('/hello', hello);

/**
 * @api {get} /help Say hello
 * @apiName help
 * @apiGroup Generic
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
 *     data: Help message
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 400 Bad Request
 *   {
 *     data: Error message
 *   }
 *
 */
function help(req, res, next) {
  logger.info('Help API called');
  const responseText = 'So you need some help, not a problem.' +
                        'You can ask: ' +
                        'Tell me a joke. ' +
                        'Turn on the lights. ' +
                        'What is the news. ' +
                        'Search for. ' +
                        'What is the time. ' +
                        'When is the next train. ' +
                        'Turn on the TV. ' +
                        'or what is the weather.';

    // Send response back to caller
  alfredHelper.sendResponse(res, true, responseText);
  next();
}
skill.get('/help', help);

/**
 * @api {get} /ping Ping
 * @apiName ping
 * @apiGroup Generic
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
 *     data: 'pong'
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 400 Bad Request
 *   {
 *     data: Error message
 *   }
 *
 */
function ping(req, res, next) {
  logger.info('Ping API called');
  alfredHelper.sendResponse(res, true, 'pong'); // Send response back to caller
  next();
}
skill.get('/ping', ping);

/**
 * @api {get} /displayLog Display log file content
 * @apiName displayLog
 * @apiGroup Generic
 *
 * @apiParam {Number} page Page number to display
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
 *     data:
 *      "currentpage": 1,
 *       "prevpage": 0,
 *       "nextpage": 2,
 *       "lastpage": 3,
 *       "lpm1": 2,
 *       "pages": [
 *         1,
 *         2,
 *         3  ],
 *       "logs": [
 *         {
 *            "level": "info",
 *            "message": "Display Log API called",
 *            "timestamp": "06 Oct 2017 20:17"
 *         }
 *        ]
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal server error
 *   {
 *     data: Error message
 *   }
 *
 */
function displayLog(req, res, next) {
  logger.info('Display Log API called');
  try {
    let page = 1;
    if (typeof req.query.page !== 'undefined' && req.query.page !== null && req.query.page !== '') {
      page = parseInt(req.query.page || 1, 10);
    }

    const itemsOnPage = 50;
    const results = [];
    const file = fs.createReadStream('./Alfred.log');
    file.on('error', (err) => {
      alfredHelper.sendResponse(res, null, err);
    });
    const rl = readline.createInterface({
      input: file,
    });

    rl.on('line', (line) => {
      results.push(JSON.parse(line));
    });

    rl.on('error', (err) => {
      alfredHelper.sendResponse(res, null, err);
    });

    let nextpage;
    rl.on('close', () => {
      results.reverse(); // Reverse logfile order

      const pagesCount = Math.floor(results.length / itemsOnPage) + (results.length % itemsOnPage === 0 ? 0 : 1);
      if (page > pagesCount) { page = pagesCount; }
      const logs = results.splice((page - 1) * itemsOnPage, itemsOnPage);

      if (page === pagesCount) {
        nextpage = pagesCount;
      } else {
        nextpage = page + 1;
      }

      // Construct the returning message
      const jsonDataObj = {
        currentpage: page,
        prevpage: page - 1,
        nextpage,
        lastpage: pagesCount,
        lpm1: pagesCount - 1,
        pages: _.range(1, pagesCount + 1),
        logs,
      };

      alfredHelper.sendResponse(res, true, jsonDataObj);
      next();
    });
  } catch (err) {
    logger.error(`displayLog: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
      next();
    }
  }
}
skill.get('/displaylog', displayLog);

module.exports = skill;
