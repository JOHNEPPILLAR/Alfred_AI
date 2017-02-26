//=========================================================
// Setup generic skill
//=========================================================
const Skills       = require('restify-router').Router,
      skill        = new Skills(),
      alfredHelper = require('../../helper.js');

//=========================================================
// Skill: base root
//=========================================================
function root (req, res, next) {
    var responseText = '',
        aiNameText = 'My name is Alfred. I am the Pillar house Digital Assistant.',
        dt = new Date().getHours()

    // Calc which part of day
    if (dt >= 0 && dt <= 11) {
        responseText = 'Good Morning.'
    } else if (dt >= 12 && dt <= 17) {
        responseText = 'Good Afternoon.'
    } else {
        responseText = 'Good Evening.'
    }
    responseText = responseText + ' ' + aiNameText;

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
        aiNameText = 'My name is Alfred. How can I help you today.',
        dt = new Date().getHours(),
        name = '';

    if (req.query.name){
        name = ' ' + req.query.name;
    };

    // Calc which part of day
    if (dt >= 0 && dt <= 11) {
        responseText = 'Good Morning'
    } else if (dt >= 12 && dt <= 17) {
        responseText = 'Good Afternoon'
    } else {
        responseText = 'Good Evening'
    }
    responseText = responseText + name + '. ' + aiNameText;

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
    alfredHelper.sendResponse(res, 'sucess', responseText)

    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/', root)
skill.get('/hello', hello)
skill.get('/help', help)

module.exports = skill;