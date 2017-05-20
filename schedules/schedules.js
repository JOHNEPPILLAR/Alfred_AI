
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
            // Set up morning lights on timer
            //=========================================================
            tmpTimer       = null;
            tmpRule        = new schedule.RecurrenceRule(),
            tmpRule.hour   = scheduleSettings.morning[0].on_hr;
            tmpRule.minute = scheduleSettings.morning[0].on_min;

            scheduleSettings.morning[0].lights.forEach(function(value){
                tmpTimer = new schedule.scheduleJob(tmpRule, function(){
                    lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness);
                });
                timers.push(tmpTimer);
                logger.info('Scheduled ' + value.name + ' to be turned ' + value.onoff + ' at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));
                tmpTimer = null;
            });

            //=========================================================
            // Set up morning lights off timer
            //=========================================================
            tmpRule        = new schedule.RecurrenceRule(),
            tmpRule.hour   = scheduleSettings.morning[0].off_hr;
            tmpRule.minute = scheduleSettings.morning[0].off_min;
            tmpTimer = new schedule.scheduleJob(tmpRule, function(){
                lightshelper.allOff();
            });
            timers.push(tmpTimer);
            logger.info('Scheduled morning all lights off timer for: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));

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
                sunSet.setHours(sunSet.getHours() - scheduleSettings.evening[0].offset_hr); // Adjust according to the setting
                sunSet.setMinutes(sunSet.getMinutes() - scheduleSettings.evening[0].offset_min); // Adjust 
                
                tmpRule        = new schedule.RecurrenceRule(),
                tmpRule.hour   = sunSet.getHours();
                tmpRule.minute = sunSet.getMinutes();

                sunSetTimer = new schedule.scheduleJob(tmpRule, function(){
                    lightshelper.turnOnMorningEveningLights();
                });
                logger.info('Scheduled sunset timer for: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));
            })
            .catch(function(err){
                logger.error('Sunset get data Error: ' + err);
                return false;
            });

            //=========================================================
            // Set up night lights off timer
            //=========================================================
            tmpRule        = new schedule.RecurrenceRule(),
            tmpRule.hour   = scheduleSettings.evening[0].off_hr;
            tmpRule.minute = scheduleSettings.evening[0].off_min;
            tmpTimer = new schedule.scheduleJob(tmpRule, function(){
                lightshelper.allOff();
            });
            timers.push(tmpTimer);
            logger.info('Scheduled night all lights off timer for: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));
        });
    return true;
};