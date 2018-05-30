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
 *     sucess: 'true'
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
 *     sucess: 'true'
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
 * @api {get} /weather/today Get todays weather
 * @apiName today
 * @apiGroup Weather
 *
 * @apiParam {String} location Location i.e. London
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     sucess: 'true'
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

  // Get the location and if blank set to London, UK
  let { location } = req.query;
  if (typeof location === 'undefined' || location === null || location === '') location = 'london';

  try {
    serviceHelper.log('trace', 'sunRise', 'Calling geocoder');
    const geocoder = NodeGeocoder(options);
    const apiData = await geocoder.geocode(location);
    const position = {
      latitude: apiData[0].latitude,
      longitude: apiData[0].longitude,
    };

    serviceHelper.log('trace', 'sunRise', 'Get forcast from DarkSky');
    const currentWeather = await darkSky.loadCurrent(position);
    const forcastWeather = await darkSky.loadForecast(position);

    // Setup weather data
    const locationName = location;
    const { icon } = currentWeather;
    const { summary } = currentWeather;
    let { temperature } = currentWeather;
    let { apparentTemperature } = currentWeather;
    let { temperatureHigh } = forcastWeather.daily.data[0];
    let { temperatureLow } = forcastWeather.daily.data[0];

    // Construct the returning message
    temperature = Math.floor(temperature);
    apparentTemperature = Math.floor(apparentTemperature);
    temperatureHigh = Math.floor(temperatureHigh);
    temperatureLow = Math.floor(temperatureLow);

    const jsonDataObj = {
      locationName,
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
    serviceHelper.log('error', 'sunRise', err);
    if (typeof res !== 'undefined' && res !== null) {
      serviceHelper.sendResponse(res, null, err);
      next();
    }
    return err;
  }
}
skill.get('/today', CurrentWeather);

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
 *     sucess: 'true'
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
