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

    // Construct the returning message
    var returnJSON = {
        code : 'sucess',
        data : responseText
    };

    // Send response back to caller
    res.send(returnJSON);
    
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/whatisthetime', whatisthetime)

module.exports = skill;