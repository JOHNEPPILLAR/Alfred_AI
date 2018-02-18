/**
 * Setup includes
 */
const alfredHelper = require('../../lib/helper.js');
const rp = require('request-promise');
const dateFormat = require('dateformat');

const bedID = 'xxxxxxx';

/**
 * Eight API helper functions
 */
function getEightAPI(url) {
  const options = {
    method: 'GET',
    uri: url,
    json: true,
    headers: {
      Host: 'client-api.8slp.net',
      'Content-Type': 'application/json',
      'API-Key': 'api-key',
      'Application-Id': 'morphy-app-id',
      Connection: 'keep-alive',
      'User-Agent': 'Eight%20AppStore/11 CFNetwork/808.2.16 Darwin/16.3.0',
      'Accept-Language': 'en-gb',
      'Accept-Encoding': 'gzip, deflate',
      Accept: '*/*',
      'app-Version': '1.10.0',
      'Session-Token': global.eightSessionInfo.token,
    },
  };
  return rp(options);
}

function putEightAPI(url, body) {
  const options = {
    body,
    method: 'PUT',
    uri: url,
    json: true,
    headers: {
      Host: 'client-api.8slp.net',
      'Content-Type': 'application/json',
      'API-Key': 'api-key',
      'Application-Id': 'morphy-app-id',
      Connection: 'keep-alive',
      'User-Agent': 'Eight%20AppStore/11 CFNetwork/808.2.16 Darwin/16.3.0',
      'Accept-Language': 'en-gb',
      'Accept-Encoding': 'gzip, deflate',
      Accept: '*/*',
      'app-Version': '1.10.0',
      'Session-Token': global.eightSessionInfo.token,
    },
  };
  return rp(options);
}

function postEightAPI(url, body) {
  const options = {
    method: 'POST',
    uri: url,
    body,
    json: true,
  };
  return rp(options);
}

async function checkEightToken() {
  const currentDateTime = dateFormat(new Date(), 'dd:mm:yyyy:HH:MM:ss');

  let validToken = false;
  let tokenExpirary = dateFormat(new Date(), 'dd:mm:yyyy:HH:MM:ss');

  if (typeof eightSessionInfo !== 'undefined' && global.eightSessionInfo !== null) {
    tokenExpirary = dateFormat(global.eightSessionInfo.expirationDate, 'dd:mm:yyyy:HH:MM:ss');
  }

  if (currentDateTime < tokenExpirary) { validToken = true; }

  if (!validToken) {
    try {
      const body = { email: process.env.eightemail, password: process.env.eightpassword };
      const url = 'https://client-api.8slp.net/v1/login';
      const apiData = await postEightAPI(url, body);
      global.eightSessionInfo = apiData.session;
      return true;
    } catch (err) {
      return false;
    }
  } else {
    return true;
  }
}

/**
 * Skill: setHeatingLevel
 */
exports.setHeatingLevel = async function FnSetHeatingLevel(res, side, temp) {
  await checkEightToken();
  const url = `https://client-api.8slp.net/v1/devices/${bedID}`;
  let body;
  try {
    if (side === 'JP') {
      body = { leftTargetHeatingLevel: temp };
    } else {
      body = { rightTargetHeatingLevel: temp };
    }
    const apiData = await putEightAPI(url, body);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, apiData.message); // Send response back to caller
    }
    return apiData.message;
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};

/**
 * Skill: setHeatingTimer
 */
exports.setHeatingTimer = async function FnSetHeatingTimer(res, side, temp, duration) {
  await checkEightToken();
  const url = `https://client-api.8slp.net/v1/devices/${bedID}`;
  let body;
  try {
    if (side === 'JP') {
      body = { leftTargetHeatingLevel: temp, leftHeatingDuration: duration };
    } else {
      body = { rightTargetHeatingLevel: temp, rightHeatingDuration: duration };
    }
    const apiData = await putEightAPI(url, body);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, apiData.message); // Send response back to caller
    }
    return apiData.message;
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};

/**
 * Skill: getBedData
 */
exports.getBedData = async function FnGetBedData(res) {
  await checkEightToken();
  const url = `https://client-api.8slp.net/v1/devices/${bedID}`;
  try {
    const apiData = await getEightAPI(url);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, apiData); // Send response back to caller
    }
    return apiData;
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};

/**
 * Skill: turnOffBed
 */
exports.turnOffBed = async function FnTurnOffBed(res, side) {
  await checkEightToken();
  const url = `https://client-api.8slp.net/v1/devices/${bedID}`;
  let body;
  try {
    if (side === 'JP') {
      body = { leftHeatingDuration: 0 };
    } else {
      body = { rightHeatingDuration: 0 };
    }
    const apiData = await putEightAPI(url, body);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, true, apiData.message); // Send response back to caller
    } else {
      return apiData.message;
    }
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
    } else {
      return err;
    }
  }
};
