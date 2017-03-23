var appSchedules = function(server) {

    //const url           = 'http://api.geonames.org/timezoneJSON?lat=51.5074&lng=0.1278&username=' + process.env.geonames,

    const url           = 'http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=' + process.env.OPENWEATHERMAPAPIKEY,
          HueLights     = require("node-hue-api"),
          HueApi        = HueLights.HueApi,
          HueBridgeIP   = process.env.HueBridgeIP,
          HueBridgeUser = process.env.HueBridgeUser,
          Hue           = new HueApi(HueBridgeIP, HueBridgeUser),
          lightState    = HueLights.lightState,
          alfredHelper  = require('../helper.js');
    
    var sunRise        = new Date(),
        sunSet         = new Date(),
        recursiveDaily = function() {
        
            //=========================================================
            // Daily scheduler
            //=========================================================
            var currentTime = dateFormat(new Date(), 'HH:MM');

            console.log ('Running daily scheduler: ' + currentTime)

            // Get sunrise & sunset data
            alfredHelper.requestAPIdata(url)
            .then(function(apiData){
                sunRise = new Date(apiData.body.sys.sunrise);
                sunSet  = new Date(apiData.body.sys.sunset);
            })
            .catch(function (err) {
                console.log('Schedule Error: ' + err);
            });
            setTimeout(recursiveDaily,1000 * 60 * 60 * 12); // run every 12 hours
        },
        recursive = function() {
        
            var scheduleSettings = require('../scheduleSettings.json'),
                runTask          = false,
                promises         = [],
                state,
                lights           = scheduleSettings.sunRiseSunsetLights,
                minCurrentTime   = new Date(),
                maxCurrentTime   = new Date(),
                time6am          = new Date(2017, 01, 01, 6, 00, 0, 0).getTime();
                currentTime      = dateFormat(new Date(), 'HH:MM'),
                minCurrentTime.setMinutes(minCurrentTime.getMinutes() + 5),
                minCurrentTime   = dateFormat(minCurrentTime, 'HH:MM'),
                maxCurrentTime.setMinutes(maxCurrentTime.getMinutes() + 5),
                maxCurrentTime   = dateFormat(maxCurrentTime, 'HH:MM');

            //=========================================================
            // Sunrise & Sunset schedules
            //=========================================================

            console.log ('Running scheduler: ' + currentTime)

            promises = [];
            state    = lightState.create().on().brightness(scheduleSettings.brightness);

            // Adjust sunrise & sunset time by offset stored in config
            sunRise.setHours(new Date(sunRise).getHours() - scheduleSettings.sunRiseOffSet);
            sunSet.setHours(new Date(sunSet).getHours() - scheduleSettings.sunSetOffSet);

            // If the adjusted sunRise if before 6am reset to sunRise 6am.
            if (sunRise.getTime() <= time6am) {
                sunRise = new Date('2017-01-01 06:00');
            };

            // Format sunRise & SunSet times
            sunRise = dateFormat(sunRise, 'HH:MM');  
            sunSet  = dateFormat(sunSet, 'HH:MM');

            // If the current time matches the adjusted sunset or sunrise time, turn on the lights
            if (sunRise >= minCurrentTime && sunRise <= maxCurrentTime) {
                runTask = true;
            };
            if (sunSet >= minCurrentTime && sunSet <= maxCurrentTime) {
                runTask = true;
            };

            if (runTask) {
                for (var i in lights) {
                    promises.push(Hue.setLightState(lights[i].lightID, state)); // push the Promises to our array
                };
                Promise.all(promises)
                .then(function(resolved) {
                    console.log('Schedule: ' + currentTime  + ' - Turned on lights')
                })
                .catch(function (err) {
                    console.log('Schedule Error: ' + err);
                });
            };
            runTask = false;

            //=========================================================
            // Morning & Night time lights off schedules
            //=========================================================
            
            // If the current time matches the morning or night time light off setting, turn off the lights
            if (scheduleSettings.morningLightsOu >= minCurrentTime && scheduleSettings.morningLightsOu <= maxCurrentTime) {
                runTask = true;
            };
            if (scheduleSettings.endOfDayLightsOut >= minCurrentTime && scheduleSettings.endOfDayLightsOut <= maxCurrentTime) {
                runTask = true;
            };

            if (runTask) {
                promises = [];
                state    = lightState.create().off();
                
                // Get a list of all the lights
                Hue.lights()
                .then (function(lights){            
                    for (var i in lights.lights) {
                        promises.push(Hue.setLightState(lights.lights[i].id, state)); // push the Promises to our array
                    };
                    Promise.all(promises)
                    .then(function(resolved) {
                        console.log('Schedule: ' + currentTime  + ' - Turned off lights')
                    })
                    .catch(function (err) {
                        console.log('Schedule Error: ' + err);
                    });
                })
                .catch(function (err) {
                    console.log('Schedule Error: ' + err);
                });
            };
            setTimeout(recursive,5 * 60 * 1000); // run every 5 minutes
        };
    
    // Call timer functions
    recursiveDaily();
    recursive();
};

module.exports = appSchedules;