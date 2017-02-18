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
    var responseText = 'The time is ' + time;

    // send response back to caller
    var returnJSON = {
        code : 'sucess',
        data : responseText
    };
    res.send(returnJSON);
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/whatisthetime', whatisthetime)

module.exports = skill;