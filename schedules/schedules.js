var appSchedules = function(server) {

    const url              = 'http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=' + process.env.OPENWEATHERMAPAPIKEY,
          scheduleSettings = require('../scheduleSettings.json');
          HueLights        = require("node-hue-api"),
          schedule         = require('node-schedule'),
          alfredHelper     = require('../helper.js'),
          dateFormat       = require('dateformat'),
          HueApi           = HueLights.HueApi,
          HueBridgeIP      = process.env.HueBridgeIP,
          HueBridgeUser    = process.env.HueBridgeUser,
          Hue              = new HueApi(HueBridgeIP, HueBridgeUser),
          lightState       = HueLights.lightState;

    var rule         = new schedule.RecurrenceRule(),
        sunRise      = new Date(),
        sunSet       = new Date(),
        firstRun     = true,
        turnOnLights = function() {

            var currentTime = dateFormat(new Date(), 'HH:MM'),
                promises    = [],
                lights      = scheduleSettings.sunRiseSunSetLights,
                state;

            lights.forEach(function(value){
                state = lightState.create().on().brightness(value.brightness);
                promises.push(Hue.setLightState(value.lightID, state));
            });
            Promise.all(promises)
            .then(function(resolved) {
                logger.info(currentTime  + ' - Turned on lights');
            })
            .catch(function (err) {
                logger.error('Schedule turnOnLights Error: ' + err);
            });
        },
        turnOffLights = function() {

            var currentTime = dateFormat(new Date(), 'HH:MM'),
                promises    = [],
                lights      = scheduleSettings.sunRiseSunSetLights,
                state       = lightState.create().off();
                
            // Get a list of all the lights
            Hue.lights()
            .then (function(lights){            
                lights.lights.forEach(function(value){
                    promises.push(Hue.setLightState(value.id, state)); // push the Promises to our array
                });
                Promise.all(promises)
                .then(function(resolved) {
                    logger.info(currentTime  + ' - Turned off lights');
                })
                .catch(function (err) {
                    logger.error('Schedule turnOnLights Error: ' + err);
                });
            })
            .catch(function (err) {
                logger.error('Schedule Error: ' + err);
            });
        };

    // Setup daily timer function
    rule.hour   = scheduleSettings.runDailyTaskHR;
    rule.minute = scheduleSettings.runDailyTaskMin;
    var dailyTimer = new schedule.scheduleJob(rule, function(){

        //=========================================================
        // Set the daily timers
        //=========================================================
        var currentTime      = dateFormat(new Date(), 'HH:MM'),
            scheduleSettings = require('../scheduleSettings.json'),
            turnOffTimes     = scheduleSettings.lightsOut,
            turnOffTimers    = [],
            turnOffTimer;

        logger.info(currentTime + ' - Running daily scheduler');

        // Get sunrise & sunset data
        const url = 'http://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=' + process.env.OPENWEATHERMAPAPIKEY;
        alfredHelper.requestAPIdata(url)
        .then(function(apiData){

            sunRise = new Date(apiData.body.sys.sunrise);
            sunSet  = new Date(apiData.body.sys.sunset);
            sunSet.setHours(sunSet.getHours() + 12); // Add 12 hrs as for some resion the api returnes it as am!

            // Cancel existing timers
            if (!firstRun){
                sunRiseTimer.cancel();
                sunSetTimer.cancel();
                turnOffTimers.forEach(function(value){
                    value.cancel();
                });
            };
            firstRun = false;                

            // if sunrise is before 6am then reset to 6am
            if (sunRise.getHours() < 6){
                sunRise.setHours(6);
                sunRise.setMinutes(0);
            };

            // Set sunrise timer
            rule.hour   = sunRise.getHours();
            rule.minute = sunRise.getMinutes();
            var sunRiseTimer = new schedule.scheduleJob(rule, function(){
                turnOnLights();
            });

            // Set sunset timer
            rule.hour   = sunSet.getHours();
            rule.minute = sunSet.getMinutes();
            var sunSetTimer = new schedule.scheduleJob(rule, function(){
                turnOnLights();
            });

            // set timers to turn off lights
            turnOffTimes.forEach(function(value){
                rule.hour    = value.hour;
                rule.minute  = value.minute;
                turnOffTimer = new schedule.scheduleJob(rule, function(){
                    turnOffLights();
                });
                turnOffTimers.push(turnOffTimer);
            });
        })
        .catch(function (err) {
            logger.error('Schedule get data Error: ' + err);
        });
    });
};

module.exports = appSchedules;