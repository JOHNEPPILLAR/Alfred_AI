//=========================================================
// Setup generic routes
//=========================================================
const Router = require('restify-router').Router;  
      router = new Router();

//=========================================================
// Route: base root
//=========================================================
function root (req, res, next) {
    var responseText = '',
        aiNameText = 'My name is Alfred. I am the Pillar house AI.',
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
    var returnJSON = {
        code    : 'sucess',
        message : responseText
    };
    res.send(returnJSON);
    next();
};

//=========================================================
// Route: Helo
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
    var returnJSON = {
        code    : 'sucess',
        message : responseText
    };
    res.send(returnJSON);
    next();
};

//=========================================================
// Route: Help
//=========================================================
function help (req, res, next) {
    var responseText = 'I can help you with...';

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
router.get('/', root)
router.get('/hello', hello)
router.get('/help', help)

module.exports = router;