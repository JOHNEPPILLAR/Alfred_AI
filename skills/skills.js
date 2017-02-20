var appSkills = function(server) {
 
    // Generic skills such as hello, help
    var genericRouter = require('./generic/generic.js');
    genericRouter.applyRoutes(server);
    
    // weather skills
    var weatherRouter = require('./weather/weather.js');
    weatherRouter.applyRoutes(server, '/weather');

    // joke skill
    var jokeRouter = require('./joke/joke.js');
    jokeRouter.applyRoutes(server);

    // time skill
    var timeRouter = require('./time/time.js');
    timeRouter.applyRoutes(server);

    // news skills
    var newsRouter = require('./news/news.js');
    newsRouter.applyRoutes(server);

    // search skill
    var searchRouter = require('./search/search.js');
    searchRouter.applyRoutes(server);

    // travel skill
    var searchRouter = require('./travel/travel.js');
    searchRouter.applyRoutes(server, '/travel');

}

module.exports = appSkills;