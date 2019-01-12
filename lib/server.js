/**
 * Import external libraries
 */
require('dotenv').config();

const restify = require('restify');
const fs = require('fs');
const UUID = require('pure-uuid');
const { Pool } = require('pg');

/**
 * Import helper libraries
 */
const serviceHelper = require('./helper.js');

global.lightsDataClient = new Pool({
  host: process.env.DataStore,
  database: 'lights',
  user: process.env.DataStoreUser,
  password: process.env.DataStoreUserPassword,
  port: 5432,
});

global.schedulesDataClient = new Pool({
  host: process.env.DataStore,
  database: 'schedules',
  user: process.env.DataStoreUser,
  password: process.env.DataStoreUserPassword,
  port: 5432,
});

global.devicesDataClient = new Pool({
  host: process.env.DataStore,
  database: 'devices',
  user: process.env.DataStoreUser,
  password: process.env.DataStoreUserPassword,
  port: 5432,
});

global.instanceTraceID = new UUID(4);
global.callTraceID = null;

/**
 * Restify server Init
 */
let key;
let crt;
if (process.env.Environment === 'dev') {
  key = './certs/server.key';
  crt = './certs/server.crt';
} else {
  key = './certs/server.key';
  crt = './certs/server.crt';
}
const server = restify.createServer({
  name: process.env.ServiceName,
  version: process.env.Version,
  key: fs.readFileSync(key),
  certificate: fs.readFileSync(crt),
});

/**
 * Setup API middleware
 */
server.use(restify.plugins.jsonBodyParser({ mapParams: true }));
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.fullResponse());
server.use((req, res, next) => {
  if (process.env.Debug === 'true') serviceHelper.log('trace', null, req.url);
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});
server.use((req, res, next) => {
  // Check for a trace id
  if (typeof req.headers['trace-id'] === 'undefined') { global.callTraceID = new UUID(4); } // Generate new trace id

  // Check for valid auth key
  if (req.headers['client-access-key'] !== process.env.ClientAccessKey) {
    serviceHelper.log('warn', 'server', `Invaid client access key: ${req.headers.ClientAccessKey}`);
    serviceHelper.sendResponse(res, 401, 'There was a problem authenticating you.');
    return;
  }
  next();
});

server.on('NotFound', (req, res, err) => {
  serviceHelper.log('error', 'server', `${err}`);
  serviceHelper.sendResponse(res, 404, err.message);
});
server.on('uncaughtException', (req, res, route, err) => {
  serviceHelper.log('error', 'server', `${route}: ${err}`);
  serviceHelper.sendResponse(res, 'server', err.message);
});

/**
 * Configure API end points
 */
require('../api/root/root.js').applyRoutes(server);
require('../api/notifications/notifications.js').applyRoutes(server, '/notifications');
require('../api/travel/travel.js').skill.applyRoutes(server, '/travel');
require('../api/travel/commute.js').skill.applyRoutes(server, '/commute');
require('../api/lights/lights.js').applyRoutes(server, '/lights');
require('../api/weather/weather.js').skill.applyRoutes(server, '/weather');
require('../api/settings/settings.js').applyRoutes(server, '/settings');
require('../api/iot/iot.js').applyRoutes(server, '/iot');

/**
 * Stop server if process close event is issued
 */
async function cleanExit() {
  serviceHelper.log('warn', 'cleanExit', 'Service stopping');
  serviceHelper.log('warn', 'cleanExit', 'Closing the data store pools');
  try {
    await global.devicesDataClient.end();
    await global.lightsDataClient.end();
    await global.schedulesDataClient.end();
  } catch (err) {
    serviceHelper.log('warn', 'cleanExit', 'Failed to close a data store connection');
  }
  serviceHelper.log('warn', 'cleanExit', 'Close rest server');
  server.close(() => { // Ensure rest server is stopped
    process.exit(); // Exit app
  });
}
process.on('exit', () => { cleanExit(); });
process.on('SIGINT', () => { cleanExit(); });
process.on('SIGTERM', () => { cleanExit(); });
process.on('uncaughtException', (err) => {
  if (err) serviceHelper.log('error', 'server', err.message); // log the error
});

/**
 * Data store error events
 */
global.devicesDataClient.on('error', (err) => {
  serviceHelper.log('error', 'server', 'Logs data store: Unexpected error on idle client');
  serviceHelper.log('error', 'server', err.message);
  cleanExit();
});

// Register service
const registerService = serviceHelper.registerService();
if (registerService instanceof Error) {
  serviceHelper.log('error', 'server', 'Unable to register service');
  cleanExit();
}

// Start service and listen to requests
server.listen(process.env.Port, () => {
  serviceHelper.log('info', 'server', `${process.env.ServiceName} has started and is listening on port ${process.env.Port}`);
});
