
const schedule   = require('node-schedule'),
      dateFormat = require('dateformat'),
      dotenv     = require('dotenv');

// Load env vars
dotenv.load()

const url = 'http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=' + process.env.OPENWEATHERMAPAPIKEY;
var rule  = new schedule.RecurrenceRule();

exports.setSchedule = function (){
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
        alfredHelper.requestAPIdata(url)
        .then(function(apiData){

            // Cancel any existing timers
            timers.forEach(function(value){
                value.cancel();
            });

            // Set sunrise timer
            sunRise = new Date(),
            sunRise.setHours(scheduleSettings.morningTimerHR);
            sunRise.setMinutes(scheduleSettings.morningTimerMin);
            rule.hour = sunRise.getHours();
            rule.minute = sunRise.getMinutes();
            tmpTimer = new schedule.scheduleJob(rule, function(){
                lightshelper.turnOnMorningEveningLights();
            });
            timers.push(tmpTimer)
            logger.info('Set sunrise schedule for: ' + rule.hour + ':' + rule.minute);

            // Set sunset timer
            sunSet = new Date(apiData.body.sys.sunset);
            sunSet.setHours(sunSet.getHours() + 12); // Add 12 hrs as for some resion the api returnes it as am!
            sunSet.setHours(sunSet.getHours() - scheduleSettings.sunSetOffSet); // Adjust according to the setting
            rule.hour = sunSet.getHours();
            rule.minute = sunSet.getMinutes();
            tmpTimer = new schedule.scheduleJob(rule, function(){
                lightshelper.turnOnMorningEveningLights();
            });
            timers.push(tmpTimer)
            logger.info('Set sunset schedule for: ' + rule.hour + ':' + rule.minute);

            // set timers to turn off lights
            turnOffTimes.forEach(function(value){
                rule.hour   = value.hour;
                rule.minute = value.minute;
                tmpTimer = new schedule.scheduleJob(rule, function(){
                    lightshelper.allOff();
                });
                timers.push(tmpTimer);
                logger.info('Set off timer schedule for: ' + rule.hour + ':' + rule.minute);
            });
        })
        .catch(function(err){
            logger.error('Schedule get data Error: ' + err);
            return false;
        });
    });
    return true;
};