//=========================================================
// Setup generic skill
//=========================================================
const Skills = require('restify-router').Router,
      _      = require('lodash'),
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
    logger.info ('Ping API called');
    
    var responseText = 'sucess.';
                        
    // Send response back to caller
    alfredHelper.sendResponse(res, 'sucess', responseText);

    next();
};

//=========================================================
// Skill: displaylog
//=========================================================
function displayLog (req, res, next) {                        
    logger.info ('Display Log API called');
    
    if (typeof req.query.page !== 'undefined' && req.query.page !== null && req.query.page !== ''){
        var page = parseInt(req.query.page || 1);
    };

    var itemsOnPage = 20,
        rl = require('readline').createInterface({
            input: require('fs').createReadStream('./Alfred.log')
        }),
        results = [];

    rl.on('line', function (line) {
        results.push(JSON.parse(line));
    });

    rl.on('close', function () {

        var pagesCount = Math.floor(results.length / itemsOnPage) + (results.length % itemsOnPage === 0 ? 0 : 1);

        if (page > pagesCount) { page = pagesCount };
        if (req.query.reverse == 'true') { // For Alfred IOS app view log page
            page = pagesCount;
            results.reverse(); // Reverse logfile order
        } 

        var logs = results.splice((page - 1) * itemsOnPage, itemsOnPage);

        if (page == pagesCount) { 
            nextpage = pagesCount;
        } else { 
            nextpage = page + 1;
        };

        // Construct the returning message
        const jsonDataObj = {
                currentpage : page,
                prevpage    : page - 1,
                nextpage    : nextpage,
                lastpage    : pagesCount,
                lpm1        : pagesCount - 1,
                pages       : _.range(1, pagesCount + 1),
                logs        : logs
        };

        alfredHelper.sendResponse(res, 'sucess', jsonDataObj);
        next();
    });
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/', root);
skill.get('/hello', hello);
skill.get('/help', help);
skill.get('/ping', ping);
skill.get('/displaylog', displayLog);

module.exports = skill;