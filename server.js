//=========================================================
// Setup server
//=========================================================
const restify = require('restify'),
      dotenv  = require('dotenv');

// Load env vars
dotenv.load()

// Restify server Init
const server = restify.createServer({
    name    : process.env.APINAME,
    version : process.env.VERSION,
});

//server.get('/', restify.serveStatic({
//    directory: __dirname,
//    default: '/index.html'
//}));

//=========================================================
// Middleware
//=========================================================
server.use(restify.jsonBodyParser({ mapParams: true }));
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser({ mapParams: true }));
server.use(restify.fullResponse());
server.on('uncaughtException',function(request, response, route, error) {
    console.error(error.stack);
    response.send(error);
});

//=========================================================
// Start server and listen to messqges
//=========================================================
server.listen(process.env.PORT, function() {
   console.log('%s listening to %s', server.name, server.url);
});

//=========================================================
// Check for valid app_key param, if not then return error
//=========================================================
server.use(function (req, res, next) {
    if (req.query.app_key == process.env.app_key) {
        next();
    } else {
        // Invalid app_key, return error
        next(new restify.NotAuthorizedError('The app_key was invalid'));
    }
    next();
});

//=========================================================
// Configure skills
//=========================================================
var defaultRouter = require("./skills/skills.js")(server);
