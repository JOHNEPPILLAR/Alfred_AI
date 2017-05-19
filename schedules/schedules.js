
const schedule   = require('node-schedule'),
      dateFormat = require('dateformat'),
      dotenv     = require('dotenv');

// Load env vars
dotenv.load()

const url = 'http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=' + process.env.OPENWEATHERMAPAPIKEY;

exports.setSchedule = function (){

    // Setup daily timer function
    var rule    = new schedule.RecurrenceRule();
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
                tmpRule,
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

                tmpTimer       = null;
                tmpRule        = new schedule.RecurrenceRule(),
                tmpRule.hour   = value.hour;
                tmpRule.minute = value.minute;

                if (!Array.isArray(value.lights)){
                    tmpTimer = new schedule.scheduleJob(tmpRule, function(){
                        lightshelper.allOff();
                    });
                    timers.push(tmpTimer);
                    logger.info('Scheduled all lights off timer for: ' + tmpRule.hour + ':' + tmpRule.minute);
                }else{
                    value.lights.forEach(function(value){
                        tmpTimer = new schedule.scheduleJob(tmpRule, function(){
                            lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness);
                        });
                        timers.push(tmpTimer);
                        logger.info('Scheduled ' + value.name + ' to be turned ' + value.onoff + ' at: ' + tmpRule.hour + ':' + tmpRule.minute);  
                        tmpTimer = null;
                    });
                };
            });

            //=========================================================
            // Set up the timer for sunset
            //=========================================================
            
            // Get sunset data
            alfredHelper.requestAPIdata(url)
            .then(function(apiData){

                // Cancel the existing timers
                if (typeof sunSetTimer !== 'undefined'){
                    sunSetTimer.cancel(); 
                };

                // Set sunset timer
                sunSet = new Date(apiData.body.sys.sunset);
                sunSet.setHours(sunSet.getHours() + 12); // Add 12 hrs as for some resion the api returnes it as am!
                sunSet.setHours(sunSet.getHours() - scheduleSettings.sunSetOffSetHR); // Adjust according to the setting
                sunSet.setMinutes(sunSet.getMinutes() - scheduleSettings.sunSetOffSetMin); // Adjust 
                
                tmpRule        = new schedule.RecurrenceRule(),
                tmpRule.hour   = sunSet.getHours();
                tmpRule.minute = sunSet.getMinutes();

                sunSetTimer = new schedule.scheduleJob(tmpRule, function(){
                    lightshelper.turnOnMorningEveningLights();
                });
                logger.info('Scheduled sunset timer for: ' + tmpRule.hour + ':' + tmpRule.minute);
            })
            .catch(function(err){
                logger.error('Sunset get data Error: ' + err);
                return false;
            });
        });
    return true;
};