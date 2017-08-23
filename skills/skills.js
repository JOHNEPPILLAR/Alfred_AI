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
    var travelRouter = require('./travel/travel.js');
    travelRouter.applyRoutes(server, '/travel');

    // lights skill
    var lightRouter = require('./lights/lights.js');
    lightRouter.applyRoutes(server, '/lights');

    // TV skill
    var tvRouter = require('./tv/tv.js');
    tvRouter.applyRoutes(server, '/tv');

    // Schedule skill
    var scheduleRouter = require('./schedules/schedules.js');
    scheduleRouter.applyRoutes(server, 'schedule');

    // Settings skill
    var settingsRouter = require('./settings/settings.js');
    settingsRouter.applyRoutes(server, '/settings');

    // Web cam skill
    var camRouter = require('./webcam/webcam.js');
    camRouter.applyRoutes(server, '/webcam');

};

module.exports = appSkills;