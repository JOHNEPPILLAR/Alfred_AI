//=========================================================
// Setup generic skill
//=========================================================
const Skills       = require('restify-router').Router,
      skill        = new Skills(),
      alfredHelper = require('../../helper.js'),
      logger       = require('winston');

alfredHelper.setLogger(logger); // Configure logging

//=========================================================
// Skill: base root
//=========================================================
function root (req, res, next) {
    var responseText = '',
        greeting = '',
        aiNameText = 'My name is Alfred.',
        aiDesc = 'I am the Pillar house Digital Assistant.'
        dt = new Date().getHours()

    // Calc which part of day
    if (dt >= 0 && dt <= 11) {
        greeting = 'Good Morning.'
    } else if (dt >= 12 && dt <= 17) {
        greeting = 'Good Afternoon.'
    } else {
        greeting = 'Good Evening.'
    }
    responseText = greeting + ' ' + aiNameText + ' ' + aiDesc; // construct json response

    // Send response back to caller
    alfredHelper.sendResponse(res, 'sucess', responseText);

    next();
};

//=========================================================
// Skill: Hello
// Params: name: String
//=========================================================
function hello (req, res, next) {
    var responseText = '',
        greeting = '',
        aiNameText = 'How can I help you today.',
        dt = new Date().getHours(),
        name = '';

    if (req.query.name){
        name = ' ' + req.query.name;
    } else {
        name = '';
    };

    // Calc which part of day
    if (dt >= 0 && dt <= 11) {
        greeting = 'Good Morning'
    } else if (dt >= 12 && dt <= 17) {
        greeting = 'Good Afternoon'
    } else {
        greeting = 'Good Evening'
    }
    responseText = greeting + name + '. ' + aiNameText; // construct json response

    // Send response back to caller
    alfredHelper.sendResponse(res, 'sucess', responseText);

    next();
};

//=========================================================
// Skill: Help
//=========================================================
function help (req, res, next) {
    var responseText = 'I can help you with...';

    // Send response back to caller
    alfredHelper.sendResponse(res, 'sucess', responseText);

    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/', root);
skill.get('/hello', hello);
skill.get('/help', help);

module.exports = skill;