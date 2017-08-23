//=========================================================
// Setup weather skills
//=========================================================
const Skills    = require('restify-router').Router;  
      skill     = new Skills(),
      sortArray = require('array-sort');

//=========================================================
// Skill: base root, get today's weather for a location, default is London
// Params: location: String
//=========================================================
function weatherForcastForToday (req, res, next) {

    logger.info ('Today\'s Weather API called');

    // Get the location
    var location = '';
    if (typeof req.query.location !== 'undefined' 
                && req.query.location !== null
                && req.query.location !== '') {
        location = req.query.location;
    } else {
        location = 'london,uk';
    };

    const url = 'http://api.openweathermap.org/data/2.5/weather?units=metric&q=' + location + '&APPID=' + process.env.OPENWEATHERMAPAPIKEY;

    alfredHelper.requestAPIdata(url)
    .then(function(apiData) {

        // Get the weather data
        apiData = apiData.body;
        var locationname    = apiData.name,
            Summary         = apiData.weather[0].description,
            CurrentTemp     = apiData.main.temp,
            MaxTemp         = apiData.main.temp_max,
            MinTemp         = apiData.main.temp_min,
            PercentOvercast = apiData.clouds.all,
            RainVolume      = apiData.rain,
            SnowVolume      = apiData.snow
        if (typeof RainVolume == 'undefined'){
            RainVolume = 0;
        } else {
            RainVolume = RainVolume['3h'];
        };
        if (typeof SnowVolume == 'undefined'){
            SnowVolume = 0;
        } else {
            SnowVolume = SnowVolume['3h'];
        };

        // Construct the returning message
        const jsonDataObj = {
                locationname    : locationname,
                Summary         : Summary,
                CurrentTemp     : CurrentTemp,
                MaxTemp         : MaxTemp,
                MinTemp         : MinTemp,
                PercentOvercast : PercentOvercast,
                RainVolume      : RainVolume,
                SnowVolume      : SnowVolume
              };

        // Send response back to caller
        alfredHelper.sendResponse(res, 'sucess', jsonDataObj);
    })
    .catch(function (err) {
        // if city not found return specific error message
        if(err.message.indexOf('Not found city') > -1) {
            var errorMessage = 'Location was not found.';
        } else {
            var errorMessage = err.message;
        };

        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', errorMessage);
        logger.error('todaysWeatherFor: ' + err);
    });
    next();
};

//=========================================================
// Skill: tomorrow, get tomorrow's forecast for a location, default is London
// Params: location: String
//=========================================================
function weatherForcastForTomorrow (req, res, next) {

    logger.info ('Tomorrow\'s Weather API called');

    // Get the location
    var location = '';
    if (typeof req.query.location !== 'undefined' 
                && req.query.location !== null
                && req.query.location !== ''){
        location = req.query.location;
    } else {
        location = 'london,uk';
    };

    const url = 'http://api.openweathermap.org/data/2.5/forecast?units=metric&q=' + location + '&APPID=' + process.env.OPENWEATHERMAPAPIKEY;

    alfredHelper.requestAPIdata(url)
    .then(function(apiData){

        var weatherData = apiData.body.list,
            startDate = alfredHelper.addDays(new Date(),1).setHours(6,0,0,0),
            endDate = alfredHelper.addDays(new Date(),1).setHours(23,59,0,0);

        // Filter data for tomorrow and then sort by time
        weatherData =  weatherData.filter(function (obj) {
            return obj.dt >= (startDate+'').substring(0, 10) && obj.dt <= (endDate+'').substring(0, 10);
        })
        weatherData = sortArray(weatherData, 'dt');

        // Get the weather data for tomorrow morning
        var locationname           = apiData.body.city.name,
            morningSummary         = weatherData[0].weather[0].description,
            morningTemp            = weatherData[0].main.temp,
            morningMaxTemp         = weatherData[0].main.temp_max,
            morningMinTemp         = weatherData[0].main.temp_min,
            morningPercentOvercast = weatherData[0].clouds.all,
            monringRainVolume      = weatherData[0].rain,
            morningSnowVolume      = weatherData[0].snow,
            morningTime            = weatherData[0].dt_txt;
        if (typeof morningRainVolume == 'undefined'){
            morningRainVolume = 0;
        } else {
            morningRainVolume = morningRainVolume['3h'];
        };
        if (typeof morningSnowVolume == 'undefined'){
            morningSnowVolume = 0;
        } else {
            morningSnowVolume = morningSnowVolume['3h'];
        };

        // Get the weather data for tomorrow evening
        var eveningSummary         = weatherData[4].weather[0].description,
            eveningTemp            = weatherData[4].main.temp,
            eveningMaxTemp         = weatherData[4].main.temp_max,
            eveningMinTemp         = weatherData[4].main.temp_min,
            eveningPercentOvercast = weatherData[4].clouds.all,
            eveningRainVolume      = weatherData[4].rain,
            eveningSnowVolume      = weatherData[4].snow,
            eveningTime            = weatherData[4].dt_txt;
        if (typeof eveningRainVolume == 'undefined'){
            eveningRainVolume = 0;
        } else {
            eveningRainVolume = eveningRainVolume['3h'];
        };
        if (typeof eveningSnowVolume == 'undefined'){
            eveningSnowVolume = 0;
        } else {
            eveningSnowVolume = eveningSnowVolume['3h'];
        };

        // Construct the returning message
        const jsonDataObj = {
                  location : locationname,
                  tomorrow_morning:
                  {
                      Time            : morningTime,
                      Summary         : morningSummary,
                      Temp            : morningTemp,
                      MaxTemp         : morningMaxTemp,
                      MinTemp         : morningMinTemp,
                      PercentOvercast : morningPercentOvercast,
                      RainVolume      : monringRainVolume,
                      SnowVolume      : morningSnowVolume
                  },
                  tomorrow_evening:
                  {
                      Time            : eveningTime,
                      Summary         : eveningSummary,
                      Temp            : eveningTemp,
                      MaxTemp         : eveningMaxTemp,
                      MinTemp         : eveningMinTemp,
                      PercentOvercast : eveningPercentOvercast,
                      RainVolume      : eveningRainVolume,
                      SnowVolume      : eveningSnowVolume
                  }
        };

        // Send response back to caller
        alfredHelper.sendResponse(res, 'sucess', jsonDataObj);
    })
    .catch(function (err) {
        // if city not found return specific error message
        if(err.message.indexOf('Not found city') > -1) {
            var errorMessage = 'Location was not found.';
        } else {
            var errorMessage = err.message;
        };

        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', errorMessage);
        logger.error('weatherForcastForTomorrow: ' + err);
    });

    next();
};

