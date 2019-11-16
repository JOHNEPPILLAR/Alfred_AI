/**
 * Import external libraries
 */
const Skills = require('restify-router').Router;
const dateFormat = require('dateformat');
const darkSky = require('dark-sky-api');
const NodeGeocoder = require('node-geocoder');
const serviceHelper = require('alfred-helper');

const skill = new Skills();

// Configure geocoder
const options = {
  provider: 'google',
  httpAdapter: 'https',
  formatter: null,
  apiKey: process.env.GeoLocationKey,
};

/**
 * @api {get} /weather/sunset What time is sunset in London
 * @apiName sunset
 * @apiGroup Weather
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     data: "18:23"
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function sunSet(req, res, next) {
  serviceHelper.log('trace', 'sunSet API called');

  // Configure darksky
  darkSky.apiKey = process.env.DarkSkyKey;
  darkSky.proxy = true;
  darkSky.units = 'uk2';

  // Get the location and if blank set to London, UK
  let { location } = req.query;
  if (typeof location === 'undefined' || location === null || location === '') location = 'london';

  try {
    serviceHelper.log('trace', 'Calling geocoder');
    const geocoder = NodeGeocoder(options);
    let apiData = await geocoder.geocode(location);
    const position = {
      latitude: apiData[0].latitude,
      longitude: apiData[0].longitude,
    };

    serviceHelper.log('trace', 'Get sunset from DarkSky');
    apiData = await darkSky.loadForecast(position);
    if (apiData instanceof Error) {
      serviceHelper.log(
        'error',
        apiData.message,
      );
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, 500, apiData);
        next();
      }
      return apiData;
    }

    serviceHelper.log(
      'trace',
      'Setup the correct sunset time from the DarkSky API data',
    );
    const sunSetTime = new Date(apiData.daily.data[0].sunsetTime * 1000);

    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 200, dateFormat(sunSetTime, 'HH:MM'));
      next();
    }
    return dateFormat(sunSetTime, 'HH:MM');
  } catch (err) {
    serviceHelper.log('error', err.message);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 500, err);
      next();
    }
    return err;
  }
}
skill.get('/sunset', sunSet);

/**
 * @api {get} /weather/sunrise What time is sunrise in London
 * @apiName sunrise
 * @apiGroup Weather
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     data: "06:23"
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function sunRise(req, res, next) {
  serviceHelper.log('trace', 'sunRise API called');

  // Configure darksky
  darkSky.apiKey = process.env.DarkSkyKey;
  darkSky.proxy = true;
  darkSky.units = 'uk2';

  // Get the location and if blank set to London, UK
  let { location } = req.query;
  if (typeof location === 'undefined' || location === null || location === '') location = 'london';

  try {
    serviceHelper.log('trace', 'Calling geocoder');
    const geocoder = NodeGeocoder(options);
    let apiData = await geocoder.geocode(location);
    const position = {
      latitude: apiData[0].latitude,
      longitude: apiData[0].longitude,
    };

    serviceHelper.log('trace', 'Get sunrise from DarkSky');
    apiData = await darkSky.loadForecast(position);
    if (apiData instanceof Error) {
      serviceHelper.log(
        'error',
        apiData.message,
      );
      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, 500, apiData);
        next();
      }
      return apiData;
    }

    serviceHelper.log(
      'trace',
      'Setup the correct sunrise time from the DarkSky API data',
    );
    const sunriseTime = new Date(apiData.daily.data[0].sunriseTime * 1000);

    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 200, dateFormat(sunriseTime, 'HH:MM'));
      next();
    }
    return dateFormat(sunriseTime, 'HH:MM');
  } catch (err) {
    serviceHelper.log('error', err.message);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 500, err);
      next();
    }
    return err;
  }
}
skill.get('/sunrise', sunRise);

/**
 * @api {get} /weather/today Get todays weather
 * @apiName today
 * @apiGroup Weather
 *
 * @apiParam {String} lat
 * @apiParam {String} long
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     "data": {
        "locationName": "london",
        "icon": "partly-cloudy-night",
        "summary": "Partly Cloudy",
        "temperature": 5,
        "apparentTemperature": 3,
        "temperatureHigh": 8,
        "temperatureLow": 4
    }
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function current(req, res, next) {
  serviceHelper.log('trace', 'CurrentWeather API called');

  // Configure darksky
  darkSky.apiKey = process.env.DarkSkyKey;
  darkSky.proxy = true;
  darkSky.units = 'uk2';

  const { lat, long } = req.params;

  if ((typeof lat === 'undefined' || lat === null || lat === '')
    || (typeof long === 'undefined' || long === null || long === '')) {
    serviceHelper.log('info', 'Missing params: lat/long');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing params: lat/long');
      next();
    }
    return false;
  }

  try {
    serviceHelper.log('trace', 'Calling geocoder to get location name');
    const geocoder = NodeGeocoder(options);
    const apiData = await geocoder.reverse({ lat, lon: long });
    const position = {
      latitude: lat,
      longitude: long,
    };
    const locationNeighborhood = apiData[0].extra.neighborhood;
    const locationCity = apiData[0].city;
    const locationCountry = apiData[0].country;

    serviceHelper.log('trace', 'Get forcast from DarkSky');
    const currentWeatherData = await darkSky.loadCurrent(position);
    const forcastWeatherData = await darkSky.loadForecast(position);

    // Setup weather data
    const { icon } = currentWeatherData;
    const { summary } = currentWeatherData;
    let { temperature } = currentWeatherData;
    let { apparentTemperature } = currentWeatherData;
    let { temperatureHigh, temperatureLow } = forcastWeatherData.daily.data[0];

    // Construct the returning message
    temperature = Math.floor(temperature);
    apparentTemperature = Math.floor(apparentTemperature);
    temperatureHigh = Math.floor(temperatureHigh);
    temperatureLow = Math.floor(temperatureLow);

    const jsonDataObj = {
      locationNeighborhood,
      locationCity,
      locationCountry,
      icon,
      summary,
      temperature,
      apparentTemperature,
      temperatureHigh,
      temperatureLow,
    };

    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 200, jsonDataObj);
      next();
    }
    return jsonDataObj;
  } catch (err) {
    serviceHelper.log('error', err.message);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 500, err);
      next();
    }
    return err;
  }
}
skill.get('/today/:lat/:long', current);

/**
 * @api {get} /weather/willitrain4h Will it rain in the next 4 hrs
 * @apiName willitrain4h
 * @apiGroup Weather
 *
 * @apiParam {String} lat
 * @apiParam {String} long
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     "data": {
        "probability": false,
    }
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function willItRain(req, res, next) {
  serviceHelper.log('trace', 'Will It Rain 4h API called');

  // Configure darksky
  darkSky.apiKey = process.env.DarkSkyKey;
  darkSky.proxy = true;
  darkSky.units = 'uk2';

  const { lat, long } = req.query;
  let { forcastDuration } = req.query;

  if (
    typeof lat === 'undefined'
    || lat === null
    || lat === ''
    || (typeof long === 'undefined' || long === null || long === '')
  ) {
    serviceHelper.log('info', 'Missing params: lat/long');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing params: lat/long');
      next();
    }
    return false;
  }

  if (
    typeof forcastDuration === 'undefined'
    || forcastDuration === null
    || forcastDuration === ''
  ) forcastDuration = 5;

  try {
    serviceHelper.log('trace', 'Calling geocoder to get location name');
    const geocoder = NodeGeocoder(options);
    const apiData = await geocoder.reverse({ lat, lon: long });
    const position = {
      latitude: lat,
      longitude: long,
    };
    const locationNeighborhood = apiData[0].extra.neighborhood;
    const locationCity = apiData[0].city;
    const locationCountry = apiData[0].country;

    serviceHelper.log('trace', 'Get forcast from DarkSky');
    const weatherData = await darkSky.loadItAll(
      'currently,minutely,daily,alerts',
      position,
    );

    serviceHelper.log(
      'trace',
      'Filter data for only next x hours and only if chance of rain is greater than x%',
    );
    const cleanWeatherData = weatherData.hourly.data.slice(0, forcastDuration);

    let { precipProbability, precipIntensity } = cleanWeatherData[0];

    for (let i = 1, len = cleanWeatherData.length; i < len; i += 1) {
      const probability = cleanWeatherData[i].precipProbability;
      const intensity = cleanWeatherData[i].precipIntensity;
      precipProbability = probability > precipProbability ? probability : precipProbability;
      precipIntensity = intensity > precipIntensity ? intensity : precipIntensity;
    }

    const jsonDataObj = {
      locationNeighborhood,
      locationCity,
      locationCountry,
      precipProbability,
      precipIntensity,
    };

    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 200, jsonDataObj);
      next();
    }
    return jsonDataObj;
  } catch (err) {
    serviceHelper.log('error', err.message);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 500, err);
      next();
    }
    return err;
  }
}
skill.get('/willitrain', willItRain);

/**
 * @api {get} /weather/house Get the temp and other weather information from inside the house
 * @apiName house
 * @apiGroup Weather
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     "data": {
        "KidsRoomTemperature": 20,
        "KidsRoomCO2": 742
      }
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal error
 *   {
 *     data: Error message
 *   }
 *
 */
