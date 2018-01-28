const rp = require('request-promise');
const dateFormat = require('dateformat');

/**
 * Setup logging
 */
exports.setLogger = function FnSetLogger(logger) {
  try {
    logger.remove(logger.transports.Console);
    logger.add(logger.transports.File, {
      JSON: true, filename: 'Alfred.log', colorize: true, timestamp() { return dateFormat(new Date(), 'dd mmm yyyy HH:MM'); },
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
  const options = {
    'User-Agent': userAgent,
    method: 'GET',
    uri: apiURL,
    family: 4,
    resolveWithFullResponse: true,
    json: true,
  };
  return rp(options).on('error', (err) => {
    global.logger.error(err);
  }).end();
};

/**
 * Misc
 */
exports.isEmptyObject = function FnIsEmptyObject(obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
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
  let timeNow = new Date();
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
  let i;
  const len = global.lightNames.length;
  for (i = 0; i < len;) {
    if (global.lightNames[i].id.toString() === param.toString()) {
      return global.lightNames[i].name;
    }
    i += 1;
  }
  return '[not defined]';
};

exports.getLightGroupName = function FnGetLightGroupName(param) {
  let i;
  const len = global.lightGroupNames.length;
  for (i = 0; i < len;) {
    if (global.lightGroupNames[i].id.toString() === param.toString()) {
      return global.lightGroupNames[i].name;
    }
    i += 1;
  }
  return '[not defined]';
};
