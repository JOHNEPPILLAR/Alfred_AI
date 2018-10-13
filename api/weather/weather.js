/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const dateFormat = require('dateformat');
const darkSky = require('dark-sky-api');
const NodeGeocoder = require('node-geocoder');
const Netatmo = require('netatmo');
const serviceHelper = require('../../lib/helper.js');

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
  serviceHelper.log('trace', 'sunSet', 'sunSet API called');

  // Configure darksky
  darkSky.apiKey = process.env.DarkSkyKey;
  darkSky.proxy = true;
  darkSky.units = 'uk2';

  // Get the location and if blank set to London, UK
  let { location } = req.query;
  if (typeof location === 'undefined' || location === null || location === '') location = 'london';

  try {
    serviceHelper.log('trace', 'sunSet', 'Calling geocoder');
    const geocoder = NodeGeocoder(options);
    let apiData = await geocoder.geocode(location);
    const position = {
      latitude: apiData[0].latitude,
      longitude: apiData[0].longitude,
    };

    serviceHelper.log('trace', 'sunSet', 'Get forcast from DarkSky');
    apiData = await darkSky.loadForecast(position);

    serviceHelper.log('trace', 'sunSet', 'Setup the correct sunset time from the DarkSky API data');
    const sunSetTime = new Date(apiData.daily.data[0].sunsetTime * 1000);

    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, true, dateFormat(sunSetTime, 'HH:MM'));
      next();
    }
    return dateFormat(sunSetTime, 'HH:MM');
  } catch (err) {
    serviceHelper.log('error', 'sunSet', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, null, err);
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
  serviceHelper.log('trace', 'sunRise', 'sunRise API called');

  // Configure darksky
  darkSky.apiKey = process.env.DarkSkyKey;
  darkSky.proxy = true;
  darkSky.units = 'uk2';

  // Get the location and if blank set to London, UK
  let { location } = req.query;
  if (typeof location === 'undefined' || location === null || location === '') location = 'london';

  try {
    serviceHelper.log('trace', 'sunRise', 'Calling geocoder');
    const geocoder = NodeGeocoder(options);
    let apiData = await geocoder.geocode(location);
    const position = {
      latitude: apiData[0].latitude,
      longitude: apiData[0].longitude,
    };

    serviceHelper.log('trace', 'sunRise', 'Get forcast from DarkSky');
    apiData = await darkSky.loadForecast(position);

    serviceHelper.log('trace', 'sunRise', 'Setup the correct sunrise time from the DarkSky API data');
    const sunriseTime = new Date(apiData.daily.data[0].sunriseTime * 1000);

    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, true, dateFormat(sunriseTime, 'HH:MM'));
      next();
    }
    return dateFormat(sunriseTime, 'HH:MM');
  } catch (err) {
    serviceHelper.log('error', 'sunRise', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, null, err);
      next();
    }
    return err;
  }
}
skill.get('/sunrise', sunRise);

