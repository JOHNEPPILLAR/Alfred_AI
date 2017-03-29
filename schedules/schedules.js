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
                    firstRun = false;
                    // TODO cancel off timers
                };

                // TODO reset sunRise if < 6 am

                // Set new sunrise timer
                sunRiseTimer = schedule.scheduleJob({hour: sunRise.getHours(), minute: sunRise.getMinutes()}, function(){
                    turnOnLights();
                });

                // Set new sunset timer
                sunSetTimer = schedule.scheduleJob({hour: sunSet.getHours(), minute: sunSet.getMinutes()}, function(){
                    turnOnLights();
                });

                // set timers to turn off lights
                turnOffTimes.forEach(function(value){
                    sunSetTimer = schedule.scheduleJob({hour: value.hour, minute: value.minute}, function(){
                        turnOffLights();
                    });
                });
            })
            .catch(function (err) {
                console.log('Schedule get data Error: ' + err);
            });
        },
        turnOnLights = function() {

            var scheduleSettings = require('../scheduleSettings.json'),
                currentTime      = dateFormat(new Date(), 'HH:MM'),
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
                currentTime      = dateFormat(new Date(), 'HH:MM'),
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

    setSchedules();
    // Set timer functions
    dailyTimer = schedule.scheduleJob({hour: 2, minute: 0}, function(){
        setSchedules();
    });

};

module.exports = appSchedules;