/**
 * Setup generic skill
 */
const Skills = require('restify-router').Router;
const _ = require('lodash');
const readline = require('readline');
const fs = require('fs');
const alfredHelper = require('../../helper.js');

const skill = new Skills();

function sayHello() {
  let greeting = '';
  const aiNameText = 'My name is Alfred.';
  const aiDesc = 'I am the Pillar house Digital Assistant.';
  const dt = new Date().getHours();

  // Calc which part of day
  if (dt >= 0 && dt <= 11) {
    greeting = 'Good Morning.';
  } else if (dt >= 12 && dt <= 17) {
    greeting = 'Good Afternoon.';
  } else {
    greeting = 'Good Evening.';
  }
  return `${greeting} ${aiNameText} ${aiDesc}`; // construct json response
}

/**
 * Skill: base root
 */
function root(req, res, next) {
  alfredHelper.sendResponse(res, 'true', sayHello()); // Send response back to caller
  next();
}

/**
 * Skill: Hello
 */
function hello(req, res, next) {
  alfredHelper.sendResponse(res, 'true', sayHello()); // Send response back to caller
  next();
}

/**
 * Skill: Help
 */
function help(req, res, next) {
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
  alfredHelper.sendResponse(res, 'true', responseText);
  next();
}

/**
 * Skill: ping
 */
function ping(req, res, next) {
  logger.info('Ping API called');

  // Send response back to caller
  alfredHelper.sendResponse(res, 'true', 'sucess');
  next();
}

/**
 * Skill: displaylog
 */
function displayLog(req, res, next) {
  logger.info('Display Log API called');

  let page = 1;
  if (typeof req.query.page !== 'undefined' && req.query.page !== null && req.query.page !== '') {
    page = parseInt(req.query.page || 1, 10);
  }

  const itemsOnPage = 50;
  const rl = readline.createInterface({
    input: fs.createReadStream('./Alfred.log'),
  });
  const results = [];

  rl.on('line', (line) => {
    results.push(JSON.parse(line));
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

    alfredHelper.sendResponse(res, 'true', jsonDataObj);
    next();
  });
}

/**
 * Add skills to server
 */
skill.get('/', root);
skill.get('/hello', hello);
skill.get('/help', help);
skill.get('/ping', ping);
skill.get('/displaylog', displayLog);

module.exports = skill;
