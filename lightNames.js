
const schedule     = require('node-schedule'),
      dateFormat   = require('dateformat'),
      fs           = require('fs'),
      dotenv       = require('dotenv'),
      lightshelper = require('./skills/lights/lightshelper.js');
      
dotenv.load() // Load env vars

exports.setupLightNames = function () {
    
    // Setup daily timer function
    var rule    = new schedule.RecurrenceRule();
    rule.hour   = new Date().getHours();
    rule.minute = new Date().getMinutes() + 1;

    var dailyTimer = new schedule.scheduleJob(rule, function() {

        logger.info('Setting up light/light group names');
        
        Promise.all([lightshelper.listLights(), lightshelper.listLightGroups()])
        .then(function([first, second]) {

            // Setup light names
            if (first instanceof Error) {
                logger.error('schedule setup: ' + data);
            } else {
                first.lights.forEach(function(value) {            
                    lightNames.push({ 'id' : value.id, 'name' : value.name});
                });
            };

            // Setup ligh group names
            if (second instanceof Error) {
                logger.error('schedule setup: ' + data);
            } else {
                second.forEach(function(value) {
                    lightGroupNames.push({ 'id' : value.id, 'name' : value.name});
                });
            };
            
        })
        .catch(function (err) {
            logger.error('setup light names: ' + err);
        });
    });
};
