/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../lib/helper.js');
// const sortArray = require('array-sort');
const dateFormat = require('dateformat');
const logger = require('winston');
const darkSky = require('dark-sky-api');
const NodeGeocoder = require('node-geocoder');
const netatmo = require('netatmo');

const skill = new Skills();

// Configure geocoder
const options = {
  provider: 'google',
  httpAdapter: 'https',
  formatter: null,
  apiKey: process.env.geolocationKey,
};
const geocoder = NodeGeocoder(options);

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
  logger.info('Sunset API called');

  // Configure darksky
  darkSky.apiKey = process.env.darkskyKey;
  darkSky.proxy = true;
  darkSky.units = 'uk2';

  // Get the location
  let { location } = req.query;
  if (typeof location === 'undefined' || location == null) {
    location = 'london';
  }

  try {
    let apiData = await geocoder.geocode(location);
    const position = {
      latitude: apiData[0].latitude,
      longitude: apiData[0].longitude,
    };
    apiData = await darkSky.loadForecast(position);
    const sunSetTime = new Date(apiData.daily.data[0].sunsetTime * 1000);

    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, dateFormat(sunSetTime, 'HH:MM')); // Send response back to caller
      next();
    } else {
      return dateFormat(sunSetTime, 'HH:MM');
    }
  } catch (err) {
    logger.error(`sunSet: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
      next();
    } else {
      return err;
    }
  }
  return null;
}
skill.get('/sunset', sunSet);

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
 *     data: {
 *      "locationName": "london",
        "icon": "clear-night",
        "summary": "Clear",
        "temperature": 43,
        "apparentTemperature": 37,
        "temperatureHigh": 48,
        "temperatureLow": 35
 *     }
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
  logger.info('Today\'s Weather API called');

  // Configure darksky
  darkSky.apiKey = process.env.darkskyKey;
  darkSky.proxy = true;
  darkSky.units = 'uk2';

  // Get the location
  let { location } = req.query;
  if (typeof location === 'undefined' || location == null) {
    location = 'london';
  }

  try {
    const apiData = await geocoder.geocode(location);
    const position = {
      latitude: apiData[0].latitude,
      longitude: apiData[0].longitude,
    };
    const currentWeather = await darkSky.loadCurrent(position);
    const forcastWeather = await darkSky.loadForecast(position);

    // Get the weather data
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
      alfredHelper.sendResponse(res, true, jsonDataObj); // Send response back to caller
      next();
    } else {
      return jsonDataObj;
    }
  } catch (err) {
    logger.error(`todaysWeatherFor: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
      next();
    } else {
      return err;
    }
  }
  return null;
}
skill.get('/today', CurrentWeather);

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
 *     data: {
 *      "locationName": "london",
        "icon": "clear-night",
        "summary": "Clear",
        "temperature": 43,
        "apparentTemperature": 37,
        "temperatureHigh": 48,
        "temperatureLow": 35
 *     }
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
  logger.info('House weather API called');

  const auth = {
    client_id: process.env.NetatmoClientKey,
    client_secret: process.env.NetatmoClientSecret,
    username: process.env.NetatmpUserName,
    password: process.env.NetatmoPassword,
  };

  try {
    const api = new netatmo(auth); // Connect to api service
    api.getStationsData((err, apiData) => { // Get data from device
      if (err) {
        if (typeof res !== 'undefined' && res !== null) {
          alfredHelper.sendResponse(res, true, err); // Send response back to caller
          next();
        }
      }

      const jsonDataObj = {
        insideTemp: Math.floor(apiData[0].dashboard_data.Temperature),
        insideCO2: Math.ceil(apiData[0].dashboard_data.CO2),
      };

      if (typeof res !== 'undefined' && res !== null) {
        alfredHelper.sendResponse(res, true, jsonDataObj); // Send response back to caller
        next();
      } else {
        return jsonDataObj;
      }
    });
  } catch (err) {
    logger.error(`houseWeather: ${err}`);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
      next();
    } else {
      return err;
    }
  }
  return null;
}
skill.get('/inside', houseWeather);

module.exports = skill;
