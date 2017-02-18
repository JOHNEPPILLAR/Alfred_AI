//=========================================================
// Setup weather skills
//=========================================================
const Skills = require('restify-router').Router;  
      skill = new Skills(),
      alfredHelper = require('../../helper'),
      sortArray = require('array-sort');

//=========================================================
// Skill: base root, get today's weather for a location, default is London
// Params: location: String
//=========================================================
function todaysWeatherFor (req, res, next) {

    // Get the location
    var location = '';
    if (typeof req.query.location !== 'undefined' && req.query.location !== null){
        location = req.query.location;
    } else {
        location = 'london,uk';
    };

    const url = 'http://api.openweathermap.org/data/2.5/weather?q=' + location + '&APPID=' + process.env.OPENWEATHERMAPAPIKEY;
    alfredHelper.requestAPIdata(url)
    .then(function(apiData){

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
              code : 'sucess',
              data :
              {
                  locationname    : locationname,
                  Summary         : Summary,
                  CurrentTemp     : CurrentTemp,
                  MaxTemp         : MaxTemp,
                  MinTemp         : MinTemp,
                  PercentOvercast : PercentOvercast,
                  RainVolume      : RainVolume,
                  SnowVolume      : SnowVolume
              }
        };

        // Send response back to caller
        res.send(jsonDataObj);
    })
    .catch(function (err) {
        // if city not found return specific error message
        if(err.message.indexOf('Not found city') > -1) {
            var errorMessage = 'Location was not found';
        } else {
            var errorMessage = err.message;
        };

        var returnJSON = {
            code : 'error',
            data : errorMessage
        }
        console.log('todaysWeatherFor: ' + err);
        res.send(returnJSON);
    });

    next();
};

//=========================================================
// Skill: tomorrow, get tomorrow's forecast for a location, default is London
// Params: location: String
//=========================================================
function weatherForcastForTomorrow (req, res, next) {

    // Get the location
    var location = '';
    if (typeof req.query.location !== 'undefined' && req.query.location !== null){
        location = req.query.location;
    } else {
        location = 'london,uk';
    };

    const url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + location + '&APPID=' + process.env.OPENWEATHERMAPAPIKEY;
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
              code : 'sucess',
              data :
              {
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
              }
        };

        // Send response back to caller
        res.send (jsonDataObj)
    })
    .catch(function (err) {
        // if city not found return specific error message
        if(err.message.indexOf('Not found city') > -1) {
            var errorMessage = 'Location was not found';
        } else {
            var errorMessage = err.message;
        };

        var returnJSON = {
            code : 'error',
            data : errorMessage
        }
        console.log('weatherForcastForTomorrow: ' + err);
        res.send(returnJSON);
    });

    next();
};

//=========================================================
// Skill: willItSnow, will it snow in the next 5 days for a location, default is London
// Params: location: String
//=========================================================
function willItSnow (req, res, next) {

    // Get the location
    var location = '';
    if (typeof req.query.location !== 'undefined' && req.query.location !== null){
        location = req.query.location;
    } else {
        location = 'london,uk';
    };

    const url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + location + '&APPID=' + process.env.OPENWEATHERMAPAPIKEY;
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
              code : 'sucess',
              data :
              {
                  location      : apiData.body.city.location,
                  going_to_snow : goingtosnow,
                  snow_days     : daysSnowing
              }
        };

        // Send response back to caller
        res.send (jsonDataObj)
    })
    .catch(function (err) {
        // if city not found return specific error message
        if(err.message.indexOf('Not found city') > -1) {
            var errorMessage = 'Location was not found';
        } else {
            var errorMessage = err.message;
        };

        var returnJSON = {
            code : 'error',
            data : errorMessage
        }
        console.log('weatherForcastForTomorrow: ' + err);
        res.send(returnJSON);
    });

    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/today', todaysWeatherFor);
skill.get('/tomorrow', weatherForcastForTomorrow);
skill.get('/willitsnow', willItSnow);

module.exports = skill;