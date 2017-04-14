
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
    var alfredHelper = require('../helper.js'),
        logger       = require('winston'),
        lightshelper = require('../skills/lights/lightshelper.js'),
        dailyTimer   = new schedule.scheduleJob(rule, function(){

        //=========================================================
        // Set the daily timers
        //=========================================================
        var scheduleSettings = require('../scheduleSettings.json'),
            scheduleTimers   = scheduleSettings.timers,
            tmpTimer;

        logger.info('Running daily scheduler');

        //=========================================================
        // Cancel any existing timers
        //=========================================================
        timers.forEach(function(value){
            value.cancel();
        });

        //=========================================================
        // Set up all of the timers in setting
        //=========================================================
        scheduleTimers.forEach(function(value){

            rule.hour   = value.hour;
            rule.minute = value.minute;

            if (!Array.isArray(value.lights)){
                tmpTimer = new schedule.scheduleJob(rule, function(){
                    lightshelper.allOff();
                });
                timers.push(tmpTimer);
                logger.info('Scheduled all lights off timer for: ' + rule.hour + ':' + rule.minute);
            }else{
                value.lights.forEach(function(value){
                    tmpTimer = null;
                    tmpTimer = new schedule.scheduleJob(rule, function(){
                        lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness);
                    });
                    timers.push(tmpTimer);
                    logger.info('Scheduled ' + value.name + ' to be turned ' + value.onoff + ' at: ' + rule.hour + ':' + rule.minute);  
                });
            };
        });

        //=========================================================
        // Set up the timer for sunset
        //=========================================================
        
        // Get sunrise & sunset data
        alfredHelper.requestAPIdata(url)
        .then(function(apiData){

            // Cancel the existing timers
            if (typeof sunSetTimer !== 'undefined'){
                sunSetTimer.cancel(); 
            };

            // Set sunset timer
            sunSet = new Date(apiData.body.sys.sunset);
            sunSet.setHours(sunSet.getHours() + 12); // Add 12 hrs as for some resion the api returnes it as am!
            sunSet.setHours(sunSet.getHours() - scheduleSettings.sunSetOffSet); // Adjust according to the setting
            rule.hour = sunSet.getHours();
            rule.minute = sunSet.getMinutes();
            sunSetTimer = new schedule.scheduleJob(rule, function(){
                lightshelper.turnOnMorningEveningLights();
            });
            logger.info('Scheduled sunset timer for: ' + rule.hour + ':' + rule.minute);
        })
        .catch(function(err){
            logger.error('Sunset get data Error: ' + err);
            return false;
        });
    });
    return true;
};