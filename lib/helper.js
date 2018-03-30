require('dotenv').config();

const rp = require('request-promise');
const fs = require('fs');
const dateFormat = require('dateformat');
const InNOut = require('in-n-out');

/**
 * Setup logging
 */
exports.setLogger = function FnSetLogger(logger) {
  try {
    logger.remove(logger.transports.Console);
    logger.add(logger.transports.File, {
      JSON: true, filename: 'Alfred.log', timestamp() { return dateFormat(new Date(), 'dd mmm yyyy HH:MM'); },
    });
    if (process.env.environment === 'dev') {
      logger.add(logger.transports.Console, { timestamp() { return dateFormat(new Date(), 'dd mmm yyyy HH:MM'); }, colorize: true });
    }
  } catch (err) {
    logger.error(`setLogger: ${err}`);
  }
};

/**
 * Construct and send JSON response back to caller
 */
exports.sendResponse = function FnSendResponse(res, status, dataObj) {
  // Construct the returning message
  let rtnStatus = 'true';
  let httpHeaderCode = 200;
  let rtnData = dataObj;

  switch (status) {
    case null: // Internal server error
      httpHeaderCode = 500;
      rtnStatus = 'false';
      rtnData = {
        name: dataObj.name,
        message: dataObj.message,
      };
      break;
    case false: // Invalid params
      httpHeaderCode = 400;
      rtnStatus = 'false';
      break;
    case 401: // Not authorised, invalid app_key
      httpHeaderCode = 401;
      rtnStatus = 'false';
      break;
    default:
      httpHeaderCode = 200;
  }

  if (!status) { rtnStatus = 'false'; }
  const returnJSON = {
    sucess: rtnStatus,
    data: rtnData,
  };
  rtnData = null; // DeAllocate rtnData object

  // Send response back to caller
  res.send(httpHeaderCode, returnJSON);
};

/**
 * Call a remote API to get data
 */
exports.requestAPIdata = function FnRequestAPIdata(apiURL, userAgent) {
  try {
    const options = {
      'User-Agent': userAgent,
      method: 'GET',
      uri: apiURL,
      family: 4,
      resolveWithFullResponse: true,
      json: true,
    };
    return rp(options);
  } catch (err) {
    global.logger.error(err);
  }
};

/**
 * Misc
 */
exports.isEmptyObject = function FnIsEmptyObject(obj) {
  if (obj == null) return true;
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;
  if (typeof obj !== 'object') return true;
  return !Object.keys(obj).length;
};

exports.GetSortOrder = function FnGetSortOrder(prop) {
  return function AB(a, b) {
    if (a[prop] > b[prop]) {
      return 1;
    } else if (a[prop] < b[prop]) {
      return -1;
    }
    return 0;
  };
};

exports.addDays = function FnAddDays(date, amount) {
  const tzOff = date.getTimezoneOffset() * 60 * 1000;
  let t = date.getTime();
  const d = new Date();

  t += (1000 * 60 * 60 * 24) * amount;
  d.setTime(t);

  const tzOff2 = d.getTimezoneOffset() * 60 * 1000;
  if (tzOff !== tzOff2) {
    const diff = tzOff2 - tzOff;
    t += diff;
    d.setTime(t);
  }
  return d;
};

exports.minutesToStop = function FnMinutesToStop(seconds) {
  const timetostopinMinutes = Math.floor(seconds / 60);
  const timeNow = new Date();
  timeNow.setMinutes(timeNow.getMinutes() + timetostopinMinutes);
  return dateFormat(timeNow, 'h:MM TT');
};

exports.zeroFill = function FnZeroFill(number, width) {
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
  }
  return `${number}`; // always return a string
};

exports.getLightName = function FnGetLightName(param) {
  const lightName = global.lightNames.filter(o => (o.id.toString() === param.toString()));
  if (lightName.length > 0) { return lightName[0].name; }
  return '[not defined]';
};

exports.getLightGroupName = function FnGetLightGroupName(param) {
  const lightGroupName = global.lightGroupNames.filter(o => (o.id.toString() === param.toString()));
  if (lightGroupName.length > 0) { return lightGroupName[0].name; }
  return '[not defined]';
};

exports.inHomeGeoFence = function FnInHomeGeoFence(lat, long) {
  const geoHomeFile = './lib/geoHome.json';
  const geoFenceHomeData = JSON.parse(fs.readFileSync(geoHomeFile, 'utf8'));
  const geoFenceHome = new InNOut.Geofence(geoFenceHomeData, 20);
  return geoFenceHome.inside([lat, long]);
};
