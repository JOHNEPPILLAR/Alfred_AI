//=========================================================
// Setup joke routes
//=========================================================
const Router = require('restify-router').Router;  
      router = new Router();

//=========================================================
// Route: base root
//=========================================================
function joke (req, res, next) {

    const url = 'http://tambal.azurewebsites.net/joke/random'
    alfredHelper.requestAPIdata(url)
    .then(function(apiData){

        // Get the joke data
        apiData = apiData.body;

        // Construct the returning message
        const jsonDataObj = {
              code    : 'sucess',
              message : apiData.joke
        };

        // Send response back to caller
        res.send(jsonDataObj);
    })
    .catch(function (err) {
        var returnJSON = {
            code    : 'error',
            message : err.message
        }
        console.log('joke: ' + err);
        res.send(returnJSON);
    });

    next();
};


//=========================================================
// Add routes to server
//=========================================================
router.get('/joke', joke)

module.exports = router;