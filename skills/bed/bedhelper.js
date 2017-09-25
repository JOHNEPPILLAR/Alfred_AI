/**
 * Setup bed skills
 */
const alfredHelper = require('../../helper.js');

/**
 * Skill: turnOnBed
 */
exports.turnOnBed = async function FnTurnOnBed(res, side, temp) {
  const url = `https://maker.ifttt.com/trigger/warm_${side}_bed_${temp}/with/key/${process.env.iftttKey}`;
  try {
    const apiData = await alfredHelper.requestAPIdata(url);
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'true', apiData.body); // Send response back to caller
    }
    return apiData.body;
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`turnOnBed: ${err}`);
    return err;
  }
};

/**
 * Skill: turnOffBed
 */
exports.turnOffBed = async function FnTurnOffBed(res, side) {
  const url = `https://maker.ifttt.com/trigger/turnoff_${side}_bed/with/key/${process.env.iftttKey}`;
  try {
    const apiData = await alfredHelper.requestAPIdata(url);
    alfredHelper.sendResponse(res, 'true', apiData.body); // Send response back to caller
    return apiData.body;
  } catch (err) {
    if (typeof res !== 'undefined' && res !== null) {
      alfredHelper.sendResponse(res, 'false', err); // Send response back to caller
    }
    logger.error(`turnOffBed: ${err}`);
    return err;
  }
};