/**
 * @api {post} /weather/today Get todays weather
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
async function CurrentWeather(req, res, next) {
  serviceHelper.log('trace', 'CurrentWeather', 'CurrentWeather API called');

  // Configure darksky
  darkSky.apiKey = process.env.DarkSkyKey;
  darkSky.proxy = true;
  darkSky.units = 'uk2';

  const { lat, long } = req.body;
  if ((typeof lat === 'undefined' || lat === null || lat === '')
    || (typeof long === 'undefined' || long === null || long === '')) {
    serviceHelper.log('info', 'CurrentWeather', 'Missing params: lat/long');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing params: lat/long');
      next();
    }
    return false;
  }

  try {
    serviceHelper.log('trace', 'CurrentWeather', 'Calling geocoder to get location name');
    const geocoder = NodeGeocoder(options);
    const apiData = await geocoder.reverse({ lat, lon: long });
    const position = {
      latitude: lat,
      longitude: long,
    };
    const locationNeighborhood = apiData[0].extra.neighborhood;
    const locationCity = apiData[0].city;
    const locationCountry = apiData[0].country;

    serviceHelper.log('trace', 'CurrentWeather', 'Get forcast from DarkSky');
    const currentWeather = await darkSky.loadCurrent(position);
    const forcastWeather = await darkSky.loadForecast(position);

    // Setup weather data
    const { icon } = currentWeather;
    const { summary } = currentWeather;
    let { temperature } = currentWeather;
    let { apparentTemperature } = currentWeather;
    let { temperatureHigh, temperatureLow } = forcastWeather.daily.data[0];

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
      serviceHelper.sendResponse(res, true, jsonDataObj);
      next();
    }
    return jsonDataObj;
  } catch (err) {
    serviceHelper.log('error', 'CurrentWeather', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, null, err);
      next();
    }
    return err;
  }
}
skill.put('/today', CurrentWeather);

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
  serviceHelper.log('trace', 'willItRain', 'Will It Rain 4h API called');

  // Configure darksky
  darkSky.apiKey = process.env.DarkSkyKey;
  darkSky.proxy = true;
  darkSky.units = 'uk2';

  const { lat, long } = req.body;
  let { forcastDuration } = req.body;

  if ((typeof lat === 'undefined' || lat === null || lat === '')
    || (typeof long === 'undefined' || long === null || long === '')) {
    serviceHelper.log('info', 'willItRain', 'Missing params: lat/long');
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, 400, 'Missing params: lat/long');
      next();
    }
    return false;
  }

  if (typeof forcastDuration === 'undefined' || forcastDuration === null || forcastDuration === '') forcastDuration = 5;

  try {
    serviceHelper.log('trace', 'willItRain', 'Calling geocoder to get location name');
    const geocoder = NodeGeocoder(options);
    const apiData = await geocoder.reverse({ lat, lon: long });
    const position = {
      latitude: lat,
      longitude: long,
    };
    const locationNeighborhood = apiData[0].extra.neighborhood;
    const locationCity = apiData[0].city;
    const locationCountry = apiData[0].country;

    serviceHelper.log('trace', 'willItRain', 'Get forcast from DarkSky');
    const weatherData = await darkSky.loadItAll('currently,minutely,daily,alerts', position);

    serviceHelper.log('trace', 'willItRain', 'Filter data for only next x hours and only if chance of rain is greater than x%');
    const cleanWeatherData = weatherData.hourly.data.slice(0, forcastDuration);

    let { precipProbability, precipIntensity } = cleanWeatherData[0];

    for (let i = 1, len = cleanWeatherData.length; i < len; i += 1) {
      const probability = cleanWeatherData[i].precipProbability;
      const intensity = cleanWeatherData[i].precipIntensity;
      precipProbability = (probability > precipProbability) ? probability : precipProbability;
      precipIntensity = (intensity > precipIntensity) ? intensity : precipIntensity;
    }

    const jsonDataObj = {
      locationNeighborhood,
      locationCity,
      locationCountry,
      precipProbability,
      precipIntensity,
    };

    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, true, jsonDataObj);
      next();
    }
    return jsonDataObj;
  } catch (err) {
    serviceHelper.log('error', 'willItRain', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, null, err);
      next();
    }
    return err;
  }
}
skill.get('/willitrain', willItRain);

/**
 * @api {get} /weather/inside Get the weather from the house weather station
 * @apiName inside
 * @apiGroup Weather
 *
 * @apiParam {String} location Location i.e. London
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     "data": {
        "insideTemp": 20,
        "insideCO2": 742
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
async function houseWeather(req, res, next) {
  serviceHelper.log('trace', 'houseWeather', 'houseWeather API called');

  const auth = {
    client_id: process.env.NetatmoClientKey,
    client_secret: process.env.NetatmoClientSecret,
    username: process.env.NetatmpUserName,
    password: process.env.NetatmoPassword,
  };

  try {
    serviceHelper.log('trace', 'houseWeather', 'Get data from netatmo API');
    const api = new Netatmo(auth); // Connect to api service
    api.getStationsData((err, apiData) => { // Get data from device
      if (err) {
        serviceHelper.log('error', 'houseWeather', err);
        if (typeof res !== 'undefined' && res !== null) {
          serviceHelper.sendResponse(res, true, err);
          next();
        }
        return err;
      }

      // Setup data
      const jsonDataObj = {
        insideTemp: Math.floor(apiData[0].dashboard_data.Temperature),
        insideCO2: Math.ceil(apiData[0].dashboard_data.CO2),
      };

      if (typeof res !== 'undefined' && res !== null) {
        serviceHelper.sendResponse(res, true, jsonDataObj);
        next();
      }
      return jsonDataObj;
    });
  } catch (err) {
    serviceHelper.log('error', 'houseWeather', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, null, err);
      next();
    }
    return err;
  }
  return false;
}
skill.get('/inside', houseWeather);

module.exports = skill;
