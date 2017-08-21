
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

        logger.info('Setting up light/room names');
        
        Promise.all([lightshelper.listLights(), lightshelper.listLightGroups()])
        .then(function([first, second]) {

            // Setup light names
            if (first instanceof Error) {
                logger.error('schedule setup: ' + data);
            } else {
                first.lights.forEach(function(value) {            
                    lightNames.push({ 'id' : value.id, 'name' : value.name});
                });
            };

            // Setup ligh group names
            if (second instanceof Error) {
                logger.error('schedule setup: ' + data);
            } else {
                second.forEach(function(value) {
                    lightGroupNames.push({ 'id' : value.id, 'name' : value.name});
                });
            };

            setUpLightTimers();
            
        })
        .catch(function (err) {
            logger.error('schedule setup: ' + err);
        });
    });
};
  
//=========================================================
// Set the daily timers
//=========================================================
function setUpLightTimers() {
  
    var scheduleSettings = JSON.parse(require('fs').readFileSync('./scheduleSettings.json', 'utf8')),
        tmpRule,
        tmpTimer,
        tmpXY;

    logger.info('Setting up schedules');

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
    tmpRule.hour   = scheduleSettings.morning.on_hr;
    tmpRule.minute = scheduleSettings.morning.on_min;

    scheduleSettings.morning.lights.forEach(function(value) {
        if(value.onoff == 'on') {
            tmpTimer = new schedule.scheduleJob(tmpRule, function() {
                if (value.type == "white") {
                    lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness);
                } else {
                    lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness, value.hue, value.sat);
                };
            });
            motionSensorActive = false; // Stop the motion sensor takeing over
            timers.push(tmpTimer);
            logger.info('Morning schedule: ' + alfredHelper.getLightName(value.lightID) + ' to be turned on at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));
            tmpTimer = null;
        };
    });

    //=========================================================
    // Set up morning lights off timer
    //=========================================================
    tmpRule        = new schedule.RecurrenceRule(),
    tmpRule.hour   = scheduleSettings.morning.off_hr;
    tmpRule.minute = scheduleSettings.morning.off_min;
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
        sunSet.setHours(sunSet.getHours() - scheduleSettings.evening.offset_hr); // Adjust according to the setting
        sunSet.setMinutes(sunSet.getMinutes() - scheduleSettings.evening.offset_min); // Adjust 
        
        tmpRule        = new schedule.RecurrenceRule(),
        tmpRule.hour   = sunSet.getHours();
        tmpRule.minute = sunSet.getMinutes();
        
        var eveningTVtime = new Date();
        eveningTVtime.setHours(scheduleSettings.eveningtv.on_hr)
        eveningTVtime.setMinutes(scheduleSettings.eveningtv.on_min)

        if (dateFormat(sunSet, "HH:MM") < dateFormat(eveningTVtime, "HH:MM")) {

            scheduleSettings.evening.lights.forEach(function(value) {
                if (value.onoff == 'on') {
                    tmpTimer = new schedule.scheduleJob(tmpRule, function() {
                        if (value.type == "white") {
                            lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness);
                        } else {
                            lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness, value.hue, value.sat);
                        };
                    });
                    motionSensorActive = false; // Stop the motion sensor takeing over
                    timers.push(tmpTimer);
                    logger.info('Evening schedule: ' + alfredHelper.getLightName(value.lightID) + ' to be turned on at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));
                    tmpTimer = null;
                };
            });

        }
    })
    .catch(function(err) {
        logger.error('Evening get data Error: ' + err);
        return false;
    });

    //=========================================================
    // Set up night lights off timer
    //=========================================================
    tmpRule        = new schedule.RecurrenceRule(),
    tmpRule.hour   = scheduleSettings.evening.off_hr;
    tmpRule.minute = scheduleSettings.evening.off_min;
    tmpTimer = new schedule.scheduleJob(tmpRule, function() {
        lightshelper.allOff();
        motionSensorActive = true; // Let the motion sensor now take over
    });
    timers.push(tmpTimer);
    logger.info('Evening schedule: All lights off at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));

    //=========================================================
    // Set up evening TV lights on timer
    //=========================================================
    tmpTimer       = null;
    tmpRule        = new schedule.RecurrenceRule(),
    tmpRule.hour   = scheduleSettings.eveningtv.on_hr;
    tmpRule.minute = scheduleSettings.eveningtv.on_min;

    scheduleSettings.eveningtv.lights.forEach(function(value) {
        if(value.onoff == 'on') {
            tmpTimer = new schedule.scheduleJob(tmpRule, function() {
                if (value.type == "white") {
                    lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness);
                } else {
                    lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness, value.hue, value.sat);
                };
            });
            motionSensorActive = false; // Stop the motion sensor takeing over
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
*/

// function
// if motionSensorActive = true then
// read motion sensor
// if detection turn on hall light 
// then figure out when to turn light off


// function
// if lights are not on and the time is >4pm on weekdays then
// read motion sensor
// if light level is low then 
// turn on living room and hall lights
// if light level is ok then turn off lights

