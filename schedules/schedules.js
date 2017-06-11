
const schedule     = require('node-schedule'),
      dateFormat   = require('dateformat'),
      fs           = require('fs'),
      dotenv       = require('dotenv'),
      lightshelper = require('../skills/lights/lightshelper.js');

dotenv.load() // Load env vars

const url = 'http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=' + process.env.OPENWEATHERMAPAPIKEY;

exports.setSchedule = function () {

    // Setup daily timer function
    var rule    = new schedule.RecurrenceRule();
    rule.hour   = new Date().getHours();
    rule.minute = new Date().getMinutes() + 1;

    var dailyTimer = new schedule.scheduleJob(rule, function() {

        // Get the light names and id's and persist them
        lightshelper.listLights()
        .then(function(obj){
            obj.lights.forEach(function(value) {
                lightNames.push({ 'id' : value.id, 'name' : value.name});
            });
            setUpLights();
        })
        .catch(function (err){
            logger.error('listLights: ' + err);
        });
    });
};
  
//=========================================================
// Set the daily timers
//=========================================================
function setUpLights() {
  
    var scheduleSettings = JSON.parse(require('fs').readFileSync('./scheduleSettings.json', 'utf8')),
        tmpRule,
        tmpTimer,
        tmpXY;

    logger.info('Running daily scheduler');

    //=========================================================
    // Cancel any existing timers
    //=========================================================
    timers.forEach(function(value) {
        value.cancel();
    });

    //=========================================================
    // Set up morning lights on timer
    //=========================================================
    tmpTimer       = null;
    tmpRule        = new schedule.RecurrenceRule(),
    tmpRule.hour   = scheduleSettings.morning[0].on_hr;
    tmpRule.minute = scheduleSettings.morning[0].on_min;

    scheduleSettings.morning[0].lights.forEach(function(value) {
        if(value.onoff == 'on') {
            tmpTimer = new schedule.scheduleJob(tmpRule, function() {
                if (typeof value.x == 'undefined' || value.x == null) {
                    lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness);
                } else {
                    lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness, value.x, value.y);
                };
                if (value.lightID == scheduleSettings.motionSensorLights[0].lightID) {
                    motionSensorActive = false; // Stop the motion sensor takeing over
                };
            });
            timers.push(tmpTimer);
            logger.info('Morning schedule: ' + alfredHelper.getLightName(value.lightID) + ' to be turned on at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));
            tmpTimer = null;
            tmpRGB = null;
        };
    });

    //=========================================================
    // Set up morning lights off timer
    //=========================================================
    tmpRule        = new schedule.RecurrenceRule(),
    tmpRule.hour   = scheduleSettings.morning[0].off_hr;
    tmpRule.minute = scheduleSettings.morning[0].off_min;
    tmpTimer = new schedule.scheduleJob(tmpRule, function() {
        lightshelper.allOff();
        motionSensorActive = true; // Let the motion sensor now take over                
    });
    timers.push(tmpTimer);
    logger.info('Morning schedule: All lights off at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));

    //=========================================================
    // Set up the timer for sunset
    //=========================================================
            
    // Get sunset data
    alfredHelper.requestAPIdata(url)
    .then(function(apiData) {

        // Set sunset timer
        sunSet = new Date(apiData.body.sys.sunset);
        sunSet.setHours(sunSet.getHours() + 12); // Add 12 hrs as for some resion the api returnes it as am!
        sunSet.setHours(sunSet.getHours() - scheduleSettings.evening[0].offset_hr); // Adjust according to the setting
        sunSet.setMinutes(sunSet.getMinutes() - scheduleSettings.evening[0].offset_min); // Adjust 
                
        tmpRule        = new schedule.RecurrenceRule(),
        tmpRule.hour   = sunSet.getHours();
        tmpRule.minute = sunSet.getMinutes();
        scheduleSettings.evening[0].lights.forEach(function(value) {
            if (value.onoff == 'on') {
                tmpTimer = new schedule.scheduleJob(tmpRule, function() {
                    if (typeof value.x == 'undefined' || value.x == null) {
                        lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness);
                    } else {
                        lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness, value.x, value.y);
                    };
                    if (value.lightID == scheduleSettings.motionSensorLights[0].lightID) {
                        motionSensorActive = false; // Stop the motion sensor takeing over
                    };
                });
                timers.push(tmpTimer);
                logger.info('Evening schedule: ' + alfredHelper.getLightName(value.lightID) + ' to be turned on at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));
                tmpTimer = null;
            };
        });
    })
    .catch(function(err) {
        logger.error('Evening get data Error: ' + err);
        return false;
    });

    //=========================================================
    // Set up night lights off timer
    //=========================================================
    tmpRule        = new schedule.RecurrenceRule(),
    tmpRule.hour   = scheduleSettings.evening[0].off_hr;
    tmpRule.minute = scheduleSettings.evening[0].off_min;
    tmpTimer = new schedule.scheduleJob(tmpRule, function() {
        lightshelper.allOff();
        motionSensorActive = true; // Let the motion sensor now take over
    });
    timers.push(tmpTimer);
    logger.info('Evening schedule: All lights off at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));

    //=========================================================
    // Set up mevening TV lights on timer
    //=========================================================
    tmpTimer       = null;
    tmpRule        = new schedule.RecurrenceRule(),
    tmpRule.hour   = scheduleSettings.eveningtv[0].on_hr;
    tmpRule.minute = scheduleSettings.eveningtv[0].on_min;

    scheduleSettings.eveningtv[0].lights.forEach(function(value) {
        if(value.onoff == 'on') {
            tmpTimer = new schedule.scheduleJob(tmpRule, function() {
                if (typeof value.x == 'undefined' || value.x == null) {
                    lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness);
                } else {
                    lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness, value.x, value.y);
                };
                if (value.lightID == scheduleSettings.motionSensorLights[0].lightID) {
                    motionSensorActive = false; // Stop the motion sensor takeing over
                };        
            });
            timers.push(tmpTimer);
            logger.info('Evening TV schedule: ' + alfredHelper.getLightName(value.lightID) + ' to be turned on at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));
            tmpTimer = null;
            tmpRGB = null;
        };
    });
    return true;
};










/*
exports.setMotionSensor = function () {
    setInterval(intervalFunc, 4000);
};

function intervalFunc () {

    if (motionSensorActive) {
        const url = 'http://' + process.env.HueBridgeIP + '/api/' + process.env.HueBridgeUser + '/sensors/13';
        alfredHelper.requestAPIdata(url)
        .then(function(apiData){
            if (apiData.body.state.presence && !motionSensorLightsOn){
            //if (!apiData.body.state.presence && !motionSensorLightsOn){
                scheduleSettings.motionSensorLights.forEach(function(value) {
                    lightshelper.lightOnOff(null, value.lightID, 'on', value.brightness, value.x, value.y);
                    // call timer 5 mins to turn off light




                });
                motionSensorLightsOn = true;
            };
        })
        .catch(function (err) {
            logger.error('Motion sensor error: ' + err);
        });
    };
};
*/

// function
// if not global var hall light on timer then 
// read motion sensor
// if detection turn on hall light 
// figure out when to turn light off
