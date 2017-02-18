var appRouter = function(server) {
 
    // Generic routes such as hello, help
    var genericRouter = require('./generic/generic.js');
    genericRouter.applyRoutes(server);
    
    // weather
    var weatherRouter = require('./weather/weather.js');
    weatherRouter.applyRoutes(server, '/weather');

    // joke
    var jokeRouter = require('./joke/joke.js');
    jokeRouter.applyRoutes(server);

    // time
    var timeRouter = require('./time/time.js');
    timeRouter.applyRoutes(server);

    // news
    var newsRouter = require('./news/news.js');
    newsRouter.applyRoutes(server, '/news');

    // search
    var searchRouter = require('./search/search.js');
    searchRouter.applyRoutes(server);

}

module.exports = appRouter;