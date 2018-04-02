/**
 * Setup server
 */
require('dotenv').config();

const restify = require('restify');
const lightNameHelper = require('./lightNames.js');
const fs = require('fs');
const alfredHelper = require('./helper.js');
const logger = require('winston');
const memwatch = require('memwatch-next');
const heapdump = require('heapdump');
const dateFormat = require('dateformat');

// Get up global vars
global.lightNames = [];
global.lightGroupNames = [];

alfredHelper.setLogger(logger); // Configure the logger

// Restify server Init
const server = restify.createServer({
  name: process.env.APINAME,
  version: process.env.VERSION,
  key: fs.readFileSync('./certs/server.key'),
  certificate: fs.readFileSync('./certs/server.crt'),
});

/**
 * API Middleware
 */
server.use(restify.plugins.jsonBodyParser({ mapParams: true }));
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.fullResponse());
server.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});
server.on('uncaughtException', (request, response, route, error) => {
  logger.error(`${route}: ${error.message}`);
  alfredHelper.sendResponse(response, null, error);
});

/**
 * Start API server and listen to messqges
 */
server.listen(process.env.PORT, () => {
  logger.info('%s is listening on port %s', server.name, process.env.PORT);
});

/**
 * Check for valid app_key param send in header, if not then return error
 */
server.use((req, res, next) => {
  if (req.headers.app_key === process.env.app_key) {
    next();
  } else {
    logger.error(`Invaid app_key: ${req.headers.app_key}`);
    alfredHelper.sendResponse(res, 401, 'There was a problem authenticating you.');
  }
});

/**
 * Configure API end points
 */
const genericRouter = require('../skills/generic/generic.js');
const jokeRouter = require('../skills/joke/joke.js');
const lightRouter = require('../skills/lights/lights.js');
const newsRouter = require('../skills/news/news.js');
const searchRouter = require('../skills/search/search.js');
const settingsRouter = require('../skills/settings/settings.js');
const timeRouter = require('../skills/time/time.js');
const travelRouter = require('../skills/travel/travel.js');
const tvRouter = require('../skills/tv/tv.js');
const weatherRouter = require('../skills/weather/weather.js');

genericRouter.applyRoutes(server);
jokeRouter.applyRoutes(server);
lightRouter.applyRoutes(server, '/lights');
newsRouter.applyRoutes(server);
searchRouter.applyRoutes(server);
settingsRouter.applyRoutes(server, '/settings');
timeRouter.applyRoutes(server);
travelRouter.applyRoutes(server, '/travel');
tvRouter.applyRoutes(server, '/tv');
weatherRouter.applyRoutes(server, '/weather');

/**
 * Setup light & light group names after 1 second delay to setup api server
 */
setTimeout(() => { lightNameHelper.setupLightNames(); }, 1000);

/**
 * Stop https server if process close event is issued
 */
process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});

/**
 * Memory leak detection
 */
heapdump.writeSnapshot(`${process.env.afred_config}mem/alfred_di/0_start_${dateFormat(Date.now(), 'HH_MM_TT')}.heapsnapshot`);

memwatch.on('leak', (info) => {
  logger.error('Memory leak detected');
  logger.error(`${info.growth} - ${info.reason}`);
  heapdump.writeSnapshot(`${process.env.afred_config}mem/alfred_di/1_run_${dateFormat(Date.now(), 'HH_MM_TT')}.heapsnapshot`);
});