async function house(req, res, next) {
  serviceHelper.log('trace', 'house weather API called');
  let mainBedRoomData;
  let restOfTheHouseData;
  let apiURL;

  try {
    // Dyson purecool fan
    serviceHelper.log('trace', 'Getting latest Dyson data');
    apiURL = `${process.env.AlfredDysonService}/sensors/current`;
    mainBedRoomData = await serviceHelper.callAlfredServiceGet(apiURL);

    if (mainBedRoomData instanceof Error) {
      throw new Error(mainBedRoomData.message);
    }
  } catch (err) {
    serviceHelper.log('error', err.message);
  }

  try {
    // Netatmo sensors
    serviceHelper.log('trace', 'Getting latest Netatmo data');
    apiURL = `${process.env.AlfredNetatmoService}/sensors/current`;
    restOfTheHouseData = await serviceHelper.callAlfredServiceGet(apiURL);
    if (restOfTheHouseData instanceof Error) {
      throw new Error(mainBedRoomData.message);
    }
  } catch (err) {
    serviceHelper.log('error', err.message);
  }

  try {
    // Construct returning data
    serviceHelper.log('trace', 'Construct returning data');
    let jsonDataObj = [];

    if (
      mainBedRoomData instanceof Error === false
      && typeof mainBedRoomData.data !== 'undefined'
      && mainBedRoomData.data !== 'No data to return'
    ) {
      jsonDataObj = mainBedRoomData.data;
    }

    if (
      restOfTheHouseData instanceof Error === false
      && typeof restOfTheHouseData.data !== 'undefined'
      && restOfTheHouseData.data !== 'No data to return'
    ) {
      jsonDataObj = restOfTheHouseData.data.concat(jsonDataObj);
    }

    if (jsonDataObj.length === 0) {
      serviceHelper.log('warn', 'No house weather results');
      serviceHelper.sendResponse(res, 200, 'No house weather results');
      next();
      return;
    }

    serviceHelper.log('trace', 'Send data back to user');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 200, jsonDataObj);
      next();
    }
  } catch (err) {
    serviceHelper.log('error', err.message);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 500, err);
      next();
    }
  }
}
skill.get('/house', house);

module.exports = {
  skill,
  current,
  house,
};
