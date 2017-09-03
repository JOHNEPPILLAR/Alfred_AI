const HueApi           = require("node-hue-api").HueApi,
      dotenv           = require('dotenv'),
      schedule         = require('node-schedule'),
      lightshelper     = require('../skills/lights/lightshelper.js'),
      scheduleSettings = JSON.parse(require('fs').readFileSync('./scheduleSettings.json', 'utf8'));

dotenv.load() // Load env vars

const HueBridgeIP   = process.env.HueBridgeIP,
      HueBridgeUser = process.env.HueBridgeUser,
      Hue           = new HueApi(HueBridgeIP, HueBridgeUser);

motionSensorActive1 = true

exports.setSchedule = function () {
    logger.info("Setting up motion sensors")
    setMotionSensorSchedule();
}

// Setup timer function to run in 30 seconds
function setMotionSensorSchedule() {
    setTimeout(function() {
        processMotionSensor();
    }, 15000);
}

function processMotionSensor() {
    // Only check motion sensor if light are not on as part of the core schedule
    //if (motionSensorActive) {
    if (motionSensorActive1) {
        
        var motion   = false,
            lowLight = false;

        // Get the sensor data
        lightshelper.sensor()
        .then(function(apiData){

            apiData.sensors.forEach(function(sensor) {            
                if (sensor.id == 13) { // Hall motion sensor
                    if (sensor.state.presence) motion = true
                };

                if (sensor.id == 14) { // Hall ambient light sensor
                    if (sensor.state.lightlevel <= sensor.config.tholddark) lowLight = true
                };             
            });

            if (motion && lowLight) {
                scheduleSettings.motionSensorLights.forEach(function(value) {
                    lightshelper.lightOnOff(null, value.lightID, "on", value.brightness);
                });

                motionSensorActive1 = false; // Turn off motion sensor as lights are on

                // Schedule to turn off after 10 minutes
                var rule        = new schedule.RecurrenceRule();
                    rule.hour   = new Date().getHours();
                    rule.minute = new Date().getMinutes() + 3;

                var motionOffTimer = new schedule.scheduleJob(rule, function() {
                    scheduleSettings.motionSensorLights.forEach(function(value) {
                        lightshelper.lightOnOff(null, value.lightID, "off", value.brightness);
                    });
                    motionSensorActive1 = true; // Re-activate motion sensor s lights are now off
                });
            };
        })
        .catch(function (err) {
            logger.error('Get sensor data: ' + err);
        });

    }
    setMotionSensorSchedule(); // Recursive call function
}
