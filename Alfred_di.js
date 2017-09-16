//=========================================================
// Setup server
//=========================================================
const restify         = require('restify'),
      dotenv          = require('dotenv'),
      lightNameHelper = require('./lightNames.js'),
      webcam          = require('./webcam.js');
      
// Get up global vars
global.alfredHelper    = require('./helper.js');
global.logger          = require('winston');
global.lightNames      = [];
global.lightGroupNames = [];

dotenv.load() // Load env vars

alfredHelper.setLogger(logger); // Configure the logger

// Restify server Init
global.server = restify.createServer({
    name    : process.env.APINAME,
    version : process.env.VERSION
});

//=========================================================
// API Middleware
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
// Start API server and listen to messqges
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
        logger.error ('Invaid app_key: ' + req.query.app_key)
        alfredHelper.sendResponse(res, 'error', 'There was a problem authenticating you.');
    }
});

//=========================================================
// Setup light & light group names
//=========================================================
lightNameHelper.setupLightNames();

//=========================================================
// Setup webcam stream
//=========================================================
webcam.setupStream(server);

server.get(/\/?.*/, restify.plugins.serveStatic({
    directory: __dirname,
    default: 'index.html',
    match: /^((?!app.js).)*$/   // we should deny access to the application source
}));

//=========================================================
// Configure API end points
//=========================================================
var defaultRouter = require("./skills/skills.js")(server);
