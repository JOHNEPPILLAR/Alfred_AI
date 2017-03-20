//=========================================================
// Setup TV skill
//=========================================================
const Skills       = require('restify-router').Router;  
      skill        = new Skills(),
      alfredHelper = require('../../helper.js'),
      harmony      = require('harmonyhubjs-client');

//=========================================================
// Skill: watch fire tv
//=========================================================
function watchFireTv (req, res, next) {
    harmony(process.env.harmonyip)
    .then(function(harmonyClient) {
        harmonyClient.startActivity(25026204) // Fire TV ID
        harmonyClient.end()
    })
    .catch(function (err) {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', err.message);
        console.log('watchFireTv: ' + err);
    });
    next();
};

//=========================================================
// Skill: watch virgin tv
//=========================================================
function watchVirginTv (req, res, next) {
    harmony(process.env.harmonyip)
    .then(function(harmonyClient) {
        harmonyClient.startActivity(22797599) // Virgin TV ID
        harmonyClient.end()
    })
    .catch(function (err) {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', err.message);
        console.log('watchVirginTv: ' + err);
    });
    next();
};

//=========================================================
// Skill: play PS4
//=========================================================
function playps4 (req, res, next) {
    harmony(process.env.harmonyip)
    .then(function(harmonyClient) {
        harmonyClient.startActivity(23898791) // PS4 ID
        harmonyClient.end()
    })
    .catch(function (err) {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', err.message);
        console.log('playPS4: ' + err);
    });
    next();
};

//=========================================================
// Skill: turn everythig off
//=========================================================
function turnofftv (req, res, next) {
    harmony(process.env.harmonyip)
    .then(function(harmonyClient) {
        harmonyClient.startActivity(-1) // Turn off TV ID
        harmonyClient.end()
    })
    .catch(function (err) {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', err.message);
        console.log('turn off tv: ' + err);
    });
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/watchfiretv', watchFireTv);
skill.get('/watchvirgintv', watchVirginTv);
skill.get('/playps4', playps4);
skill.get('/turnoff', turnofftv);

module.exports = skill;