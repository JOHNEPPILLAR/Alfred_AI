#!/usr/bin/env nodejs

//=========================================================
// Setup server
//=========================================================
const restify = require('restify'),
      dotenv  = require('dotenv');

// Get up global vars
global.alfredHelper         = require('./helper.js');
global.logger               = require('winston');
global.scheduleHelper       = require('./schedules/schedules.js');
global.timers               = [];
global.motionSensorLightsOn = false;

dotenv.load() // Load env vars

alfredHelper.setLogger(logger); // Configure the logger

// Restify server Init
const server = restify.createServer({
    name    : process.env.APINAME,
    version : process.env.VERSION,
});

//=========================================================
// Middleware
//=========================================================
server.use(restify.jsonBodyParser({ mapParams: true }));
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser({ mapParams: true }));
server.use(restify.fullResponse());
server.on('uncaughtException',function(request, response, route, error) {
    logger.error(error.message);
    alfredHelper.sendResponse(response, 'error', error.message);
});

//=========================================================
// Start server and listen to messqges
//=========================================================
server.listen(process.env.PORT, function() {
   logger.info('%s listening to %s', server.name, server.url);
});

//=========================================================
// Check for valid app_key param, if not then return error
//=========================================================
server.use(function (req, res, next) {
    if (req.query.app_key == process.env.app_key) {
        next();
    } else {
        next(new restify.NotAuthorizedError('There was a problem authenticating you.')); // Invalid app_key, return error
    }
    next();
});

//=========================================================
// Setup light schedules & motion sensor
//=========================================================
scheduleHelper.setSchedule();
//scheduleHelper.setMotionSensor();

//=========================================================
// Configure skills
//=========================================================
var defaultRouter = require("./skills/skills.js")(server);
