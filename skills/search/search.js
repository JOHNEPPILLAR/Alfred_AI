//=========================================================
// Setup search skills
//=========================================================
const Skills = require('restify-router').Router;  
      skill = new Skills();

//=========================================================
// Skill: googlesearch
// Params: searchterm: String
//=========================================================
function googlesearch (req, res, next) {

    // Get the search term
    var searchTerm = '';
    if (typeof req.query.searchterm !== 'undefined' && req.query.searchterm !== null){
        searchTerm = req.query.searchterm;




            // send response back to caller
            var returnJSON = {
                code : 'sucess',
                data : ''
            };
            res.send(returnJSON);

    } else {
        // send error response back to caller
        var returnJSON = {
            code : 'error',
            data : 'Search term not provided'
        };
        console.log('googlesearch: ' + err);
        res.send(returnJSON);
    };
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/search', googlesearch)

module.exports = skill;