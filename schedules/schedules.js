var appSchedules = function(server) {

    const url           = 'http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=' + process.env.OPENWEATHERMAPAPIKEY,
          HueLights     = require("node-hue-api"),
          schedule      = require('node-schedule'),
          alfredHelper  = require('../helper.js'),
          dateFormat    = require('dateformat'),
          HueApi        = HueLights.HueApi,
          HueBridgeIP   = process.env.HueBridgeIP,
          HueBridgeUser = process.env.HueBridgeUser,
          Hue           = new HueApi(HueBridgeIP, HueBridgeUser),
          lightState    = HueLights.lightState;

    var sunRise   = new Date(),
        sunSet    = new Date(),
        firstRun  = true,
        dailyTimer,
        sunRiseTimer,
        sunSetTimer,
        
        setSchedules = function() {
        
            //=========================================================
            // Set the daily timers
            //=========================================================
            var currentTime      = dateFormat(new Date(), 'HH:MM'),
                scheduleSettings = require('../scheduleSettings.json'),
                setTime,
                offTimers        = [],
                turnOffTimes     = scheduleSettings.lightsOut;

            console.log (currentTime + ' - Running daily scheduler');

            // Get sunrise & sunset data
            alfredHelper.requestAPIdata(url)
            .then(function(apiData){
                sunRise = new Date(apiData.body.sys.sunrise);
                sunSet  = new Date(apiData.body.sys.sunset);
                sunSet.setHours(sunSet.getHours() + 12); // Add 12 hrs as for some resion the api returnes it as am!
            })
            .catch(function (err) {
                console.log('Schedule get data Error: ' + err);
                
                // Set default times as API call failed
                sunRise.setHours(06); 
                sunRise.setMinutes(00);
                sunSet.setHours(17);
                sunSet.setMinutes(00);
            });

            // Cancel existing timers
            if (!firstRun){
                sunRiseTimer.cancel();
                sunSetTimer.cancel();
                firstRun = false;
            };

            // Set new sunrise timer
            setTime =  sunRise.getMinutes() + " " + sunRise.getHours() + ' * * *';
console.log ("SR: " + setTime);
//            sunRiseTimer = schedule.scheduleJob(setTime, turnOnLights());
            
            // Set new sunset timer
            setTime =  sunSet.getMinutes() + " " + sunSet.getHours() + ' * * *';
console.log ("SS: " + setTime);
//            sunSetTimer = schedule.scheduleJob(setTime, turnOnLights());

            // set timers to turn off lights
            turnOffTimes.forEach(function(value){
                setTime = value.minute + " " + value.hour + ' * * *';
console.log ("Off: " + setTime);
//                offTimers[i] = schedule.scheduleJob(setTime, turnOffLights());
            });
        },
        turnOnLights = function() {

            var scheduleSettings = require('../scheduleSettings.json'),
                promises         = [],
                lights           = scheduleSettings.sunRiseSunSetLights,
                state;

            lights.forEach(function(value){
                state = lightState.create().on().brightness(value.brightness);
                promises.push(Hue.setLightState(value.lightID, state));
            });
            Promise.all(promises)
            .then(function(resolved) {
                console.log(currentTime  + ' - Turned on lights');
            })
            .catch(function (err) {
                console.log('Schedule turnOnLights Error: ' + err);
            });
        },
        turnOffLights = function() {

            var scheduleSettings = require('../scheduleSettings.json'),
                promises         = [],
                lights           = scheduleSettings.sunRiseSunSetLights,
                state            = lightState.create().off();
                
            // Get a list of all the lights
            Hue.lights()
            .then (function(lights){            
                lights.lights.forEach(function(value){
                    promises.push(Hue.setLightState(value.id, state)); // push the Promises to our array
                });
                Promise.all(promises)
                .then(function(resolved) {
                    console.log(currentTime  + ' - Turned off lights');
                })
                .catch(function (err) {
                    console.log('Schedule turnOnLights Error: ' + err);
                });
            })
            .catch(function (err) {
                console.log('Schedule Error: ' + err);
            });
        };

    // Set timer functions
//    dailyTimer = schedule.scheduleJob('* 2 * * *', setSchedules());
//setSchedules()
};

module.exports = appSchedules;