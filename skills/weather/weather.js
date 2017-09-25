/**
 * Setup schedule skill
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../helper.js');
const sortArray = require('array-sort');
const dateFormat = require('dateformat');

const skill = new Skills();

/**
 * Skill: base root, get today's weather for a location, default is London
 * Params: location: String
 */
async function weatherForcastForToday(req, res, next) {
  logger.info('Today\'s Weather API called');

  // Get the location
  let location = '';
  if (typeof req.query.location !== 'undefined' && req.query.location !== null && req.query.location !== '') {
    location = req.query.location;
  } else {
    location = 'london,uk';
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${location}&APPID=${process.env.OPENWEATHERMAPAPIKEY}`;

  try {
    let apiData = await alfredHelper.requestAPIdata(url);

    // Get the weather data
    apiData = apiData.body;
    const locationname = apiData.name;
    const Summary = apiData.weather[0].description;
    const CurrentTemp = apiData.main.temp;
    const MaxTemp = apiData.main.temp_max;
    const MinTemp = apiData.main.temp_min;
    const PercentOvercast = apiData.clouds.all;
    let RainVolume = apiData.rain;
    let SnowVolume = apiData.snow;
    if (typeof RainVolume === 'undefined') {
      RainVolume = 0;
    } else {
      RainVolume = RainVolume['3h'];
    }
    if (typeof SnowVolume === 'undefined') {
      SnowVolume = 0;
    } else {
      SnowVolume = SnowVolume['3h'];
    }

    // Construct the returning message
    const jsonDataObj = {
      locationname,
      Summary,
      CurrentTemp,
      MaxTemp,
      MinTemp,
      PercentOvercast,
      RainVolume,
      SnowVolume,
    };

    // Send response back to caller
    alfredHelper.sendResponse(res, 'true', jsonDataObj);
    next();
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`todaysWeatherFor: ${err}`);
    next();
  }
}

/**
 * Skill: tomorrow, get tomorrow's forecast for a location, default is London
 * Params: location: String
 */
async function weatherForcastForTomorrow(req, res, next) {
  logger.info('Tomorrow\'s Weather API called');

  // Get the location
  let location = '';
  if (typeof req.query.location !== 'undefined' && req.query.location !== null && req.query.location !== '') {
    location = req.query.location;
  } else {
    location = 'london,uk';
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${location}&APPID=${process.env.OPENWEATHERMAPAPIKEY}`;

  try {
    const apiData = await alfredHelper.requestAPIdata(url);
    let weatherData = apiData.body.list;
    const startDate = alfredHelper.addDays(new Date(), 1).setHours(6, 0, 0, 0);
    const endDate = alfredHelper.addDays(new Date(), 1).setHours(23, 59, 0, 0);

    // Filter data for tomorrow and then sort by time
    weatherData = weatherData.filter(obj => obj.dt >= (`${startDate}`).substring(0, 10) && obj.dt <= (`${endDate}`).substring(0, 10));
    weatherData = sortArray(weatherData, 'dt');

    // Get the weather data for tomorrow morning
    const locationname = apiData.body.city.name;
    const morningSummary = weatherData[0].weather[0].description;
    const morningTemp = weatherData[0].main.temp;
    const morningMaxTemp = weatherData[0].main.temp_max;
    const morningMinTemp = weatherData[0].main.temp_min;
    const morningPercentOvercast = weatherData[0].clouds.all;
    let monringRainVolume = weatherData[0].rain;
    let morningSnowVolume = weatherData[0].snow;
    const morningTime = weatherData[0].dt_txt;
    if (typeof morningRainVolume === 'undefined') {
      monringRainVolume = 0;
    } else {
      monringRainVolume = monringRainVolume['3h'];
    }
    if (typeof morningSnowVolume === 'undefined') {
      morningSnowVolume = 0;
    } else {
      morningSnowVolume = morningSnowVolume['3h'];
    }

    // Get the weather data for tomorrow evening
    const eveningSummary = weatherData[4].weather[0].description;
    const eveningTemp = weatherData[4].main.temp;
    const eveningMaxTemp = weatherData[4].main.temp_max;
    const eveningMinTemp = weatherData[4].main.temp_min;
    const eveningPercentOvercast = weatherData[4].clouds.all;
    let eveningRainVolume = weatherData[4].rain;
    let eveningSnowVolume = weatherData[4].snow;
    const eveningTime = weatherData[4].dt_txt;
    if (typeof eveningRainVolume === 'undefined') {
      eveningRainVolume = 0;
    } else {
      eveningRainVolume = eveningRainVolume['3h'];
    }
    if (typeof eveningSnowVolume === 'undefined') {
      eveningSnowVolume = 0;
    } else {
      eveningSnowVolume = eveningSnowVolume['3h'];
    }

    // Construct the returning message
    const jsonDataObj = {
      location: locationname,
      tomorrow_morning: {
        Time: morningTime,
        Summary: morningSummary,
        Temp: morningTemp,
        MaxTemp: morningMaxTemp,
        MinTemp: morningMinTemp,
        PercentOvercast: morningPercentOvercast,
        RainVolume: monringRainVolume,
        SnowVolume: morningSnowVolume,
      },
      tomorrow_evening: {
        Time: eveningTime,
        Summary: eveningSummary,
        Temp: eveningTemp,
        MaxTemp: eveningMaxTemp,
        MinTemp: eveningMinTemp,
        PercentOvercast: eveningPercentOvercast,
        RainVolume: eveningRainVolume,
        SnowVolume: eveningSnowVolume,
      },
    };
    // Send response back to caller
    alfredHelper.sendResponse(res, 'true', jsonDataObj);
    next();
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`weatherForcastForTomorrow: ${err}`);
    next();
  }
}