//=========================================================
// Skill: willItSnow, will it snow in the next 5 days for a location, default is London
// Params: location: String
//=========================================================
function willItSnow (req, res, next) {

    logger.info ('Will it snow API called');

    // Get the location
    var location = 'london,uk';

    if (typeof req.query.location !== 'undefined' && req.query.location !== null && req.query.location !== ''){
        location = req.query.location;
    };

    const url = 'http://api.openweathermap.org/data/2.5/forecast?units=metric&q=' + location + '&APPID=' + process.env.OPENWEATHERMAPAPIKEY;

    alfredHelper.requestAPIdata(url)
    .then(function(apiData){

        var weatherData = apiData.body.list,
            goingtosnow = false,
            daysSnowing = [];

        // Loop through the 5 day forecast to see if it will snow
        weatherData = sortArray(weatherData, 'dt');
        weatherData.forEach(function(obj) {
            if (typeof obj.snow !== 'undefined'){
                daysSnowing.push(obj.dt_txt);
                goingtosnow = true;
            };
        });

        // Construct the returning message
        const jsonDataObj = {
                  location      : apiData.body.city.location,
                  going_to_snow : goingtosnow,
                  snow_days     : daysSnowing
              };

        // Send response back to caller
        alfredHelper.sendResponse(res, 'sucess', jsonDataObj);
    })
    .catch(function (err) {
        // if city not found return specific error message
        if(err.message.indexOf('Not found city') > -1) {
            var errorMessage = 'Location was not found.';
        } else {
            var errorMessage = err.message;
        };

        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', errorMessage);
        logger.error('willItSnow: ' + err);
    });
    next();
};

//=========================================================
// Skill: willItRain, will it rain in the next 5 days for a location, default is London
// Params: location: String
//=========================================================
function willItRain (req, res, next) {

    logger.info ('Will it rain API called');

    // Get the location
    var location = 'london,uk';

    if (typeof req.query.location !== 'undefined' && req.query.location !== null && req.query.location !== ''){
        location = req.query.location;
    };

    const url = 'http://api.openweathermap.org/data/2.5/forecast?units=metric&q=' + location + '&APPID=' + process.env.OPENWEATHERMAPAPIKEY;

    alfredHelper.requestAPIdata(url)
    .then(function(apiData){

        var weatherData = apiData.body.list,
            goingtorain = false,
            daysRaining = [];

        // Loop through the 5 day forecast to see if it will rain
        weatherData = sortArray(weatherData, 'dt');
        weatherData.forEach(function(obj) {

            if (typeof obj.rain !== 'undefined'){
                if (typeof obj.rain['3h'] !== 'undefined'){
                    daysRaining.push(obj.dt_txt);
                    goingtorain = true;
                };
            };
        });

        // Construct the returning message
        const jsonDataObj = {
                  location      : apiData.body.city.location || location,
                  going_to_rain : goingtorain,
                  rain_days     : daysRaining
              };

        // Send response back to caller
        alfredHelper.sendResponse(res, 'sucess', jsonDataObj);
    })
    .catch(function (err) {
        // if city not found return specific error message
        if(err.message.indexOf('Not found city') > -1) {
            var errorMessage = 'Location was not found.';
        } else {
            var errorMessage = err.message;
        };

        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', errorMessage);
        logger.error('willItRain: ' + err);
    });
    next();
};

//=========================================================
// Skill: Set sunset time
//=========================================================
function sunSet (req, res, next) {
    
        logger.info ('Sunset API called');
    
        const url = 'http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=' + process.env.OPENWEATHERMAPAPIKEY;
        
        alfredHelper.requestAPIdata(url)
        .then(function(apiData){
    
            sunSet = new Date(apiData.body.sys.sunset);
            sunSet.setHours(sunSet.getHours() + 12);
            
            // Send response back to caller
            alfredHelper.sendResponse(res, 'sucess', dateFormat(sunSet, "HH:MM"));
        })
        .catch(function (err) {
            // Send response back to caller
            alfredHelper.sendResponse(res, 'error', err.message);
            logger.error('sunset: ' + err);
        });
    
        next();
    };
    
//=========================================================
// Add skills to server
//=========================================================
skill.get('/today', weatherForcastForToday);
skill.get('/tomorrow', weatherForcastForTomorrow);
skill.get('/willitsnow', willItSnow);
skill.get('/willitrain', willItRain);
skill.get('/sunset', sunSet);

module.exports = skill;