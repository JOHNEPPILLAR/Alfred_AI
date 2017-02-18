//=========================================================
// Setup server
//=========================================================
const restify    = require('restify'),
      dotenv     = require('dotenv');

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
server.use(restify.jsonBodyParser({ mapParams: true }))
server.use(restify.acceptParser(server.acceptable))
server.use(restify.queryParser({ mapParams: true }))
server.use(restify.fullResponse())

//=========================================================
// Error logging
//=========================================================
server.on('uncaughtException', (req, res, route, err) => {
    var returnJSON = {
        code    : 'error',
        message : err.message,
        data    : {
            skill : route,
            error : err,
            call  : req
        }
    };
    res.send(returnJSON);
});

//=========================================================
// Startup server and listen to messqges
//=========================================================
server.listen(process.env.PORT, function() {
   console.log('%s listening to %s', server.name, server.url);
});

//=========================================================
// Configure skills
//=========================================================
var defaultRouter = require("./skills/skills.js")(server);
