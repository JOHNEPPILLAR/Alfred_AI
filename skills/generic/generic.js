//=========================================================
// Setup generic skill
//=========================================================
const Skills = require('restify-router').Router,
      skill  = new Skills();

function sayHello() {
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
    return greeting + ' ' + aiNameText + ' ' + aiDesc; // construct json response
};

//=========================================================
// Skill: base root
//=========================================================
function root (req, res, next) {
    alfredHelper.sendResponse(res, 'sucess', sayHello()); // Send response back to caller
    next();
};

//=========================================================
// Skill: Hello
//=========================================================
function hello (req, res, next) {
    alfredHelper.sendResponse(res, 'sucess', sayHello()); // Send response back to caller
    next();
};

//=========================================================
// Skill: Help
//=========================================================
function help (req, res, next) {
    var responseText = 'So you need some help, not a problem.' +
                        'You can ask: ' +
                        'Tell me a joke. ' +
                        'Turn on the lights. ' +
                        'What is the news. ' +
                        'Search for. ' +
                        'What is the time. ' +
                        'When is the next train. ' +
                        'Turn on the TV. ' +
                        'or what is the weather.';
                        
    // Send response back to caller
    alfredHelper.sendResponse(res, 'sucess', responseText);

    next();
};

//=========================================================
// Skill: ping
//=========================================================
function ping (req, res, next) {
    var responseText = 'sucess.';
                        
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
skill.get('/ping', ping);

module.exports = skill;