//=========================================================
// Setup time skills
//=========================================================
const Skills = require('restify-router').Router;  
      skill = new Skills();

//=========================================================
// Skill: whatisthetime
//=========================================================
function whatisthetime (req, res, next) {
    const time = new Date().toLocaleTimeString('en-GB', {
        hour: 'numeric',
        minute: 'numeric'
    });
    var responseText = 'The time is ' + time + '.';

    // Send response back to caller
    alfredHelper.sendResponse(res, 'sucess', responseText);
    
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/whatisthetime', whatisthetime);

module.exports = skill;