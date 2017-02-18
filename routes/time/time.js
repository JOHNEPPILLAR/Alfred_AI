//=========================================================
// Setup time routes
//=========================================================
const Router = require('restify-router').Router;  
      router = new Router();

//=========================================================
// Route: whatisthetime
//=========================================================
function whatisthetime (req, res, next) {
    const time = new Date().toLocaleTimeString('en-GB', {
        hour: 'numeric',
        minute: 'numeric'
    });
    var responseText = 'The time is ' + time;

    // send response back to caller
    var returnJSON = {
        code    : 'sucess',
        message : responseText
    };
    res.send(returnJSON);
    next();
};

//=========================================================
// Add routes to server
//=========================================================
router.get('/whatisthetime', whatisthetime)

module.exports = router;