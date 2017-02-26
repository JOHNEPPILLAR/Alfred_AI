var appSkills = function(server) {

    // Generic skills such as hello, help
    var genericRouter = require('./generic/generic.js');
    genericRouter.applyRoutes(server);
    
    // Weather skills
    var weatherRouter = require('./weather/weather.js');
    weatherRouter.applyRoutes(server, '/weather');

    // Joke skill
    var jokeRouter = require('./joke/joke.js');
    jokeRouter.applyRoutes(server);

    // Time skill
    var timeRouter = require('./time/time.js');
    timeRouter.applyRoutes(server);

    // News skills
    var newsRouter = require('./news/news.js');
    newsRouter.applyRoutes(server);

    // Search skill
    var searchRouter = require('./search/search.js');
    searchRouter.applyRoutes(server);

    // travel skill
    var searchRouter = require('./travel/travel.js');
    searchRouter.applyRoutes(server, '/travel');

    // lights skill
    var searchRouter = require('./lights/lights.js');
    searchRouter.applyRoutes(server, '/lights');

}

module.exports = appSkills;