/**
 * Skill: willItSnow, will it snow in the next 5 days for a location, default is London
 * Params: location: String
 */
async function willItSnow(req, res, next) {
  logger.info('Will it snow API called');

  // Get the location
  let location = 'london,uk';

  if (typeof req.query.location !== 'undefined' && req.query.location !== null && req.query.location !== '') {
    location = req.query.location;
  }
  const url = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${location}&APPID=${process.env.OPENWEATHERMAPAPIKEY}`;
  try {
    const apiData = await alfredHelper.requestAPIdata(url);
    let weatherData = apiData.body.list;
    let goingtosnow = false;
    const daysSnowing = [];

    // Loop through the 5 day forecast to see if it will snow
    weatherData = sortArray(weatherData, 'dt');
    weatherData.forEach((obj) => {
      if (typeof obj.snow !== 'undefined') {
        daysSnowing.push(obj.dt_txt);
        goingtosnow = true;
      }
    });

    // Construct the returning message
    const jsonDataObj = {
      location: apiData.body.city.location,
      going_to_snow: goingtosnow,
      snow_days: daysSnowing,
    };

    // Send response back to caller
    alfredHelper.sendResponse(res, 'true', jsonDataObj);
    next();
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`willItSnow: ${err}`);
    next();
  }
}

/**
 * Skill: willItRain, will it rain in the next 5 days for a location, default is London
 * Params: location: String
 */
async function willItRain(req, res, next) {
  logger.info('Will it rain API called');

  // Get the location
  let location = 'london,uk';
  if (typeof req.query.location !== 'undefined' && req.query.location !== null && req.query.location !== '') {
    location = req.query.location;
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${location}&APPID=${process.env.OPENWEATHERMAPAPIKEY}`;
  try {
    const apiData = await alfredHelper.requestAPIdata(url);
    let weatherData = apiData.body.list;
    let goingtorain = false;
    const daysRaining = [];

    // Loop through the 5 day forecast to see if it will rain
    weatherData = sortArray(weatherData, 'dt');
    weatherData.forEach((obj) => {
      if (typeof obj.rain !== 'undefined') {
        if (typeof obj.rain['3h'] !== 'undefined') {
          daysRaining.push(obj.dt_txt);
          goingtorain = true;
        }
      }
    });

    // Construct the returning message
    const jsonDataObj = {
      location: apiData.body.city.location || location,
      going_to_rain: goingtorain,
      rain_days: daysRaining,
    };

    // Send response back to caller
    alfredHelper.sendResponse(res, 'true', jsonDataObj);
    next();
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`willItRain: ${err}`);
    next();
  }
}

/**
 * Skill: Get sunset time
 */
async function sunSet(req, res, next) {
  logger.info('Sunset API called');

  const url = `http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=${process.env.OPENWEATHERMAPAPIKEY}`;

  try {
    const apiData = await alfredHelper.requestAPIdata(url);
    let sunSet = new Date(apiData.body.sys.sunset);
    sunSet.setHours(sunSet.getHours() + 12); // Adjust 12h to 24h format

    // Send response back to caller
    alfredHelper.sendResponse(res, 'true', dateFormat(sunSet, 'HH:MM'));
    next();
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`sunSet: ${err}`);
    next();
  }
}

/**
 * Add skills to server
 */
skill.get('/today', weatherForcastForToday);
skill.get('/tomorrow', weatherForcastForTomorrow);
skill.get('/willitsnow', willItSnow);
skill.get('/willitrain', willItRain);
skill.get('/sunset', sunSet);

module.exports = skill;
