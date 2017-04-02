
const url        = 'http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=' + process.env.OPENWEATHERMAPAPIKEY,
      schedule   = require('node-schedule'),
      dateFormat = require('dateformat');

var rule    = new schedule.RecurrenceRule(),
    sunRise = new Date(),
    sunSet  = new Date();
              
exports.setSchedule = function (resetTimers){

    // Setup daily timer function
    rule.hour   = new Date().getHours();
    rule.minute = new Date().getMinutes() + 1;

    var alfredHelper = require('../helper.js');
        logger       = require('winston');
        dailyTimer   = new schedule.scheduleJob(rule, function(){

        //=========================================================
        // Set the daily timers
        //=========================================================
        var scheduleSettings = require('../scheduleSettings.json'),
            turnOffTimes     = scheduleSettings.lightsOut,
            tmpTimer;

        logger.info('Running daily scheduler');

        // Get sunrise & sunset data
        const url = 'http://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=' + process.env.OPENWEATHERMAPAPIKEY;
        alfredHelper.requestAPIdata(url)
        .then(function(apiData){

            sunRise = new Date(apiData.body.sys.sunrise);
            sunSet  = new Date(apiData.body.sys.sunset);
            sunSet.setHours(sunSet.getHours() + 12); // Add 12 hrs as for some resion the api returnes it as am!

            // Cancel existing timers
            if (resetTimers){
                timers.forEach(function(value){
                    value.cancel();
                });
            };

            // if sunrise is before 6am then reset to 6am
            if (sunRise.getHours() < 6){
                sunRise.setHours(6);
                sunRise.setMinutes(0);
            };

            // Set sunrise timer
            rule.hour   = sunRise.getHours();
            rule.minute = sunRise.getMinutes();
            tmpTimer = new schedule.scheduleJob(rule, function(){
                lightshelper.turnOnMorningEveningLights();
            });
            timers.push(tmpTimer)

            // Set sunset timer
            rule.hour   = sunSet.getHours();
            rule.minute = sunSet.getMinutes();
            tmpTimer = new schedule.scheduleJob(rule, function(){
                lightshelper.turnOnMorningEveningLights();
            });
            timers.push(tmpTimer)

            // set timers to turn off lights
            turnOffTimes.forEach(function(value){
                rule.hour   = value.hour;
                rule.minute = value.minute;
                tmpTimer = new schedule.scheduleJob(rule, function(){
                    lightshelper.allOff();
                });
                timers.push(tmpTimer);
            });
        })
        .catch(function(err){
            logger.error('Schedule get data Error: ' + err);
            return false;
        });
    });
    return true;
};