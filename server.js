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
global.motionSensorActive   = false;
global.motionSensorLightsOn = false;
global.lightNames           = [];
global.lightGroupNames      = [];

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
server.use(restify.plugins.jsonBodyParser({ mapParams: true }));
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.fullResponse());
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
